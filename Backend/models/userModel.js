const db = require('../db');

exports.findByEmail = async (email) => {
  const { rows } = await db.query(
    'SELECT id, first_name, last_name, email, password_hash, is_admin, is_verified, otp_code, otp_expires FROM users WHERE email = $1', 
    [email]
  );
  return rows[0];
};

exports.createWithOTP = async ({ firstName, lastName, email, passwordHash, otp, otpExpires }) => {
  const { rows } = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, otp_code, otp_expires, is_verified) 
     VALUES ($1, $2, $3, $4, $5, $6, FALSE) 
     RETURNING id, first_name, last_name, email, is_admin`,
    [firstName, lastName, email, passwordHash, otp, otpExpires]
  );
  return rows[0];
};

// Kept for backward compatibility if needed, but createWithOTP is preferred now
exports.create = async ({ firstName, lastName, email, passwordHash }) => {
  const { rows } = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, is_admin',
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
  const { rows } = await db.query('SELECT id, first_name, last_name, email, is_admin, is_verified FROM users ORDER BY last_name');
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

exports.findOrCreateByGoogle = async ({ email, firstName, lastName }) => {

  const existingUser = await exports.findByEmail(email);
  
  if (existingUser) {
    return existingUser;
  }


  const { rows } = await db.query(
    `INSERT INTO users 
     (first_name, last_name, email, password_hash, is_verified) 
     VALUES ($1, $2, $3, $4, TRUE) 
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