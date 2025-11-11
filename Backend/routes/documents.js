const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db'); 
const fs = require('fs').promises; 

const authMiddleware = require('../middleware/authMiddleware');

const pdfModule = require('pdf-parse'); 
const pdfParse = pdfModule.default || pdfModule; 

const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config(); 

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

async function generateMetadata(text) {
  const prompt = `Analyze the following research paper text. Extract:
    1. The exact Title of the paper.
    2. A list of all primary authors (full names if possible, last name and initials otherwise).
    3. A list of 5-8 highly relevant keywords/tags.
    4. The most precise publication date found (e.g., 'YYYY-MM-DD', 'YYYY-MM', or 'YYYY').
    Return the result as a single JSON object. Text: ${text.substring(0, 8000)}...`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          ai_title: { type: "string", description: "The exact title of the research paper." },
          ai_authors: { type: "array", description: "A canonical list of all primary authors.", items: { type: "string" } },
          keywords: { type: "array", description: "A list of 5 to 8 keywords/tags.", items: { type: "string" } },
          ai_date_created: { type: "string", description: "The most precise publication or creation date found (e.g., 'YYYY-MM-DD', 'YYYY-MM', or 'YYYY')." },
        },
        required: ["ai_title", "ai_authors", "keywords", "ai_date_created"],
      },
    },
  });
  
  return JSON.parse(response.text);
}


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


router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, filename, filepath, created_at, ai_keywords, ai_authors, ai_date_created 
       FROM documents 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/search', async (req, res) => {
    const { term } = req.query;
    if (!term) {
        try {
            const { rows } = await db.query(
              `SELECT id, title, filename, filepath, created_at, ai_keywords, ai_authors, ai_date_created 
               FROM documents 
               ORDER BY created_at DESC`
            );
            return res.json(rows);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
    try {
        const searchQuery = `%${term}%`;
        const { rows } = await db.query(
            `SELECT id, title, filename, filepath, created_at, ai_keywords, ai_authors, ai_date_created 
             FROM documents 
             WHERE title ILIKE $1 
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


router.post('/upload', authMiddleware, (req, res) => {
    upload.single('file')(req, res, async function (err) {
        
        if (err) {
            if (err.message === 'Invalid file type. Only PDF documents are accepted.') {
                return res.status(400).json({ message: err.message });
            }
            console.error('Multer/Upload Error:', err.message);
            return res.status(500).json({ message: 'File upload error.' });
        }

        const file = req.file;
        if (!file) { return res.status(400).send('A file is required.'); }
        
        const { filename, path: filepath } = file;
        const userId = req.user.userId; 

        try {
            const dataBuffer = await fs.readFile(filepath);
            const data = await pdfParse(dataBuffer); 
            const pdfText = data.text;

            const metadata = await generateMetadata(pdfText);
            
            const title = metadata.ai_title; 
            const aiKeywords = JSON.stringify(metadata.keywords);
            const aiAuthors = JSON.stringify(metadata.ai_authors);
            const aiDateCreated = metadata.ai_date_created;

            const newDocument = await db.query(
                `INSERT INTO documents 
                  (title, filename, filepath, ai_keywords, ai_authors, ai_date_created, user_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [title, filename, filepath, aiKeywords, aiAuthors, aiDateCreated, userId]
            );
            res.status(201).json(newDocument.rows[0]);

        } catch (aiOrDbErr) {
            console.error('AI Processing or Database Error:', aiOrDbErr.message);
            await fs.unlink(filepath).catch(e => console.error("Failed to delete temp file:", e)); 
            if (aiOrDbErr.message && aiOrDbErr.message.includes("overloaded")) {
                 return res.status(503).json({ message: 'The AI model is currently overloaded. Please try again in a moment.' });
            }
            res.status(500).json({ message: 'Server error during AI processing or database save.' });
        }
    });
});


router.get('/my-uploads', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = await db.query(
      `SELECT id, title, filename, ai_authors, ai_date_created 
       FROM documents 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ai_authors, ai_date_created } = req.body;
    const userId = req.user.userId;

    const aiAuthorsJson = JSON.stringify(ai_authors);

    const updateQuery = await db.query(
      `UPDATE documents 
       SET title = $1, ai_authors = $2, ai_date_created = $3 
       WHERE id = $4 AND user_id = $5 
       RETURNING *`,
      [title, aiAuthorsJson, ai_date_created, id, userId]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ message: "Document not found or you don't have permission to edit it." });
    }

    res.json(updateQuery.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const fileResult = await db.query(
      'SELECT filename, filepath FROM documents WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ message: "Document not found or you don't have permission to delete it." });
    }

    const { filename, filepath } = fileResult.rows[0];

    await db.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);

    await fs.unlink(filepath);

    res.json({ message: `Document '${filename}' deleted successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;