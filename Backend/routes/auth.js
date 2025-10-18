const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const router = express.Router();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;


router.post('/register', async (req, res) => { 
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const newUser = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );
    res.status(201).json({ 
        message: 'User registered successfully. Use these credentials to login.',
        user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration.');
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.json({ token, username: user.username });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login.');
  }
});


module.exports = router;