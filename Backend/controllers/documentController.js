const documentModel = require('../models/documentModel');
const analyticsModel = require('../models/analyticsModel');
const aiService = require('../services/aiService');
const fileUploadService = require('../services/fileUploadService');
const s3Service = require('../services/s3Service');
const previewService = require('../services/previewService'); 
const path = require('path');

const upload = fileUploadService.upload;

let trendsCache = { data: [], lastUpdated: 0 };
const CACHE_DURATION = 60 * 60 * 1000; 

const sanitizeDocuments = async (req, documents) => {
  const processedDocs = await Promise.all(documents.map(async (doc) => {
    const cleanDoc = { ...doc };

    if (req.user) {
      try {
        if (s3Service.getPresignedUrl && doc.filepath) {
            cleanDoc.downloadLink = await s3Service.getPresignedUrl(doc.filepath);
        } else {
            cleanDoc.downloadLink = null;
        }
      } catch (e) {
        console.error("Error signing URL", e);
        cleanDoc.downloadLink = null;
      }
    } else {
      delete cleanDoc.filepath;
      delete cleanDoc.downloadLink;
    }
    return cleanDoc;
  }));

  return processedDocs;
};

exports.getAllDocuments = async (req, res) => {
  try {
    const rows = await documentModel.findAll();
    const data = await sanitizeDocuments(req, rows);
    res.json(data);
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
        analyticsModel.logSearch(term).catch(e => console.error("Analytics error:", e));
        rows = await documentModel.findByTerm(term);
    }
    const data = await sanitizeDocuments(req, rows);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.filterDocuments = async (req, res) => {
  try {
    const { authors, keywords, year, journal, dateRange } = req.body;
    const rows = await documentModel.filterByFacets({ authors, keywords, year, journal, dateRange });
    const data = await sanitizeDocuments(req, rows);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getPopularSearches = async (req, res) => {
  try {
    // 1. Fetch the actual top 10 terms directly from the DB
    // (Skipping the AI Service "summarization" which hides real data)
    const rawTerms = await analyticsModel.getTopSearches(10);
    
    if (rawTerms.length === 0) {
        return res.json([]);
    }

    // 2. Return them directly. 
    // The structure matches what frontend expects: [{ term: 'abc', count: 12 }]
    res.json(rawTerms);

  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).send('Server error fetching analytics');
  }
};

exports.getFilters = async (req, res) => {
  try {
    const rows = await documentModel.getAllMetadata();
    const authorsSet = new Set();
    const keywordsSet = new Set();
    const yearsSet = new Set();
    const journalsSet = new Set();

    rows.forEach(doc => {
      let authors = [];
      try { authors = typeof doc.ai_authors === 'string' ? JSON.parse(doc.ai_authors) : doc.ai_authors; } catch(e) {}
      if (Array.isArray(authors)) authors.forEach(a => authorsSet.add(a.trim()));

      let keywords = [];
      try { keywords = typeof doc.ai_keywords === 'string' ? JSON.parse(doc.ai_keywords) : doc.ai_keywords; } catch(e) {}
      if (Array.isArray(keywords)) keywords.forEach(k => keywordsSet.add(k.trim()));

      if (doc.ai_date_created) {
        const match = doc.ai_date_created.match(/\d{4}/);
        if (match) yearsSet.add(match[0]);
      }
      if (doc.ai_journal && doc.ai_journal !== 'Unknown Source') {
        journalsSet.add(doc.ai_journal.trim());
      }
    });

    res.json({
      authors: Array.from(authorsSet).sort(),
      keywords: Array.from(keywordsSet).sort(),
      years: Array.from(yearsSet).sort().reverse(),
      journals: Array.from(journalsSet).sort()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error fetching filters');
  }
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

exports.uploadDocument = (req, res) => {
  if (req.user && req.user.is_super_admin) {
      return res.status(403).json({ message: "Super Admins are restricted from uploading documents." });
  }

  upload.single('file')(req, res, async function (err) {
    if (err) return res.status(500).json({ message: 'File upload error.' });
    if (!req.file) return res.status(400).send('A file is required.');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `doc-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    const userId = req.user.userId;

    try {
        const metadata = await aiService.analyzeDocument(req.file.buffer);
        
        if (metadata.title) {
            const existingDoc = await documentModel.findByExactTitle(metadata.title);
            if (existingDoc) {
                return res.status(409).json({ 
                    message: `Duplicate detected. A document with the title "${metadata.title}" already exists.` 
                });
            }
        }

        let previewUrls = [];
        try {
            previewUrls = await previewService.generatePreviews(req.file.buffer, filename);
        } catch (previewErr) {
            console.error("Preview generation failed:", previewErr);
            previewUrls = [];
        }

        const fileKey = await s3Service.uploadToS3(req.file, `documents/${filename}`);

        const documentData = {
          ...metadata,
          filename: filename,
          filepath: fileKey,
          preview_urls: previewUrls, 
          user_id: userId
        };

        const newDocument = await documentModel.create(documentData);
        res.status(201).json(newDocument);

    } catch (aiOrDbErr) {
        console.error('Processing Error:', aiOrDbErr.message);
        if (aiOrDbErr.message && aiOrDbErr.message.includes("overloaded")) {
             return res.status(503).json({ message: 'The AI model is currently overloaded.' });
        }
        res.status(500).json({ message: 'Server error during processing.' });
    }
  });
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ai_authors, ai_date_created } = req.body;
    const userId = req.user.userId;

    const updatedDoc = await documentModel.update(id, userId, { 
      title, 
      ai_authors, 
      ai_date_created 
    });

    if (!updatedDoc) {
      return res.status(404).json({ message: "Document not found or unauthorized." });
    }
    res.json(updatedDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const file = await documentModel.findFileForUser(id, userId);
    if (!file) return res.status(404).json({ message: "Document not found." });

    const deletedCount = await documentModel.deleteByIdAndUser(id, userId);
    if (deletedCount > 0) {
      if (s3Service.deleteFromS3) {
          await s3Service.deleteFromS3(file.filename); 
      }
      res.json({ message: `Document '${file.filename}' deleted.` });
    } else {
      return res.status(404).json({ message: "Document not found." });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.requestDeleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; 
    const userId = req.user.userId;

    if (!reason) {
      return res.status(400).json({ message: "A reason for deletion is required." });
    }

    const result = await documentModel.submitDeletionRequest(id, userId, reason);

    if (!result) {
      return res.status(404).json({ message: "Document not found or unauthorized." });
    }

    res.json({ message: "Deletion request submitted successfully.", request: result });
  } catch (err) {
    console.error("Error requesting deletion:", err.message);
    res.status(500).send('Server error');
  }
};

// === NEW: GENERATE CITATION ===
exports.generateCitation = async (req, res) => {
  try {
    const { document, style } = req.body;
    if (!document || !style) return res.status(400).json({ message: "Missing data" });

    const result = await aiService.formatCitation(document, style);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error generating citation" });
  }
};