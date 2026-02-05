const nodemailer = require('nodemailer');

// Create transporter only if credentials are available
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.warn('Email credentials not configured. Email functionality will be disabled.');
}

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    console.log('Email not configured - skipping welcome email to:', email);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Expense Tracker!',
    html: `
      <h1>Thank you for joining, ${name}!</h1>
      <p>Welcome to Expense Tracker. We're excited to have you on board.</p>
      <p>You can now start tracking your expenses and managing your budgets.</p>
      <p>Best regards,<br>The Expense Tracker Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  if (!transporter) {
    console.log('Email not configured - skipping password reset email to:', email);
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your Expense Tracker account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The Expense Tracker Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};
