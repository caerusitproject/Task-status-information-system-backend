const { Kafka } = require('kafkajs');
require('dotenv').config();

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'hrms-workflow',
  brokers
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log('Kafka producer connected');
}

module.exports = { kafka, producer, connectProducer };