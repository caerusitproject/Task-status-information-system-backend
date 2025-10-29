const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "hrms-admin",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

const producer = kafka.producer();

(async () => {
  await producer.connect();
  console.log("✅ Kafka connected (Admin)");
})();

module.exports = producer;