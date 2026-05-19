import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

export const redisClient = new Redis(redisUrl, {
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️ [Warning] Redis is currently offline. Falling back to in-memory cache.');
      return null;
    }
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err: any) => {
  if (err.code !== 'ECONNREFUSED') {
    console.warn(`⚠️ [Warning] Redis connection error: ${err.message}`);
  }
});

// In-memory fallback cache for when Redis is offline (e.g., local development)
const fallbackCache = new Map<string, string>();

export const getCachedChannel = async (channelId: string): Promise<any | null> => {
  try {
    if (redisClient.status !== 'ready') {
      const fallbackData = fallbackCache.get(`channel:${channelId}`);
      return fallbackData ? JSON.parse(fallbackData) : null;
    }
    const data = await redisClient.get(`channel:${channelId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis GET error:', err);
    return null;
  }
};

export const cacheChannel = async (channelId: string, data: object): Promise<void> => {
  try {
    if (redisClient.status !== 'ready') {
      fallbackCache.set(`channel:${channelId}`, JSON.stringify(data));
      return;
    }
    await redisClient.setex(`channel:${channelId}`, 86400, JSON.stringify(data));
  } catch (err) {
    console.error('Redis SETEX error:', err);
  }
};
