import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Check, User, Users, BarChart3, MessageCircle, PieChart, Palette, Target, HelpCircle, X } from 'lucide-react';

/**
 * InstagramWizard — 7-step guided data entry for Instagram creators.
 * New Feature 04: Screenshot guidance tooltips built in.
 */

interface InstagramWizardProps {
  loading: boolean;
  onEvaluate: (data: any) => void;
  initialValues?: any;
}

// Tooltip component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      {children}
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
        aria-label="Help"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 leading-relaxed shadow-xl z-50">
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
          {text}
        </div>
      )}
    </span>
  );
};

// Tag input component for Content Pillars
const TagInput = ({ tags, setTags, placeholder, maxTags = 5 }: { tags: string[]; setTags: (t: string[]) => void; placeholder: string; maxTags?: number }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && tags.length < maxTags && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-3 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all min-h-[44px]">
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-lg text-xs font-medium">
          {tag}
          <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="text-indigo-400 hover:text-red-400 transition-colors cursor-pointer">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none font-sans"
        />
      )}
    </div>
  );
};

const STEP_LABELS = ['Your Profile', 'Audience Size', 'Reels Stats', 'Stories Stats', 'Audience Profile', 'What You Create', 'Target Sponsor'];
const STEP_ICONS = [User, Users, BarChart3, MessageCircle, PieChart, Palette, Target];
const TOTAL_STEPS = 7;

