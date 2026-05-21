import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, ChevronRight, ChevronLeft, Check, Compass, Globe, Award, Video } from 'lucide-react';

interface PitchDeckWizardProps {
  loading: boolean;
  onEvaluate: (data: {
    channelId: string;
    niche: string;
    audienceGeo: string;
    brandName: string;
    integrationType: string;
    platform: string;
    totalFollowers?: number;
    accountsReached30d?: number;
    avgReelPlays?: number;
    avgStoryViews?: number;
    topLocation?: string;
    topAgeRange?: string;
    genderSplit?: string;
    sponsorNiche?: string;
    recentContentFocus?: string;
  }) => void;
  initialValues?: {
    channelId: string;
    niche: string;
    audienceGeo: string;
    brandName: string;
    integrationType: string;
    platform?: string;
    totalFollowers?: string | number;
    accountsReached30d?: string | number;
    avgReelPlays?: string | number;
    avgStoryViews?: string | number;
    topLocation?: string;
    topAgeRange?: string;
    genderSplit?: string;
    sponsorNiche?: string;
    recentContentFocus?: string;
  };
}

export default function PitchDeckWizard({ loading, onEvaluate, initialValues }: PitchDeckWizardProps) {
  const [step, setStep] = useState(1);
  const [channelId, setChannelId] = useState(initialValues?.channelId || '');
  const [niche, setNiche] = useState(initialValues?.niche || 'Tech & Gadgets');
  const [audienceGeo, setAudienceGeo] = useState(initialValues?.audienceGeo || 'Tier 3 India/Asia');
  const [brandName, setBrandName] = useState(initialValues?.brandName || '');
  const [integrationType, setIntegrationType] = useState(initialValues?.integrationType || '60-sec shoutout');
  const [error, setError] = useState('');

  // Instagram-specific states
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>(
    (initialValues?.platform as 'youtube' | 'instagram') || 'youtube'
  );
  const [totalFollowers, setTotalFollowers] = useState(initialValues?.totalFollowers || '');
  const [accountsReached30d, setAccountsReached30d] = useState(initialValues?.accountsReached30d || '');
  const [avgReelPlays, setAvgReelPlays] = useState(initialValues?.avgReelPlays || '');
  const [avgStoryViews, setAvgStoryViews] = useState(initialValues?.avgStoryViews || '');
  
  const [topLocation, setTopLocation] = useState(initialValues?.topLocation || 'Tier 3');
  const [topAgeRange, setTopAgeRange] = useState(initialValues?.topAgeRange || '');
  const [genderSplit, setGenderSplit] = useState(initialValues?.genderSplit || '');
  
  const [sponsorNiche, setSponsorNiche] = useState(initialValues?.sponsorNiche || 'Tech & Gadgets');
  const [recentContentFocus, setRecentContentFocus] = useState(initialValues?.recentContentFocus || '');

  // Persist wizard data as user type or select
  useEffect(() => {
    const data = {
      channelId,
      niche,
      audienceGeo,
      brandName,
      integrationType,
      platform,
      totalFollowers,
      accountsReached30d,
      avgReelPlays,
      avgStoryViews,
      topLocation,
      topAgeRange,
      genderSplit,
      sponsorNiche,
      recentContentFocus
    };
    localStorage.setItem('pending_pdf_channel_data', JSON.stringify(data));
  }, [
    channelId, niche, audienceGeo, brandName, integrationType, platform,
    totalFollowers, accountsReached30d, avgReelPlays, avgStoryViews,
    topLocation, topAgeRange, genderSplit, sponsorNiche, recentContentFocus
  ]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (platform === 'youtube') {
        if (!channelId.trim()) {
          setError('Please enter a valid YouTube Channel ID or URL.');
          return;
        }
      } else {
        if (!channelId.trim()) {
          setError('Please enter an Instagram handle.');
          return;
        }
        if (!totalFollowers || !accountsReached30d || !avgReelPlays || !avgStoryViews) {
          setError('Please fill out all Instagram metrics.');
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      if (platform === 'instagram') {
        if (!topAgeRange.trim() || !genderSplit.trim()) {
          setError('Please enter your demographic details.');
          return;
        }
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!channelId.trim()) {
      setError(platform === 'instagram' ? 'Instagram handle is required.' : 'Channel ID is required.');
      setStep(1);
      return;
    }
    if (!brandName.trim()) {
      setError('Please target a sponsor brand name to proceed.');
      return;
    }
    if (platform === 'instagram') {
      if (!recentContentFocus.trim()) {
        setError('Please describe your recent content focus.');
        return;
      }
    }

    onEvaluate({
      channelId: channelId.trim(),
      niche,
      audienceGeo,
      brandName: brandName.trim(),
      integrationType,
      platform,
      totalFollowers: totalFollowers ? Number(totalFollowers) : undefined,
      accountsReached30d: accountsReached30d ? Number(accountsReached30d) : undefined,
      avgReelPlays: avgReelPlays ? Number(avgReelPlays) : undefined,
      avgStoryViews: avgStoryViews ? Number(avgStoryViews) : undefined,
      topLocation,
      topAgeRange,
      genderSplit,
      sponsorNiche,
      recentContentFocus: recentContentFocus.trim(),
    });
  };

  // Direction animation variant
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 font-sans">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div 
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-500 ${
                  step === num 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]' 
                    : step > num 
                      ? 'border-indigo-600 bg-indigo-600 text-white' 
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                {step > num ? <Check className="h-4 w-4" /> : num}
              </div>
              <span className={`mt-2 text-xs font-semibold tracking-wide uppercase transition-colors duration-300 ${
                step === num ? 'text-indigo-400' : 'text-slate-600'
              }`}>
                {num === 1 ? 'Channel' : num === 2 ? 'Targeting' : 'Brand Spot'}
              </span>
            </div>
            {num < 3 && (
              <div className={`h-[2px] flex-1 mx-2 rounded transition-all duration-500 ${
                step > num ? 'bg-indigo-600' : 'bg-slate-800'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Compass className="h-5 w-5 text-indigo-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white">Step 1: Identify Your Channel</h3>
              </div>

              {/* Platform Selector Toggle */}
              <div className="flex border border-slate-800 rounded-xl p-1 bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('youtube');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    platform === 'youtube'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('instagram');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    platform === 'instagram'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Instagram
                </button>
              </div>

              {platform === 'youtube' ? (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Connect your YouTube channel using your Channel ID (e.g. UC_x5X...). We will fetch your real-time performance statistics automatically.
                  </p>

                  <div>
                    <label htmlFor="channel-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      YouTube Channel ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-600" />
                      </div>
                      <input
                        type="text"
                        id="channel-id"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="e.g. UC_x5XG1L_G7V..."
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-base text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Bypass automatic API fetch. Enter your Instagram Professional Dashboard metrics manually.
                  </p>

                  <div>
                    <label htmlFor="channel-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span className="text-slate-600 font-bold text-sm">@</span>
                      </div>
                      <input
                        type="text"
                        id="channel-id"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="your_handle"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-base text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* UI Tooltip exactly as requested */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl p-3 text-xs leading-relaxed flex items-center space-x-2">
                    <span>💡 Open Instagram &gt; Profile &gt; Professional Dashboard to find these metrics.</span>
                  </div>

                  {/* Instagram Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="total-followers" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Total Followers
                      </label>
                      <input
                        type="number"
                        id="total-followers"
                        value={totalFollowers}
                        onChange={(e) => setTotalFollowers(e.target.value)}
                        placeholder="e.g. 15000"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="reached-30d" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Accounts Reached (30d)
                      </label>
                      <input
                        type="number"
                        id="reached-30d"
                        value={accountsReached30d}
                        onChange={(e) => setAccountsReached30d(e.target.value)}
                        placeholder="e.g. 50000"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="reel-plays" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Avg. Reel Plays (last 5)
                      </label>
                      <input
                        type="number"
                        id="reel-plays"
                        value={avgReelPlays}
                        onChange={(e) => setAvgReelPlays(e.target.value)}
                        placeholder="e.g. 8000"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="story-views" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Avg. Story Views (last 3)
                      </label>
                      <input
                        type="number"
                        id="story-views"
                        value={avgStoryViews}
                        onChange={(e) => setAvgStoryViews(e.target.value)}
                        placeholder="e.g. 1500"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg shadow-indigo-500/20 cursor-pointer text-sm md:text-base"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Step 2: Niche & Geography</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                CPM scales dynamically by content type and audience purchasing power. Select your core content vertical and primary viewer region.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="niche-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Creator Niche
                  </label>
                  <select
                    id="niche-select"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none"
                  >
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                    <option value="Finance & Crypto">Finance & Crypto</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
                    <option value="Beauty & Fashion">Beauty & Fashion</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="geo-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Audience Geo
                  </label>
                  <select
                    id="geo-select"
                    value={audienceGeo}
                    onChange={(e) => setAudienceGeo(e.target.value)}
                    className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none"
                  >
                    <option value="Tier 1 US/UK">Tier 1 US/UK (Highest CPM)</option>
                    <option value="Tier 2 EU/AUS">Tier 2 EU/AUS (Medium CPM)</option>
                    <option value="Tier 3 India/Asia">Tier 3 India/Asia (Standard CPM)</option>
                  </select>
                </div>
              </div>

              {platform === 'instagram' && (
                <div className="space-y-4 pt-4 border-t border-slate-800/60">
                  <h4 className="text-sm font-bold text-indigo-400">Instagram Demographics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="top-location" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Top Location
                      </label>
                      <select
                        id="top-location"
                        value={topLocation}
                        onChange={(e) => setTopLocation(e.target.value)}
                        className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none"
                      >
                        <option value="Tier 1">Tier 1 (US/UK)</option>
                        <option value="Tier 2">Tier 2 (EU/AUS)</option>
                        <option value="Tier 3">Tier 3 (India/Asia)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="top-age" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Top Age Range
                      </label>
                      <input
                        type="text"
                        id="top-age"
                        value={topAgeRange}
                        onChange={(e) => setTopAgeRange(e.target.value)}
                        placeholder="e.g. 18-24"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="gender-split" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Gender Split
                      </label>
                      <input
                        type="text"
                        id="gender-split"
                        value={genderSplit}
                        onChange={(e) => setGenderSplit(e.target.value)}
                        placeholder="e.g. 60% M / 40% F"
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg shadow-indigo-500/20 cursor-pointer text-sm md:text-base"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Step 3: Sponsor Calibration</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Provide details regarding your target sponsor brand. This information creates highly customized ROI projections to impress their marketing leads.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="brand-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Target Sponsor Brand Name
                  </label>
                  <input
                    type="text"
                    id="brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Nike, ASUS, Skillshare"
                    className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-base text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="integration-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Integration Type</span>
                  </label>
                  <select
                    id="integration-select"
                    value={integrationType}
                    onChange={(e) => setIntegrationType(e.target.value)}
                    className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none"
                  >
                    <option value="60-sec shoutout">60-sec Integrated Shoutout</option>
                    <option value="Dedicated Video">Full Dedicated Video (Premium)</option>
                  </select>
                </div>

                {platform === 'instagram' && (
                  <div className="space-y-4 pt-4 border-t border-slate-800/60">
                    <div>
                      <label htmlFor="sponsor-niche-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Sponsor Brand Niche
                      </label>
                      <select
                        id="sponsor-niche-select"
                        value={sponsorNiche}
                        onChange={(e) => setSponsorNiche(e.target.value)}
                        className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none text-slate-300"
                      >
                        <option value="Tech & Gadgets">Tech & Gadgets</option>
                        <option value="Finance & Crypto">Finance & Crypto</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
                        <option value="Beauty & Fashion">Beauty & Fashion</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="recent-content-focus" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Recent Content Focus
                      </label>
                      <textarea
                        id="recent-content-focus"
                        value={recentContentFocus}
                        onChange={(e) => setRecentContentFocus(e.target.value)}
                        placeholder="What were your last 3 Reels about?"
                        rows={3}
                        className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50 text-sm md:text-base"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

