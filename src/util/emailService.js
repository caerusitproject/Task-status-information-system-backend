/*const nodemailer = require('nodemailer');
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587 ,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

exports.sendEmail = async (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }

  const { to, subject, body, isHtml = true, attachments = [] } = payload;// destructuring payload
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error('Valid recipient email is required');
  }
  for (const attachment of attachments) {
    if (!attachment.filename || !attachment.content || !attachment.contentType) {
      throw new Error('Each attachment must have filename, content, and contentType');
    }
  }

  try {
    const mailOptions = {
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to,
      subject,
      body,
      attachments: attachments.map(({ filename, content, contentType }) => ({
        filename,
        content: Buffer.from(content, 'base64'), // Decode base64 content
        contentType,
      })),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};*/
 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

exports.sendEmail = async (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }

  const { to, cc = [], bcc = [], subject, body, isHtml = true, attachments = [] } = payload;
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error('Valid recipient email is required');
  }
  for (const email of [...cc, ...bcc]) {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('All CC and BCC entries must be valid email addresses');
    }
  }
  for (const attachment of attachments) {
    if (!attachment.filename || !attachment.content || !attachment.contentType) {
      throw new Error('Each attachment must have filename, content, and contentType');
    }
  }

  try {
    const mailOptions = {
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to,
      cc, 
      bcc, 
      subject,
      [isHtml ? 'html' : 'text']: body, 
      attachments: attachments.map(({ filename, content, contentType }) => ({
        filename,
        content: Buffer.from(content, 'base64'),
        contentType,
      })),
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};