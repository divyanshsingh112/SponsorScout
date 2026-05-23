export interface PricingInputs {
  platform: 'youtube' | 'instagram';
  audienceSize: number; // subscribers (YT) or followers (IG)
  niche: string;
  audienceGeo: string;
  integrationType: string;
  averageViews: number; // averageViews (YT) or avgReelPlays (IG)
  // Instagram specific true engagement metrics
  instagramLikes?: number;
  instagramComments?: number;
  instagramShares?: number;
  instagramSaves?: number;
  instagramStoriesCount?: number; // fallback/calculated number of stories for stories-only
}

export interface PricingResult {
  tierLabel: string;
  tierRange: string;
  baseRate: number;
  nicheMultiplier: number;
  nicheLabel: string;
  engagementSignal: number; // view rate % (YT) or engagement rate % (IG)
  engagementMultiplier: number;
  geoMultiplier: number;
  geoLabel: string;
  formatMultiplier: number;
  formatLabel: string;
  finalFee: number; // rounded to nearest ₹500
  starterFee: number; // finalFee × 0.55 (rounded to nearest ₹500)
  standardFee: number; // = finalFee
  premiumFee: number; // finalFee × 1.80 (rounded to nearest ₹500)
  floorPrice: number; // finalFee × 0.70 (rounded to nearest ₹500)
  exclusivityFee: number; // finalFee × 1.25 (rounded to nearest ₹500)
  usageRightsFee: number; // finalFee × 0.20 (rounded to nearest ₹500)
  monthlyRetainerEstimate: number;
  engagementCaption: string; // contextual label for YT view rate
}

function roundTo500(val: number): number {
  return Math.round(val / 500) * 500;
}

// Normalized niche matcher helper
function matchNiche(niche: string, platform: 'youtube' | 'instagram'): { multiplier: number; label: string } {
  const n = niche.toLowerCase().trim();

  if (platform === 'youtube') {
    if (n.includes('finance') || n.includes('crypto') || n.includes('invest')) {
      return { multiplier: 2.0, label: 'Finance & Investing' };
    }
    if (n.includes('tech') || n.includes('gadget')) {
      return { multiplier: 1.6, label: 'Tech & Gadgets' };
    }
    if (n.includes('education') || n.includes('study')) {
      return { multiplier: 1.4, label: 'Education & Study' };
    }
    if (n.includes('fitness') || n.includes('health')) {
      return { multiplier: 1.3, label: 'Fitness & Health' };
    }
    if (n.includes('beauty') || n.includes('fashion')) {
      return { multiplier: 1.2, label: 'Beauty & Fashion' };
    }
    if (n.includes('food') || n.includes('cook')) {
      return { multiplier: 1.1, label: 'Food & Cooking' };
    }
    if (n.includes('lifestyle') || n.includes('vlog')) {
      return { multiplier: 1.0, label: 'Lifestyle & Vlog' };
    }
    if (n.includes('gaming')) {
      return { multiplier: 1.0, label: 'Gaming' };
    }
    if (n.includes('comedy') || n.includes('entertain')) {
      return { multiplier: 0.85, label: 'Comedy & Entertainment' };
    }
    return { multiplier: 1.0, label: niche }; // fallback baseline
  } else {
    // Instagram niches
    if (n.includes('finance') || n.includes('crypto') || n.includes('invest')) {
      return { multiplier: 1.8, label: 'Finance & Investing' };
    }
    if (n.includes('tech') || n.includes('gadget')) {
      return { multiplier: 1.5, label: 'Tech & Gadgets' };
    }
    if (n.includes('fitness') || n.includes('health')) {
      return { multiplier: 1.3, label: 'Fitness & Health' };
    }
    if (n.includes('education') || n.includes('study')) {
      return { multiplier: 1.3, label: 'Education & Study' };
    }
    if (n.includes('food') || n.includes('cook')) {
      return { multiplier: 1.1, label: 'Food & Cooking' };
    }
    if (n.includes('fashion') || n.includes('beauty')) {
      return { multiplier: 1.1, label: 'Fashion & Beauty' };
    }
    if (n.includes('gaming')) {
      return { multiplier: 1.0, label: 'Gaming' };
    }
    if (n.includes('lifestyle') || n.includes('vlog')) {
      return { multiplier: 1.0, label: 'Lifestyle & Vlog' };
    }
    if (n.includes('comedy') || n.includes('entertain')) {
      return { multiplier: 0.9, label: 'Comedy & Entertainment' };
    }
    if (n.includes('travel')) {
      return { multiplier: 0.9, label: 'Travel' };
    }
    return { multiplier: 1.0, label: niche }; // fallback baseline
  }
}

