const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,      // CHANGED: Use Port 587
  secure: false,  // CHANGED: Must be false for port 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Keep these for debugging until it works
  logger: true,
  debug: true,
  // Add this to handle potential certificate issues in cloud environments
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Archivia Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error; 
  }
};