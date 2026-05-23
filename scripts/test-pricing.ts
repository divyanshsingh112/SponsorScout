import { calculateYouTubePrice, calculateInstagramPrice, getYouTubeBenchmarkRange, getInstagramBenchmarkRange } from '../src/utils/pricing-engine';

console.log('=== RUNNING PRICING ENGINE QA TEST CASES ===\n');

// --- TEST CASE 01: YouTube: Shub ---
console.log('--- TEST CASE 01: YouTube: Shub ---');
const shubResult = calculateYouTubePrice({
  platform: 'youtube',
  audienceSize: 326000,
  niche: 'Gaming',
  audienceGeo: 'India',
  integrationType: '60-second integration',
  averageViews: 38441
});

console.log('Shub Result:');
console.log(`- Tier Label: ${shubResult.tierLabel}`);
console.log(`- Base Rate: ₹${shubResult.baseRate}`);
console.log(`- Niche Multiplier: ${shubResult.nicheMultiplier}x`);
console.log(`- Engagement (View Rate): ${shubResult.engagementSignal}% (Multiplier: ${shubResult.engagementMultiplier}x, Caption: "${shubResult.engagementCaption}")`);
console.log(`- Geo Multiplier: ${shubResult.geoMultiplier}x`);
console.log(`- Format: "${shubResult.formatLabel}" (Multiplier: ${shubResult.formatMultiplier}x)`);
console.log(`- Final Fee: ₹${shubResult.finalFee} (Expected: ₹1,40,000)`);
console.log(`- Starter Fee: ₹${shubResult.starterFee} (Expected: ₹77,000)`);
console.log(`- Standard Fee: ₹${shubResult.standardFee} (Expected: ₹1,40,000)`);
console.log(`- Premium Fee: ₹${shubResult.premiumFee} (Expected: ₹2,52,000)`);
console.log(`- Monthly Retainer: ₹${shubResult.monthlyRetainerEstimate} (Expected: ₹5,60,000)`);

const shubBenchmark = getYouTubeBenchmarkRange(326000, 'Gaming');
console.log(`- Benchmark Gaming Niche: Low: ₹${shubBenchmark.low}, High: ₹${shubBenchmark.high} (Expected: Low: ₹80,000, High: ₹2,50,000)`);
console.log(`- Marker %: ${((shubResult.finalFee - shubBenchmark.low) / (shubBenchmark.high - shubBenchmark.low) * 100).toFixed(1)}% (Expected: ~37%)\n`);

// --- TEST CASE 02: Instagram: Tech Unboxed ---
console.log('--- TEST CASE 02: Instagram: Tech Unboxed ---');
const techUnboxedResult = calculateInstagramPrice({
  platform: 'instagram',
  audienceSize: 85000,
  niche: 'Tech & Gadgets',
  audienceGeo: 'India',
  integrationType: '1 Reel + 3 Stories (Full Package)',
  averageViews: 45000,
  instagramLikes: 4200,
  instagramComments: 180,
  instagramShares: 520,
  instagramSaves: 980
});

console.log('Tech Unboxed Result:');
console.log(`- Tier Label: ${techUnboxedResult.tierLabel}`);
console.log(`- Base Rate: ₹${techUnboxedResult.baseRate}`);
console.log(`- Niche Multiplier: ${techUnboxedResult.nicheMultiplier}x`);
console.log(`- Engagement (True ER): ${techUnboxedResult.engagementSignal}% (Multiplier: ${techUnboxedResult.engagementMultiplier}x)`);
console.log(`- Geo Multiplier: ${techUnboxedResult.geoMultiplier}x`);
console.log(`- Format: "${techUnboxedResult.formatLabel}" (Multiplier: ${techUnboxedResult.formatMultiplier}x)`);
console.log(`- Final Fee: ₹${techUnboxedResult.finalFee} (Expected: ₹68,500)`);
console.log(`- Starter Fee: ₹${techUnboxedResult.starterFee} (Expected: ₹37,500)`);
console.log(`- Standard Fee: ₹${techUnboxedResult.standardFee} (Expected: ₹68,500)`);
console.log(`- Premium Fee: ₹${techUnboxedResult.premiumFee} (Expected: ₹1,23,500)`);
console.log(`- Monthly Retainer: ₹${techUnboxedResult.monthlyRetainerEstimate} (Expected: ₹6,85,000)`);

const techUnboxedBenchmark = getInstagramBenchmarkRange(85000, 'Tech & Gadgets');
console.log(`- Benchmark Tech Niche: Low: ₹${techUnboxedBenchmark.low}, High: ₹${techUnboxedBenchmark.high} (Expected: Low: ₹30,000, High: ₹1,05,000)`);
console.log(`- Marker %: ${((techUnboxedResult.finalFee - techUnboxedBenchmark.low) / (techUnboxedBenchmark.high - techUnboxedBenchmark.low) * 100).toFixed(1)}% (Expected: ~58%)\n`);

// --- TEST CASE 03: Instagram: dummy_id ---
console.log('--- TEST CASE 03: Instagram: dummy_id ---');
const dummyResult = calculateInstagramPrice({
  platform: 'instagram',
  audienceSize: 45000,
  niche: 'Gaming',
  audienceGeo: 'India',
  integrationType: '60-second Reel only',
  averageViews: 50000
});

console.log('dummy_id Result:');
console.log(`- Tier Label: ${dummyResult.tierLabel}`);
console.log(`- Base Rate: ₹${dummyResult.baseRate}`);
console.log(`- Niche Multiplier: ${dummyResult.nicheMultiplier}x`);
console.log(`- Engagement (Reach ER): ${dummyResult.engagementSignal}% (Multiplier: ${dummyResult.engagementMultiplier}x)`);
console.log(`- Geo Multiplier: ${dummyResult.geoMultiplier}x`);
console.log(`- Format: "${dummyResult.formatLabel}" (Multiplier: ${dummyResult.formatMultiplier}x)`);
console.log(`- Final Fee: ₹${dummyResult.finalFee} (Expected: ₹52,500)`);

const dummyBenchmark = getInstagramBenchmarkRange(45000, 'Gaming');
console.log(`- Benchmark Gaming Niche: Low: ₹${dummyBenchmark.low}, High: ₹${dummyBenchmark.high} (Expected: Low: ₹20,000, High: ₹70,000)`);
console.log(`- Marker %: ${((dummyResult.finalFee - dummyBenchmark.low) / (dummyBenchmark.high - dummyBenchmark.low) * 100).toFixed(1)}% (Expected: ~47%)\n`);

console.log('=== END OF TEST RUN ===');
