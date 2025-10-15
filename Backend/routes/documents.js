const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db'); // Correct path to db.js from within the routes folder

const router = express.Router();

// The Regex pattern to enforce the author format on the backend
const authorFormatRegex = /^([A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)(;\s[A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)*$/;

// --- File Storage Setup (Multer) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- API Routes ---

// GET all documents
// Corresponds to API endpoint: GET /api/documents/
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST (upload) a new document
// Corresponds to API endpoint: POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const { title, author } = req.body;
  const file = req.file;

  // --- Backend Validation Logic ---
  if (!authorFormatRegex.test(author)) {
    // If the format is invalid, reject the request with a 400 Bad Request error.
    return res.status(400).json({ message: 'Invalid author format. Please use: Lastname, F. M.; Lastname, S.' });
  }
  // --- End Validation Logic ---

  if (!file || !title) { // We already validated author
    return res.status(400).send('Title, author, and file are required.');
  }

  const { filename, path: filepath } = file;
  try {
    const newDocument = await db.query(
      'INSERT INTO documents (title, author, filename, filepath) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, filename, filepath]
    );
    res.status(201).json(newDocument.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET documents via search
// Corresponds to API endpoint: GET /api/documents/search
router.get('/search', async (req, res) => {
    const { term } = req.query;
    if (!term) {
        return res.status(400).send('Search term is required.');
    }
    try {
        const searchQuery = `%${term}%`;
        const { rows } = await db.query(
            "SELECT * FROM documents WHERE title ILIKE $1 OR author ILIKE $1 ORDER BY created_at DESC",
            [searchQuery]
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;