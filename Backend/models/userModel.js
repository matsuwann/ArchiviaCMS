const db = require('../db');

exports.findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

exports.create = async ({ firstName, lastName, email, passwordHash }) => {
  const { rows } = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
    [firstName, lastName, email, passwordHash]
  );
  return rows[0];
};