const { Kafka } = require("kafkajs");
require('dotenv').config();

const kafka = new Kafka({
  clientId: "leave-service",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

const sendEvent = async (emailData) => {
  console.log("eventdata", emailData);
  await producer.connect();
  await producer.send({
    topic: "EMAIL_NOTIFICATION",
    messages: [{ value: JSON.stringify(emailData) }],
  });
  console.log("📤 Email event sent to Kafka:", emailData);
  await producer.disconnect();
};

module.exports = { sendEvent };