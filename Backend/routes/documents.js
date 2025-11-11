const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// PUBLIC ROUTES
router.get('/', documentController.getAllDocuments);
router.get('/search', documentController.searchDocuments);

// PROTECTED ROUTES
router.post('/upload', authMiddleware, documentController.uploadDocument);
router.get('/my-uploads', authMiddleware, documentController.getUserUploads);
router.put('/:id', authMiddleware, documentController.updateDocument);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;