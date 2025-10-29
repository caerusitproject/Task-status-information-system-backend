const { producer } = require('../config/kafka/workflowKafka');
const uuid = require('uuid');

async function publish(topic, eventType, payload = {}) {
  const message = {
    eventId: uuid.v4(),
    eventType,
    occurredAt: new Date().toISOString(),
    payload
  };

  await producer.send({
    topic,
    messages: [
      { key: String(payload.employeeId || payload.email || ''), value: JSON.stringify(message) }
    ]
  });
  console.log(`Published event ${eventType} to ${topic}`);
  return message;
}

module.exports = { publish };