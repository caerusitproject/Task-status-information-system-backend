const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'hrms-service',
  brokers: [process.env.KAFKA_BROKER], // Update for your Docker setup
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

module.exports = { producer, connectProducer };