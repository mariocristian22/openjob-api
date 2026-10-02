const redis = require('../config/redis');

const CACHE_TTL = 3600;

const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value) => {
  await redis.setEx(key, CACHE_TTL, JSON.stringify(value));
};

const deleteCache = async (key) => {
  await redis.del(key);
};

const deleteCacheByPattern = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await Promise.all(keys.map((k) => redis.del(k)));
  }
};

module.exports = { getCache, setCache, deleteCache, deleteCacheByPattern };
