const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware'); 
const router = express.Router();

// Public Routes (With Optional Auth for View Logic)
router.get('/', optionalAuthMiddleware, documentController.getAllDocuments);
router.get('/search', optionalAuthMiddleware, documentController.searchDocuments);
router.post('/filter', optionalAuthMiddleware, documentController.filterDocuments);

// Public Analytics
router.get('/popular', documentController.getPopularSearches);
router.get('/filters', documentController.getFilters);

// Protected Routes
router.post('/upload', authMiddleware, documentController.uploadDocument);
router.get('/my-uploads', authMiddleware, documentController.getUserUploads);
router.put('/:id', authMiddleware, documentController.updateDocument);
router.post('/:id/request-delete', authMiddleware, documentController.requestDeleteDocument);

module.exports = router;