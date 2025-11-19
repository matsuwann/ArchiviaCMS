const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // You must generate this in Google Account Settings
  },
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Archivia Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};