const { Kafka } = require("kafkajs");
const nodemailer = require("nodemailer");
require('dotenv').config();

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "email-group" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "EMAIL_NOTIFICATION", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("📩 Received email event:", data);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.to,
        subject: data.subject,
        text: data.text,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent to:", data.to);
    },
  });
};

startConsumer().catch(console.error);