// Normalized Geo Matcher
function matchGeo(geo: string): { multiplier: number; label: string } {
  const g = geo.toLowerCase().trim();
  if (g.includes('us') || g.includes('uk') || g.includes('canada') || g.includes('australia') || g.includes('tier 1')) {
    return { multiplier: 2.20, label: 'US / UK / Canada / AU' };
  }
  if (g.includes('uae') || g.includes('singapore') || g.includes('saudi') || g.includes('tier 2')) {
    return { multiplier: 1.60, label: 'UAE / Singapore / Saudi' };
  }
  if (g.includes('india') || g.includes('tier 3')) {
    return { multiplier: 1.00, label: 'India' };
  }
  return { multiplier: 0.80, label: 'Other / Mixed' };
}

// 1. YouTube Tier Lookups
export function getYouTubeTierInfo(subscribers: number): { label: string; range: string; baseRate: number } {
  if (subscribers <= 25000) {
    return { label: 'Nano', range: '5,000 – 25,000', baseRate: 8000 };
  } else if (subscribers <= 100000) {
    return { label: 'Micro', range: '25,001 – 100,000', baseRate: 30000 };
  } else if (subscribers <= 300000) {
    return { label: 'Mid-Tier', range: '100,01 – 300,000', baseRate: 70000 }; // Use exact range from instruction
  } else if (subscribers <= 600000) {
    return { label: 'Rising', range: '300,001 – 600,000', baseRate: 140000 };
  } else if (subscribers <= 1000000) {
    return { label: 'Macro', range: '600,001 – 1,000,000', baseRate: 280000 };
  } else if (subscribers <= 5000000) {
    return { label: 'Mega', range: '1,000,001 – 5,000,000', baseRate: 600000 };
  } else {
    return { label: 'Elite', range: '5,000,001+', baseRate: 1500000 };
  }
}

// 2. Instagram Tier Lookups
export function getInstagramTierInfo(followers: number): { label: string; range: string; baseRate: number } {
  if (followers <= 10000) {
    return { label: 'Nano', range: '1,000 – 10,000', baseRate: 6000 };
  } else if (followers <= 30000) {
    return { label: 'Micro Low', range: '10,001 – 30,000', baseRate: 15000 };
  } else if (followers <= 100000) {
    return { label: 'Micro High', range: '30,001 – 100,000', baseRate: 35000 };
  } else if (followers <= 300000) {
    return { label: 'Mid-Tier', range: '100,01 – 300,000', baseRate: 90000 };
  } else if (followers <= 600000) {
    return { label: 'Rising', range: '300,001 – 600,000', baseRate: 200000 };
  } else if (followers <= 1000000) {
    return { label: 'Macro', range: '600,001 – 1,000,000', baseRate: 450000 };
  } else {
    return { label: 'Mega', range: '1,000,001+', baseRate: 1000000 };
  }
}

// 3. YouTube Tier Benchmark Ranges (Scaled by Niche multiplier)
export function getYouTubeBenchmarkRange(subscribers: number, niche: string): { low: number; high: number } {
  const tier = getYouTubeTierInfo(subscribers);
  const nicheResult = matchNiche(niche, 'youtube');
  let baseLow = 4000;
  let baseHigh = 15000;

  switch (tier.label) {
    case 'Nano': baseLow = 4000; baseHigh = 15000; break;
    case 'Micro': baseLow = 15000; baseHigh = 60000; break;
    case 'Mid-Tier': baseLow = 40000; baseHigh = 120000; break;
    case 'Rising': baseLow = 80000; baseHigh = 250000; break;
    case 'Macro': baseLow = 180000; baseHigh = 500000; break;
    case 'Mega': baseLow = 400000; baseHigh = 1200000; break;
    case 'Elite': baseLow = 1000000; baseHigh = 4000000; break;
  }

  return {
    low: Math.round(baseLow * nicheResult.multiplier),
    high: Math.round(baseHigh * nicheResult.multiplier)
  };
}

