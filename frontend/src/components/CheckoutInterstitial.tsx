import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutInterstitialProps {
  topmateUrl: string;
}

export default function CheckoutInterstitial({ topmateUrl }: CheckoutInterstitialProps) {
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // 3 seconds countdown
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Smooth progress bar decrement (60fps animation)
    const totalDuration = 3000;
    const updateInterval = 20; // 50hz
    const steps = totalDuration / updateInterval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const percentLeft = Math.max(0, 100 - (currentStep / steps) * 100);
      setProgress(percentLeft);
      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, updateInterval);

    // Redirect after 3 seconds
    const timeout = setTimeout(() => {
      window.location.href = topmateUrl;
    }, totalDuration);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [topmateUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

      {/* Main glassmorphism card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-8 md:p-10 text-center backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Progress bar line at top */}
        <div className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75" style={{ width: `${progress}%` }} />

        {/* Shield Icon with glowing animation */}
        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <ShieldCheck className="h-10 w-10 animate-pulse text-indigo-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </span>
        </div>

        {/* Header Title */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
          Securing your checkout
        </h2>

        {/* Safeguard prompt */}
        <p className="mb-8 text-sm md:text-base leading-relaxed text-slate-400">
          Please <strong className="text-indigo-300 font-semibold">do not close</strong> the browser tab after payment is complete so we can finalize and download your PDF.
        </p>

        {/* Active transition spinner and countdown */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 p-6 mb-8">
          <div className="flex items-center space-x-3 text-indigo-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium tracking-wide text-slate-300 uppercase">
              Redirecting in {secondsLeft}s
            </span>
          </div>

          {/* Micro countdown visual */}
          <div className="flex space-x-1.5 justify-center items-center">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  secondsLeft >= 4 - step 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Manual Redirect Backup Link */}
        <div className="flex items-center justify-center">
          <a
            href={topmateUrl}
            className="group flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors font-medium cursor-pointer"
          >
            <span>Not redirecting? Click here to continue manually</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
