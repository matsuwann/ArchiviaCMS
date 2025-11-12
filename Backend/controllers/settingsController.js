const settingsModel = require('../models/settingsModel');

exports.getSettings = async (req, res) => {
  try {
    const settingsArray = await settingsModel.getSettings();
  
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