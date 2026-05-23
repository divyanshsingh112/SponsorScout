import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel } from '../services/redis.service';
import { generateMediaKit } from '../services/pdf.service';
import { cpmCalculator } from '../utils/cpm';

/**
 * YouTube-specific download route.
 * Preserved from original logic with minimal changes:
 * - Removed all Instagram conditional branches
 * - Added Data Freshness dates (New Feature 02)
 * - Added Monthly Retainer Estimate (New Feature 05)
 * - Now passes platform='youtube' to generateMediaKit
 */
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

      // If this is an Instagram channel, redirect to the Instagram-specific route
      if (cachedData.platform === 'instagram') {
        return reply.redirect(`/api/download-kit-instagram/${channelId}`);
      }

      const rawSubscribers = cachedData.subscribers ?? cachedData.channelStatistics?.subscriberCount ?? 'N/A';
      const rawAvgViews = cachedData.avgViews ?? cachedData.averageViews ?? 0;
      const rawEngagement = cachedData.engagement ?? cachedData.engagementRate ?? 0;
      const rawCalculatedCpm = cachedData.calculatedCpm ?? cachedData.cpm ?? 100;
      const rawFinalValuation = cachedData.finalValuation ?? cachedData.calculated_sponsor_fee_inr ?? 0;

      // Derive multipliers and base cpm if they are missing (e.g. if the cache expired and we restored from limited payload)
      let baseNicheCpm = cachedData.baseNicheCpm;
      let geoMultiplier = cachedData.geoMultiplier ?? 1.0;
      let integrationMultiplier = cachedData.integrationMultiplier ?? 1.0;

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

      // YouTube Metric Overrides
      const subscribersNum = Number(rawSubscribers);
      const avgViewsNum = Number(rawAvgViews);
      const viewRateVal = (!isNaN(subscribersNum) && subscribersNum > 0) ? (avgViewsNum / subscribersNum) * 100 : 0;
      const cappedViewRate = Math.min(viewRateVal, 15).toFixed(2);
      const engagementLabel = "Avg. View Rate";

      // Industry Benchmarks (YouTube)
      const benchmarkRanges: Record<string, { low: number; high: number }> = {
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
      if (nicheLower.includes('gaming')) benchmarkNicheKey = 'gaming';
      else if (nicheLower.includes('tech')) benchmarkNicheKey = 'tech';
      else if (nicheLower.includes('finance') || nicheLower.includes('crypto')) benchmarkNicheKey = 'finance';
      else if (nicheLower.includes('lifestyle') || nicheLower.includes('vlog')) benchmarkNicheKey = 'lifestyle';
      else if (nicheLower.includes('fitness')) benchmarkNicheKey = 'fitness';
      else if (nicheLower.includes('education')) benchmarkNicheKey = 'education';
      else if (nicheLower.includes('food')) benchmarkNicheKey = 'food';

      const range = benchmarkRanges[benchmarkNicheKey] || { low: 10000, high: 60000 };
      const finalFee = rawFinalValuation;

      const barPosition = Math.min(95, Math.max(5,
        ((finalFee - range.low) / (range.high - range.low)) * 100
      )).toFixed(0);

      const benchmarkLow = range.low.toLocaleString('en-IN');
      const benchmarkHigh = range.high.toLocaleString('en-IN');
      const benchmarkPosition = barPosition;
      const formattedFee = finalFee.toLocaleString('en-IN');

      // 3-Tier Packages
      const baseFee = finalFee;
      const tierStarter = Math.round(baseFee * 0.65).toLocaleString('en-IN');
      const tierStandard = baseFee.toLocaleString('en-IN');
      const tierPremium = Math.round(baseFee * 1.65).toLocaleString('en-IN');

      const deliverableStarter = "30-sec brand mention";
      const deliverableStandard = "60-sec dedicated shoutout";
      const deliverablePremium = "Dedicated video + Community post";

      // NEW FEATURE 05: Monthly Retainer Estimate
      const monthlyRetainerEstimate = Math.round(baseFee * 4).toLocaleString('en-IN');

      // Negotiation Brief
      const floorPrice = Math.round(baseFee * 0.70).toLocaleString('en-IN');
      const recommendedFee = baseFee.toLocaleString('en-IN');
      const exclusivityFee = Math.round(baseFee * 1.25).toLocaleString('en-IN');
      const usageRightsFee = Math.round(baseFee * 0.20).toLocaleString('en-IN');

      // Outreach Email Template
      const creatorFirstName = (cachedData.channelName || 'Creator').split(' ')[0];
      const mostRecentVideoObj = cachedData.recentVideos && cachedData.recentVideos[0]
        ? cachedData.recentVideos[0]
        : null;
      const mostRecentVideo = mostRecentVideoObj
        ? (typeof mostRecentVideoObj === 'string' ? mostRecentVideoObj : (mostRecentVideoObj.title || "my latest content"))
        : "my latest content";
      const aiParagraph = cachedData.alignmentText || `${cachedData.channelName || 'Unknown Channel'}'s authority in the ${cachedData.niche || 'Tech'} space is heavily reinforced by recent high-performing videos.`;

      // NEW FEATURE 02: Data Freshness
      const now = new Date();
      const currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const templateData = {
        channelName: cachedData.channelName || 'Unknown Channel',
        subscribers: formatNumber(rawSubscribers),
        avgViews: formatNumber(rawAvgViews),
        engagement: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        targetSponsor: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        targetRegion: cachedData.targetRegion ?? cachedData.audienceGeo ?? 'Tier 3 India/Asia',
        integrationFormat: cachedData.integrationFormat ?? cachedData.integrationType ?? '60-sec shoutout',
        calculatedCpm: formatNumber(rawCalculatedCpm),
        finalValuation: formatNumber(rawFinalValuation),
        alignmentText: cachedData.alignmentText || aiParagraph,
        subscriberCount: formatNumber(rawSubscribers),
        averageViews: formatNumber(rawAvgViews),
        engagementRate: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        suggestedFee: formatNumber(rawFinalValuation),
        brandName: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        audienceGeo: cachedData.targetRegion ?? cachedData.audienceGeo ?? 'Tier 3 India/Asia',
        integrationType: cachedData.integrationFormat ?? cachedData.integrationType ?? '60-sec shoutout',
        cpm: formatNumber(rawCalculatedCpm),
        channelAvatarUrl: cachedData.channelAvatarUrl,
        recentVideos: (cachedData.recentVideos || []).map((video: any) => ({
          title: video.title,
          viewCount: formatNumber(video.viewCount)
        })),
        currentDate,
        expiryDate,
        niche: cachedData.niche || 'Tech',
        baseNicheCpm: formatNumber(baseNicheCpm),
        geoMultiplier,
        integrationMultiplier,
        viewRate: cappedViewRate,
        engagementLabel,
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
        monthlyRetainerEstimate,
        floorPrice,
        recommendedFee,
        exclusivityFee,
        usageRightsFee,
        creatorFirstName,
        creatorName: cachedData.channelName || 'Unknown Creator',
        mostRecentVideo,
        aiParagraph
      };

      const pdfBuffer = await generateMediaKit(templateData, 'youtube');

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
