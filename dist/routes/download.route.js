"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_service_1 = require("../services/redis.service");
const pdf_service_1 = require("../services/pdf.service");
const downloadRoutes = async (fastify) => {
    fastify.get('/api/download-kit/:channelId', async (request, reply) => {
        const { channelId } = request.params;
        try {
            const cachedData = await (0, redis_service_1.getCachedChannel)(channelId);
            if (!cachedData) {
                return reply.status(404).send({ error: 'Channel data not found. Please evaluate first.' });
            }
            if (!cachedData.isPaid) {
                return reply.status(402).send({ error: 'Please complete the ₹29 payment to unlock this Media Kit.' });
            }
            // Map cached data to the template variables
            const templateData = {
                channelName: cachedData.channelName || 'Unknown Channel',
                subscriberCount: cachedData.channelStatistics?.subscriberCount || 'N/A',
                averageViews: cachedData.averageViews,
                engagementRate: cachedData.engagementRate,
                suggestedFee: cachedData.calculated_sponsor_fee_inr,
            };
            const pdfBuffer = await (0, pdf_service_1.generateMediaKit)(templateData);
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', 'attachment; filename="MediaKit.pdf"');
            return reply.send(pdfBuffer);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: error.message || 'Failed to generate media kit PDF' });
        }
    });
};
exports.default = downloadRoutes;
