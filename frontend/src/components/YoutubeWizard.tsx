import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, ChevronRight, ChevronLeft, Check, Compass, Globe, Award, Video } from 'lucide-react';

/**
 * YoutubeWizard — extracted from the original PitchDeckWizard.
 * This is the IDENTICAL YouTube flow, isolated into its own component.
 * No Instagram logic present.
 */

interface YoutubeWizardProps {
  loading: boolean;
  onEvaluate: (data: {
    channelId: string;
    niche: string;
    audienceGeo: string;
    brandName: string;
    integrationType: string;
    platform: string;
  }) => void;
  initialValues?: {
    channelId: string;
    niche: string;
    audienceGeo: string;
    brandName: string;
    integrationType: string;
  };
}

export default function YoutubeWizard({ loading, onEvaluate, initialValues }: YoutubeWizardProps) {
  const [step, setStep] = useState(1);
  const [channelId, setChannelId] = useState(initialValues?.channelId || '');
  const [niche, setNiche] = useState(initialValues?.niche || 'Tech & Gadgets');
  const [audienceGeo, setAudienceGeo] = useState(initialValues?.audienceGeo || 'Tier 3 India/Asia');
  const [brandName, setBrandName] = useState(initialValues?.brandName || '');
  const [integrationType, setIntegrationType] = useState(initialValues?.integrationType || '60-sec shoutout');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = { channelId, niche, audienceGeo, brandName, integrationType, platform: 'youtube' };
      localStorage.setItem('pending_pdf_channel_data', JSON.stringify(data));
    }, 800);
    return () => clearTimeout(timer);
  }, [channelId, niche, audienceGeo, brandName, integrationType]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!channelId.trim()) {
        setError('Please enter a valid YouTube Channel ID or URL.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
      setError('Channel ID is required.');
      setStep(1);
      return;
    }
    if (!brandName.trim()) {
      setError('Please target a sponsor brand name to proceed.');
      return;
    }

    onEvaluate({
      channelId: channelId.trim(),
      niche,
      audienceGeo,
      brandName: brandName.trim(),
      integrationType,
      platform: 'youtube',
    });
  };

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 font-sans">
      {/* Step progress */}
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

      {/* Form */}
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

              <div className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Connect your YouTube channel using your Channel ID (e.g. UC_x5X...). We will fetch your real-time performance statistics automatically.
                </p>

                <div>
                  <label htmlFor="yt-channel-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    YouTube Channel ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-600" />
                    </div>
                    <input
                      type="text"
                      id="yt-channel-id"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="e.g. UC_x5XG1L_G7V..."
                      className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-base text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

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
                  <label htmlFor="yt-niche-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Creator Niche
                  </label>
                  <select
                    id="yt-niche-select"
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
                  <label htmlFor="yt-geo-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Audience Geo
                  </label>
                  <select
                    id="yt-geo-select"
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
                  <label htmlFor="yt-brand-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Target Sponsor Brand Name
                  </label>
                  <input
                    type="text"
                    id="yt-brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Nike, ASUS, Skillshare"
                    className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-base text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="yt-integration-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Integration Type</span>
                  </label>
                  <select
                    id="yt-integration-select"
                    value={integrationType}
                    onChange={(e) => setIntegrationType(e.target.value)}
                    className="block w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900/60 text-sm appearance-none"
                  >
                    <option value="60-sec shoutout">60-sec Integrated Shoutout</option>
                    <option value="Dedicated Video">Full Dedicated Video (Premium)</option>
                  </select>
                </div>
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
