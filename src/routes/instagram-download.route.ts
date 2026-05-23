import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getCachedChannel } from '../services/redis.service';
import { generateMediaKit } from '../services/pdf.service';
import { calculateInstagramPrice, getInstagramBenchmarkRange } from '../utils/pricing-engine';

/**
 * Instagram-specific download route.
 * Separated from YouTube route to avoid cross-platform bugs.
 * Contains: Instagram benchmark ranges (Bug 05), content pillar parsing (Bug 06),
 * authenticity score calculation (New Feature 01), data freshness (New Feature 02),
 * monthly retainer estimate (New Feature 05).
 */
const instagramDownloadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { channelId: string } }>('/api/download-kit-instagram/:channelId', async (request, reply) => {
    const { channelId } = request.params;

    try {
      const cachedData = await getCachedChannel(channelId);

      if (!cachedData) {
        return reply.status(404).send({ error: 'Channel data not found. Please evaluate first.' });
      }

      if (!cachedData.isPaid) {
        return reply.status(402).send({ error: 'Please complete the payment to unlock this Media Kit.' });
      }

      // ── BUG 04 FIX: Niche strictly from request/cache, never hardcoded ──
      const niche = cachedData.niche;
      if (!niche || niche.trim() === '') {
        return reply.status(400).send({ error: 'Content niche is missing. Please re-evaluate with a niche selected.' });
      }

      // ── Core Instagram metrics ──
      const totalFollowers = cachedData.totalFollowers ?? 0;
      const totalFollowing = cachedData.totalFollowing ?? 0;
      const avgReelPlays = cachedData.avgReelPlays ?? 0;
      const avgStoryViews = cachedData.avgStoryViews ?? 0;

      // Optional engagement metrics
      const avgReelLikes = cachedData.avgReelLikes ?? 0;
      const avgReelComments = cachedData.avgReelComments ?? 0;
      const avgReelShares = cachedData.avgReelShares ?? 0;
      const avgReelSaves = cachedData.avgReelSaves ?? 0;
      const postingFrequency = cachedData.postingFrequency ?? '';

      // ── Number formatting helper ──
      const formatNumber = (val: any) => {
        if (val === undefined || val === null || val === '') return '0';
        const num = Number(val);
        if (!isNaN(num)) return num.toLocaleString('en-IN');
        return String(val);
      };

      // ── Reach-to-Follower Ratio ──
      const followersNum = Number(totalFollowers);
      const avgReelsPlaysNum = Number(avgReelPlays);
      const reachRatioVal = (!isNaN(followersNum) && followersNum > 0) ? (avgReelsPlaysNum / followersNum) * 100 : 0;
      const reachRatio = reachRatioVal.toFixed(1);
      const isViralReach = reachRatioVal > 100;

      // ── True Engagement Rate (when all metrics provided) ──
      const hasFullEngagement = avgReelLikes > 0 && avgReelComments > 0 && avgReelShares > 0 && avgReelSaves > 0;
      const trueEngagementRate = hasFullEngagement && followersNum > 0
        ? (((avgReelLikes + avgReelComments + avgReelShares + avgReelSaves) / followersNum) * 100).toFixed(2)
        : '0';

      // ── NEW FEATURE 01: Audience Authenticity Score ──
      const calculateAuthenticityScore = (): { score: number; color: string; label: string; context: string } => {
        // Signal 1 (30%): Following-to-Follower Ratio
        let signal1 = 100;
        if (followersNum > 0 && totalFollowing > 0) {
          const followingRatio = totalFollowing / followersNum;
          if (followingRatio <= 0.3) {
            signal1 = 100;
          } else if (followingRatio <= 1.0) {
            signal1 = Math.max(0, 100 - ((followingRatio - 0.3) / 0.7) * 100);
          } else {
            signal1 = 0;
          }
        }

        // Signal 2 (30%): Reach-to-Follower Ratio
        let signal2 = 60; // neutral default
        if (reachRatioVal > 0) {
          if (reachRatioVal >= 30 && reachRatioVal <= 150) {
            signal2 = 100;
          } else if (reachRatioVal < 30 && reachRatioVal >= 5) {
            signal2 = (reachRatioVal / 30) * 100;
          } else if (reachRatioVal < 5) {
            signal2 = reachRatioVal * 4; // very low = suspicious
          } else if (reachRatioVal > 150 && reachRatioVal <= 300) {
            signal2 = Math.max(50, 100 - ((reachRatioVal - 150) / 150) * 50);
          } else {
            signal2 = 30; // above 300% is suspicious
          }
        }

        // Signal 3 (25%): Engagement Depth
        let signal3 = 60; // neutral if data not provided
        if (avgReelSaves > 0 && avgReelShares > 0 && avgReelLikes > 0) {
          const depthRatio = (avgReelSaves + avgReelShares) / avgReelLikes;
          signal3 = depthRatio >= 0.05 ? 100 : (depthRatio / 0.05) * 100;
        }

        // Signal 4 (15%): Posting Consistency
        let signal4 = 60;
        const freq = postingFrequency.toLowerCase();
        if (freq.includes('daily') || freq.includes('4') || freq.includes('5') || freq.includes('6')) {
          signal4 = 100;
        } else if (freq.includes('2') || freq.includes('3')) {
          signal4 = 80;
        } else if (freq.includes('once') || freq.includes('week')) {
          signal4 = 60;
        } else if (freq.includes('few') || freq.includes('month')) {
          signal4 = 30;
        }

        const score = Math.round(signal1 * 0.30 + signal2 * 0.30 + signal3 * 0.25 + signal4 * 0.15);
        const clampedScore = Math.min(100, Math.max(0, score));

        let color = '#ef4444'; // red
        let label = 'Low';
        let context = 'Audience authenticity indicators need improvement. Consider organic growth strategies.';

        if (clampedScore >= 80) {
          color = '#16a34a'; // green
          label = 'Excellent';
          context = 'Strong organic growth indicators. Low follow-for-follow risk. Engagement depth verified.';
        } else if (clampedScore >= 60) {
          color = '#f59e0b'; // amber
          label = 'Good';
          context = 'Healthy audience profile with normal engagement patterns. Some signals could be stronger.';
        } else if (clampedScore >= 40) {
          color = '#f97316'; // orange
          label = 'Fair';
          context = 'Mixed audience signals detected. Brands may request additional verification.';
        }

        return { score: clampedScore, color, label, context };
      };

      const authenticity = calculateAuthenticityScore();

      // Dynamically calculate using new tiered pricing engine
      const priceResult = calculateInstagramPrice({
        platform: 'instagram',
        audienceSize: followersNum,
        niche: niche,
        audienceGeo: cachedData.topLocation ?? cachedData.audienceGeo ?? 'Tier 3',
        integrationType: cachedData.integrationFormat ?? cachedData.integrationType ?? '1 Reel + 3 Stories (Full Package)',
        averageViews: avgReelsPlaysNum,
        instagramLikes: Number(avgReelLikes),
        instagramComments: Number(avgReelComments),
        instagramShares: Number(avgReelShares),
        instagramSaves: Number(avgReelSaves)
      });

      const finalFee = priceResult.finalFee;

      // Tier-specific benchmarks
      const benchmarkRange = getInstagramBenchmarkRange(followersNum, niche);

      const barPosition = Math.min(95, Math.max(5,
        ((finalFee - benchmarkRange.low) / (benchmarkRange.high - benchmarkRange.low)) * 100
      )).toFixed(0);

      // ── 3-Tier Packages ──
      const tierStarter = priceResult.starterFee.toLocaleString('en-IN');
      const tierStandard = priceResult.standardFee.toLocaleString('en-IN');
      const tierPremium = priceResult.premiumFee.toLocaleString('en-IN');

      const deliverableStarter = '3x Instagram Stories';
      const deliverableStandard = '1x Reel + 3x Stories';
      const deliverablePremium = '2x Reels + 5x Stories + Link in Bio (7 days)';

      // ── NEW FEATURE 05: Monthly Retainer Estimate ──
      // Parse posting frequency to estimate posts/month
      let postsPerMonth = 10;
      const freqLower = postingFrequency.toLowerCase();
      if (freqLower.includes('daily')) {
        postsPerMonth = 30;
      } else if (freqLower.includes('once a week') || freqLower.includes('1 per week')) {
        postsPerMonth = 4;
      } else if (freqLower.includes('2-3x per week') || freqLower.includes('2-3') || freqLower.includes('3x per week') || freqLower.includes('2 to 3')) {
        postsPerMonth = 10;
      } else if (freqLower.includes('4-5x per week') || freqLower.includes('4-5') || freqLower.includes('4 to 5')) {
        postsPerMonth = 18;
      } else if (freqLower.includes('month') || freqLower.includes('few')) {
        postsPerMonth = 2;
      }

      const monthlyRetainerEstimateVal = finalFee * postsPerMonth;
      const monthlyRetainerEstimate = monthlyRetainerEstimateVal.toLocaleString('en-IN');
      const retainerDeliverableLabel = `Monthly Retainer Estimate (${postsPerMonth} posts/month)`;

      // ── Negotiation Brief ──
      const floorPrice = priceResult.floorPrice.toLocaleString('en-IN');
      const recommendedFee = priceResult.standardFee.toLocaleString('en-IN');
      const exclusivityFee = priceResult.exclusivityFee.toLocaleString('en-IN');
      const usageRightsFee = priceResult.usageRightsFee.toLocaleString('en-IN');

      // ── BUG 06 FIX: Content pillars → recent content reference ──
      const contentPillarsRaw = cachedData.contentPillars || cachedData.recentContentFocus || '';
      let contentPillarsArray: string[] = [];
      if (Array.isArray(contentPillarsRaw)) {
        contentPillarsArray = contentPillarsRaw;
      } else if (typeof contentPillarsRaw === 'string' && contentPillarsRaw.trim()) {
        contentPillarsArray = contentPillarsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      const mostRecentContent = cachedData.mostRecentReelTopic || contentPillarsArray[0] || 'my latest content';
      const contentPillarsDisplay = contentPillarsArray.length > 0 ? contentPillarsArray.join(', ') : niche;

      // ── Creator info ──
      const displayName = cachedData.displayName || cachedData.channelName || channelId;
      const creatorFirstName = displayName.split(' ')[0];
      const instagramHandle = cachedData.instagramHandle || channelId.replace(/^@/, '');
      const aiParagraph = cachedData.alignmentText || `${displayName}'s Instagram audience is well-aligned with ${cachedData.targetSponsor || cachedData.brandName || 'the brand'}'s target demographic.`;

      // ── NEW FEATURE 02: Data Freshness ──
      const now = new Date();
      const currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // Pricing methodology note
      const pricingMethodologyNote = "This valuation is calculated using SponsorScout's tiered rate engine, not AdSense CPM data. It reflects actual brand-to-creator transaction benchmarks from the Indian influencer market in 2026, adjusted for niche commercial value, audience engagement depth, and geographic reach. All figures represent fair market value for a direct brand deal — they do not account for platform agency fees or exclusivity premiums.";

      // Benchmark bar note
      const benchmarkNote = `Industry range for ${priceResult.tierLabel.split(' ')[0]} Instagram creators in ${priceResult.nicheLabel} niche, Indian market, per Reel, 2026.`;

      const templateData = {
        channelName: displayName,
        instagramHandle,
        targetSponsor: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        brandName: cachedData.targetSponsor ?? cachedData.brandName ?? 'Sponsor Brand',
        niche: priceResult.nicheLabel,
        totalFollowers: formatNumber(totalFollowers),
        avgReelPlays: formatNumber(avgReelPlays),
        avgStoryViews: formatNumber(avgStoryViews),
        reachRatio,
        isViralReach,
        hasFullEngagement,
        trueEngagementRate,
        topLocation: cachedData.topLocation ?? 'Tier 3',
        topAgeRange: cachedData.topAgeRange ?? 'N/A',
        genderSplit: cachedData.genderSplit ?? 'N/A',
        targetRegion: priceResult.geoLabel,
        integrationFormat: priceResult.formatLabel,
        geoMultiplier: priceResult.geoMultiplier,
        resonanceMultiplier: priceResult.nicheMultiplier,
        reelValuation: formatNumber(finalFee),
        storyValuation: formatNumber(0), // not used in new format table but kept for compatibility
        finalValuation: formatNumber(finalFee),
        formattedFee: finalFee.toLocaleString('en-IN'),
        benchmarkLow: benchmarkRange.low.toLocaleString('en-IN'),
        benchmarkHigh: benchmarkRange.high.toLocaleString('en-IN'),
        benchmarkPosition: barPosition,
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
        creatorName: displayName,
        mostRecentContent,
        contentPillarsDisplay,
        aiParagraph,
        alignmentText: cachedData.alignmentText || aiParagraph,
        authenticityScore: authenticity.score,
        authenticityColor: authenticity.color,
        authenticityLabel: authenticity.label,
        authenticityContext: authenticity.context,
        currentDate,
        expiryDate,
        audienceGeo: priceResult.geoLabel,
        averageViews: formatNumber(avgReelPlays),

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
        benchmarkNote
      };

      const pdfBuffer = await generateMediaKit(templateData, 'instagram');

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'attachment; filename="MediaKit-Instagram.pdf"');

      return reply.send(pdfBuffer);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message || 'Failed to generate Instagram media kit PDF' });
    }
  });
};

export default instagramDownloadRoutes;
