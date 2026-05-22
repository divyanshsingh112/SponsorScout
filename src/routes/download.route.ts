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

      const isInstagram = cachedData.platform === 'instagram';
      const totalFollowers = cachedData.totalFollowers ?? 0;
      const accountsReached30d = cachedData.accountsReached30d ?? 0;
      const avgReelPlays = cachedData.avgReelPlays ?? 0;
      const avgStoryViews = cachedData.avgStoryViews ?? 0;
      const reelValuation = cachedData.reelValuation ?? 0;
      const storyValuation = cachedData.storyValuation ?? 0;

      // Derive multipliers and base cpm if they are missing (e.g. if the cache expired and we restored from limited payload)
      let baseNicheCpm = cachedData.baseNicheCpm;
      let geoMultiplier = cachedData.geoMultiplier ?? 1.0;
      let integrationMultiplier = cachedData.integrationMultiplier ?? 1.0;

      if (!isInstagram && (!baseNicheCpm || !geoMultiplier || !integrationMultiplier)) {
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

      const fallbackPitch = isInstagram
        ? `${cachedData.channelName || 'Unknown Creator'}'s highly visually engaged audience of followers is perfectly primed for ${cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand'} through dynamic Instagram content.`
        : `${cachedData.channelName || 'Unknown Channel'}'s authority in the ${cachedData.niche || 'Tech'} space is heavily reinforced by recent high-performing videos.`;

      // 1. YouTube Metric Overrides
      const subscribersNum = Number(rawSubscribers);
      const avgViewsNum = Number(rawAvgViews);
      const viewRateVal = (!isNaN(subscribersNum) && subscribersNum > 0) ? (avgViewsNum / subscribersNum) * 100 : 0;
      const cappedViewRate = Math.min(viewRateVal, 15).toFixed(2);
      const engagementLabel = "Avg. View Rate";

      // 2. Instagram Metric Overrides
      const followersNum = Number(totalFollowers);
      const avgReelsPlaysNum = Number(avgReelPlays);
      const reachRatioVal = (!isNaN(followersNum) && followersNum > 0) ? (avgReelsPlaysNum / followersNum) * 100 : 0;
      const reachRatio = reachRatioVal.toFixed(1);
      const reachLabel = "Reach-to-Follower Ratio";
      const reachContext = reachRatioVal > 100
        ? "🔥 Viral reach — content distributing beyond existing audience"
        : "Healthy organic reach within follower base";

      // 3. Industry Benchmarks
      const benchmarkRanges = {
        gaming:      { low: 20000,  high: 80000  },
        tech:        { low: 30000,  high: 120000 },
        finance:     { low: 40000,  high: 150000 },
        lifestyle:   { low: 8000,   high: 40000  },
        fitness:     { low: 10000,  high: 50000  },
        education:   { low: 15000,  high: 60000  },
        food:        { low: 8000,   high: 35000  },
      };

      const nicheLower = (cachedData.niche || 'Tech').toLowerCase();
      let benchmarkNicheKey = 'tech';
      if (nicheLower.includes('gaming')) {
        benchmarkNicheKey = 'gaming';
      } else if (nicheLower.includes('tech')) {
        benchmarkNicheKey = 'tech';
      } else if (nicheLower.includes('finance') || nicheLower.includes('crypto')) {
        benchmarkNicheKey = 'finance';
      } else if (nicheLower.includes('lifestyle') || nicheLower.includes('vlog')) {
        benchmarkNicheKey = 'lifestyle';
      } else if (nicheLower.includes('fitness')) {
        benchmarkNicheKey = 'fitness';
      } else if (nicheLower.includes('education')) {
        benchmarkNicheKey = 'education';
      } else if (nicheLower.includes('food')) {
        benchmarkNicheKey = 'food';
      }

      const range = benchmarkRanges[benchmarkNicheKey as keyof typeof benchmarkRanges] || { low: 10000, high: 60000 };
      const finalFee = rawFinalValuation;

      const barPosition = Math.min(95, Math.max(5,
        ((finalFee - range.low) / (range.high - range.low)) * 100
      )).toFixed(0);

      const benchmarkLow = range.low.toLocaleString('en-IN');
      const benchmarkHigh = range.high.toLocaleString('en-IN');
      const benchmarkPosition = barPosition;
      const formattedFee = finalFee.toLocaleString('en-IN');

      // 4. 3-Tier Packages
      const baseFee = finalFee;
      const tierStarter = Math.round(baseFee * 0.65).toLocaleString('en-IN');
      const tierStandard = baseFee.toLocaleString('en-IN');
      const tierPremium = Math.round(baseFee * 1.65).toLocaleString('en-IN');

      let deliverableStarter = '';
      let deliverableStandard = '';
      let deliverablePremium = '';

      if (!isInstagram) {
        deliverableStarter = "30-sec brand mention";
        deliverableStandard = "60-sec dedicated shoutout";
        deliverablePremium = "Dedicated video + Community post";
      } else {
        deliverableStarter = "3x Instagram Stories";
        deliverableStandard = "1x Reel + 3x Stories";
        deliverablePremium = "2x Reels + 5x Stories + Link in Bio (7 days)";
      }

      // 5. Negotiation Brief
      const floorPrice = Math.round(baseFee * 0.70).toLocaleString('en-IN');
      const recommendedFee = baseFee.toLocaleString('en-IN');
      const exclusivityFee = Math.round(baseFee * 1.25).toLocaleString('en-IN');
      const usageRightsFee = Math.round(baseFee * 0.20).toLocaleString('en-IN');

      // 6. Outreach Email Template
      const creatorFirstName = (cachedData.channelName || 'Creator').split(' ')[0];
      const mostRecentVideoObj = cachedData.recentVideos && cachedData.recentVideos[0]
        ? cachedData.recentVideos[0]
        : null;
      const mostRecentVideo = mostRecentVideoObj
        ? (typeof mostRecentVideoObj === 'string' ? mostRecentVideoObj : (mostRecentVideoObj.title || "my recent content"))
        : "my recent content";
      const aiParagraph = cachedData.alignmentText || fallbackPitch;

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
        alignmentText: cachedData.alignmentText || fallbackPitch,

        // Instagram specific fields
        isInstagram,
        totalFollowers: formatNumber(totalFollowers),
        accountsReached30d: formatNumber(accountsReached30d),
        avgReelPlays: formatNumber(avgReelPlays),
        avgStoryViews: formatNumber(avgStoryViews),
        topLocation: cachedData.topLocation ?? 'Tier 3',
        topAgeRange: cachedData.topAgeRange ?? 'N/A',
        genderSplit: cachedData.genderSplit ?? 'N/A',
        sponsorNiche: cachedData.sponsorNiche ?? (cachedData.niche || 'Tech'),
        recentContentFocus: cachedData.recentContentFocus ?? '',
        reelValuation: formatNumber(reelValuation),
        storyValuation: formatNumber(storyValuation),
        resonanceMultiplier: cachedData.resonanceMultiplier ?? 1.0,

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

        // Added parameters for Section 3 Checklist compatibility
        viewRate: cappedViewRate,
        engagementLabel,
        reachRatio,
        reachLabel,
        reachContext,
        benchmarkLow,
        benchmarkHigh,
        benchmarkPosition,
        formattedFee,
        tierStarter,
        tierStandard,
        tierPremium,
        deliverableStarter,
        deliverableStandard,
        deliverablePremium,
        floorPrice,
        recommendedFee,
        exclusivityFee,
        usageRightsFee,
        creatorFirstName,
        creatorName: cachedData.channelName || 'Unknown Creator',
        mostRecentVideo,
        aiParagraph
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