// 4. Instagram Tier Benchmark Ranges (Scaled by Niche multiplier)
export function getInstagramBenchmarkRange(followers: number, niche: string): { low: number; high: number } {
  const tier = getInstagramTierInfo(followers);
  const nicheResult = matchNiche(niche, 'instagram');
  let baseLow = 3000;
  let baseHigh = 12000;

  switch (tier.label) {
    case 'Nano': baseLow = 3000; baseHigh = 12000; break;
    case 'Micro Low': baseLow = 8000; baseHigh = 30000; break;
    case 'Micro High': baseLow = 20000; baseHigh = 70000; break;
    case 'Mid-Tier': baseLow = 60000; baseHigh = 180000; break;
    case 'Rising': baseLow = 150000; baseHigh = 450000; break;
    case 'Macro': baseLow = 350000; baseHigh = 900000; break;
    case 'Mega': baseLow = 800000; baseHigh = 2500000; break;
  }

  return {
    low: Math.round(baseLow * nicheResult.multiplier),
    high: Math.round(baseHigh * nicheResult.multiplier)
  };
}

export function calculateYouTubePrice(inputs: PricingInputs): PricingResult {
  const tier = getYouTubeTierInfo(inputs.audienceSize);
  const nicheResult = matchNiche(inputs.niche, 'youtube');
  
  // Base Rate (gaming baseline is baseline multiplier)
  const baseRate = tier.baseRate;

  // Step B: Engagement
  const viewRate = inputs.audienceSize > 0 ? (inputs.averageViews / inputs.audienceSize) * 100 : 0;
  let engagementMultiplier = 1.0;
  let engagementCaption = 'Healthy — well above industry average';

  if (viewRate < 5) {
    engagementMultiplier = 0.75;
    engagementCaption = 'Below average — brands may negotiate down';
  } else if (viewRate < 9) {
    engagementMultiplier = 0.90;
    engagementCaption = 'Average — typical for this subscriber range';
  } else if (viewRate < 15) {
    engagementMultiplier = 1.00;
    engagementCaption = 'Healthy — well above industry average';
  } else if (viewRate < 25) {
    engagementMultiplier = 1.20;
    engagementCaption = 'Exceptional — top 10% of channels at this tier';
  } else {
    engagementMultiplier = 1.40;
    engagementCaption = 'Exceptional — top 10% of channels at this tier';
  }

  // Step C: Geo
  const geoResult = matchGeo(inputs.audienceGeo);

  // Step D: Format
  let formatMultiplier = 1.0;
  let formatLabel = inputs.integrationType;
  const f = inputs.integrationType.toLowerCase().trim();

  if (f.includes('15-second') || f.includes('15-sec') || f.includes('end-card')) {
    formatMultiplier = 0.45;
    formatLabel = '15-second mention';
  } else if (f.includes('30-second') || f.includes('30-sec') || f.includes('shoutout')) {
    formatMultiplier = 0.70;
    formatLabel = '30-second shoutout';
  } else if (f.includes('60-second') || f.includes('60-sec') || f.includes('integration')) {
    formatMultiplier = 1.00;
    formatLabel = '60-second integration';
  } else if (f.includes('dedicated video + shorts + community')) {
    formatMultiplier = 3.50;
    formatLabel = 'Dedicated video + Shorts + Community';
  } else if (f.includes('dedicated video + community')) {
    formatMultiplier = 3.00;
    formatLabel = 'Dedicated video + Community post';
  } else if (f.includes('dedicated')) {
    formatMultiplier = 2.50;
    formatLabel = 'Dedicated video';
  }

  // Step E: Final Calculation
  const unroundedFinalFee = baseRate * nicheResult.multiplier * engagementMultiplier * geoResult.multiplier * formatMultiplier;
  const finalFee = roundTo500(unroundedFinalFee);

  // 3 packages from Final Fee
  const starterFee = roundTo500(finalFee * 0.55);
  const standardFee = finalFee;
  const premiumFee = roundTo500(finalFee * 1.80);
  const floorPrice = roundTo500(finalFee * 0.70);
  const exclusivityFee = roundTo500(finalFee * 1.25);
  const usageRightsFee = roundTo500(finalFee * 0.20);

  return {
    tierLabel: `${tier.label} — ${tier.range} subs`,
    tierRange: tier.range,
    baseRate,
    nicheMultiplier: nicheResult.multiplier,
    nicheLabel: nicheResult.label,
    engagementSignal: parseFloat(viewRate.toFixed(2)),
    engagementMultiplier,
    geoMultiplier: geoResult.multiplier,
    geoLabel: geoResult.label,
    formatMultiplier,
    formatLabel,
    finalFee,
    starterFee,
    standardFee,
    premiumFee,
    floorPrice,
    exclusivityFee,
    usageRightsFee,
    monthlyRetainerEstimate: finalFee * 4, // 4 uploads estimate
    engagementCaption
  };
}

