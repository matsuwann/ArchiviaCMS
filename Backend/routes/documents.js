const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db'); 

const router = express.Router();


const authorFormatRegex = /^([A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)(;\s[A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)*$/;


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




router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.post('/upload', upload.single('file'), async (req, res) => {
  const { title, author } = req.body;
  const file = req.file;

 
  if (!authorFormatRegex.test(author)) {
    
    return res.status(400).json({ message: 'Invalid author format. Please use: Lastname, F. M.; Lastname, S.' });
  }


  if (!file || !title) { 
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