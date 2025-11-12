const db = require('../db');

exports.findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, title, filename, filepath, created_at, ai_keywords, ai_authors, ai_date_created, user_id 
     FROM documents 
     ORDER BY created_at DESC`
  );
  return rows;
};

exports.findByTerm = async (term) => {
  const searchQuery = `%${term}%`;
  const { rows } = await db.query(
      `SELECT id, title, filename, filepath, created_at, ai_keywords, ai_authors, ai_date_created 
       FROM documents 
       WHERE title ILIKE $1 
       OR ai_keywords::text ILIKE $1 
       OR ai_authors::text ILIKE $1 
       OR ai_date_created ILIKE $1 
       ORDER BY created_at DESC`,
      [searchQuery]
  );
  return rows;
};

exports.findByUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, title, filename, ai_authors, ai_date_created 
     FROM documents 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

exports.create = async ({ title, filename, filepath, ai_keywords, ai_authors, ai_date_created, user_id }) => {
  const { rows } = await db.query(
      `INSERT INTO documents 
        (title, filename, filepath, ai_keywords, ai_authors, ai_date_created, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, filename, filepath, ai_keywords, ai_authors, ai_date_created, user_id]
  );
  return rows[0];
};


exports.update = async (id, userId, { title, ai_authors, ai_date_created }) => {
  const aiAuthorsJson = JSON.stringify(ai_authors);
  const { rows } = await db.query(
    `UPDATE documents 
     SET title = $1, ai_authors = $2, ai_date_created = $3 
     WHERE id = $4 AND user_id = $5 
     RETURNING *`,
    [title, aiAuthorsJson, ai_date_created, id, userId]
  );
  return rows[0];
};

exports.findFileForUser = async (id, userId) => {
    const { rows } = await db.query(
      'SELECT filename, filepath FROM documents WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0];
};

exports.deleteByIdAndUser = async (id, userId) => {
    const { rowCount } = await db.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2', 
      [id, userId]
    );
    return rowCount;
};

// --- NEW ADMIN FUNCTIONS ---

exports.adminUpdate = async (id, { title, ai_authors, ai_date_created }) => {
  const aiAuthorsJson = JSON.stringify(ai_authors);
  const { rows } = await db.query(
    `UPDATE documents 
     SET title = $1, ai_authors = $2, ai_date_created = $3 
     WHERE id = $4 
     RETURNING *`,
    [title, aiAuthorsJson, ai_date_created, id]
  );
  return rows[0];
};

exports.adminFindFileById = async (id) => {
    const { rows } = await db.query(
      'SELECT filename, filepath FROM documents WHERE id = $1',
      [id]
    );
    return rows[0];
};

exports.adminDeleteById = async (id) => {
    const { rowCount } = await db.query(
      'DELETE FROM documents WHERE id = $1', 
      [id]
    );
    return rowCount;
};