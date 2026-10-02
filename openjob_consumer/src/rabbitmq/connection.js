const amqp = require('amqplib');

let channel = null;
const QUEUE_NAME = 'applications_queue';

async function getChannel() {
  if (channel) return channel;

  const connection = await amqp.connect({
    hostname: process.env.RABBITMQ_HOST || 'localhost',
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
  });

  channel = await connection.createChannel();
  return channel;
}

module.exports = { getChannel, QUEUE_NAME };