export function calculateInstagramPrice(inputs: PricingInputs): PricingResult {
  const tier = getInstagramTierInfo(inputs.audienceSize);
  const nicheResult = matchNiche(inputs.niche, 'instagram');
  const baseRate = tier.baseRate; // Base Reel Rate

  // Step B: Engagement
  const likes = inputs.instagramLikes ?? 0;
  const comments = inputs.instagramComments ?? 0;
  const shares = inputs.instagramShares ?? 0;
  const saves = inputs.instagramSaves ?? 0;

  const hasFullEngagement = likes > 0 && comments > 0 && shares > 0 && saves > 0;
  let erValue = 0;

  if (hasFullEngagement) {
    erValue = ((likes + comments + shares + saves) / inputs.audienceSize) * 100;
  } else {
    erValue = (inputs.averageViews / inputs.audienceSize) * 100;
  }

  let engagementMultiplier = 1.0;
  if (erValue < 3) {
    engagementMultiplier = 0.75;
  } else if (erValue < 6) {
    engagementMultiplier = 0.90;
  } else if (erValue < 10) {
    engagementMultiplier = 1.00;
  } else if (erValue < 20) {
    engagementMultiplier = 1.20;
  } else if (erValue < 40) {
    engagementMultiplier = 1.35;
  } else {
    engagementMultiplier = 1.50;
  }

  // Step C: Geo
  const geoResult = matchGeo(inputs.audienceGeo);

  // Step D: Format
  let formatMultiplier = 1.0;
  let formatLabel = inputs.integrationType;
  const f = inputs.integrationType.toLowerCase().trim();

  // Reels formats
  if (f.includes('30-second reel only') || f.includes('30-sec reel')) {
    formatMultiplier = 0.70;
    formatLabel = '30-second Reel only';
  } else if (f.includes('60-second reel only') || f.includes('60-sec reel') || f.includes('reel only')) {
    formatMultiplier = 1.00;
    formatLabel = '60-second Reel only';
  } else if (f.includes('package') || f.includes('combined') || f.includes('1 reel + 3 stories')) {
    formatMultiplier = 1.30;
    formatLabel = '1 Reel + 3 Stories (Full Package)';
  } else if (f.includes('2 reels + 5 stories')) {
    formatMultiplier = 2.10;
    formatLabel = '2 Reels + 5 Stories + Link in Bio';
  } else if (f.includes('stories only') || f.includes('story only') || f.includes('stories')) {
    // Stories only logic
    const storiesCount = inputs.instagramStoriesCount ?? 3;
    formatMultiplier = 0.25 * storiesCount;
    formatLabel = `${storiesCount}x Stories Only`;
  }

  // Step E: Final Calculation
  const unroundedFinalFee = baseRate * nicheResult.multiplier * engagementMultiplier * geoResult.multiplier * formatMultiplier;
  const finalFee = roundTo500(unroundedFinalFee);

  // 3 packages from Final Fee
  const starterFee = roundTo500(finalFee * 0.55);
  const standardFee = finalFee;
  const premiumFee = roundTo500(finalFee * 1.80);
  const floorPrice = roundTo500(finalFee * 0.70);
  const exclusivityFee = roundTo500(finalFee * 1.25);
  const usageRightsFee = roundTo500(finalFee * 0.20);

  return {
    tierLabel: `${tier.label} — ${tier.range} followers`,
    tierRange: tier.range,
    baseRate,
    nicheMultiplier: nicheResult.multiplier,
    nicheLabel: nicheResult.label,
    engagementSignal: parseFloat(erValue.toFixed(2)),
    engagementMultiplier,
    geoMultiplier: geoResult.multiplier,
    geoLabel: geoResult.label,
    formatMultiplier,
    formatLabel,
    finalFee,
    starterFee,
    standardFee,
    premiumFee,
    floorPrice,
    exclusivityFee,
    usageRightsFee,
    monthlyRetainerEstimate: finalFee * 10, // Default 10 estimate based on posts per month
    engagementCaption: ''
  };
}
