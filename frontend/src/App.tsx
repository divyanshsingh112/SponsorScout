import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, Download, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import CheckoutInterstitial from './components/CheckoutInterstitial';
import ClaimFallback from './components/ClaimFallback';

interface ChannelData {
  channelId: string;
  channelName: string;
  averageViews: number;
  engagementRate: number;
  channelStatistics: { subscriberCount: string };
  calculated_sponsor_fee_inr: number;
  channelAvatarUrl?: string;
  recentVideos?: { title: string; viewCount: string }[];
  niche?: string;
}

const TOPMATE_URL = 'https://topmate.io/sponsorscout/2109766';

function App() {
  const [channelId, setChannelId] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('Tech & Gadgets');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

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

        // Unlock the channel on the backend first, then trigger download
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/unlock-channel`, {
          channelId: pendingChannel,
          unlockSecret
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
          });
      }
    }
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) return;

    setLoading(true);
    setError('');
    setChannelData(null);
    setPaymentStatus('idle');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/evaluate-channel`, {
        channelId,
        niche: selectedNiche
      });
      setChannelData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to evaluate channel. Check ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    localStorage.setItem('pending_pdf_channel', channelId);
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
          Generate an agency-grade Media Kit based on live Indian sponsorship rates.
        </p>

        {/* Input Form */}
        <form onSubmit={handleEvaluate} className="w-full max-w-xl mx-auto relative group flex flex-col gap-4">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-800/50 text-sm md:text-base appearance-none"
          >
            <option value="Tech & Gadgets">Tech & Gadgets</option>
            <option value="Finance & Crypto">Finance & Crypto</option>
            <option value="Gaming">Gaming</option>
            <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
          </select>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Channel ID (e.g. UC_x5X...)"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 md:py-4 pl-12 pr-32 md:pr-36 text-base md:text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !channelId}
              className="absolute right-2 top-2 bottom-2 px-4 md:px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-w-[100px] md:min-w-[120px] text-sm md:text-base cursor-pointer"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Calculate'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 text-red-400 bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl inline-block text-sm md:text-base w-full max-w-xl">
            {error}
          </div>
        )}

        {/* Results / Tease & Lock */}
        {channelData && (
          <div className="w-full max-w-2xl mx-auto mt-12 md:mt-16 pb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">{channelData.channelName}</h2>
                <div className="flex flex-row justify-center space-x-6 md:space-x-8 mt-4 md:mt-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-indigo-400">{Number(channelData.channelStatistics.subscriberCount).toLocaleString()}</div>
                    <div className="text-xs md:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">{channelData.averageViews.toLocaleString()}</div>
                    <div className="text-xs md:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Avg Views</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-6 md:p-8 border border-slate-800/50 text-center relative overflow-hidden">
                <div className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-xs md:text-sm">Suggested Sponsorship Fee</div>

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
                      <span>Unlock Full Report (₹29)</span>
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
                      <span>Download Media Kit Again</span>
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

