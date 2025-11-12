const db = require('../db');

exports.findByEmail = async (email) => {
  // Select all columns including the new 'is_admin'
  const { rows } = await db.query(
    'SELECT id, first_name, last_name, email, password_hash, is_admin FROM users WHERE email = $1', 
    [email]
  );
  return rows[0];
};

exports.create = async ({ firstName, lastName, email, passwordHash }) => {
  // 'is_admin' will use the DEFAULT 'false' we set in the database
  const { rows } = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, is_admin',
    [firstName, lastName, email, passwordHash]
  );
  return rows[0];
};

// --- NEW FUNCTIONS FOR ADMIN DASHBOARD ---

exports.findAll = async () => {
  // Note: We explicitly DO NOT select the password_hash
  const { rows } = await db.query('SELECT id, first_name, last_name, email, is_admin FROM users ORDER BY last_name');
  return rows;
};

exports.updateAdminStatus = async (userId, isAdminBoolean) => {
  const { rows } = await db.query(
    'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, is_admin',
    [isAdminBoolean, userId]
  );
  return rows[0];
};

exports.deleteById = async (userId) => {
  const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [userId]);
  return rowCount;
};