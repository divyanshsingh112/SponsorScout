import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Lock, AlertCircle, Sparkles, Globe, Target, Video, Bookmark, Database, Cpu, FileDown, ArrowRight, Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-x-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Frosted Glass Header / Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0F172A]/75 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 text-transparent bg-clip-text">
              SponsorScout
            </span>
          </div>
          
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#demos" className="hover:text-white transition-colors duration-200">See Output</a>
            <a href="#founder-story" className="hover:text-white transition-colors duration-200">Founder Story</a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => {
                const element = document.getElementById('calculator');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Launch Beta
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0F172A] px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-5 duration-200">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              How It Works
            </a>
            <a 
              href="#demos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              See Output
            </a>
            <a 
              href="#founder-story" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              Founder Story
            </a>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                const element = document.getElementById('calculator');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-base font-bold shadow-lg shadow-indigo-500/20 text-center block cursor-pointer"
            >
              Calculate Your Worth
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6 animate-pulse">
            <ShieldCheck className="h-4 w-4" />
            <span>Over 10,000+ creators analyzed</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="block bg-gradient-to-r from-white via-slate-100 to-slate-400 text-transparent bg-clip-text">
              Stop Getting Lowballed
            </span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              by Brands.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate an agency-grade sponsorship pitch deck in 60 seconds using real-time market data and AI.
          </p>

          <button
            onClick={() => {
              const element = document.getElementById('calculator');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group px-8 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-2xl font-extrabold text-base sm:text-lg tracking-wide shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center space-x-3 cursor-pointer"
          >
            <span>Calculate Your Worth (Beta)</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-3 max-w-lg mx-auto">
            From raw analytics to closed sponsorship deals in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-slate-900/50 flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all" />
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 mb-6 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Stats</h3>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50 mb-3">
                Manual or URL
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect your YouTube channel dynamically or input Instagram demographics manually in seconds.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-slate-900/50 flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-all" />
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/25 mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Contextualization</h3>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50 mb-3">
                Groq LLM pitch generation
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our dynamic pricing engine teams up with AI to construct a high-converting pitch strategy specific to your target brand.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:bg-slate-900/50 flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-pink-500/5 blur-xl group-hover:bg-pink-500/10 transition-all" />
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/25 mb-6 group-hover:scale-110 transition-transform">
                <FileDown className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Export & Close Deals</h3>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50 mb-3">
                Download the PDF
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate a ready-to-send 3-page Agency Pitch Deck containing your verified rates, metrics, and custom AI pitch text.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      {/* The Proof (Demo Section) */}
      <section id="demos" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
            See the Output
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-3 max-w-lg mx-auto">
            Take a look at real pitch decks exported directly from the SponsorScout pricing engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demo 1: YouTube Tech Pitch */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-[#161f36]/40 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col justify-between min-h-[280px]">
            <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase py-1.5 px-4 rounded-bl-2xl border-l border-b border-slate-800">
              YOUTUBE
            </div>
            
            <div className="pt-4">
              <h3 className="text-2xl font-black text-white mb-2">YouTube Tech Pitch</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                Agency-grade creator media kit calibrated for high-budget tech, software, and hardware sponsors. Built to highlight deep integrations and high-value tech demographic stats.
              </p>
            </div>
            
            <a 
              href="/demos/youtube-demo.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-5 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200 font-bold rounded-2xl text-sm transition-all group-hover:scale-[1.01] cursor-pointer"
            >
              <span>View Sample Pitch PDF</span>
              <ArrowUpRight className="h-4 w-4 text-indigo-400" />
            </a>
          </div>

          {/* Demo 2: Instagram Lifestyle Pitch */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-[#161f36]/40 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-purple-500/5 flex flex-col justify-between min-h-[280px]">
            <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 text-[10px] font-bold tracking-widest uppercase py-1.5 px-4 rounded-bl-2xl border-l border-b border-slate-800">
              INSTAGRAM
            </div>
            
            <div className="pt-4">
              <h3 className="text-2xl font-black text-white mb-2">Instagram Lifestyle Pitch</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                Sleek, image-focused media kit and contract pitch custom designed for lifestyle, fashion, beauty, and travel collaborations. Tailored to highlight Reels, Story reach, and strong visual branding metrics.
              </p>
            </div>
            
            <a 
              href="/demos/insta-demo.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-5 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200 font-bold rounded-2xl text-sm transition-all group-hover:scale-[1.01] cursor-pointer"
            >
              <span>View Sample Pitch PDF</span>
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      {/* Pitch Deck Wizard Calculator Container Section */}
      <section id="calculator" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-12 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3 uppercase tracking-wider">
            Pricing Calibration Engine
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Calculate Your Sponsorship Valuation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Fill in your channel details or manual stats to unlock your professional valuation and custom-contextualized PDF pitch deck.
          </p>
        </div>

        {/* Wizard container with glowing border */}
        <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/25 p-1 backdrop-blur-2xl shadow-3xl hover:border-slate-700/60 transition-all duration-300 max-w-4xl mx-auto">
          {/* Top glow */}
          <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-purple-500 pointer-events-none" />
          
          <div className="p-4 sm:p-8">
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
              <div className="mt-6 text-red-400 bg-red-400/10 border border-red-400/20 py-3.5 px-4 rounded-2xl text-center text-sm md:text-base w-full max-w-xl mx-auto">
                {error}
              </div>
            )}

            {/* Results / Tease & Lock */}
            {channelData && (
              <div className="w-full max-w-3xl mx-auto mt-12 pb-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                  
                  {/* Creator details */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-5 mb-8 border-b border-slate-900 pb-6">
                    {channelData.channelAvatarUrl && (
                      <img 
                        src={channelData.channelAvatarUrl} 
                        alt={channelData.channelName} 
                        className="h-16 w-16 rounded-2xl border-2 border-indigo-500/25 bg-slate-900 object-cover shadow-md"
                      />
                    )}
                    <div className="text-center md:text-left flex-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                        <Sparkles className="h-3 w-3" />
                        {channelData.niche || selectedNiche}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-100">{channelData.channelName}</h2>
                      
                      {/* Channels stats badge row */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-xs text-slate-400 font-medium">
                        <div className="flex items-center space-x-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800/40">
                          <span className="text-slate-500">{platform === 'instagram' ? 'Followers:' : 'Subscribers:'}</span>
                          <span className="text-indigo-400 font-bold">
                            {platform === 'instagram'
                              ? Number(channelData.totalFollowers || totalFollowers).toLocaleString()
                              : Number(channelData.channelStatistics?.subscriberCount || channelData.subscribers).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800/40">
                          <span className="text-slate-500">{platform === 'instagram' ? 'Avg. Reels Plays:' : 'Avg. Views:'}</span>
                          <span className="text-purple-400 font-bold">
                            {platform === 'instagram'
                              ? Number(channelData.avgReelPlays || avgReelPlays).toLocaleString()
                              : channelData.averageViews.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800/40">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left text-xs">
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Target Sponsor</div>
                        <div className="text-slate-200 font-bold text-sm truncate max-w-[180px]">{channelData.brandName || selectedBrand}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 flex items-start gap-2.5">
                      <Globe className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Target Region</div>
                        <div className="text-slate-200 font-bold text-sm truncate">{platform === 'instagram' ? (channelData.topLocation || topLocation) : (channelData.audienceGeo || selectedGeo)}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 flex items-start gap-2.5">
                      <Video className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Integration Format</div>
                        <div className="text-slate-200 font-bold text-sm truncate">{channelData.integrationType || selectedIntegration}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 flex items-start gap-2.5">
                      <Bookmark className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Calculated CPM</div>
                        <div className="text-slate-200 font-bold text-sm">
                          {platform === 'instagram' ? '₹100 Reel / ₹200 Story' : `₹${channelData.cpm || 'TBD'}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing section with lock */}
                  <div className="bg-slate-900/60 rounded-3xl p-6 md:p-8 border border-slate-800 text-center relative overflow-hidden">
                    <div className="text-slate-400 font-semibold mb-4 uppercase tracking-wider text-xs">Calibrated Pitch Deck Valuation</div>

                    {paymentStatus === 'success' ? (
                      <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                        ₹{channelData.calculated_sponsor_fee_inr.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-5xl md:text-7xl font-black text-slate-500 blur-lg select-none transition-all duration-500">
                        ₹{channelData.calculated_sponsor_fee_inr.toLocaleString()}
                      </div>
                    )}

                    {paymentStatus === 'idle' && (
                      <div className="mt-6">
                        <button
                          onClick={handleUnlock}
                          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2.5 cursor-pointer"
                        >
                          <Lock className="h-5 w-5" />
                          <span>Unlock 3-Page Pitch Deck (₹29)</span>
                        </button>
                      </div>
                    )}

                    {paymentStatus === 'pending' && (
                      <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
                          <p className="text-slate-300 mb-4 font-semibold text-sm">Mock Payment Gateway</p>
                          <button
                            onClick={simulatePayment}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2 text-sm cursor-pointer border border-emerald-500/20"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Simulate PhonePe Success</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentStatus === 'success' && (
                      <div className="mt-6 animate-in fade-in zoom-in duration-500">
                        <button
                          onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/download-kit/${channelId}`}
                          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2.5 cursor-pointer"
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
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      {/* About Us (The Founder Story) Section */}
      <section id="founder-story" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 bg-slate-900/20 border border-slate-850 rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto">
            {/* Tiny accent label */}
            <span className="text-[10px] tracking-widest text-indigo-400 font-extrabold uppercase block mb-3">
              THE MISSION
            </span>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Built for Creators, by a Developer.
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              SponsorScout started as an engineering project in India after seeing creators with massive audiences get taken advantage of by corporate brand managers. I built this mathematical pricing engine to level the playing field.
            </p>
            
            <p className="text-slate-350 text-sm sm:text-base leading-relaxed font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              No agency fees, no gatekeeping. Just data.
            </p>

            {/* Micro developer signature */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                SS
              </div>
              <div>
                <div className="text-xs font-bold text-white">SponsorScout Founder</div>
                <div className="text-[10px] text-slate-500">India-based Creator Advocate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Agency-Grade Footer with Payment Safeguard */}
      <footer className="w-full max-w-6xl mx-auto py-12 px-6 sm:px-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-6 mt-12 bg-slate-950/20">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <span>© {new Date().getFullYear()} SponsorScout. All rights reserved.</span>
          <div className="hidden md:block h-3.5 w-px bg-slate-800" />
          <a href="#how-it-works" className="hover:text-slate-300 transition-colors">How It Works</a>
          <a href="#demos" className="hover:text-slate-300 transition-colors">Demos</a>
          <a href="#founder-story" className="hover:text-slate-300 transition-colors">Story</a>
        </div>
        
        <div className="flex items-center space-x-1.5 bg-slate-900/40 border border-slate-850 px-4 py-2.5 rounded-full shadow-inner hover:border-slate-700/60 transition-all duration-300">
          <AlertCircle className="h-4 w-4 text-amber-500/80 shrink-0" />
          <span>Payment issues?</span>
          <button
            onClick={() => {
              setView('claim-fallback');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
