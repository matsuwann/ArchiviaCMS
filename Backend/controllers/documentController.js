const documentModel = require('../models/documentModel');
const aiService = require('../services/aiService');
const fileUploadService = require('../services/fileUploadService');

const upload = fileUploadService.upload;

exports.getAllDocuments = async (req, res) => {
  try {
    const rows = await documentModel.findAll();
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchDocuments = async (req, res) => {
  const { term } = req.query;
  try {
    let rows;
    if (!term) {
        rows = await documentModel.findAll();
    } else {
        rows = await documentModel.findByTerm(term);
    }
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.uploadDocument = (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err) {
        if (err.message === 'Invalid file type. Only PDF documents are accepted.') {
            return res.status(400).json({ message: err.message });
        }
        console.error('Multer/Upload Error:', err.message);
        return res.status(500).json({ message: 'File upload error.' });
    }

    const file = req.file;
    if (!file) { return res.status(400).send('A file is required.'); }
    
    const { filename, path: filepath } = file; 
    const userId = req.user.userId;
  

    try {
 
        const metadata = await aiService.analyzeDocument(filepath);
        
        const documentData = {
          ...metadata, 
          filename: filename,   
          filepath: filepath,   
          user_id: userId       
        };

        const newDocument = await documentModel.create(documentData);
        res.status(201).json(newDocument);

    } catch (aiOrDbErr) {
        console.error('AI Processing or Database Error:', aiOrDbErr.message);
        if (aiOrDbErr.message && aiOrDbErr.message.includes("overloaded")) {
             return res.status(503).json({ message: 'The AI model is currently overloaded. Please try again in a moment.' });
        }
        res.status(500).json({ message: 'Server error during AI processing or database save.' });
    }
  });
};

exports.getUserUploads = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rows = await documentModel.findByUser(userId);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ai_authors, ai_date_created } = req.body;
    const userId = req.user.userId;

    const updatedDoc = await documentModel.update(id, userId, { title, ai_authors, ai_date_created });

    if (!updatedDoc) {
      return res.status(440).json({ message: "Document not found or you don't have permission to edit it." });
    }
    res.json(updatedDoc);
  } catch (err)
 {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const file = await documentModel.findFileForUser(id, userId);
    if (!file) {
      return res.status(404).json({ message: "Document not found or you don't have permission to delete it." });
    }

    const deletedCount = await documentModel.deleteByIdAndUser(id, userId);
    if (deletedCount > 0) {
      await aiService.deleteFile(file.filepath); 
      res.json({ message: `Document '${file.filename}' deleted successfully.` });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};