const documentModel = require('../models/documentModel');
const analyticsModel = require('../models/analyticsModel');
const aiService = require('../services/aiService');
const fileUploadService = require('../services/fileUploadService');
const s3Service = require('../services/s3Service');
const previewService = require('../services/previewService'); 
const path = require('path');

const upload = fileUploadService.upload;

// === SIMPLE IN-MEMORY CACHE FOR TRENDS ===
let trendsCache = { data: [], lastUpdated: 0 };
const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

// HELPER: Hide PDF link if user is not logged in
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
    const now = Date.now();
    if (trendsCache.data.length > 0 && (now - trendsCache.lastUpdated < CACHE_DURATION)) {
        return res.json(trendsCache.data);
    }
    const rawTerms = await analyticsModel.getTopSearches(50);
    if (rawTerms.length === 0) return res.json([]);

    const smartTrends = await aiService.generateSearchInsights(rawTerms);
    trendsCache = { data: smartTrends, lastUpdated: now };
    res.json(smartTrends);
  } catch (err) {
    console.error(err.message);
    if (trendsCache.data.length > 0) return res.json(trendsCache.data);
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
  upload.single('file')(req, res, async function (err) {
    if (err) return res.status(500).json({ message: 'File upload error.' });
    if (!req.file) return res.status(400).send('A file is required.');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `doc-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    const userId = req.user.userId;

    try {
        // 1. Analyze Metadata (AI)
        const metadata = await aiService.analyzeDocument(req.file.buffer);
        
        // 2. Generate Previews (Via Cloudinary)
        let previewUrls = [];
        try {
            previewUrls = await previewService.generatePreviews(req.file.buffer, filename);
        } catch (previewErr) {
            console.error("Preview generation failed:", previewErr);
            previewUrls = [];
        }

        // 3. Upload Original PDF to S3 (Private Storage)
        const fileKey = await s3Service.uploadToS3(req.file, `documents/${filename}`);

        // 4. Save EVERYTHING to DB
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

// === FIXED: Added missing controller function ===
exports.requestDeleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; 
    const userId = req.user.userId;

    if (!reason) {
      return res.status(400).json({ message: "A reason for deletion is required." });
    }

    // Call the model function
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