import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import {
  signInWithGoogle,
  loginWithEmailPassword,
  registerWithEmailPassword,
  registerPlayerAccountDirect,
  FIREBASE_AUTH_PROVIDERS_URL,
  FIREBASE_PROJECT_ID,
} from '../lib/firebase';
import {
  User,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Gift,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (uid: string, username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [consoleHelpNeeded, setConsoleHelpNeeded] = useState<boolean>(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setConsoleHelpNeeded(false);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    soundManager.playClick();
    setMode(newMode);
    resetForm();
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    soundManager.playClick();
    setIsLoading(true);
    resetForm();

    const res = await signInWithGoogle();
    setIsLoading(false);

    if (res.success && res.user) {
      soundManager.playCoinSound();
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onAuthSuccess(res.user!.uid, res.user!.displayName || 'Google Player');
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.message || 'Google sign-in could not be completed.');
    }
  };

  // Email/Password Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    resetForm();

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    if (mode === 'register') {
      const res = await registerWithEmailPassword(
        email,
        password,
        displayName || email.split('@')[0],
        phone
      );
      setIsLoading(false);

      if (res.success && res.user) {
        soundManager.playCoinSound();
        setSuccessMsg('Account registered successfully! Welcome to DhakaSlots.');
        setTimeout(() => {
          onAuthSuccess(res.user!.uid, displayName || email.split('@')[0]);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Registration failed');
        if (res.requiresConsoleActivation) {
          setConsoleHelpNeeded(true);
        }
      }
    } else {
      const res = await loginWithEmailPassword(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        soundManager.playCoinSound();
        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.user!.uid, res.user!.displayName || email.split('@')[0]);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message || 'Log in failed');
        if (res.requiresConsoleActivation) {
          setConsoleHelpNeeded(true);
        }
      }
    }
  };

  // Instant Casino Player Account Fallback
  const handleInstantAccount = async () => {
    soundManager.playClick();
    setIsLoading(true);
    const chosenName = displayName || (email ? email.split('@')[0] : 'DhakaPlayer');
    const res = await registerPlayerAccountDirect(chosenName, phone, email);
    setIsLoading(false);

    soundManager.playCoinSound();
    setSuccessMsg(`Instant VIP Player account created: ${res.uid}`);
    setTimeout(() => {
      onAuthSuccess(res.uid, chosenName);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border-b border-neutral-800 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-amber-400/50 shadow-md bg-neutral-900 flex items-center justify-center">
              <img
                src="/images/dhakaslots_logo_crest_1792258104215.jpg"
                alt="DhakaSlots Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  {mode === 'login' ? 'Player Sign In' : 'Register New Account'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Access your bKash/Nagad wallet & VIP turnover'
                  : 'Start fresh with 0 initial balance & verified bKash/Nagad wallet'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-900/90 border-b border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Register</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Firebase Console Activation Notice Banner */}
          {consoleHelpNeeded && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Enable Email/Password in Firebase Console</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your Firebase project (<code className="text-amber-300">{FIREBASE_PROJECT_ID}</code>)
                requires Email/Password provider to be enabled in the Firebase Console:
              </p>
              <ol className="text-[11px] text-slate-300 list-decimal list-inside space-y-1 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                <li>Click the console link below</li>
                <li>Under <strong>Sign-in method</strong>, choose <strong>Email/Password</strong></li>
                <li>Switch to <strong>Enable</strong> and hit <strong>Save</strong></li>
              </ol>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={FIREBASE_AUTH_PROVIDERS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow"
                >
                  <span>Open Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleInstantAccount}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-slate-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition-all"
                >
                  Play with Instant Casino ID
                </button>
              </div>
            </div>
          )}

          {/* 1-Click Google Sign-In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl text-xs font-bold text-white transition-all shadow hover:border-amber-400/50 active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-950 px-3 text-[11px] text-slate-500 uppercase tracking-widest font-semibold shrink-0">
              or credentials
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Player Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. VIP_LuckyTiger"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    bKash / Nagad Mobile (Optional)
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@dhakaslots.com"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Gift className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VIP888"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs text-amber-300 uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-98 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create VIP Account (৳0 Balance)'
              )}
            </button>
          </form>

          {/* Quick Casino Player option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleInstantAccount}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Casino Player Account (৳0 Balance)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 text-[11px] text-slate-400 text-center flex items-center justify-between">
          <span>Protected by Firebase 256-bit SSL</span>
          <span className="text-amber-400 font-semibold">18+ Play Responsibly</span>
        </div>
      </div>
    </div>
  );
};
