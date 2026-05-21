import crypto from 'crypto';
import { getCachedChannel, cacheChannel } from './redis.service';

const transactionCache = new Map<string, { channelId: string; status: string }>();

export class PaymentService {
  static async createPaymentIntent(channelId: string, amount: number) {
    // Generate a random string as a transactionId
    const transactionId = crypto.randomBytes(16).toString('hex');
    
    // Store record in in-memory cache
    transactionCache.set(transactionId, { channelId, status: 'PENDING' });

    return {
      transactionId,
      paymentUrl: `https://mock-upi.com/pay/${transactionId}`,
    };
  }

  static async unlockChannel(channelId: string, additionalData?: any) {
    const cachedData = await getCachedChannel(channelId);
    if (cachedData) {
      cachedData.isPaid = true;
      if (additionalData) {
        Object.assign(cachedData, additionalData);
      }
      await cacheChannel(channelId, cachedData);
    } else {
      const dataToCache = {
        isPaid: true,
        ...(additionalData || {})
      };
      await cacheChannel(channelId, dataToCache);
    }
    return true;
  }

  static async verifyPayment(transactionId: string) {
    // Look up the transaction in the cache
    const tx = transactionCache.get(transactionId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    // Change the status to SUCCESS
    tx.status = 'SUCCESS';
    transactionCache.set(transactionId, tx);

    // Mark channel as paid and unlock it
    await this.unlockChannel(tx.channelId);

    return true;
  }
}
