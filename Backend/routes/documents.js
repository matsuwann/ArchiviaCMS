const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db'); 
const fs = require('fs').promises; 

// --- CRITICAL IMPORT BLOCK ---
const pdfModule = require('pdf-parse'); 
// Fallback: This attempts to grab the function from .default or the root export, 
// which is the most robust way to handle this CJS/ESM conflict.
const pdfParse = pdfModule.default || pdfModule; 
// --- END CRITICAL IMPORT BLOCK ---

const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config(); 

const router = express.Router();
const authorFormatRegex = /^([A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)(;\s[A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)*$/;


// --- Gemini AI Integration Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

async function generateMetadata(text) {
  // NEW PROMPT AND SCHEMA
  const prompt = `Analyze the following research paper text. Extract: 
    1. A list of 5-8 highly relevant keywords/tags.
    2. A list of all primary authors (full names if possible, last name and initials otherwise).
    3. The publication or creation date (just the year, or 'YYYY-MM-DD'). 
    Return the result as a single JSON object. Text: ${text.substring(0, 8000)}...`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          keywords: { type: "array", description: "A list of 5 to 8 keywords/tags.", items: { type: "string" } },
          ai_authors: { type: "array", description: "A canonical list of all primary authors.", items: { type: "string" } },
          ai_date_created: { type: "string", description: "The most precise publication or creation date found in the format YYYY-MM-DD, or just YYYY." },
        },
        required: ["keywords", "ai_authors", "ai_date_created"],
      },
    },
  });
  
  return JSON.parse(response.text);
}
// -----------------------------------


// --- Existing Multer Setup (No changes needed) ---
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are accepted.'), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});
// ----------------------------------------------------


router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Modified upload POST route to include new AI fields
router.post('/upload', (req, res) => {
    upload.single('file')(req, res, async function (err) {
        
        let aiKeywords = null;
        let aiAuthors = null;
        let aiDateCreated = null;
        
        // Handle Multer error (e.g., wrong file type)
        if (err) {
            if (err.message === 'Invalid file type. Only PDF documents are accepted.') {
                return res.status(400).json({ message: err.message });
            }
            console.error('Multer/Upload Error:', err.message);
            return res.status(500).json({ message: 'File upload error.' });
        }

        const { title, author } = req.body;
        const file = req.file;
        const { filename, path: filepath } = file;

        // Basic validation
        if (!authorFormatRegex.test(author)) {
            // In a production app, you should delete the file after validation fails
            await fs.unlink(filepath).catch(e => console.error("Failed to delete invalid file:", e)); 
            return res.status(400).json({ message: 'Invalid author format. Please use: Lastname, F. M.; Lastname, S.' });
        }

        if (!file || !title) { 
            await fs.unlink(filepath).catch(e => console.error("Failed to delete invalid file:", e));
            return res.status(400).send('Title, author, and file are required.');
        }

        try {
            // 1. Extract text from the PDF
            const dataBuffer = await fs.readFile(filepath);
            // The correctly resolved pdfParse function is called here
            const data = await pdfParse(dataBuffer); 
            const pdfText = data.text;

            // 2. Generate new metadata using Gemini
            const metadata = await generateMetadata(pdfText);
            
            // Store lists as JSON strings for PostgreSQL JSONB column
            aiKeywords = JSON.stringify(metadata.keywords);
            aiAuthors = JSON.stringify(metadata.ai_authors);
            aiDateCreated = metadata.ai_date_created;

            // 3. Save to Database with new columns
            const newDocument = await db.query(
                // IMPORTANT: Ensure your DB schema has ai_keywords (JSONB), ai_authors (JSONB), and ai_date_created (TEXT)
                'INSERT INTO documents (title, author, filename, filepath, ai_keywords, ai_authors, ai_date_created) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [title, author, filename, filepath, aiKeywords, aiAuthors, aiDateCreated]
            );
            res.status(201).json(newDocument.rows[0]);

        } catch (aiOrDbErr) {
            console.error('AI Processing or Database Error:', aiOrDbErr.message);
            
            // Clean up the uploaded file if processing failed
            await fs.unlink(filepath).catch(e => console.error("Failed to delete temp file:", e)); 
            
            res.status(500).json({ message: 'Server error during AI processing or database save.' });
        }
    });
});


router.get('/search', async (req, res) => {
    const { term } = req.query;
    if (!term) {
        try {
            const { rows } = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
            return res.json(rows);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
    try {
        const searchQuery = `%${term}%`;
        // Search across title, existing author, and the new AI-generated columns
        const { rows } = await db.query(
            `SELECT * FROM documents 
             WHERE title ILIKE $1 
             OR author ILIKE $1 
             OR ai_keywords::text ILIKE $1 
             OR ai_authors::text ILIKE $1 
             OR ai_date_created ILIKE $1 
             ORDER BY created_at DESC`,
            [searchQuery]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;