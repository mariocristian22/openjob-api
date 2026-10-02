const redis = require('redis');
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});
client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));
client.connect();
module.exports = client;
