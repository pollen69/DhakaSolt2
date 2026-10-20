import React, { useState } from 'react';
import { Provider, VIPTier, UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import {
  History,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Crown,
  Users,
  Menu,
  X,
  Headphones,
  ChevronRight,
  Settings,
  LogIn,
  LogOut,
  Database,
  UserPlus
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  balance: number;
  profile: UserProfile;
  currentTier: VIPTier;
  selectedProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
  onOpenPromos: () => void;
  onOpenVIP: () => void;
  onOpenReferral: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenBackendModal: () => void;
  onSignOut?: () => void;
  firebaseUser?: FirebaseUser | null;
  isAuthenticated?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isFirebaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  profile,
  currentTier,
  selectedProvider,
  onSelectProvider,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
  onOpenPromos,
  onOpenVIP,
  onOpenReferral,
  onOpenSupport,
  onOpenSettings,
  onOpenAuth,
  onOpenBackendModal,
  onSignOut,
  firebaseUser,
  isAuthenticated = false,
  isFirebaseConnected = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    soundManager.playClick();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNav = (action: () => void) => {
    soundManager.playClick();
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/95 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onSelectProvider('ALL')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="DhakaSlots VIP Casino"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:border-amber-400 group-hover:shadow-[0_0_22px_rgba(245,158,11,0.55)] group-hover:scale-105 transition-all duration-300 bg-neutral-900 shrink-0">
              <img
                src="/images/dhakaslots_logo_crest_1792258104215.jpg"
                alt="DhakaSlots Logo"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-black tracking-tight text-white leading-tight flex items-center group-hover:text-amber-200 transition-colors">
                DHAKA<span className="text-amber-400 font-extrabold">SLOTS</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase font-bold text-amber-500/80 -mt-0.5">
                VIP CASINO
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectProvider('ALL');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              selectedProvider === 'ALL' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectProvider('JILI');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              selectedProvider === 'JILI' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            JILI Slots
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectProvider('FC');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              selectedProvider === 'FC' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            FC Slots
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectProvider('JDB');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              selectedProvider === 'JDB' ? 'text-amber-400 underline underline-offset-8 font-bold' : ''
            }`}
          >
            JDB Slots
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenVIP();
            }}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 font-semibold"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            VIP Club
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenReferral();
            }}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 font-semibold"
          >
            <Users className="w-3.5 h-3.5" />
            Invite & Earn
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPromos();
            }}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Gift className="w-3.5 h-3.5" />
            Promotions
          </button>
        </nav>

        {/* Zone 3: 1 primary action lockup (Balance, Cashier, Settings, Mute) */}
        {!isAuthenticated ? (
          /* Unauthenticated State: Show Log In & Registration prominently at the top of the homepage */
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAuth('login');
              }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAuth('register');
              }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_28px_rgba(245,158,11,0.6)] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>

            {/* Firebase Cloud Sync Indicator */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenBackendModal();
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/40 text-[11px] transition-all cursor-pointer shadow-sm group"
              title="Open Firebase Console & Live Backend Diagnostics"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConnected
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" />
                <span>{isFirebaseConnected ? 'Firebase Active' : 'Connecting'}</span>
              </span>
            </button>
          </div>
        ) : (
          /* Authenticated State: Real user registered account */
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* VIP Badge shortcut */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenVIP();
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${currentTier.badgeColor} hover:scale-105`}
              title="Open VIP Royalty Club"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{currentTier.name}</span>
            </button>

            {/* Balance display */}
            <div className="flex items-center bg-neutral-900 border border-amber-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm">
              <Coins className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block -mb-0.5 font-medium uppercase">BDT</span>
                <span className="text-xs sm:text-sm font-bold font-mono-num text-amber-300 whitespace-nowrap">
                  ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Deposit Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenDeposit();
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deposit</span>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenWithdraw();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
              title="Withdraw to bKash or Nagad"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Withdraw</span>
            </button>

            {/* Account Settings Trigger */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenSettings();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-slate-200 transition-colors cursor-pointer"
              title="Account Settings & Security"
            >
              <span className="text-sm">{profile.avatar || '👤'}</span>
              <span className="hidden lg:inline text-xs font-semibold max-w-[80px] truncate">
                {firebaseUser?.displayName || profile.username}
              </span>
            </button>

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onSignOut();
                }}
                className="hidden sm:flex p-2 text-slate-400 hover:text-rose-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            {/* History Drawer Trigger */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenHistory();
              }}
              className="hidden sm:flex p-2 text-slate-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
              title="Transaction Ledger"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Firebase Cloud Sync & Backend Hub Trigger */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenBackendModal();
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/40 text-[11px] transition-all cursor-pointer shadow-sm group"
              title="Open Firebase Console & Live Backend Diagnostics"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConnected
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" />
                <span>{isFirebaseConnected ? 'Firebase Active' : 'Connecting'}</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Slide-Down Mobile / Responsive Navigation Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950/98 px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          {!isAuthenticated ? (
            /* Unauthenticated User Card in Mobile Menu */
            <div className="p-4 bg-gradient-to-r from-neutral-900 to-amber-950/40 rounded-2xl border border-amber-500/30 space-y-3">
              <div>
                <span className="text-sm font-bold text-white block">Welcome to DhakaSlots VIP</span>
                <span className="text-xs text-slate-400">
                  Register or log in to play premier slots with verified bKash/Nagad wallet & 0 initial balance.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleMobileNav(() => onOpenAuth('login'))}
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 text-center flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => handleMobileNav(() => onOpenAuth('register'))}
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated User Quick Info in Menu */
            <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => handleMobileNav(onOpenSettings)}
                className="flex items-center gap-2.5 text-left flex-1 mr-2"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-400/30">
                  {profile.avatar || '👤'}
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {firebaseUser?.displayName || profile.username} · {currentTier.name} VIP
                  </span>
                  <span className="text-[11px] text-amber-300 font-mono-num font-bold">
                    ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                {onSignOut && (
                  <button
                    onClick={() => handleMobileNav(onSignOut)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleMobileNav(onOpenSettings)}
                  className="p-1.5 text-slate-400 hover:text-amber-400"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Firebase Hub Button for Mobile */}
          <button
            onClick={() => handleMobileNav(onOpenBackendModal)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-semibold text-amber-300"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Firebase Console & Live Backend</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
              Connected
            </span>
          </button>

          {/* Menu Sections Grid */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Game Providers
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleMobileNav(() => onSelectProvider('ALL'))}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-slate-200 hover:text-white hover:bg-neutral-800"
              >
                <span>🎰 All Slots</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => handleMobileNav(() => onSelectProvider('JILI'))}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-amber-300 hover:bg-neutral-800"
              >
                <span>👑 JILI Slots</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => handleMobileNav(() => onSelectProvider('FC'))}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-rose-300 hover:bg-neutral-800"
              >
                <span>🏮 FC Slots</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => handleMobileNav(() => onSelectProvider('JDB'))}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-blue-300 hover:bg-neutral-800"
              >
                <span>🐉 JDB Slots</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Wallet & Cashier
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleMobileNav(onOpenDeposit)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Deposit bKash/Nagad
              </button>
              <button
                onClick={() => handleMobileNav(onOpenWithdraw)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-bold"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Withdraw
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-neutral-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Account, Rewards & Support
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => handleMobileNav(onOpenSettings)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Account Settings & Security PIN</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNav(onOpenVIP)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-amber-300"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>VIP Royalty Club & Cashbacks</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNav(onOpenReferral)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-semibold text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Invite & Earn (৳250 per friend)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleMobileNav(onOpenPromos)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span>Promotions & Match Bonuses</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNav(onOpenHistory)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Transaction Ledger</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNav(onOpenSupport)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-xs font-semibold text-cyan-300"
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span>24/7 Live Agent Chat & WhatsApp</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
