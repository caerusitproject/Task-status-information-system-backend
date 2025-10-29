const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certificates
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP connected successfully");
  }
});

await transporter.sendMail({
  from: process.env.SMTP_EMAIL,
  to: user.email,
  subject: "Welcome to HRMS",
  html: "<h3>Your account has been created successfully!</h3>",
});

module.exports = transporter;