export default function InstagramWizard({ loading, onEvaluate, initialValues }: InstagramWizardProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1: Account Identity
  const [handle, setHandle] = useState(initialValues?.channelId || '');
  const [displayName, setDisplayName] = useState(initialValues?.displayName || '');
  const [niche, setNiche] = useState(initialValues?.niche || 'Fitness & Health');

  // Step 2: Follower & Profile Data
  const [totalFollowers, setTotalFollowers] = useState(initialValues?.totalFollowers || '');
  const [totalFollowing, setTotalFollowing] = useState(initialValues?.totalFollowing || '');
  const [profileVisits, setProfileVisits] = useState(initialValues?.profileVisits || '');

  // Step 3: Reels Performance
  const [avgReelPlays, setAvgReelPlays] = useState(initialValues?.avgReelPlays || '');
  const [avgReelLikes, setAvgReelLikes] = useState(initialValues?.avgReelLikes || '');
  const [avgReelComments, setAvgReelComments] = useState(initialValues?.avgReelComments || '');
  const [avgReelShares, setAvgReelShares] = useState(initialValues?.avgReelShares || '');
  const [avgReelSaves, setAvgReelSaves] = useState(initialValues?.avgReelSaves || '');

  // Step 4: Stories Performance
  const [avgStoryViews, setAvgStoryViews] = useState(initialValues?.avgStoryViews || '');
  const [autoEstimateStories, setAutoEstimateStories] = useState(false);

  // Step 5: Audience Demographics
  const [primaryAgeGroup, setPrimaryAgeGroup] = useState(initialValues?.topAgeRange || '18–24');
  const [femalePercentage, setFemalePercentage] = useState<number>(initialValues?.femalePercentage ?? 50);
  const [topCity, setTopCity] = useState(initialValues?.topCity || '');
  const [topCountry, setTopCountry] = useState(initialValues?.topCountry || 'India');

  // Step 6: Content Profile
  const [contentPillars, setContentPillars] = useState<string[]>(initialValues?.contentPillars || []);
  const [postingFrequency, setPostingFrequency] = useState(initialValues?.postingFrequency || '2–3x per week');
  const [mostRecentReel, setMostRecentReel] = useState(initialValues?.mostRecentReelTopic || '');
  const [secondRecentReel, setSecondRecentReel] = useState(initialValues?.secondRecentReelTopic || '');
  const [thirdRecentReel, setThirdRecentReel] = useState(initialValues?.thirdRecentReelTopic || '');

  // Step 7: Campaign Details
  const [brandName, setBrandName] = useState(initialValues?.brandName || '');
  const [brandIndustry, setBrandIndustry] = useState(initialValues?.brandIndustry || '');
  const [integrationFormat, setIntegrationFormat] = useState(initialValues?.integrationType || 'Full Package (1 Reel + 3 Stories)');

  // Auto-estimate story views
  useEffect(() => {
    if (autoEstimateStories && totalFollowers) {
      const estimated = Math.round(Number(totalFollowers) * 0.12);
      setAvgStoryViews(String(estimated));
    }
  }, [autoEstimateStories, totalFollowers]);

  // Derive geo tier
  const deriveGeoTier = useCallback((country: string): string => {
    const c = country.toLowerCase();
    if (['united states', 'united kingdom', 'canada', 'australia'].some(t => c.includes(t))) return 'Tier 1';
    if (['united arab emirates', 'saudi arabia', 'singapore'].some(t => c.includes(t))) return 'Tier 2';
    return 'Tier 3';
  }, []);

  const geoTier = deriveGeoTier(topCountry);

  // Format number for display
  const formatDisplay = (val: string) => {
    const num = Number(val);
    if (!isNaN(num) && val) return num.toLocaleString('en-IN');
    return val;
  };

  // Validation per step
  const canProceed = (): boolean => {
    switch (step) {
      case 1: return handle.trim() !== '' && displayName.trim() !== '' && niche !== '';
      case 2: return totalFollowers !== '' && totalFollowing !== '';
      case 3: return avgReelPlays !== '';
      case 4: return avgStoryViews !== '';
      case 5: return primaryAgeGroup !== '' && topCountry !== '';
      case 6: return contentPillars.length >= 1 && postingFrequency !== '' && mostRecentReel.trim() !== '';
      case 7: return brandName.trim() !== '' && brandIndustry.trim() !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    setError('');
    if (!canProceed()) {
      setError('Please fill out all required fields.');
      return;
    }
    setStep(prev => Math.min(TOTAL_STEPS, prev + 1));
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canProceed()) {
      setError('Please fill out all required fields before generating.');
      return;
    }

    const cleanHandle = handle.replace(/^@/, '').trim();

    onEvaluate({
      channelId: cleanHandle,
      displayName,
      niche,
      platform: 'instagram',
      totalFollowers: Number(totalFollowers),
      totalFollowing: Number(totalFollowing),
      profileVisits: profileVisits ? Number(profileVisits) : undefined,
      avgReelPlays: Number(avgReelPlays),
      avgReelLikes: avgReelLikes ? Number(avgReelLikes) : undefined,
      avgReelComments: avgReelComments ? Number(avgReelComments) : undefined,
      avgReelShares: avgReelShares ? Number(avgReelShares) : undefined,
      avgReelSaves: avgReelSaves ? Number(avgReelSaves) : undefined,
      avgStoryViews: avgStoryViews ? Number(avgStoryViews) : undefined,
      topAgeRange: primaryAgeGroup,
      femalePercentage,
      topCity,
      topCountry,
      geoTier,
      contentPillars,
      postingFrequency,
      mostRecentReelTopic: mostRecentReel,
      secondRecentReelTopic: secondRecentReel || undefined,
      thirdRecentReelTopic: thirdRecentReel || undefined,
      brandName: brandName.trim(),
      brandIndustry: brandIndustry.trim(),
      integrationType: integrationFormat,
      sponsorNiche: brandIndustry.trim() || niche,
      recentContentFocus: [mostRecentReel, secondRecentReel, thirdRecentReel].filter(Boolean).join(', '),
    });
  };

  const slideVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const inputClass = "block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans";
  const selectClass = "block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2";

  const StepIcon = STEP_ICONS[step - 1];

  return (
    <div className="w-full max-w-xl mx-auto px-4 font-sans">
      {/* Progress bar — 7 steps */}
      <div className="flex items-center justify-between mb-8 px-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((num) => (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div
                className={`relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border-2 font-bold text-xs transition-all duration-500 ${
                  step === num
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_-3px_rgba(168,85,247,0.5)]'
                    : step > num
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                {step > num ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <span className={`mt-1.5 text-[9px] md:text-[10px] font-semibold tracking-wide uppercase transition-colors duration-300 text-center leading-tight max-w-[52px] ${
                step === num ? 'text-purple-400' : 'text-slate-600'
              }`}>
                {STEP_LABELS[num - 1]}
              </span>
            </div>
            {num < TOTAL_STEPS && (
              <div className={`h-[2px] flex-1 mx-0.5 rounded transition-all duration-500 ${
                step > num ? 'bg-purple-600' : 'bg-slate-800'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-5 md:p-8 backdrop-blur-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {/* ═══ STEP 1: Your Profile ═══ */}
          {step === 1 && (
            <motion.div key="s1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Your Profile</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">This is public info from your Instagram profile.</p>

              <div>
                <label htmlFor="ig-handle" className={labelClass}>Instagram Handle</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-slate-600 font-bold text-sm">@</span>
                  </div>
                  <input type="text" id="ig-handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourchannel" className={`${inputClass} pl-8`} />
                </div>
              </div>

              <div>
                <label htmlFor="ig-display" className={labelClass}>Display Name</label>
                <input type="text" id="ig-display" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Name" className={inputClass} />
              </div>

              <div>
                <label htmlFor="ig-niche" className={labelClass}>Content Niche</label>
                <select id="ig-niche" value={niche} onChange={(e) => setNiche(e.target.value)} className={selectClass}>
                  <option value="Gaming">Gaming</option>
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Finance & Investing">Finance & Investing</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
                  <option value="Food & Cooking">Food & Cooking</option>
                  <option value="Education & Study">Education & Study</option>
                  <option value="Fashion & Beauty">Fashion & Beauty</option>
                  <option value="Travel">Travel</option>
                  <option value="Comedy & Entertainment">Comedy & Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: Audience Size ═══ */}
          {step === 2 && (
            <motion.div key="s2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Your Audience Size</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Open Instagram → Profile → tap Followers.</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Where to find this → Open your Instagram profile. The follower count is displayed on your profile page.">
                    <label htmlFor="ig-followers" className={labelClass}>Total Followers</label>
                  </Tooltip>
                  <input type="number" id="ig-followers" value={totalFollowers} onChange={(e) => setTotalFollowers(e.target.value)} placeholder="e.g. 45000" className={inputClass} />
                  {totalFollowers && <span className="text-xs text-slate-500 mt-1 block">{formatDisplay(totalFollowers)}</span>}
                </div>
                <div>
                  <Tooltip text="Used to calculate audience authenticity score. A high following-to-follower ratio may indicate follow-for-follow behavior.">
                    <label htmlFor="ig-following" className={labelClass}>Total Following</label>
                  </Tooltip>
                  <input type="number" id="ig-following" value={totalFollowing} onChange={(e) => setTotalFollowing(e.target.value)} placeholder="e.g. 500" className={inputClass} />
                </div>
              </div>

              <div>
                <Tooltip text="Where to find this → Instagram app → Insights → Overview → Profile Visits (30 days).">
                  <label htmlFor="ig-profile-visits" className={labelClass}>Profile Visits (last 30 days) <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                </Tooltip>
                <input type="number" id="ig-profile-visits" value={profileVisits} onChange={(e) => setProfileVisits(e.target.value)} placeholder="e.g. 1200" className={inputClass} />
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: Reels Stats ═══ */}
          {step === 3 && (
            <motion.div key="s3" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Your Reels Stats</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Open Instagram → Insights → Content → Reels. Look at your last 10 Reels and note the averages.</p>

              <div>
                <Tooltip text="Where to find this → Instagram app → Insights → Content You've Shared → Reels → View plays for each. Average your last 10.">
                  <label htmlFor="ig-reel-plays" className={labelClass}>Average Reel Plays</label>
                </Tooltip>
                <input type="number" id="ig-reel-plays" value={avgReelPlays} onChange={(e) => setAvgReelPlays(e.target.value)} placeholder="e.g. 50000" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ig-reel-likes" className={labelClass}>Avg. Reel Likes <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  <input type="number" id="ig-reel-likes" value={avgReelLikes} onChange={(e) => setAvgReelLikes(e.target.value)} placeholder="e.g. 800" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="ig-reel-comments" className={labelClass}>Avg. Comments <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  <input type="number" id="ig-reel-comments" value={avgReelComments} onChange={(e) => setAvgReelComments(e.target.value)} placeholder="e.g. 45" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Shares are a strong signal of audience quality for brands. Shared content indicates active recommendation behavior.">
                    <label htmlFor="ig-reel-shares" className={labelClass}>Avg. Shares <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  </Tooltip>
                  <input type="number" id="ig-reel-shares" value={avgReelShares} onChange={(e) => setAvgReelShares(e.target.value)} placeholder="e.g. 120" className={inputClass} />
                </div>
                <div>
                  <Tooltip text="Saves indicate purchase-intent audience. Users who save content are more likely to act on product recommendations.">
                    <label htmlFor="ig-reel-saves" className={labelClass}>Avg. Saves <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  </Tooltip>
                  <input type="number" id="ig-reel-saves" value={avgReelSaves} onChange={(e) => setAvgReelSaves(e.target.value)} placeholder="e.g. 200" className={inputClass} />
                </div>
              </div>

              {/* Engagement indicator */}
              {avgReelLikes && avgReelComments && avgReelShares && avgReelSaves && totalFollowers && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300">
                  ✅ True Engagement Rate: <strong>{(((Number(avgReelLikes) + Number(avgReelComments) + Number(avgReelShares) + Number(avgReelSaves)) / Number(totalFollowers)) * 100).toFixed(2)}%</strong> — will be shown on your PDF cover.
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 4: Stories Stats ═══ */}
          {step === 4 && (
            <motion.div key="s4" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Your Stories Stats</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Open Instagram → Insights → Content → Stories.</p>

              <div>
                <Tooltip text="Where to find this → Instagram app → Insights → Content You've Shared → Stories → View impressions for each story. Average your last 10.">
                  <label htmlFor="ig-story-views" className={labelClass}>Average Story Views</label>
                </Tooltip>
                <input
                  type="number"
                  id="ig-story-views"
                  value={avgStoryViews}
                  onChange={(e) => { setAvgStoryViews(e.target.value); setAutoEstimateStories(false); }}
                  placeholder="e.g. 5400"
                  className={inputClass}
                />
              </div>

              {/* Auto-estimate toggle */}
              <label className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={autoEstimateStories}
                  onChange={(e) => setAutoEstimateStories(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                />
                <div>
                  <span className="text-sm text-slate-300 font-medium">Estimate for me (I don't know this)</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Auto-calculates as 12% of your follower count{totalFollowers && autoEstimateStories ? ` ≈ ${Math.round(Number(totalFollowers) * 0.12).toLocaleString('en-IN')}` : ''}</span>
                </div>
              </label>
            </motion.div>
          )}

          {/* ═══ STEP 5: Audience Demographics ═══ */}
          {step === 5 && (
            <motion.div key="s5" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Your Audience Profile</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Open Instagram → Insights → Audience. Look at age, gender, and top locations.</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ig-age-group" className={labelClass}>Primary Age Group</label>
                  <select id="ig-age-group" value={primaryAgeGroup} onChange={(e) => setPrimaryAgeGroup(e.target.value)} className={selectClass}>
                    <option value="13–17">13–17</option>
                    <option value="18–24">18–24</option>
                    <option value="25–34">25–34</option>
                    <option value="35–44">35–44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ig-country" className={labelClass}>Top Country</label>
                  <select id="ig-country" value={topCountry} onChange={(e) => setTopCountry(e.target.value)} className={selectClass}>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Gender slider */}
              <div>
                <label className={labelClass}>Gender Split</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={femalePercentage}
                  onChange={(e) => setFemalePercentage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{femalePercentage}% Female</span>
                  <span>{100 - femalePercentage}% Male</span>
                </div>
              </div>

              <div>
                <label htmlFor="ig-city" className={labelClass}>Top City <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                <input type="text" id="ig-city" value={topCity} onChange={(e) => setTopCity(e.target.value)} placeholder="e.g. Mumbai" className={inputClass} />
              </div>

              {/* Auto-derived Geo Tier badge */}
              <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl p-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  geoTier === 'Tier 1' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : geoTier === 'Tier 2' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                }`}>
                  Audience {geoTier}
                </span>
                <span className="text-xs text-slate-500">— affects your CPM calculation</span>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 6: Content Profile ═══ */}
          {step === 6 && (
            <motion.div key="s6" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">What You Create</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Tell brands what kind of content you actually make.</p>

              <div>
                <label className={labelClass}>Content Pillars <span className="text-slate-600 normal-case font-normal">— min 1, max 5</span></label>
                <TagInput tags={contentPillars} setTags={setContentPillars} placeholder="e.g. meal prep, gym workouts, product reviews" maxTags={5} />
                <span className="text-xs text-slate-500 mt-1 block">Type a topic and press Enter or comma to add.</span>
              </div>

              <div>
                <label htmlFor="ig-posting-freq" className={labelClass}>Posting Frequency</label>
                <select id="ig-posting-freq" value={postingFrequency} onChange={(e) => setPostingFrequency(e.target.value)} className={selectClass}>
                  <option value="Daily">Daily</option>
                  <option value="4–6x per week">4–6x per week</option>
                  <option value="2–3x per week">2–3x per week</option>
                  <option value="Once a week">Once a week</option>
                  <option value="A few times a month">A few times a month</option>
                </select>
              </div>

              <div>
                <label htmlFor="ig-recent-reel-1" className={labelClass}>Most Recent Reel Topic</label>
                <input type="text" id="ig-recent-reel-1" value={mostRecentReel} onChange={(e) => setMostRecentReel(e.target.value)} placeholder="e.g. 60-day fitness transformation results" className={inputClass} />
                <span className="text-xs text-slate-500 mt-1 block">This directly appears in your pitch email.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ig-recent-reel-2" className={labelClass}>2nd Reel Topic <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  <input type="text" id="ig-recent-reel-2" value={secondRecentReel} onChange={(e) => setSecondRecentReel(e.target.value)} placeholder="e.g. honest protein review" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="ig-recent-reel-3" className={labelClass}>3rd Reel Topic <span className="text-slate-600 normal-case font-normal">— optional</span></label>
                  <input type="text" id="ig-recent-reel-3" value={thirdRecentReel} onChange={(e) => setThirdRecentReel(e.target.value)} placeholder="e.g. morning routine" className={inputClass} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 7: Campaign Details ═══ */}
          {step === 7 && (
            <motion.div key="s7" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-1">
                <StepIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Your Target Sponsor</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Tell us who you want to pitch and how.</p>

              <div>
                <label htmlFor="ig-brand" className={labelClass}>Target Brand Name</label>
                <input type="text" id="ig-brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. MamaEarth, boAt, WheyProtein" className={inputClass} />
              </div>

              <div>
                <label htmlFor="ig-brand-industry" className={labelClass}>Brand Industry / Category</label>
                <input type="text" id="ig-brand-industry" value={brandIndustry} onChange={(e) => setBrandIndustry(e.target.value)} placeholder="e.g. Personal Care, Audio Electronics, Supplements" className={inputClass} />
                <span className="text-xs text-slate-500 mt-1 block">What does this brand sell? Be specific.</span>
              </div>

              <div>
                <label className={labelClass}>Preferred Integration Format</label>
                <div className="space-y-2">
                  {[
                    { value: 'Reels Only (60-sec shoutout)', label: 'Reels Only (60-sec shoutout)' },
                    { value: 'Reels Only (30-sec shoutout)', label: 'Reels Only (30-sec shoutout)' },
                    { value: 'Stories Only (3-frame series)', label: 'Stories Only (3-frame series)' },
                    { value: 'Full Package (1 Reel + 3 Stories)', label: 'Full Package (1 Reel + 3 Stories)', popular: true },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      integrationFormat === opt.value
                        ? 'border-purple-500/50 bg-purple-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="integration-format"
                        value={opt.value}
                        checked={integrationFormat === opt.value}
                        onChange={(e) => setIntegrationFormat(e.target.value)}
                        className="h-4 w-4 text-purple-500 bg-slate-900 border-slate-700 focus:ring-purple-500/50 cursor-pointer"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                      {opt.popular && (
                        <span className="ml-auto text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/25">Most Popular</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Campaign Preview Summary Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review before generating</span>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Handle:</span> <span className="text-slate-200 font-medium">@{handle.replace(/^@/, '')}</span></div>
                  <div><span className="text-slate-500">Niche:</span> <span className="text-slate-200 font-medium">{niche}</span></div>
                  <div><span className="text-slate-500">Followers:</span> <span className="text-slate-200 font-medium">{formatDisplay(totalFollowers)}</span></div>
                  <div><span className="text-slate-500">Avg. Plays:</span> <span className="text-slate-200 font-medium">{formatDisplay(avgReelPlays)}</span></div>
                  <div><span className="text-slate-500">Brand:</span> <span className="text-slate-200 font-medium">{brandName || '—'}</span></div>
                  <div><span className="text-slate-500">Format:</span> <span className="text-slate-200 font-medium">{integrationFormat.split('(')[0].trim()}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        {error && <p className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-2 rounded-lg text-center">{error}</p>}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-5 mt-4 border-t border-slate-800/60">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg shadow-purple-500/20 cursor-pointer text-sm md:text-base"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !canProceed()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg shadow-purple-500/20 cursor-pointer disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calibrating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Pitch Deck</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
