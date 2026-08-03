const redis = require('redis');

let redisClient;

async function connectRedis() {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
  });

  await redisClient.connect();
}

async function getRedisClient() {
  if (!redisClient) {
    await connectRedis();
  }
  return redisClient;
}

module.exports = {
  connectRedis,
  getRedisClient
};