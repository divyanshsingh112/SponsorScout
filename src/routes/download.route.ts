import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel } from '../services/redis.service';
import { generateMediaKit } from '../services/pdf.service';
import { cpmCalculator } from '../utils/cpm';

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

      const rawSubscribers = cachedData.subscribers ?? cachedData.channelStatistics?.subscriberCount ?? 'N/A';
      const rawAvgViews = cachedData.avgViews ?? cachedData.averageViews ?? 0;
      const rawEngagement = cachedData.engagement ?? cachedData.engagementRate ?? 0;
      const rawCalculatedCpm = cachedData.calculatedCpm ?? cachedData.cpm ?? 100;
      const rawFinalValuation = cachedData.finalValuation ?? cachedData.calculated_sponsor_fee_inr ?? 0;

      // Derive multipliers and base cpm if they are missing (e.g. if the cache expired and we restored from limited payload)
      let baseNicheCpm = cachedData.baseNicheCpm;
      let geoMultiplier = cachedData.geoMultiplier;
      let integrationMultiplier = cachedData.integrationMultiplier;

      if (!baseNicheCpm || !geoMultiplier || !integrationMultiplier) {
        const derivedNiche = cachedData.niche || 'Tech';
        const derivedGeo = cachedData.targetRegion ?? cachedData.audienceGeo ?? 'Tier 3 India/Asia';
        const derivedIntegration = cachedData.integrationFormat ?? cachedData.integrationType ?? '60-sec shoutout';
        try {
          const calc = cpmCalculator(derivedNiche, derivedGeo, derivedIntegration);
          baseNicheCpm = calc.baseNicheCpm;
          geoMultiplier = calc.geoMultiplier;
          integrationMultiplier = calc.integrationMultiplier;
        } catch (e) {
          baseNicheCpm = 100;
          geoMultiplier = 1.0;
          integrationMultiplier = 1.0;
        }
      }

      const formatNumber = (val: any) => {
        if (val === undefined || val === null || val === '') return '0';
        const num = Number(val);
        if (!isNaN(num)) return num.toLocaleString('en-IN');
        return String(val);
      };

      const templateData = {
        // Universal / New Keys (Formatted for Premium PDF look)
        channelName: cachedData.channelName || 'Unknown Channel',
        subscribers: formatNumber(rawSubscribers),
        avgViews: formatNumber(rawAvgViews),
        engagement: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        targetSponsor: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        targetRegion: cachedData.targetRegion ?? cachedData.audienceGeo ?? 'Tier 3 India/Asia',
        integrationFormat: cachedData.integrationFormat ?? cachedData.integrationType ?? '60-sec shoutout',
        calculatedCpm: formatNumber(rawCalculatedCpm),
        finalValuation: formatNumber(rawFinalValuation),

        // Legacy / Standard Keys for compatibility/fallback
        subscriberCount: formatNumber(rawSubscribers),
        averageViews: formatNumber(rawAvgViews),
        engagementRate: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        suggestedFee: formatNumber(rawFinalValuation),
        brandName: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        audienceGeo: cachedData.targetRegion ?? cachedData.audienceGeo ?? 'Tier 3 India/Asia',
        integrationType: cachedData.integrationFormat ?? cachedData.integrationType ?? '60-sec shoutout',
        cpm: formatNumber(rawCalculatedCpm),

        // Core / Static Layout fields
        channelAvatarUrl: cachedData.channelAvatarUrl,
        recentVideos: (cachedData.recentVideos || []).map((video: any) => ({
          title: video.title,
          viewCount: formatNumber(video.viewCount)
        })),
        currentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        niche: cachedData.niche || 'Tech',
        baseNicheCpm: formatNumber(baseNicheCpm),
        geoMultiplier,
        integrationMultiplier,
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
