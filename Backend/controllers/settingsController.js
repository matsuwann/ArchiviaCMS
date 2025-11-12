// Backend/controllers/settingsController.js
const settingsModel = require('../models/settingsModel');

/**
 * Gets all system settings and formats them as a key-value object.
 */
exports.getSettings = async (req, res) => {
  try {
    const settingsArray = await settingsModel.getSettings();
    
    // Convert from [{key: '...', value: '...'}, ...] to { backgroundColor: '...', ... }
    const settingsObject = settingsArray.reduce((acc, item) => {
      acc[item.setting_key] = item.setting_value;
      return acc;
    }, {});

    res.json(settingsObject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error getting settings');
  }
};