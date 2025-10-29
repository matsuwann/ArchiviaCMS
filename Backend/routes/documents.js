const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db'); 

const router = express.Router();


const authorFormatRegex = /^([A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)(;\s[A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)*$/;

// Add a file filter to accept only application/pdf
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    // Accept file
    cb(null, true);
  } else {
    // Reject file and return a descriptive error message
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
  fileFilter: fileFilter // <-- Pass the filter to multer
});




router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Change the router.post handler to manually call upload.single and handle errors
router.post('/upload', (req, res) => {
    // Manually call the multer middleware to catch errors, including fileFilter rejection
    upload.single('file')(req, res, async function (err) {
        // Handle multer-related errors (including the one from fileFilter)
        if (err) {
            // Check for the specific error message from the fileFilter
            if (err.message === 'Invalid file type. Only PDF documents are accepted.') {
                // Respond with a 400 Bad Request and the error message
                return res.status(400).json({ message: err.message });
            }
            
            // Handle other general Multer errors or unexpected errors
            console.error('Multer/Upload Error:', err.message);
            return res.status(500).json({ message: 'File upload error.' });
        }

        const { title, author } = req.body;
        const file = req.file;
        
        // Original logic for author format validation
        if (!authorFormatRegex.test(author)) {
            return res.status(400).json({ message: 'Invalid author format. Please use: Lastname, F. M.; Lastname, S.' });
        }

        // Original logic for missing fields
        if (!file || !title) { 
            return res.status(400).send('Title, author, and file are required.');
        }

        // Original database logic
        const { filename, path: filepath } = file;
        try {
            const newDocument = await db.query(
                'INSERT INTO documents (title, author, filename, filepath) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, author, filename, filepath]
            );
            res.status(201).json(newDocument.rows[0]);
        } catch (dbErr) {
            console.error(dbErr.message);
            res.status(500).send('Server error');
        }
    });
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