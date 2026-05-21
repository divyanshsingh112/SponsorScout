import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Lock, AlertCircle, Sparkles, Globe, Target, Video, Bookmark } from 'lucide-react';
import CheckoutInterstitial from './components/CheckoutInterstitial';
import ClaimFallback from './components/ClaimFallback';
import PitchDeckWizard from './components/PitchDeckWizard';

export interface ChannelData {
  channelId: string;
  channelName: string;
  averageViews: number;
  engagementRate: number;
  channelStatistics: { subscriberCount: string };
  calculated_sponsor_fee_inr: number;
  channelAvatarUrl?: string;
  recentVideos?: { title: string; viewCount: string }[];
  niche?: string;
  audienceGeo?: string;
  brandName?: string;
  integrationType?: string;
  cpm?: number;
}

const TOPMATE_URL = 'https://topmate.io/sponsorscout/2109766';

// Helper to prefill last wizard state
const getInitialWizardValues = () => {
  try {
    const saved = localStorage.getItem('pending_pdf_channel_data');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    channelId: '',
    niche: 'Tech & Gadgets',
    audienceGeo: 'Tier 3 India/Asia',
    brandName: '',
    integrationType: '60-sec shoutout',
    platform: 'youtube',
    totalFollowers: '',
    accountsReached30d: '',
    avgReelPlays: '',
    avgStoryViews: '',
    topLocation: 'Tier 3',
    topAgeRange: '',
    genderSplit: '',
    sponsorNiche: 'Tech & Gadgets',
    recentContentFocus: ''
  };
};

