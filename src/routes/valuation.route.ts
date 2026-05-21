import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { fetchAndCalculateStats } from '../services/youtube.service';
import { cpmCalculator, getResonanceMultiplier } from '../utils/cpm';

interface EvaluateChannelBody {
  channelId: string;
  niche: string;
  audienceGeo: string;
  brandName: string;
  integrationType: string;
  // Instagram fields
  platform?: string;
  totalFollowers?: number;
  accountsReached30d?: number;
  avgReelPlays?: number;
  avgStoryViews?: number;
  topLocation?: string;
  topAgeRange?: string;
  genderSplit?: string;
  sponsorNiche?: string;
  recentContentFocus?: string;
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
        cachedData.platform === request.body.platform &&
        cachedData.niche === niche &&
        cachedData.audienceGeo === audienceGeo &&
        cachedData.brandName === brandName &&
        cachedData.integrationType === integrationType &&
        (request.body.platform !== 'instagram' || (
          cachedData.totalFollowers === request.body.totalFollowers &&
          cachedData.accountsReached30d === request.body.accountsReached30d &&
          cachedData.avgReelPlays === request.body.avgReelPlays &&
          cachedData.avgStoryViews === request.body.avgStoryViews &&
          cachedData.topLocation === request.body.topLocation &&
          cachedData.topAgeRange === request.body.topAgeRange &&
          cachedData.genderSplit === request.body.genderSplit &&
          cachedData.sponsorNiche === request.body.sponsorNiche &&
          cachedData.recentContentFocus === request.body.recentContentFocus
        ))
      ) {
        reply.header('X-Cache', 'HIT');
        return reply.send(cachedData);
      }

      let finalObject: any = {};

      if (request.body.platform === 'instagram') {
        const {
          totalFollowers = 0,
          accountsReached30d = 0,
          avgReelPlays = 0,
          avgStoryViews = 0,
          topLocation = 'Tier 3',
          topAgeRange = '',
          genderSplit = '',
          sponsorNiche = niche,
          recentContentFocus = '',
        } = request.body;

        // Calculate Resonance Multiplier
        const resonanceMultiplier = getResonanceMultiplier(niche, sponsorNiche);

        // Get Geo Multiplier
        let geoMultiplier = 1.0;
        const geo = topLocation.toLowerCase();
        if (geo.includes('tier 1')) {
          geoMultiplier = 3.0;
        } else if (geo.includes('tier 2')) {
          geoMultiplier = 1.8;
        } else if (geo.includes('tier 3')) {
          geoMultiplier = 1.0;
        }

        // Instagram valuations
        const reelValuation = Math.round((avgReelPlays * 100 * geoMultiplier * resonanceMultiplier) / 1000);
        const storyValuation = Math.round((avgStoryViews * 200 * geoMultiplier * resonanceMultiplier) / 1000);
        const calculated_sponsor_fee_inr = reelValuation + storyValuation;

        // Map stats to unify with YouTube keys for frontend components
        finalObject = {
          channelId,
          channelName: channelId, // handle
          averageViews: avgReelPlays,
          engagementRate: totalFollowers > 0 ? parseFloat(((avgReelPlays / totalFollowers) * 100).toFixed(2)) : 0,
          channelStatistics: { subscriberCount: String(totalFollowers) },
          niche,
          audienceGeo,
          brandName,
          integrationType,
          platform: 'instagram',
          totalFollowers,
          accountsReached30d,
          avgReelPlays,
          avgStoryViews,
          topLocation,
          topAgeRange,
          genderSplit,
          sponsorNiche,
          recentContentFocus,
          resonanceMultiplier,
          geoMultiplier,
          reelValuation,
          storyValuation,
          calculated_sponsor_fee_inr,
          evaluatedAt: new Date().toISOString(),
        };
      } else {
        // b. Fetch YouTube statistics
        const stats = await fetchAndCalculateStats(channelId);

        // c. Dynamic CPM matrix logic
        const cpmResult = cpmCalculator(niche, audienceGeo, integrationType);

        // Calculate sponsor fee: averageViews * (cpm / 1000)
        const calculated_sponsor_fee_inr = Math.max(0, Math.round(stats.averageViews * (cpmResult.cpm / 1000)));

        // d. Structure final JSON object with comprehensive breakdown
        finalObject = {
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
      }

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

