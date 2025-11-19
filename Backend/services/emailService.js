const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Brevo's SMTP Server
  port: 587,                     // Standard secure port
  secure: false,                 // false for port 587
  auth: {
    user: process.env.GMAIL_USER,       // Your Brevo Login Email (from Render Env)
    pass: process.env.GMAIL_APP_PASSWORD, // Your Brevo SMTP Key (from Render Env)
  },
  // Logger for debugging
  logger: true,
  debug: true 
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER, // Sender address (MUST be the email you verified with Brevo)
    to: email,                    // Recipient address (Any user!)
    subject: 'Archivia Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Thank you for registering with Archivia. Please use the following One-Time Password (OTP) to complete your registration:</p>
          <h1 style="background-color: #eee; padding: 10px; text-align: center; letter-spacing: 5px; border-radius: 4px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully via Brevo!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    // Don't throw error so registration doesn't "hang" if email fails
  }
};