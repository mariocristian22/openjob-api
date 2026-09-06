const amqp = require('amqplib');

let channel = null;
const QUEUE_NAME = 'applications_queue';

async function getChannel() {
  if (channel) return channel;
  const connection = await amqp.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  channel = await connection.createChannel();
  return channel;
}

async function publishApplicationMessage(applicationId) {
  const ch = await getChannel();
  await ch.assertQueue(QUEUE_NAME, { durable: true });
  ch.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify({ application_id: applicationId })),
    { persistent: true },
  );
}

module.exports = { getChannel, publishApplicationMessage, QUEUE_NAME };