const path = require('path');
const userModel = require('../models/userModel');
const documentModel = require('../models/documentModel');
const aiService = require('../services/aiService');
const settingsModel = require('../models/settingsModel');
const fileUploadService = require('../services/fileUploadService');
const s3Service = require('../services/s3Service');

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
    
    // Changed from deleteById to deactivate
    const deactivatedUser = await userModel.deactivate(id);

    if (!deactivatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deactivated successfully.' });
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
 
      await s3Service.deleteFromS3(file.filename); 
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
  fileUploadService.uploadIcon.single('icon')(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message || 'Upload error' });
    if (!req.file) return res.status(400).send('An icon file is required.');

    try {
      // Upload to S3 instead of local disk
      const filename = `favicon-${Date.now()}${path.extname(req.file.originalname)}`;
      const iconUrl = await s3Service.uploadToS3(req.file, filename);
      
      // NOTE: For the favicon to update dynamically, you'd need to store this URL 
      // in your settings table and update your Frontend layout to read it.
      // For now, we just return success.
      res.status(200).json({ message: 'Icon uploaded to S3 (Update frontend to use dynamic favicon URL).' });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: 'Failed to upload icon to S3.'});
    }
  });
};

exports.uploadBgImage = (req, res) => {
  fileUploadService.uploadBgImage.single('bg-image')(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message || 'Upload error' });
    if (!req.file) return res.status(400).send('An image file is required.');
    
    try {
      const filename = `system-background-${Date.now()}${path.extname(req.file.originalname)}`;
      const imageUrl = await s3Service.uploadToS3(req.file, filename);
      
      await settingsModel.updateSettings({ backgroundImage: `url(${imageUrl})` });
      res.status(200).json({ 
        message: 'Background image updated!',
        imageUrl: `url(${imageUrl})` 
      });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: 'Failed to save background image.'});
    }
  });
};

exports.uploadBrandIcon = (req, res) => {
  fileUploadService.uploadBrandIcon.single('brand-icon')(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message || 'Upload error' });
    if (!req.file) return res.status(400).send('An icon file is required.');
    
    try {
      const filename = `brand-icon-${Date.now()}${path.extname(req.file.originalname)}`;
      const iconUrl = await s3Service.uploadToS3(req.file, filename);
      
      await settingsModel.updateSettings({ brandIconUrl: `url(${iconUrl})` });
      res.status(200).json({ 
        message: 'Brand icon updated!',
        iconUrl: `url(${iconUrl})`
      });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: 'Failed to save brand icon.'});
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

exports.removeBrandIcon = async (req, res) => {
  try {
    await settingsModel.updateSettings({ brandIconUrl: 'none' });
    res.status(200).json({ message: 'Brand icon removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove brand icon.' });
  }
};

exports.getDeletionRequests = async (req, res) => {
  try {
    const requests = await documentModel.findAllDeletionRequests();
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.approveDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get file info to delete from S3
    const file = await documentModel.adminFindFileById(id);
    if (!file) return res.status(404).json({ message: "Document not found." });

    // 2. Delete from DB
    const deletedCount = await documentModel.adminDeleteById(id);
    
    // 3. Delete from S3
    if (deletedCount > 0) {
      await s3Service.deleteFromS3(file.filename);
      res.json({ message: "Request approved. Document deleted." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.rejectDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    await documentModel.revokeDeletionRequest(id);
    res.json({ message: "Request rejected. Document kept." });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};