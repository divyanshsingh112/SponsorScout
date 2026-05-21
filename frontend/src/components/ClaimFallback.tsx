import React, { useState } from 'react';
import { Mail, ChevronLeft, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ClaimFallbackProps {
  onBack: () => void;
  pendingChannelId?: string;
}

export default function ClaimFallback({ onBack, pendingChannelId }: ClaimFallbackProps) {
  const [claimInput, setClaimInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedInput = claimInput.trim();
    if (!trimmedInput) {
      setError('Please enter your Topmate Email or Transaction ID.');
      return;
    }

    // Set support email details
    const supportEmail = 'support@sponsorscout.in';
    const subject = `[SponsorScout] PDF Claim Support Request`;
    const body = `Hi SponsorScout Support,

I completed my payment on Topmate but did not receive my PDF report automatically. Here are my payment details to claim the PDF:

- Topmate Email or Transaction ID: ${trimmedInput}
- Requested Channel ID: ${pendingChannelId || 'Not specified'}

Please unlock and send my report as soon as possible.

Thank you!`;

    // Construct fully encoded mailto link
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open mail client
    window.location.href = mailtoUrl;
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back navigation button */}
      <button
        onClick={onBack}
        className="group mb-8 flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Evaluation</span>
      </button>

      {/* Main glassmorphism card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Manual Report Claim</h2>
            <p className="text-xs text-slate-500">Did not receive your PDF download automatically?</p>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
              If your payment completed but the browser closed or redirect failed, please supply your <strong className="text-slate-200 font-semibold">Topmate Email</strong> or <strong className="text-slate-200 font-semibold">Transaction ID</strong>. We will generate a pre-filled support email to help our team verify and send your PDF instantly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="claim-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Topmate Email or Transaction ID
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="claim-input"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    placeholder="e.g. john@example.com or TM-123456"
                    className="block w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-base text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-xs text-red-400 flex items-center space-x-1">
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {pendingChannelId && (
                <div className="text-xs text-slate-500 bg-slate-950/30 border border-slate-800/40 rounded-lg py-2 px-3 flex items-center justify-between">
                  <span>Linked Channel ID:</span>
                  <span className="font-mono text-slate-300 font-semibold">{pendingChannelId}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Trigger Support Email</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-7 w-7 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Support Email Triggered!</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
              Your default mail app should have opened. If it didn't, please email us directly at <span className="text-indigo-400 font-semibold select-all">support@sponsorscout.in</span> with your transaction details.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setClaimInput('');
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Submit Another Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
