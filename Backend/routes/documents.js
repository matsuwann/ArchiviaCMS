const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware'); 

// Public Routes (With Optional Auth for View Logic)
router.get('/', optionalAuthMiddleware, documentController.getAllDocuments);
router.get('/search', optionalAuthMiddleware, documentController.searchDocuments);
router.post('/filter', optionalAuthMiddleware, documentController.filterDocuments);

// Public Analytics
router.get('/popular', documentController.getPopularSearches);
router.get('/filters', documentController.getFilters);

// === NEW: CITATION ROUTE ===
// Note: Ensure your documentController has the generateCitation method!
router.post('/citation', optionalAuthMiddleware, documentController.generateCitation);

// Protected Routes
router.get('/my-uploads', authMiddleware, documentController.getUserUploads);
router.post('/upload', authMiddleware, documentController.uploadDocument);
router.put('/:id', authMiddleware, documentController.updateDocument);
router.delete('/:id', authMiddleware, documentController.deleteDocument);
router.post('/:id/request-delete', authMiddleware, documentController.requestDeleteDocument);

module.exports = router;