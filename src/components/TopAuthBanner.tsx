import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { signInWithGoogle } from '../lib/firebase';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Zap,
  Crown,
  Database,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, VIPTier } from '../types';

interface TopAuthBannerProps {
  isAuthenticated: boolean;
  profile: UserProfile;
  balance: number;
  currentTier: VIPTier;
  isFirebaseConnected: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenBackendModal: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onSignOut: () => void;
  onAuthSuccess: (uid: string, username: string) => void;
}

export const TopAuthBanner: React.FC<TopAuthBannerProps> = ({
  isAuthenticated,
  profile,
  balance,
  currentTier,
  isFirebaseConnected,
  onOpenAuth,
  onOpenBackendModal,
  onOpenDeposit,
  onOpenWithdraw,
  onSignOut,
  onAuthSuccess,
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  const handleGoogleQuickSignIn = async () => {
    soundManager.playClick();
    setIsGoogleLoading(true);
    setGoogleNotice(null);

    const res = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (res.success && res.user) {
      soundManager.playCoinSound();
      setGoogleNotice('Successfully authenticated with Google!');
      setTimeout(() => {
        onAuthSuccess(res.user!.uid, res.user!.displayName || 'Google Player');
        setGoogleNotice(null);
      }, 700);
    } else {
      setGoogleNotice(res.message || 'Google sign-in could not be completed.');
      setTimeout(() => setGoogleNotice(null), 4000);
    }
  };

  if (isAuthenticated) {
    // Authenticated Player Strip at top of homepage
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40 border border-amber-500/30 p-3.5 sm:p-4 mb-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              {profile.avatar || '👑'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Player: <span className="text-amber-400">{profile.username || 'VIP Player'}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentTier.badgeColor}`}>
                  {currentTier.name} VIP
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Synced with Firebase
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">Current Balance:</span>
                <span className="text-sm font-extrabold font-mono-num text-amber-300">
                  ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenDeposit();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit bKash/Nagad</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenWithdraw();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onSignOut();
              }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Welcome & Auth Portal Banner at top of homepage
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900/90 to-amber-950/40 border-2 border-amber-500/40 p-5 sm:p-6 mb-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
      {/* Ambient background glow halos */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top luminous pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-xs font-extrabold text-amber-300">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>PLAYER PORTAL · 100% CLEAN ৳0 STARTING BALANCE</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenBackendModal();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400/50 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
            title="Inspect Firebase Firestore connection & rules"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <Database className="w-3 h-3 text-amber-400" />
            <span>{isFirebaseConnected ? 'Firebase Active' : 'Connecting'}</span>
          </button>
        </div>

        {/* Headline & Description */}
        <div className="max-w-3xl mb-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-display tracking-tight leading-snug">
            Log In or Register to Play{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              DhakaSlots VIP
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Welcome to Bangladesh’s premier licensed slots platform. Every new account is created fresh with a verified <span className="font-bold text-amber-300">৳0.00 starting balance</span> (no mock or demo balances). Connect via real Firebase backend, deposit seamlessly with bKash or Nagad, and play certified JILI, FC & JDB games.
          </p>
        </div>

        {/* Notice Message */}
        {googleNotice && (
          <div className="p-3 mb-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 animate-in fade-in">
            {googleNotice}
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
          {/* Primary Register Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAuth('register');
            }}
            className="flex items-center gap-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_28px_rgba(245,158,11,0.6)] active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>Register Account (৳0 Balance)</span>
          </button>

          {/* Log In Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAuth('login');
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Log In to Account</span>
          </button>

          {/* Quick Google Sign In */}
          <button
            onClick={handleGoogleQuickSignIn}
            disabled={isGoogleLoading}
            className="flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-neutral-900/90 hover:bg-neutral-800 text-slate-200 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Sign in with your Google Account"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting...' : 'Google Sign-In'}</span>
          </button>
        </div>

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 pt-4 border-t border-neutral-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Strict ৳0 Balance Start</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>bKash & Nagad Verified Merchant</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>5-Minute Express Cashouts</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-time Firestore Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
