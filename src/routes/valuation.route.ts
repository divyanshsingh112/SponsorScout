import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { fetchAndCalculateStats } from '../services/youtube.service';
import { cpmCalculator } from '../utils/cpm';

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

      // Dynamic CPM matrix logic
      const cpmResult = cpmCalculator(niche, audienceGeo, integrationType);

      // Calculate sponsor fee: averageViews * (cpm / 1000)
      const calculated_sponsor_fee_inr = Math.max(0, Math.round(stats.averageViews * (cpmResult.cpm / 1000)));

      // Structure final JSON object
      const finalObject = {
        ...stats,
        niche,
        audienceGeo,
        brandName,
        integrationType,
        platform: 'youtube',
        cpm: cpmResult.cpm,
        baseNicheCpm: cpmResult.baseNicheCpm,
        geoMultiplier: cpmResult.geoMultiplier,
        integrationMultiplier: cpmResult.integrationMultiplier,
        calculated_sponsor_fee_inr,
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
