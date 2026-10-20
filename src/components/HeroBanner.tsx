import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, ShieldCheck, Crown, Zap, Trophy, Coins } from 'lucide-react';

interface HeroBannerProps {
  onOpenDeposit?: () => void;
  onPlayFeatured?: () => void;
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
  isAuthenticated?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenDeposit,
  onPlayFeatured,
  onOpenRegister,
  onOpenLogin,
  isAuthenticated = false,
}) => {
  // Live progressive jackpot counter
  const [jackpot, setJackpot] = useState<number>(4892350.75);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + (Math.random() * 4.5 + 0.5));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-neutral-950 shadow-[0_10px_40px_rgba(0,0,0,0.8)] mb-8">
      {/* Background Hero Image with measured contrast scrim and colourful lighting leaks */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_slot_banner_1792230671421.jpg"
          alt="Golden Slot Casino Banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-transparent" />
        
        {/* Dynamic colorful ambient glow halos */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Hero Foreground Content - Target element */}
      <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-14 max-w-4xl">
        {/* Luminous Top Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-600/20 border border-amber-400/50 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] text-xs font-bold mb-4">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
            <span>BANGLADESH #1 LICENSED VIP SLOTS</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-500" />
          <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>bKash & Nagad Instant Payout</span>
          </span>
        </div>

        {/* Vibrant Multi-Color Typography */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4 font-display">
          WIN BIG ON{' '}
          <span className="inline-block bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(245,158,11,0.6)]">
            JILI
          </span>
          {', '}
          <span className="inline-block bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(45,212,191,0.6)]">
            FC
          </span>
          {' & '}
          <span className="inline-block bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(244,63,94,0.6)]">
            JDB
          </span>{' '}
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
            SLOTS
          </span>
        </h1>

        {/* Rich Description with Brand Highlights */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mb-6 leading-relaxed font-medium">
          Experience authentic Las Vegas slots with cascading multipliers, explosive free spins, and guaranteed instant payouts via{' '}
          <span className="font-extrabold text-[#e2136e] bg-[#e2136e]/20 px-2 py-0.5 rounded border border-[#e2136e]/40 shadow-[0_0_10px_rgba(226,19,110,0.25)]">
            bKash
          </span>{' '}
          and{' '}
          <span className="font-extrabold text-[#f26522] bg-[#f26522]/20 px-2 py-0.5 rounded border border-[#f26522]/40 shadow-[0_0_10px_rgba(242,101,34,0.25)]">
            Nagad
          </span>
          .
        </p>

        {/* Live Progressive Jackpot Showcase - Radiant & Glamorous */}
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-neutral-900/95 via-purple-950/40 to-neutral-950/95 border-2 border-amber-400/50 backdrop-blur-xl mb-7 shadow-[0_0_35px_rgba(245,158,11,0.3)] max-w-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-amber-500/25 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 rounded-full bg-pink-500/25 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Crown className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  MEGA PROGRESSIVE JACKPOT
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>LIVE CASINO POOL</span>
              </div>
            </div>

            {/* Jackpot Ticker */}
            <div className="text-3xl sm:text-5xl font-black font-mono-num tracking-tight bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)] py-1">
              ৳{jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Colourful Highlights Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                Hot RTP: 98.6%
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Daily Super Drop
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Spins from ৳1.00
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Log In & Register (0 Balance) or Deposit */}
        <div className="flex flex-wrap items-center gap-3 mb-7">
          {!isAuthenticated ? (
            <>
              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>Register Account (৳0 Balance)</span>
                </button>
              )}
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Log In to Account</span>
                </button>
              )}
            </>
          ) : (
            <>
              {onOpenDeposit && (
                <button
                  onClick={onOpenDeposit}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4 fill-black" />
                  <span>Deposit bKash/Nagad</span>
                </button>
              )}
              {onPlayFeatured && (
                <button
                  onClick={onPlayFeatured}
                  className="px-5 py-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Browse All Slots</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Colourful Trust & Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 border-t border-neutral-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-black">Official Partner</div>
              <div className="font-bold text-slate-200">JILI, FC & JDB</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/15 to-rose-500/5 border border-pink-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(226,19,110,0.1)]">
            <div className="w-7 h-7 rounded-lg bg-[#e2136e]/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-pink-400 fill-pink-400" />
            </div>
            <div>
              <div className="text-[10px] text-pink-400 uppercase font-black">Express Cashout</div>
              <div className="font-bold text-slate-200">2-5 Min bKash/Nagad</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/5 border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-black">Fair Play</div>
              <div className="font-bold text-slate-200">Certified RNG 97%+</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/5 border border-cyan-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase font-black">High Multipliers</div>
              <div className="font-bold text-slate-200">Up to 50,000x Win</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

