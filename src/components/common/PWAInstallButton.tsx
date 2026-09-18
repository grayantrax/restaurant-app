import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Check, Smartphone, X, WifiOff, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>Installed PWA</span>
      </div>
    );
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm active:scale-95"
        title="Install Android / Desktop POS App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install Android App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Install JOJO FOODIES</span>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>To run JOJO FOODIES offline on iOS or iPad:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li>Tap the <strong className="text-white">Share</strong> button (box with upward arrow) at the bottom of Safari.</li>
                <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
                <li>Tap <strong className="text-amber-400">Add</strong> in the top right.</li>
              </ol>
              <p className="text-[11px] text-emerald-400">
                ✓ Launches full-screen without browser bars, and caches recipes and tables offline!
              </p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Android Chrome / Desktop Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Install POS Application</span>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Offline-First Progressive Web App with local caching.</span>
              </div>
              <p>On Android Chrome:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li>Tap the <strong className="text-white">three dots menu (⋮)</strong> in Chrome.</li>
                <li>Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.</li>
                <li>Tap <strong className="text-amber-400">Install</strong> to get the standalone Android app launcher.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
