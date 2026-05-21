import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel } from '../services/redis.service';
import { generateMediaKit } from '../services/pdf.service';

const downloadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { channelId: string } }>('/api/download-kit/:channelId', async (request, reply) => {
    const { channelId } = request.params;

    try {
      const cachedData = await getCachedChannel(channelId);
      
      if (!cachedData) {
        return reply.status(404).send({ error: 'Channel data not found. Please evaluate first.' });
      }

      if (!cachedData.isPaid) {
        return reply.status(402).send({ error: 'Please complete the ₹29 payment to unlock this Media Kit.' });
      }

      const templateData = {
        channelName: cachedData.channelName || 'Unknown Channel',
        subscriberCount: cachedData.channelStatistics?.subscriberCount || 'N/A',
        averageViews: cachedData.averageViews,
        engagementRate: cachedData.engagementRate,
        suggestedFee: cachedData.calculated_sponsor_fee_inr,
        channelAvatarUrl: cachedData.channelAvatarUrl,
        recentVideos: cachedData.recentVideos || [],
        currentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        niche: cachedData.niche || 'Tech',
        audienceGeo: cachedData.audienceGeo || 'Tier 3 India/Asia',
        brandName: cachedData.brandName || 'Sponsor Brand',
        integrationType: cachedData.integrationType || '60-sec shoutout',
        cpm: cachedData.cpm || 100,
        baseNicheCpm: cachedData.baseNicheCpm || 100,
        geoMultiplier: cachedData.geoMultiplier || 1.0,
        integrationMultiplier: cachedData.integrationMultiplier || 1.0,
      };

      const pdfBuffer = await generateMediaKit(templateData);

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'attachment; filename="MediaKit.pdf"');
      
      return reply.send(pdfBuffer);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message || 'Failed to generate media kit PDF' });
    }
  });
};

export default downloadRoutes;
