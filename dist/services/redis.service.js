"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheChannel = exports.getCachedChannel = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
exports.redisClient = new ioredis_1.default(redisUrl, {
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('⚠️ [Warning] Redis is currently offline. Falling back to in-memory cache.');
            return null;
        }
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null,
});
exports.redisClient.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
        console.warn(`⚠️ [Warning] Redis connection error: ${err.message}`);
    }
});
// In-memory fallback cache for when Redis is offline (e.g., local development)
const fallbackCache = new Map();
const getCachedChannel = async (channelId) => {
    try {
        if (exports.redisClient.status !== 'ready') {
            const fallbackData = fallbackCache.get(`channel:${channelId}`);
            return fallbackData ? JSON.parse(fallbackData) : null;
        }
        const data = await exports.redisClient.get(`channel:${channelId}`);
        return data ? JSON.parse(data) : null;
    }
    catch (err) {
        console.error('Redis GET error:', err);
        return null;
    }
};
exports.getCachedChannel = getCachedChannel;
const cacheChannel = async (channelId, data) => {
    try {
        if (exports.redisClient.status !== 'ready') {
            fallbackCache.set(`channel:${channelId}`, JSON.stringify(data));
            return;
        }
        await exports.redisClient.setex(`channel:${channelId}`, 86400, JSON.stringify(data));
    }
    catch (err) {
        console.error('Redis SETEX error:', err);
    }
};
exports.cacheChannel = cacheChannel;
