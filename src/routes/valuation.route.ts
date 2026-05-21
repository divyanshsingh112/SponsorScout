import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { fetchAndCalculateStats } from '../services/youtube.service';
import { cpmCalculator } from '../utils/cpm';

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
      // a. Check Redis cache - check if all inputs match
      const cachedData = await getCachedChannel(channelId);
      if (
        cachedData &&
        cachedData.niche === niche &&
        cachedData.audienceGeo === audienceGeo &&
        cachedData.brandName === brandName &&
        cachedData.integrationType === integrationType
      ) {
        reply.header('X-Cache', 'HIT');
        return reply.send(cachedData);
      }

      // b. Fetch YouTube statistics
      const stats = await fetchAndCalculateStats(channelId);

      // c. Dynamic CPM matrix logic
      const cpmResult = cpmCalculator(niche, audienceGeo, integrationType);

      // Calculate sponsor fee: averageViews * (cpm / 1000)
      const calculated_sponsor_fee_inr = Math.max(0, Math.round(stats.averageViews * (cpmResult.cpm / 1000)));

      // d. Structure final JSON object with comprehensive breakdown
      const finalObject = {
        ...stats,
        niche,
        audienceGeo,
        brandName,
        integrationType,
        cpm: cpmResult.cpm,
        baseNicheCpm: cpmResult.baseNicheCpm,
        geoMultiplier: cpmResult.geoMultiplier,
        integrationMultiplier: cpmResult.integrationMultiplier,
        calculated_sponsor_fee_inr,
        evaluatedAt: new Date().toISOString(),
      };

      // e. Cache in Redis
      await cacheChannel(channelId, finalObject);

      // f. Return JSON
      reply.header('X-Cache', 'MISS');
      return reply.send(finalObject);

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  });
};

export default valuationRoutes;
