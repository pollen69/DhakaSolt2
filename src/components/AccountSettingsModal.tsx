import React, { useState } from 'react';
import { UserProfile, VIPTier } from '../types';
import { soundManager } from '../utils/audio';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Check,
  Smartphone,
  Mail,
  Lock,
  Crown,
  Volume2,
  VolumeX,
  Zap,
  Save,
  KeyRound,
  LogIn,
  LogOut,
  Database,
  ExternalLink
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentTier: VIPTier;
  onUpdateProfile: (updated: UserProfile) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFirebaseConnected?: boolean;
  firebaseUserId?: string;
  firebaseUser?: any;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenBackendModal?: () => void;
  onSignOut?: () => void;
}

const AVATAR_OPTIONS = ['👑', '🐯', '🐉', '🦁', '🦅', '💎', '🃏', '🚀'];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentTier,
  onUpdateProfile,
  isMuted,
  onToggleMute,
  isFirebaseConnected = false,
  firebaseUserId,
  firebaseUser,
  onOpenAuth,
  onOpenBackendModal,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'security' | 'preferences'>('profile');
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [pin, setPin] = useState<string>(profile.withdrawalPin || '1234');
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playCoinSound();
    const updated = {
      ...formData,
      withdrawalPin: pin,
    };
    onUpdateProfile(updated);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-xl shadow-lg">
              {formData.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">Account Settings</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${currentTier.badgeColor}`}>
                  {currentTier.name} VIP
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage profile, payment wallets & cashier security</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-2 bg-neutral-900/60 border-b border-neutral-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'profile', label: 'Profile & Avatar', icon: User },
            { id: 'payments', label: 'Saved Wallets', icon: CreditCard },
            { id: 'security', label: 'Security & PIN', icon: Shield },
            { id: 'preferences', label: 'Preferences', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Toast Notification */}
          {showSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Account settings saved successfully!</span>
            </div>
          )}

          {/* TAB 1: Profile & Avatar */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Avatar:</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                      className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                        formData.avatar === emoji
                          ? 'bg-amber-400/20 border-2 border-amber-400 scale-105 shadow-md'
                          : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Username:
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Registered Phone:
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs font-mono-num text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address:
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Account Meta Strip */}
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs flex items-center justify-between text-slate-400 font-mono-num">
                <span>Account ID: {formData.id}</span>
                <span>Member Since: {formData.joinedDate}</span>
              </div>
            </div>
          )}

          {/* TAB 2: Saved Payment Wallets */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Save your default bKash and Nagad personal account numbers for 1-click withdrawals and pre-filled cashier forms.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#e2136e] text-white text-[9px] font-black flex items-center justify-center">
                    bK
                  </span>
                  Default bKash Number (বিকাশ পার্সোনাল):
                </label>
                <input
                  type="text"
                  value={formData.defaultBkash}
                  onChange={(e) => setFormData({ ...formData, defaultBkash: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs font-mono-num text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#f26522] text-white text-[9px] font-black flex items-center justify-center">
                    NG
                  </span>
                  Default Nagad Number (নগদ পার্সোনাল):
                </label>
                <input
                  type="text"
                  value={formData.defaultNagad}
                  onChange={(e) => setFormData({ ...formData, defaultNagad: e.target.value })}
                  placeholder="018XXXXXXXX"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs font-mono-num text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                ⚡ Withdrawals to saved numbers bypass secondary SMS verification and dispatch in under 2 minutes.
              </div>
            </div>
          )}

          {/* TAB 3: Security & PIN */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  4-Digit Cashier Withdrawal Security PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="****"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-base font-mono-num tracking-widest text-white focus:outline-none focus:border-amber-400 text-center max-w-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required when confirming cashouts to protect your funds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Biometric / Face ID Quick Cashout</span>
                    <span className="text-[11px] text-slate-400">Allow instant withdrawal authorization</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">SMS Login Alerts</span>
                    <span className="text-[11px] text-slate-400">Receive alert when account is accessed</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Firebase Cloud Account & Authentication Status */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`} />
                    <div>
                      <span className="text-xs font-bold text-white block">Firebase Authentication & Cloud Sync</span>
                      <span className="text-[11px] text-slate-400">
                        {firebaseUser && !firebaseUser.isAnonymous
                          ? `Authenticated: ${firebaseUser.email || firebaseUser.displayName || 'Player Account'}`
                          : 'Guest Player Session (Cloud Synced)'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${isFirebaseConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                    {isFirebaseConnected ? 'Online' : 'Pending'}
                  </span>
                </div>

                {firebaseUserId && (
                  <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-slate-400 font-mono truncate">
                    Cloud UID: <span className="text-slate-300 select-all">{firebaseUserId}</span>
                  </div>
                )}

                {/* Account Action Buttons */}
                <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-2">
                  {!firebaseUser || firebaseUser.isAnonymous ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAuth?.('login');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In / Register</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSignOut?.();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-300 border border-neutral-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}

                  {onOpenBackendModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenBackendModal();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all"
                      title="Open Firebase Console Hub"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>Firebase Hub</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Gaming Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    <div>
                      <span className="text-xs font-bold text-white block">Slot Sound Effects</span>
                      <span className="text-[11px] text-slate-400">Mechanical reel clicks, win chimes, coin drops</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      isMuted ? 'bg-neutral-800 text-slate-400' : 'bg-amber-400 text-black'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Enabled'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Responsible Gaming Daily Deposit Cap</span>
                      <span className="text-[11px] text-slate-400">Maximum daily deposit limit in BDT</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono-num text-amber-300 font-bold">
                    ৳100,000 / day
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black text-xs uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Account Settings
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>DhakaSlots Account Security · SSL 256-Bit Encrypted</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="text-white hover:text-amber-400 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
