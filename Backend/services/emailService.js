const nodemailer = require('nodemailer');

// Use explicit host and port configuration for better reliability on Render
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,    // Port 465 is for Secure SSL (Allowed by Render)
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Archivia Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
  };
  
  // Attempt to send the email
  await transporter.sendMail(mailOptions);
};