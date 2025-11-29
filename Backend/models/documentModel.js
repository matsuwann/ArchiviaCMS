const db = require('../db');

exports.findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, title, filename, filepath, preview_urls, created_at, ai_keywords, ai_authors, ai_date_created, ai_journal, ai_abstract, user_id 
     FROM documents ORDER BY created_at DESC`
  );
  return rows;
};

exports.findByTerm = async (term) => {
  const searchQuery = `%${term}%`;
  const { rows } = await db.query(
      `SELECT id, title, filename, filepath, preview_urls, created_at, ai_keywords, ai_authors, ai_date_created, ai_journal, ai_abstract 
       FROM documents 
       WHERE title ILIKE $1 
       OR ai_keywords::text ILIKE $1 
       OR ai_authors::text ILIKE $1 
       OR ai_date_created ILIKE $1 
       OR ai_journal ILIKE $1
       ORDER BY created_at DESC`,
      [searchQuery]
  );
  return rows;
};

exports.create = async ({ title, filename, filepath, preview_urls, ai_keywords, ai_authors, ai_date_created, ai_journal, ai_abstract, user_id }) => {
  const safePreviewUrls = preview_urls || [];
  const { rows } = await db.query(
      `INSERT INTO documents 
        (title, filename, filepath, preview_urls, ai_keywords, ai_authors, ai_date_created, ai_journal, ai_abstract, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, filename, filepath, safePreviewUrls, ai_keywords, ai_authors, ai_date_created, ai_journal, ai_abstract, user_id]
  );
  return rows[0];
};

exports.getAllMetadata = async () => {
  const { rows } = await db.query(
    `SELECT ai_authors, ai_keywords, ai_date_created, ai_journal FROM documents`
  );
  return rows;
};

exports.filterByFacets = async ({ authors, keywords, year, journal, dateRange }) => {
  let query = `SELECT * FROM documents WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  if (authors && authors.length > 0) {
    const conditions = authors.map(a => { params.push(`%${a}%`); return `ai_authors::text ILIKE $${paramIndex++}`; });
    query += ` AND (${conditions.join(' OR ')})`;
  }
  if (keywords && keywords.length > 0) {
    const conditions = keywords.map(k => { params.push(`%${k}%`); return `ai_keywords::text ILIKE $${paramIndex++}`; });
    query += ` AND (${conditions.join(' OR ')})`;
  }
  if (year) { params.push(`%${year}%`); query += ` AND ai_date_created::text ILIKE $${paramIndex++}`; }
  
  if (journal && journal.length > 0) {
    const conditions = journal.map(j => { params.push(j); return `ai_journal = $${paramIndex++}`; });
    query += ` AND (${conditions.join(' OR ')})`;
  }

  if (dateRange) {
    if (dateRange === '7days') query += ` AND created_at >= NOW() - INTERVAL '7 days'`;
    else if (dateRange === '30days') query += ` AND created_at >= NOW() - INTERVAL '30 days'`;
    else if (dateRange === 'thisYear') query += ` AND created_at >= date_trunc('year', NOW())`;
  }

  query += ` ORDER BY created_at DESC`;
  const { rows } = await db.query(query, params);
  return rows;
};

exports.findByUser = async (userId) => {
  const { rows } = await db.query('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows;
};

exports.update = async (id, userId, { title, ai_authors, ai_date_created }) => {
  const aiAuthorsJson = JSON.stringify(ai_authors);
  const { rows } = await db.query(
    `UPDATE documents SET title = $1, ai_authors = $2, ai_date_created = $3 
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [title, aiAuthorsJson, ai_date_created, id, userId]
  );
  return rows[0];
};

exports.findFileForUser = async (id, userId) => {
    const { rows } = await db.query('SELECT filename FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0];
};

exports.deleteByIdAndUser = async (id, userId) => {
    const { rowCount } = await db.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, userId]);
    return rowCount;
};

exports.adminUpdate = async (id, { title, ai_authors, ai_date_created }) => {
  const aiAuthorsJson = JSON.stringify(ai_authors);
  const { rows } = await db.query('UPDATE documents SET title = $1, ai_authors = $2, ai_date_created = $3 WHERE id = $4 RETURNING *', [title, aiAuthorsJson, ai_date_created, id]);
  return rows[0];
};

exports.adminFindFileById = async (id) => {
    const { rows } = await db.query('SELECT filename, filepath FROM documents WHERE id = $1', [id]);
    return rows[0];
};

exports.adminDeleteById = async (id) => {
    const { rowCount } = await db.query('DELETE FROM documents WHERE id = $1', [id]);
    return rowCount;
};

// 1. User submits a request (USER SIDE)
exports.submitDeletionRequest = async (id, userId, reason) => {
  const { rows } = await db.query(
    `UPDATE documents 
     SET deletion_requested = TRUE, deletion_reason = $1 
     WHERE id = $2 AND user_id = $3 
     RETURNING *`,
    [reason, id, userId]
  );
  return rows[0];
};

// 2. Find all User Deletion Requests
exports.findAllDeletionRequests = async () => {
  const { rows } = await db.query(
    `SELECT id, title, filename, user_id, deletion_reason, created_at, ai_authors 
     FROM documents 
     WHERE deletion_requested = TRUE 
     ORDER BY created_at ASC`
  );
  return rows;
};

// 3. Revoke User Deletion Request
exports.revokeDeletionRequest = async (id) => {
  const { rows } = await db.query(
    `UPDATE documents 
     SET deletion_requested = FALSE, deletion_reason = NULL 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );
  return rows[0];
};

// === ADMIN ARCHIVE REQUESTS ===

exports.submitArchiveRequest = async (id, reason) => {
  const { rows } = await db.query(
    `UPDATE documents 
     SET archive_requested = TRUE, archive_reason = $1 
     WHERE id = $2 
     RETURNING *`,
    [reason, id]
  );
  return rows[0];
};

exports.findAllArchiveRequests = async () => {
  const { rows } = await db.query(
    `SELECT id, title, filename, user_id, archive_reason, created_at, ai_authors 
     FROM documents 
     WHERE archive_requested = TRUE 
     ORDER BY created_at ASC`
  );
  return rows;
};

exports.revokeArchiveRequest = async (id) => {
  const { rows } = await db.query(
    `UPDATE documents 
     SET archive_requested = FALSE, archive_reason = NULL 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );
  return rows[0];
};

// === AUTO-ARCHIVE FUNCTION ===
exports.autoArchiveOldDocuments = async () => {
  try {
    // Archives documents created > 10 years ago that aren't already flagged
    const { rowCount } = await db.query(
      `UPDATE documents 
       SET archive_requested = TRUE, 
           archive_reason = 'System Auto-Archive: Document is older than 10 years.'
       WHERE created_at < NOW() - INTERVAL '10 years' 
         AND archive_requested = FALSE` 
    );
    if (rowCount > 0) {
        console.log(`Auto-Archiver: Flagged ${rowCount} documents older than 10 years.`);
    }
    return rowCount;
  } catch (err) {
    console.error("Auto-Archive Error:", err.message);
  }
};