// Backend/models/settingsModel.js
const db = require('../db');

/**
 * Fetches all settings from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of settings, e.g.,
 * [{setting_key: 'backgroundColor', setting_value: '#ffffff'}, ...]
 */
exports.getSettings = async () => {
  const { rows } = await db.query('SELECT setting_key, setting_value FROM system_settings');
  return rows;
};

/**
 * Inserts or updates settings in the database.
 * @param {Object} settingsObject - An object of key-value pairs, e.g., { backgroundColor: '#FFF', foregroundColor: '#111' }
 * @returns {Promise<Array>} A promise that resolves to the newly updated settings.
 */
exports.updateSettings = async (settingsObject) => {
  // This runs all update/insert queries in parallel
  const promises = Object.entries(settingsObject).map(([key, value]) => {
    return db.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES ($1, $2)
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = $2`,
      [key, value]
    );
  });
  
  await Promise.all(promises);
  
  // Return all settings after the update
  return exports.getSettings();
};