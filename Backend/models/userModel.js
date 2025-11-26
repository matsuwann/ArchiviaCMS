const db = require('../db');

exports.findByEmail = async (email) => {
  // Added is_active to the select list
  const { rows } = await db.query(
    'SELECT id, first_name, last_name, email, password_hash, is_admin, is_verified, otp_code, otp_expires, is_active FROM users WHERE email = $1', 
    [email]
  );
  return rows[0];
};

exports.createWithOTP = async ({ firstName, lastName, email, passwordHash, otp, otpExpires }) => {
  const { rows } = await db.query(
    // Added is_active = TRUE by default
    `INSERT INTO users (first_name, last_name, email, password_hash, otp_code, otp_expires, is_verified, is_active) 
     VALUES ($1, $2, $3, $4, $5, $6, FALSE, TRUE) 
     RETURNING id, first_name, last_name, email, is_admin`,
    [firstName, lastName, email, passwordHash, otp, otpExpires]
  );
  return rows[0];
};

exports.create = async ({ firstName, lastName, email, passwordHash }) => {
  const { rows } = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, is_active) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, first_name, last_name, email, is_admin',
    [firstName, lastName, email, passwordHash]
  );
  return rows[0];
};

exports.markVerified = async (userId) => {
  await db.query(
    'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = $1', 
    [userId]
  );
};

exports.findAll = async () => {
  // Added is_active to selection
  const { rows } = await db.query('SELECT id, first_name, last_name, email, is_admin, is_verified, is_active FROM users ORDER BY last_name');
  return rows;
};

exports.updateAdminStatus = async (userId, isAdminBoolean) => {
  const { rows } = await db.query(
    'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, is_admin',
    [isAdminBoolean, userId]
  );
  return rows[0];
};

// NEW: Function to update full user details
exports.updateUserDetails = async (userId, { first_name, last_name, email, is_admin }) => {
  const { rows } = await db.query(
    `UPDATE users 
     SET first_name = $1, last_name = $2, email = $3, is_admin = $4 
     WHERE id = $5 
     RETURNING id, first_name, last_name, email, is_admin, is_active`,
    [first_name, last_name, email, is_admin, userId]
  );
  return rows[0];
};

// CHANGED: This checks for soft-deletion now
exports.deactivate = async (userId) => {
  const { rows } = await db.query(
    'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id', 
    [userId]
  );
  return rows[0];
};

exports.findOrCreateByGoogle = async ({ email, firstName, lastName }) => {
  const existingUser = await exports.findByEmail(email);
  
  if (existingUser) {
    return existingUser;
  }

  const { rows } = await db.query(
    `INSERT INTO users 
     (first_name, last_name, email, password_hash, is_verified, is_active) 
     VALUES ($1, $2, $3, $4, TRUE, TRUE) 
     RETURNING id, first_name, last_name, email, is_admin`,
    [firstName, lastName, email, 'GOOGLE_AUTH_USER'] 
  );
  
  return rows[0];
};

exports.saveResetToken = async (email, token, expires) => {
  await db.query(
    'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
    [token, expires, email]
  );
};

exports.findByResetToken = async (token) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
    [token]
  );
  return rows[0];
};

exports.updatePassword = async (userId, passwordHash) => {
  await db.query(
    'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
    [passwordHash, userId]
  );
};

exports.reactivate = async (userId) => {
  const { rows } = await db.query(
    'UPDATE users SET is_active = TRUE WHERE id = $1 RETURNING id', 
    [userId]
  );
  return rows[0];
};