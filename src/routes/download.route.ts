import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel } from '../services/redis.service';
import { generateMediaKit } from '../services/pdf.service';
import { calculateYouTubePrice, getYouTubeBenchmarkRange } from '../utils/pricing-engine';

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

      const subscribers = Number(rawSubscribers);
      const avgViews = Number(rawAvgViews);

      // Dynamically calculate using new tiered pricing engine
      const priceResult = calculateYouTubePrice({
        platform: 'youtube',
        audienceSize: subscribers,
        niche: cachedData.niche || 'Tech & Gadgets',
        audienceGeo: cachedData.audienceGeo || cachedData.targetRegion || 'India',
        integrationType: cachedData.integrationFormat ?? cachedData.integrationType ?? '60-second integration',
        averageViews: avgViews
      });

      const formatNumber = (val: any) => {
        if (val === undefined || val === null || val === '') return '0';
        const num = Number(val);
        if (!isNaN(num)) return num.toLocaleString('en-IN');
        return String(val);
      };

      // Raw View Rate (uncapped)
      const viewRateVal = (!isNaN(subscribers) && subscribers > 0) ? (avgViews / subscribers) * 100 : 0;
      const rawViewRate = viewRateVal.toFixed(2);
      const engagementLabel = "Avg. View Rate";

      // Tier-specific benchmarks
      const benchmarkRange = getYouTubeBenchmarkRange(subscribers, cachedData.niche || 'Tech & Gadgets');
      const finalFee = priceResult.finalFee;

      const barPosition = Math.min(95, Math.max(5,
        ((finalFee - benchmarkRange.low) / (benchmarkRange.high - benchmarkRange.low)) * 100
      )).toFixed(0);

      const benchmarkLow = benchmarkRange.low.toLocaleString('en-IN');
      const benchmarkHigh = benchmarkRange.high.toLocaleString('en-IN');
      const benchmarkPosition = barPosition;
      const formattedFee = finalFee.toLocaleString('en-IN');

      // Tiers package deliverables and prices
      const tierStarter = priceResult.starterFee.toLocaleString('en-IN');
      const tierStandard = priceResult.standardFee.toLocaleString('en-IN');
      const tierPremium = priceResult.premiumFee.toLocaleString('en-IN');

      const deliverableStarter = "30-second brand shoutout";
      const deliverableStandard = "60-second dedicated integration (Recommended)";
      const deliverablePremium = "Dedicated video + Community post";

      // Retainer calculation
      const monthlyRetainerEstimate = priceResult.monthlyRetainerEstimate.toLocaleString('en-IN');
      const retainerDeliverableLabel = "Monthly Retainer Estimate (4 videos/month)";

      // Negotiation values
      const floorPrice = priceResult.floorPrice.toLocaleString('en-IN');
      const recommendedFee = priceResult.standardFee.toLocaleString('en-IN');
      const exclusivityFee = priceResult.exclusivityFee.toLocaleString('en-IN');
      const usageRightsFee = priceResult.usageRightsFee.toLocaleString('en-IN');

      // Outreach Email Template
      const creatorFirstName = (cachedData.channelName || 'Creator').split(' ')[0];
      const mostRecentVideoObj = cachedData.recentVideos && cachedData.recentVideos[0]
        ? cachedData.recentVideos[0]
        : null;
      const mostRecentVideo = mostRecentVideoObj
        ? (typeof mostRecentVideoObj === 'string' ? mostRecentVideoObj : (mostRecentVideoObj.title || "my latest content"))
        : "my latest content";
      const aiParagraph = cachedData.alignmentText || `${cachedData.channelName || 'Unknown Channel'}'s authority in the ${cachedData.niche || 'Tech & Gadgets'} space is heavily reinforced by recent high-performing videos.`;

      // Data Freshness
      const now = new Date();
      const currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // Pricing methodology note
      const pricingMethodologyNote = "This valuation is calculated using SponsorScout's tiered rate engine, not AdSense CPM data. It reflects actual brand-to-creator transaction benchmarks from the Indian influencer market in 2026, adjusted for niche commercial value, audience engagement depth, and geographic reach. All figures represent fair market value for a direct brand deal — they do not account for platform agency fees or exclusivity premiums.";

      // Benchmark bar note
      const benchmarkNote = `Industry range for ${priceResult.tierLabel.split(' ')[0]} YouTube creators in ${priceResult.nicheLabel} niche, Indian market, 2026.`;

      const templateData = {
        channelName: cachedData.channelName || 'Unknown Channel',
        subscribers: formatNumber(rawSubscribers),
        avgViews: formatNumber(rawAvgViews),
        engagement: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        targetSponsor: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        targetRegion: priceResult.geoLabel,
        integrationFormat: priceResult.formatLabel,
        calculatedCpm: formatNumber(100), // kept for backwards compat placeholder
        finalValuation: formatNumber(finalFee),
        alignmentText: cachedData.alignmentText || aiParagraph,
        subscriberCount: formatNumber(rawSubscribers),
        averageViews: formatNumber(rawAvgViews),
        engagementRate: typeof rawEngagement === 'number' ? parseFloat(rawEngagement.toFixed(2)) : rawEngagement,
        suggestedFee: formatNumber(finalFee),
        brandName: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        audienceGeo: priceResult.geoLabel,
        integrationType: priceResult.formatLabel,
        cpm: formatNumber(100),
        channelAvatarUrl: cachedData.channelAvatarUrl,
        recentVideos: (cachedData.recentVideos || []).map((video: any) => ({
          title: video.title,
          viewCount: formatNumber(video.viewCount)
        })),
        currentDate,
        expiryDate,
        niche: priceResult.nicheLabel,
        baseNicheCpm: formatNumber(priceResult.baseRate),
        geoMultiplier: priceResult.geoMultiplier,
        integrationMultiplier: priceResult.formatMultiplier,
        viewRate: rawViewRate,
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
        retainerDeliverableLabel,
        floorPrice,
        recommendedFee,
        exclusivityFee,
        usageRightsFee,
        creatorFirstName,
        creatorName: cachedData.channelName || 'Unknown Creator',
        mostRecentVideo,
        aiParagraph,

        // Tier fields
        tierLabel: priceResult.tierLabel,
        nicheLabel: priceResult.nicheLabel,
        nicheMultiplier: priceResult.nicheMultiplier,
        engagementSignal: priceResult.engagementSignal,
        engagementMultiplier: priceResult.engagementMultiplier,
        geoLabel: priceResult.geoLabel,
        formatLabel: priceResult.formatLabel,
        formatMultiplier: priceResult.formatMultiplier,
        pricingMethodologyNote,
        benchmarkNote,
        engagementCaption: priceResult.engagementCaption
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
