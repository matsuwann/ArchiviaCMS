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

router.put('/documents/:id', adminController.adminUpdateDocument);
router.delete('/documents/:id', adminController.adminDeleteDocument);

module.exports = router;