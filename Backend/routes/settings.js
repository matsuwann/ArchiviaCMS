// Backend/routes/settings.js
const express = require('express');
const settingsController = require('../controllers/settingsController');
const router = express.Router();

// PUBLIC ROUTE - Anyone can load the theme settings
router.get('/', settingsController.getSettings);

module.exports = router;