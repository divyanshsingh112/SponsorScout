"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.youtube = void 0;
const googleapis_1 = require("googleapis");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables early
dotenv_1.default.config();
// 1. Initialize YouTube Data API v3 Client
exports.youtube = googleapis_1.google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY || 'PLACEHOLDER_KEY',
});
// 2. Initialize local Redis connection
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
exports.redis = new ioredis_1.default({
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
exports.redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn(`⚠️ [Warning] Could not connect to Redis at ${redisHost}:${redisPort}. Is it running?`);
    }
    else {
        console.warn(`⚠️ [Warning] Redis connection error: ${err.message}`);
    }
});
exports.redis.on('connect', () => {
    console.log(`✅ Connected to Redis at ${redisHost}:${redisPort}`);
});
