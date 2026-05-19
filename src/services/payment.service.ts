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

  static async verifyPayment(transactionId: string) {
    // Look up the transaction in the cache
    const tx = transactionCache.get(transactionId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    // Change the status to SUCCESS
    tx.status = 'SUCCESS';
    transactionCache.set(transactionId, tx);

    // Add a flag to the channelId cache stating { isPaid: true }
    const cachedData = await getCachedChannel(tx.channelId);
    if (cachedData) {
      cachedData.isPaid = true;
      await cacheChannel(tx.channelId, cachedData);
    } else {
      await cacheChannel(tx.channelId, { isPaid: true });
    }

    return true;
  }
}
