import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { fetchAndCalculateStats } from '../services/youtube.service';
import { calculateYouTubePrice } from '../utils/pricing-engine';

/**
 * YouTube-specific valuation route.
 * Instagram logic has been moved to instagram-valuation.route.ts
 */

interface EvaluateChannelBody {
  channelId: string;
  niche: string;
  audienceGeo: string;
  brandName: string;
  integrationType: string;
}

const valuationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: EvaluateChannelBody }>('/api/evaluate-channel', async (request, reply) => {
    const { channelId, niche, audienceGeo, brandName, integrationType } = request.body;

    if (!channelId || !niche || !audienceGeo || !brandName || !integrationType) {
      return reply.status(400).send({ 
        error: 'channelId, niche, audienceGeo, brandName, and integrationType are required' 
      });
    }

    try {
      // Check Redis cache
      const cachedData = await getCachedChannel(channelId);
      if (
        cachedData &&
        cachedData.platform !== 'instagram' &&
        cachedData.niche === niche &&
        cachedData.audienceGeo === audienceGeo &&
        cachedData.brandName === brandName &&
        cachedData.integrationType === integrationType
      ) {
        reply.header('X-Cache', 'HIT');
        return reply.send(cachedData);
      }

      // Fetch YouTube statistics
      const stats = await fetchAndCalculateStats(channelId);

      const subscribers = Number(stats.channelStatistics?.subscriberCount ?? 0);

      // New pricing engine calculation
      const priceResult = calculateYouTubePrice({
        platform: 'youtube',
        audienceSize: subscribers,
        niche,
        audienceGeo,
        integrationType,
        averageViews: stats.averageViews
      });

      // Structure final JSON object
      const finalObject = {
        ...stats,
        niche,
        audienceGeo,
        brandName,
        integrationType,
        platform: 'youtube',
        calculated_sponsor_fee_inr: priceResult.finalFee,
        tierLabel: priceResult.tierLabel,
        baseRate: priceResult.baseRate,
        nicheMultiplier: priceResult.nicheMultiplier,
        nicheLabel: priceResult.nicheLabel,
        engagementSignal: priceResult.engagementSignal,
        engagementMultiplier: priceResult.engagementMultiplier,
        geoMultiplier: priceResult.geoMultiplier,
        geoLabel: priceResult.geoLabel,
        formatMultiplier: priceResult.formatMultiplier,
        formatLabel: priceResult.formatLabel,
        starterFee: priceResult.starterFee,
        standardFee: priceResult.standardFee,
        premiumFee: priceResult.premiumFee,
        floorPrice: priceResult.floorPrice,
        exclusivityFee: priceResult.exclusivityFee,
        usageRightsFee: priceResult.usageRightsFee,
        monthlyRetainerEstimate: priceResult.monthlyRetainerEstimate,
        engagementCaption: priceResult.engagementCaption,
        evaluatedAt: new Date().toISOString(),
      };

      // Cache in Redis
      await cacheChannel(channelId, finalObject);

      reply.header('X-Cache', 'MISS');
      return reply.send(finalObject);

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  });
};

export default valuationRoutes;

