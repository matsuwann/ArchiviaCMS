const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');




const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await userModel.createWithOTP({
      firstName,
      lastName,
      email,
      passwordHash,
      otp,
      otpExpires
    });


    emailService.sendOTP(email, otp).catch(err => {
        console.error("BACKGROUND EMAIL ERROR:", err);
    });

   
    res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        email: email, 
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration.');
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const user = await userModel.findByEmail(email);
    
    if (!user) {
        return res.status(400).json({ message: 'User not found.' });
    }
    
   
    if (user.is_verified) {
        return res.status(200).json({ message: 'User is already verified.' });
    }


    if (user.otp_code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
    }
    
    if (new Date() > new Date(user.otp_expires)) {
        return res.status(400).json({ message: 'OTP has expired. Please register again to generate a new one.' });
    }

  
    await userModel.markVerified(user.id);
    
    res.status(200).json({ message: 'Email verified! You can now log in.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during verification.' });
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

    if (!user.is_verified) {
        return res.status(403).json({ message: 'Please verify your email address before logging in.' });
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

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    const user = await userModel.findOrCreateByGoogle({
      email,
      firstName: given_name || 'Google',
      lastName: family_name || 'User'
    });

    const appToken = jwt.sign(
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
      token: appToken, 
      user: { 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name,
        is_admin: user.is_admin
      } 
    });

  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(400).json({ message: 'Google authentication failed.' });
  }
};