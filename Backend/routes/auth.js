const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }


  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password is not strong enough.',
      details: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const newUser = await db.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
      [firstName, lastName, email, passwordHash]
    );

    res.status(201).json({
        message: 'User registered successfully. You can now log in.',
        user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration.');
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { email: user.email, firstName: user.first_name, lastName: user.last_name } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login.');
  }
});

module.exports = router;