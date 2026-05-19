import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { fetchAndCalculateStats } from '../services/youtube.service';

interface EvaluateChannelBody {
  channelId: string;
  niche: string;
}

const valuationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: EvaluateChannelBody }>('/api/evaluate-channel', async (request, reply) => {
    const { channelId, niche } = request.body;

    if (!channelId || !niche) {
      return reply.status(400).send({ error: 'channelId and niche are required' });
    }

    try {
      // a. Check Redis cache
      const cachedData = await getCachedChannel(channelId);
      if (cachedData) {
        reply.header('X-Cache', 'HIT');
        return reply.send(cachedData);
      }

      // b. Fetch from YouTube
      const stats = await fetchAndCalculateStats(channelId);

      // c. Indian Valuation Matrix
      let baseRate = 0;
      const normalizedNiche = niche.toLowerCase();

      if (normalizedNiche.includes('tech')) baseRate = 250;
      else if (normalizedNiche.includes('finance')) baseRate = 350;
      else if (normalizedNiche.includes('gaming')) baseRate = 60;
      else if (normalizedNiche.includes('lifestyle') || normalizedNiche.includes('vlog')) baseRate = 100;
      else baseRate = 100; // Default baseline rate

      // Calculate sponsor fee: averageViews * (baseRate / 1000)
      const calculated_sponsor_fee_inr = Math.round(stats.averageViews * (baseRate / 1000));

      // d. Structure final JSON object
      const finalObject = {
        ...stats,
        niche,
        baseRate,
        calculated_sponsor_fee_inr,
        evaluatedAt: new Date().toISOString(),
      };

      // e. Cache in Redis (86400 TTL)
      await cacheChannel(channelId, finalObject);

      // f. Return JSON with X-Cache: MISS
      reply.header('X-Cache', 'MISS');
      return reply.send(finalObject);

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message || 'Internal Server Error' });
    }
  });
};

export default valuationRoutes;
