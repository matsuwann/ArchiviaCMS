const path = require('path');
const userModel = require('../models/userModel');
const documentModel = require('../models/documentModel');
const aiService = require('../services/aiService');
const settingsModel = require('../models/settingsModel');
const fileUploadService = require('../services/fileUploadService');

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

exports.updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    console.log('[Backend Controller] Received settings to update:', newSettings);
    
    const updatedSettingsArray = await settingsModel.updateSettings(newSettings);
    
    console.log('[Backend Controller] Sending updated settings to frontend.');

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

exports.resetSettings = async (req, res) => {
  try {
    console.log('[Backend Controller] Resetting settings to default...');
    const defaultSettingsArray = await settingsModel.resetToDefault();
    
    const settingsObject = defaultSettingsArray.reduce((acc, item) => {
      acc[item.setting_key] = item.setting_value;
      return acc;
    }, {});

    console.log('[Backend Controller] Settings reset.');
    res.json(settingsObject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error resetting settings');
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

exports.uploadBgImage = (req, res) => {
  fileUploadService.uploadBgImage.single('bg-image')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).send('An image file is required.');
    }
    
    try {
      const imageUrl = `/system-background${path.extname(req.file.originalname)}`;
      await settingsModel.updateSettings({ backgroundImage: `url(${imageUrl})` });
      res.status(200).json({ 
        message: 'Background image updated!',
        imageUrl: `url(${imageUrl})` 
      });
    } catch (dbErr) {
      res.status(500).json({ message: 'File uploaded but failed to save to settings.'});
    }
  });
};

exports.removeBgImage = async (req, res) => {
  try {
    await settingsModel.updateSettings({ backgroundImage: 'none' });
    res.status(200).json({ message: 'Background image removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove background image.' });
  }
};

exports.uploadBrandIcon = (req, res) => {
  fileUploadService.uploadBrandIcon.single('brand-icon')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).send('An icon file is required.');
    }
    
    try {
      const iconUrl = `/system-brand-icon${path.extname(req.file.originalname)}`;
      await settingsModel.updateSettings({ brandIconUrl: `url(${iconUrl})` });
      res.status(200).json({ 
        message: 'Brand icon updated!',
        iconUrl: `url(${iconUrl})`
      });
    } catch (dbErr) {
      res.status(500).json({ message: 'Icon uploaded but failed to save to settings.'});
    }
  });
};

exports.removeBrandIcon = async (req, res) => {
  try {
    await settingsModel.updateSettings({ brandIconUrl: 'none' });
    res.status(200).json({ message: 'Brand icon removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove brand icon.' });
  }
};