function App() {
  const initialValues = getInitialWizardValues();

  // Input states synchronized with the Wizard
  const [channelId, setChannelId] = useState(initialValues.channelId);
  const [selectedNiche, setSelectedNiche] = useState(initialValues.niche);
  const [selectedGeo, setSelectedGeo] = useState(initialValues.audienceGeo);
  const [selectedBrand, setSelectedBrand] = useState(initialValues.brandName);
  const [selectedIntegration, setSelectedIntegration] = useState(initialValues.integrationType);

  // Instagram platform specific states
  const [platform, setPlatform] = useState(initialValues.platform || 'youtube');
  const [totalFollowers, setTotalFollowers] = useState(initialValues.totalFollowers || '');
  const [accountsReached30d, setAccountsReached30d] = useState(initialValues.accountsReached30d || '');
  const [avgReelPlays, setAvgReelPlays] = useState(initialValues.avgReelPlays || '');
  const [avgStoryViews, setAvgStoryViews] = useState(initialValues.avgStoryViews || '');
  const [topLocation, setTopLocation] = useState(initialValues.topLocation || 'Tier 3');
  const [topAgeRange, setTopAgeRange] = useState(initialValues.topAgeRange || '');
  const [genderSplit, setGenderSplit] = useState(initialValues.genderSplit || '');
  const [sponsorNiche, setSponsorNiche] = useState(initialValues.sponsorNiche || 'Tech & Gadgets');
  const [recentContentFocus, setRecentContentFocus] = useState(initialValues.recentContentFocus || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState<any | null>(null);

  // Navigation state
  const [view, setView] = useState<'home' | 'checkout-interstitial' | 'claim-fallback'>('home');

  // Payment states
  const [transactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const pendingChannel = localStorage.getItem('pending_pdf_channel');
      if (pendingChannel) {
        const unlockSecret = import.meta.env.VITE_UNLOCK_SECRET_KEY || '';

        // Retrieve the pending pitch deck data from localStorage
        let pitchDeckData = {};
        const savedData = localStorage.getItem('pending_pitch_deck_data');
        if (savedData) {
          try {
            pitchDeckData = JSON.parse(savedData);
          } catch (e) {
            console.error('Failed to parse pending pitch deck data:', e);
          }
        }

        // Unlock the channel on the backend first, then trigger download
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/unlock-channel`, {
          channelId: pendingChannel,
          unlockSecret,
          ...pitchDeckData
        })
          .then(() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/download-kit/${pendingChannel}`;
          })
          .catch((err) => {
            console.error('Failed to unlock media kit:', err);
          })
          .finally(() => {
            // Clean up URL parameters without page reload
            const url = new URL(window.location.href);
            url.searchParams.delete('payment');
            window.history.replaceState({}, document.title, url.pathname + url.search);

            // Clean up localStorage
            localStorage.removeItem('pending_pdf_channel');
            localStorage.removeItem('pending_pitch_deck_data');
          });
      }
    }
  }, []);

  const handleUnlock = () => {
    localStorage.setItem('pending_pdf_channel', channelId);
    
    // Bundle all metrics and inputs into a single object for state desynchronization safeguard
    const pitchDeckData = {
      channelId,
      channelName: channelData?.channelName || 'Unknown Channel',
      subscribers: channelData?.channelStatistics?.subscriberCount || channelData?.subscribers || 'N/A',
      avgViews: channelData?.averageViews || channelData?.avgViews || 0,
      engagement: channelData?.engagementRate || channelData?.engagement || 0,
      targetSponsor: selectedBrand,
      targetRegion: platform === 'instagram' ? topLocation : selectedGeo,
      integrationFormat: selectedIntegration,
      calculatedCpm: channelData?.cpm || 0,
      finalValuation: channelData?.calculated_sponsor_fee_inr || channelData?.finalValuation || 0,
      channelAvatarUrl: channelData?.channelAvatarUrl || '',
      recentVideos: channelData?.recentVideos || [],
      // Instagram fields
      platform,
      totalFollowers: channelData?.totalFollowers || totalFollowers,
      accountsReached30d: channelData?.accountsReached30d || accountsReached30d,
      avgReelPlays: channelData?.avgReelPlays || avgReelPlays,
      avgStoryViews: channelData?.avgStoryViews || avgStoryViews,
      topLocation: channelData?.topLocation || topLocation,
      topAgeRange: channelData?.topAgeRange || topAgeRange,
      genderSplit: channelData?.genderSplit || genderSplit,
      sponsorNiche: channelData?.sponsorNiche || sponsorNiche,
      recentContentFocus: channelData?.recentContentFocus || recentContentFocus,
      reelValuation: channelData?.reelValuation,
      storyValuation: channelData?.storyValuation,
    };
    localStorage.setItem('pending_pitch_deck_data', JSON.stringify(pitchDeckData));
    
    // Also save the generic form state
    const data = {
      channelId,
      niche: selectedNiche,
      audienceGeo: selectedGeo,
      brandName: selectedBrand,
      integrationType: selectedIntegration,
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
    
    setView('checkout-interstitial');
  };

  const simulatePayment = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/webhook/payment`, {
        transactionId,
        status: 'SUCCESS'
      });
      setPaymentStatus('success');

      // Instantly trigger download
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/download-kit/${channelId}`;
    } catch (err: any) {
      setError('Payment verification failed.');
    }
  };

  // Render Interstitial
  if (view === 'checkout-interstitial') {
    return <CheckoutInterstitial topmateUrl={TOPMATE_URL} />;
  }

  // Render Fallback claim screen
  if (view === 'claim-fallback') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center">
        <ClaimFallback 
          onBack={() => setView('home')} 
          pendingChannelId={channelId || undefined} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 flex flex-col items-center justify-between">
      {/* Hero & Main Content */}
      <div className="w-full max-w-4xl mx-auto pt-16 md:pt-24 px-4 md:px-6 text-center flex-grow">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Stop Guessing.<br />Know Your Worth.
        </h1>
        <p className="text-base md:text-xl text-slate-400 w-full max-w-2xl mx-auto mb-8 md:mb-12">
          Generate a premium, 3-page Agency Pitch Deck powered by dynamic CPM matrices.
        </p>

        {/* Dynamic Multi-Step Wizard Input */}
        <PitchDeckWizard
          loading={loading}
          initialValues={{
            channelId,
            niche: selectedNiche,
            audienceGeo: selectedGeo,
            brandName: selectedBrand,
            integrationType: selectedIntegration,
            platform,
            totalFollowers,
            accountsReached30d,
            avgReelPlays,
            avgStoryViews,
            topLocation,
            topAgeRange,
            genderSplit,
            sponsorNiche,
            recentContentFocus,
          }}
          onEvaluate={async (wizardData) => {
            // Keep app local state synchronized
            setChannelId(wizardData.channelId);
            setSelectedNiche(wizardData.niche);
            setSelectedGeo(wizardData.audienceGeo);
            setSelectedBrand(wizardData.brandName);
            setSelectedIntegration(wizardData.integrationType);
            setPlatform(wizardData.platform);
            setTotalFollowers(wizardData.totalFollowers || '');
            setAccountsReached30d(wizardData.accountsReached30d || '');
            setAvgReelPlays(wizardData.avgReelPlays || '');
            setAvgStoryViews(wizardData.avgStoryViews || '');
            setTopLocation(wizardData.topLocation || 'Tier 3');
            setTopAgeRange(wizardData.topAgeRange || '');
            setGenderSplit(wizardData.genderSplit || '');
            setSponsorNiche(wizardData.sponsorNiche || 'Tech & Gadgets');
            setRecentContentFocus(wizardData.recentContentFocus || '');

            setLoading(true);
            setError('');
            setChannelData(null);
            setPaymentStatus('idle');

            try {
              const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/evaluate-channel`, {
                channelId: wizardData.channelId,
                niche: wizardData.niche,
                audienceGeo: wizardData.audienceGeo,
                brandName: wizardData.brandName,
                integrationType: wizardData.integrationType,
                platform: wizardData.platform,
                totalFollowers: wizardData.totalFollowers ? Number(wizardData.totalFollowers) : undefined,
                accountsReached30d: wizardData.accountsReached30d ? Number(wizardData.accountsReached30d) : undefined,
                avgReelPlays: wizardData.avgReelPlays ? Number(wizardData.avgReelPlays) : undefined,
                avgStoryViews: wizardData.avgStoryViews ? Number(wizardData.avgStoryViews) : undefined,
                topLocation: wizardData.topLocation,
                topAgeRange: wizardData.topAgeRange,
                genderSplit: wizardData.genderSplit,
                sponsorNiche: wizardData.sponsorNiche,
                recentContentFocus: wizardData.recentContentFocus,
              });
              setChannelData(res.data);
            } catch (err: any) {
              setError(err.response?.data?.error || 'Failed to evaluate channel. Check ID and try again.');
            } finally {
              setLoading(false);
            }
          }}
        />

        {error && (
          <div className="mt-6 text-red-400 bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl inline-block text-sm md:text-base w-full max-w-xl">
            {error}
          </div>
        )}

        {/* Results / Tease & Lock */}
        {channelData && (
          <div className="w-full max-w-2xl mx-auto mt-12 md:mt-16 pb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
              
              {/* Creator details */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5 mb-8 border-b border-slate-800/60 pb-6">
                {channelData.channelAvatarUrl && (
                  <img 
                    src={channelData.channelAvatarUrl} 
                    alt={channelData.channelName} 
                    className="h-16 w-16 rounded-full border-2 border-indigo-500/25 bg-slate-950 object-cover shadow"
                  />
                )}
                <div className="text-center md:text-left flex-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                    <Sparkles className="h-3 w-3" />
                    {channelData.niche || selectedNiche}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-100">{channelData.channelName}</h2>
                  
                  {/* Channels stats badge row */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-xs text-slate-400 font-medium">
                    <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                      <span className="text-slate-500">{platform === 'instagram' ? 'Followers:' : 'Subscribers:'}</span>
                      <span className="text-indigo-400 font-bold">
                        {platform === 'instagram'
                          ? Number(channelData.totalFollowers || totalFollowers).toLocaleString()
                          : Number(channelData.channelStatistics?.subscriberCount || channelData.subscribers).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                      <span className="text-slate-500">{platform === 'instagram' ? 'Avg. Reels Plays:' : 'Avg. Views:'}</span>
                      <span className="text-purple-400 font-bold">
                        {platform === 'instagram'
                          ? Number(channelData.avgReelPlays || avgReelPlays).toLocaleString()
                          : channelData.averageViews.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                      <span className="text-slate-500">Engagement:</span>
                      <span className="text-pink-400 font-bold">
                        {platform === 'instagram'
                          ? `${channelData.engagementRate || channelData.engagement || 0}%`
                          : `${channelData.engagementRate}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Target Alignment Parameters */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-left text-xs font-sans">
                <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-start gap-2">
                  <Target className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Target Sponsor</div>
                    <div className="text-slate-200 font-bold text-sm truncate max-w-[180px]">{channelData.brandName || selectedBrand}</div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-start gap-2">
                  <Globe className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Target Region</div>
                    <div className="text-slate-200 font-bold text-sm truncate">{platform === 'instagram' ? (channelData.topLocation || topLocation) : (channelData.audienceGeo || selectedGeo)}</div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-start gap-2">
                  <Video className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Integration Format</div>
                    <div className="text-slate-200 font-bold text-sm truncate">{channelData.integrationType || selectedIntegration}</div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex items-start gap-2">
                  <Bookmark className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Calculated CPM</div>
                    <div className="text-slate-200 font-bold text-sm">
                      {platform === 'instagram' ? '₹250 Reel / ₹150 Story' : `₹${channelData.cpm || 'TBD'}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing section with lock */}
              <div className="bg-slate-950/50 rounded-2xl p-6 md:p-8 border border-slate-800/50 text-center relative overflow-hidden">
                <div className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-xs md:text-sm">Calibrated Pitch Deck Valuation</div>

                {paymentStatus === 'success' ? (
                  <div className="text-4xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                    ₹{channelData.calculated_sponsor_fee_inr.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-4xl md:text-7xl font-black text-slate-300 blur-md select-none transition-all duration-500">
                    ₹{channelData.calculated_sponsor_fee_inr.toLocaleString()}
                  </div>
                )}

                {paymentStatus === 'idle' && (
                  <div className="mt-6 md:mt-8">
                    <button
                      onClick={handleUnlock}
                      className="w-full py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-base md:text-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Lock className="h-5 w-5" />
                      <span>Unlock 3-Page Pitch Deck (₹29)</span>
                    </button>
                  </div>
                )}

                {paymentStatus === 'pending' && (
                  <div className="mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-xl">
                      <p className="text-slate-300 mb-4 font-medium text-sm md:text-base">Mock Payment Gateway</p>
                      <button
                        onClick={simulatePayment}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-sm md:text-base cursor-pointer"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Simulate PhonePe Success</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentStatus === 'success' && (
                  <div className="mt-6 md:mt-8 animate-in fade-in zoom-in duration-500">
                    <button
                      onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/download-kit/${channelId}`}
                      className="w-full py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Pitch Deck Again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Agency-Grade Footer with Payment Safeguard */}
      <footer className="w-full max-w-4xl mx-auto py-8 px-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 mt-8">
        <div>
          © {new Date().getFullYear()} SponsorScout. All rights reserved.
        </div>
        <div className="flex items-center space-x-1 bg-slate-900/40 border border-slate-800/60 px-4 py-2 rounded-full shadow-inner animate-pulse hover:animate-none hover:border-slate-700/60 transition-colors">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500/80" />
          <span>Payment issues?</span>
          <button
            onClick={() => setView('claim-fallback')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
          >
            Claim report manually
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
