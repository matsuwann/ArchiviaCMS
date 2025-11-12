const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.register = async (req, res) => {
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
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await userModel.create({
      firstName,
      lastName,
      email,
      passwordHash
    });

    res.status(201).json({
        message: 'User registered successfully. You can now log in.',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          is_admin: user.is_admin 
        }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration.');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name,
        is_admin: user.is_admin
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: { 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name,
        is_admin: user.is_admin
      } 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login.');
  }
};