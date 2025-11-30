const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/optionalAuthMiddleware');

// Public Routes
router.get('/', optionalAuth, documentController.getAllDocuments);
router.get('/search', optionalAuth, documentController.searchDocuments);
router.post('/filter', optionalAuth, documentController.filterDocuments);
router.get('/popular', documentController.getPopularSearches);
router.get('/filters', documentController.getFilters);

// === NEW: CITATION ROUTE (Public/Optional) ===
router.post('/citation', optionalAuth, documentController.generateCitation);

// Protected Routes
router.get('/my-uploads', requireAuth, documentController.getUserUploads);
router.post('/upload', requireAuth, documentController.uploadDocument);
router.put('/:id', requireAuth, documentController.updateDocument);
router.delete('/:id', requireAuth, documentController.deleteDocument);
router.post('/:id/request-delete', requireAuth, documentController.requestDeleteDocument);

module.exports = router;