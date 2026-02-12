// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter (configure based on your email service)
const transporter = nodemailer.createTransport({
  // For development, you can use Ethereal email (fake SMTP service)
  // Or configure for your actual email service (Gmail, Outlook, etc.)

  // Option 1: For development/testing with Ethereal
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER || 'your-ethereal-email',
    pass: process.env.ETHEREAL_PASS || 'your-ethereal-password'
  },

  // Option 2: For Gmail (enable "Less secure app access" or use App Password)
  /*
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
  */

  // Option 3: For Outlook/Hotmail
  /*
  host: 'smtp-mail.outlook.com',
  secureConnection: false,
  port: 587,
  tls: {
    ciphers: 'SSLv3'
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
  */
});

// Test email configuration
const testTransporter = async () => {
  try {
    // For Ethereal, get test account
    if (transporter.options.host === 'smtp.ethereal.email') {
      const testAccount = await nodemailer.createTestAccount();
      transporter.options.auth.user = testAccount.user;
      transporter.options.auth.pass = testAccount.pass;
      console.log('Ethereal test account created:', testAccount.user);
    }
    
    await transporter.verify();
    console.log('Email transporter is ready');
  } catch (error) {
    console.error('Email transporter error:', error);
  }
};

// Initialize transporter
testTransporter();

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 * @param {string} html - Email HTML content (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
      to,
      subject,
      text,
      ...(html && { html }) // Include html if provided
    };

    const info = await transporter.sendMail(mailOptions);

    // For Ethereal emails, log the preview URL
    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a welcome email to new users
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @returns {Promise}
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Our Platform!';
  const text = `Hello ${name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform, ${name}!</h2>
      <p>We're excited to have you on board.</p>
      <p>Start exploring all the features we have to offer.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The Team</strong></p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - Password reset token
 * @returns {Promise}
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click the link to reset your password: ${resetLink}\n\nIf you didn't request this, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <br>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
};

/**
 * Send email verification email
 * @param {string} email - User's email
 * @param {string} verificationToken - Email verification token
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, verificationToken) => {
  const verifyLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email Address';
  const text = `Please verify your email address by clicking the link: ${verifyLink}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
      <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verifyLink}</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};