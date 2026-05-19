import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PaymentService } from '../services/payment.service';

interface PayBody {
  channelId: string;
}

interface WebhookBody {
  transactionId: string;
  status: string;
}

const paymentRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Endpoint 1: Create Payment Intent
  fastify.post<{ Body: PayBody }>('/api/pay', async (request, reply) => {
    const { channelId } = request.body;
    if (!channelId) {
      return reply.status(400).send({ error: 'channelId is required' });
    }

    try {
      const intent = await PaymentService.createPaymentIntent(channelId, 29);
      return reply.send(intent);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Endpoint 2: Payment Webhook
  fastify.post<{ Body: WebhookBody }>('/webhook/payment', async (request, reply) => {
    const { transactionId, status } = request.body;
    if (!transactionId || status !== 'SUCCESS') {
      return reply.status(400).send({ error: 'Invalid webhook payload or status not SUCCESS' });
    }

    try {
      await PaymentService.verifyPayment(transactionId);
      return reply.send({ success: true, message: 'Payment verified and Media Kit unlocked' });
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  });
};

export default paymentRoutes;
