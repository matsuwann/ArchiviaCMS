// Backend/controllers/adminController.js
const userModel = require('../models/userModel');
const documentModel = require('../models/documentModel');
const aiService = require('../services/aiService');
const settingsModel = require('../models/settingsModel');
const fileUploadService = require('../services/fileUploadService');

// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body; 

    if (typeof is_admin !== 'boolean') {
      return res.status(400).json({ message: 'Invalid admin status specified. Must be true or false.' });
    }

    const updatedUser = await userModel.updateAdminStatus(id, is_admin);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await userModel.deleteById(id);

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// --- Admin Document Management ---
exports.adminUpdateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ai_authors, ai_date_created } = req.body;

    const updatedDoc = await documentModel.adminUpdate(id, { title, ai_authors, ai_date_created });

    if (!updatedDoc) {
      return res.status(404).json({ message: "Document not found." });
    }
    res.json(updatedDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.adminDeleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await documentModel.adminFindFileById(id);
    if (!file) {
      return res.status(404).json({ message: "Document not found." });
    }

    const deletedCount = await documentModel.adminDeleteById(id);
    if (deletedCount > 0) {
      await aiService.deleteFile(file.filepath); 
      res.json({ message: `Document '${file.filename}' deleted successfully.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// --- Theme Management ---
exports.updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    const updatedSettingsArray = await settingsModel.updateSettings(newSettings);
    
    const settingsObject = updatedSettingsArray.reduce((acc, item) => {
      acc[item.setting_key] = item.setting_value;
      return acc;
    }, {});

    res.json(settingsObject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error updating settings');
  }
};

exports.uploadIcon = (req, res) => {
  fileUploadService.uploadIcon.single('icon')(req, res, function (err) {
    if (err) {
      if (err.message) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Icon upload error.' });
    }
    if (!req.file) {
      return res.status(400).send('An icon file is required.');
    }
    res.status(200).json({ 
      message: 'Icon updated successfully. Hard refresh your browser to see changes.'
    });
  });
};