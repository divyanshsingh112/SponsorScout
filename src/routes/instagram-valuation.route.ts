import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel, cacheChannel } from '../services/redis.service';
import { calculateInstagramPrice } from '../utils/pricing-engine';

/**
 * Instagram-specific valuation route.
 * Handles the expanded field set from the 7-step Instagram wizard.
 * Separated from YouTube to prevent cross-platform bugs.
 */

interface InstagramEvaluateBody {
  channelId: string;
  niche: string;
  brandName: string;
  integrationType: string;
  // Core metrics
  totalFollowers: number;
  totalFollowing?: number;
  avgReelPlays: number;
  avgStoryViews?: number;
  // Optional engagement metrics (for true engagement rate)
  avgReelLikes?: number;
  avgReelComments?: number;
  avgReelShares?: number;
  avgReelSaves?: number;
  // Demographics
  topCountry?: string;
  topCity?: string;
  topAgeRange?: string;
  femalePercentage?: number;
  geoTier?: string;
  // Content profile
  contentPillars?: string[] | string;
  postingFrequency?: string;
  mostRecentReelTopic?: string;
  secondRecentReelTopic?: string;
  thirdRecentReelTopic?: string;
  // Campaign details
  brandIndustry?: string;
  sponsorNiche?: string;
  // Profile info
  displayName?: string;
  profileVisits?: number;
}

const instagramValuationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: InstagramEvaluateBody }>('/api/evaluate-instagram', async (request, reply) => {
    const {
      channelId, niche, brandName, integrationType,
      totalFollowers, totalFollowing = 0,
      avgReelPlays, avgStoryViews = 0,
      avgReelLikes = 0, avgReelComments = 0,
      avgReelShares = 0, avgReelSaves = 0,
      topCountry = 'India', topCity = '',
      topAgeRange = '', femalePercentage,
      geoTier = '',
      contentPillars = [], postingFrequency = '',
      mostRecentReelTopic = '', secondRecentReelTopic = '', thirdRecentReelTopic = '',
      brandIndustry = '', sponsorNiche = niche,
      displayName = channelId,
      profileVisits,
    } = request.body;

    if (!channelId || !niche || !brandName || !integrationType) {
      return reply.status(400).send({
        error: 'channelId, niche, brandName, and integrationType are required'
      });
    }

    if (!totalFollowers || !avgReelPlays) {
      return reply.status(400).send({
        error: 'totalFollowers and avgReelPlays are required'
      });
    }

    // Validate niche is not empty (Bug 04)
    if (!niche.trim()) {
      return reply.status(400).send({ error: 'Content niche cannot be empty.' });
    }

    try {
      // Check cache — match on key fields
      const cachedData = await getCachedChannel(channelId);
      if (
        cachedData &&
        cachedData.platform === 'instagram' &&
        cachedData.niche === niche &&
        cachedData.brandName === brandName &&
        cachedData.totalFollowers === totalFollowers &&
        cachedData.avgReelPlays === avgReelPlays
      ) {
        reply.header('X-Cache', 'HIT');
        return reply.send(cachedData);
      }

      const derivedTier = geoTier || deriveGeoTier(topCountry);

      // New pricing engine calculation
      const priceResult = calculateInstagramPrice({
        platform: 'instagram',
        audienceSize: totalFollowers,
        niche,
        audienceGeo: derivedTier,
        integrationType,
        averageViews: avgReelPlays,
        instagramLikes: avgReelLikes,
        instagramComments: avgReelComments,
        instagramShares: avgReelShares,
        instagramSaves: avgReelSaves
      });

      // Process content pillars
      let pillarsArray: string[] = [];
      if (Array.isArray(contentPillars)) {
        pillarsArray = contentPillars;
      } else if (typeof contentPillars === 'string' && contentPillars.trim()) {
        pillarsArray = contentPillars.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Build recent content focus from reel topics
      const recentContentFocus = [mostRecentReelTopic, secondRecentReelTopic, thirdRecentReelTopic]
        .filter(Boolean).join(', ');

      const finalObject: any = {
        channelId,
        channelName: displayName || channelId,
        displayName,
        instagramHandle: channelId.replace(/^@/, ''),
        averageViews: avgReelPlays,
        engagementRate: priceResult.engagementSignal,
        channelStatistics: { subscriberCount: String(totalFollowers) },
        niche,
        brandName,
        integrationType,
        platform: 'instagram',
        totalFollowers,
        totalFollowing,
        avgReelPlays,
        avgStoryViews,
        avgReelLikes,
        avgReelComments,
        avgReelShares,
        avgReelSaves,
        topCountry,
        topCity,
        topLocation: derivedTier,
        topAgeRange,
        femalePercentage,
        geoTier: derivedTier,
        genderSplit: femalePercentage !== undefined ? `${femalePercentage}% F / ${100 - femalePercentage}% M` : 'N/A',
        contentPillars: pillarsArray,
        postingFrequency,
        mostRecentReelTopic,
        secondRecentReelTopic,
        thirdRecentReelTopic,
        recentContentFocus,
        brandIndustry,
        sponsorNiche,
        profileVisits,
        
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

        // For backward compatibility
        resonanceMultiplier: priceResult.nicheMultiplier,
        reelValuation: priceResult.finalFee,
        storyValuation: avgStoryViews > 0
          ? Math.round((avgStoryViews * 200 * priceResult.geoMultiplier * priceResult.nicheMultiplier) / 1000)
          : 0,
        calculated_sponsor_fee_inr: priceResult.finalFee,
        targetSponsor: brandName,
        audienceGeo: derivedTier,
        integrationFormat: integrationType,
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

/**
 * Derives geo tier from country name.
 */
function deriveGeoTier(country: string): string {
  const c = country.toLowerCase();
  if (['us', 'united states', 'uk', 'united kingdom', 'canada', 'australia'].some(t => c.includes(t))) {
    return 'Tier 1';
  }
  if (['uae', 'united arab emirates', 'saudi', 'singapore'].some(t => c.includes(t))) {
    return 'Tier 2';
  }
  return 'Tier 3';
}

export default instagramValuationRoutes;

