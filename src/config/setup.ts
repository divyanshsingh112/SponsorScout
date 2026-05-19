import { google } from 'googleapis';
import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables early
dotenv.config();

// 1. Initialize YouTube Data API v3 Client
export const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY || 'PLACEHOLDER_KEY',
});

// 2. Initialize local Redis connection
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️ [Warning] Redis is currently offline. Some features may be disabled.');
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: null,
});

redis.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') {
    console.warn(`⚠️ [Warning] Could not connect to Redis at ${redisHost}:${redisPort}. Is it running?`);
  } else {
    console.warn(`⚠️ [Warning] Redis connection error: ${err.message}`);
  }
});

redis.on('connect', () => {
  console.log(`✅ Connected to Redis at ${redisHost}:${redisPort}`);
});
