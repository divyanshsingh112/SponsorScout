"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_service_1 = require("./redis.service");
const transactionCache = new Map();
class PaymentService {
    static async createPaymentIntent(channelId, amount) {
        // Generate a random string as a transactionId
        const transactionId = crypto_1.default.randomBytes(16).toString('hex');
        // Store record in in-memory cache
        transactionCache.set(transactionId, { channelId, status: 'PENDING' });
        return {
            transactionId,
            paymentUrl: `https://mock-upi.com/pay/${transactionId}`,
        };
    }
    static async verifyPayment(transactionId) {
        // Look up the transaction in the cache
        const tx = transactionCache.get(transactionId);
        if (!tx) {
            throw new Error('Transaction not found');
        }
        // Change the status to SUCCESS
        tx.status = 'SUCCESS';
        transactionCache.set(transactionId, tx);
        // Add a flag to the channelId cache stating { isPaid: true }
        const cachedData = await (0, redis_service_1.getCachedChannel)(tx.channelId);
        if (cachedData) {
            cachedData.isPaid = true;
            await (0, redis_service_1.cacheChannel)(tx.channelId, cachedData);
        }
        else {
            await (0, redis_service_1.cacheChannel)(tx.channelId, { isPaid: true });
        }
        return true;
    }
}
exports.PaymentService = PaymentService;
