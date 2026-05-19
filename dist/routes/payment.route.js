"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("../services/payment.service");
const paymentRoutes = async (fastify) => {
    // Endpoint 1: Create Payment Intent
    fastify.post('/api/pay', async (request, reply) => {
        const { channelId } = request.body;
        if (!channelId) {
            return reply.status(400).send({ error: 'channelId is required' });
        }
        try {
            const intent = await payment_service_1.PaymentService.createPaymentIntent(channelId, 29);
            return reply.send(intent);
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    });
    // Endpoint 2: Payment Webhook
    fastify.post('/webhook/payment', async (request, reply) => {
        const { transactionId, status } = request.body;
        if (!transactionId || status !== 'SUCCESS') {
            return reply.status(400).send({ error: 'Invalid webhook payload or status not SUCCESS' });
        }
        try {
            await payment_service_1.PaymentService.verifyPayment(transactionId);
            return reply.send({ success: true, message: 'Payment verified and Media Kit unlocked' });
        }
        catch (error) {
            return reply.status(404).send({ error: error.message });
        }
    });
};
exports.default = paymentRoutes;
