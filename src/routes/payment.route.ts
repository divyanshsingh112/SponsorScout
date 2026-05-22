import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PaymentService } from '../services/payment.service';
import { fetchAndCalculateStats } from '../services/youtube.service';
import { getCachedChannel } from '../services/redis.service';
import { generateAlignmentPitch } from '../services/ai.service';

interface PayBody {
  channelId: string;
}

interface WebhookBody {
  transactionId: string;
  status: string;
}

const paymentRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Endpoint 1: Create Payment Intent
  fastify.post<{ Body: PayBody }>('/api/pay', async (request, reply) => {
    const { channelId } = request.body;
    if (!channelId) {
      return reply.status(400).send({ error: 'channelId is required' });
    }

    try {
      const intent = await PaymentService.createPaymentIntent(channelId, 29);
      return reply.send(intent);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Endpoint 2: Payment Webhook
  fastify.post<{ Body: WebhookBody }>('/webhook/payment', async (request, reply) => {
    const { transactionId, status } = request.body;
    if (!transactionId || status !== 'SUCCESS') {
      return reply.status(400).send({ error: 'Invalid webhook payload or status not SUCCESS' });
    }

    try {
      await PaymentService.verifyPayment(transactionId);
      return reply.send({ success: true, message: 'Payment verified and Media Kit unlocked' });
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  });

  // Endpoint 3: Unlock Channel (called after successful payment redirect, e.g. Topmate)
  interface UnlockBody {
    channelId: string;
    unlockSecret: string;
    channelName?: string;
    subscribers?: string;
    avgViews?: number;
    engagement?: number;
    targetSponsor?: string;
    targetRegion?: string;
    integrationFormat?: string;
    calculatedCpm?: number;
    finalValuation?: number;
    channelAvatarUrl?: string;
    recentVideos?: any[];
    brandName?: string;
    audienceGeo?: string;
    integrationType?: string;
    // Instagram specific fields
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
    reelValuation?: number;
    storyValuation?: number;
    niche?: string;
  }

  fastify.post<{ Body: UnlockBody }>('/api/unlock-channel', async (request, reply) => {
    const { channelId, unlockSecret, ...additionalData } = request.body;
    if (!channelId) {
      return reply.status(400).send({ error: 'channelId is required' });
    }

    const serverSecret = process.env.UNLOCK_SECRET_KEY;
    if (!serverSecret || !unlockSecret || unlockSecret !== serverSecret) {
      return reply.status(403).send({ error: 'Invalid security token' });
    }

    try {
      // 1. Fetch cached data to check/extract channel info
      let cachedData = await getCachedChannel(channelId);
      const platform = additionalData.platform || cachedData?.platform || 'youtube';
      let recentVideos = cachedData?.recentVideos || additionalData?.recentVideos || [];
      let channelName = cachedData?.channelName || additionalData?.channelName || 'Unknown Channel';
      let niche = cachedData?.niche || additionalData?.niche || 'Tech';
      let targetSponsor = additionalData?.targetSponsor || cachedData?.targetSponsor || cachedData?.brandName || additionalData?.brandName || 'Sponsor Brand';

      // 2. Fetch/update from YouTube API if cached data is missing or doesn't have 5 recent videos (only for YouTube)
      if (platform !== 'instagram' && (!cachedData || recentVideos.length < 5)) {
        try {
          const freshStats = await fetchAndCalculateStats(channelId);
          recentVideos = freshStats.recentVideos;
          channelName = freshStats.channelName;
          // Merge freshStats into additionalData to ensure it gets cached
          Object.assign(additionalData, freshStats);
        } catch (youtubeErr: any) {
          fastify.log.warn(`[YouTube Sync Warning] Failed to fetch fresh YouTube stats in unlock-channel: ${youtubeErr.message || youtubeErr}`);
        }
      }

      // 3. Generate the AI Alignment Pitch
      let alignmentText = '';
      
      const creatorName = channelName;
      const brandName = targetSponsor;
      const brandCategory = platform === 'instagram' ? (additionalData?.sponsorNiche || cachedData?.sponsorNiche || niche) : niche;
      const geoTier = platform === 'instagram' 
        ? (additionalData?.topLocation || cachedData?.topLocation || additionalData?.targetRegion || cachedData?.targetRegion || 'Tier 3')
        : (additionalData?.targetRegion || cachedData?.targetRegion || additionalData?.audienceGeo || cachedData?.audienceGeo || 'Tier 3 India/Asia');
      const placementFormat = platform === 'instagram'
        ? 'Reels & Stories'
        : (additionalData?.integrationFormat || cachedData?.integrationFormat || additionalData?.integrationType || cachedData?.integrationType || '60-sec shoutout');

      const recentTitles = platform === 'instagram'
        ? [additionalData?.recentContentFocus || cachedData?.recentContentFocus || '']
        : recentVideos.slice(0, 5).map((v: any) => v.title || 'Unknown Video');

      alignmentText = await generateAlignmentPitch({
        creatorName,
        platform,
        niche,
        recentVideos: recentTitles,
        brandName,
        brandCategory,
        geoTier,
        placementFormat
      });

      // 4. Attach alignmentText to the final payload to merge in cache
      const finalPayload = {
        ...additionalData,
        alignmentText,
      };

      await PaymentService.unlockChannel(channelId, finalPayload);
      return reply.send({ success: true, message: 'Media Kit unlocked successfully' });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};

export default paymentRoutes;
