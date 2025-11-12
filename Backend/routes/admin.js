// Backend/routes/admin.js
const express = require('express');
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Protect all routes in this file
router.use(adminMiddleware);

// User Routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Document Routes
router.put('/documents/:id', adminController.adminUpdateDocument);
router.delete('/documents/:id', adminController.adminDeleteDocument);

// Theme/Settings Routes
router.put('/settings', adminController.updateSettings);
router.post('/icon-upload', adminController.uploadIcon);

router.post('/upload-bg-image', adminController.uploadBgImage);
router.post('/remove-bg-image', adminController.removeBgImage);
router.post('/upload-brand-icon', adminController.uploadBrandIcon);
router.post('/remove-brand-icon', adminController.removeBrandIcon);

module.exports = router;