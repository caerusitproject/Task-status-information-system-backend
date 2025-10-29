const nodemailer = require('nodemailer');
const fs = require("fs");
const { emailTemplateGetter } = require('./emailTemplateGetter');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

exports.sendEmailNotification = async (notification) => {
  const { email, subject, payload } = notification;

  try {
    const compiled = await emailTemplateGetter(payload);
    if (!compiled) {
      console.warn("⚠️ No compiled email data returned.");
      return;
    }

    // Send email using the compiled template
    await transporter.sendMail({
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to: compiled.toEmail || email,
      subject: compiled.subject || subject || "Notification",
      html: compiled.body,
    });

    console.log(`✅ Email sent to ${compiled.toEmail || email}`);
  } catch (err) {
    console.error(`❌ Failed to send email notification:`, err.message);
  }
};

exports.sendPayslipEmail = async (employee, filePath) => {
  const payload = {
    ...employee,
    type: "payslip",
    attachmentFilePath: filePath,
  };
  const compiled = await emailTemplateGetter(payload);
  if (!compiled || compiled === null) {
    console.warn("⚠️ No compiled email data returned.");
    //return;
  }
  let attachments = compiled.attachments || [];

  await transporter.sendMail({
    from: '"HRMS Notification" <no-reply@hrms.com>',
    to: employee.email,
    subject: compiled.subject,
    html: compiled.body,
    attachments
  });
};

