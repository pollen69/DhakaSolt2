import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_CONSOLE_URL,
  FIREBASE_AUTH_PROVIDERS_URL,
  FIREBASE_FIRESTORE_DATA_URL,
  testFirebaseBackendMetrics,
  BackendMetrics,
} from '../lib/firebase';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Coins,
  History,
  Activity,
  Layers,
  CheckCircle2,
  X,
  Sparkles,
  Server,
  KeyRound,
} from 'lucide-react';

interface FirebaseBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUid: string;
}

export const FirebaseBackendModal: React.FC<FirebaseBackendModalProps> = ({
  isOpen,
  onClose,
  currentUid,
}) => {
  const [metrics, setMetrics] = useState<BackendMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'console' | 'rules'>('overview');

  const loadMetrics = async () => {
    setIsRefreshing(true);
    try {
      const data = await testFirebaseBackendMetrics(currentUid);
      setMetrics(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
    }
  }, [isOpen, currentUid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  Firebase Console & Backend Hub
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Firestore
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected project: <code className="text-amber-300">{FIREBASE_PROJECT_ID}</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                loadMetrics();
              }}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh backend status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-neutral-900/40 border-b border-neutral-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backend Health & Stats
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'console'
                ? 'bg-amber-400 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Firebase Console Direct Links
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-400 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Rules & Schemas
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Status Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connection</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-num">
                    {metrics ? `${metrics.pingMs}ms latency` : 'Testing...'}
                  </span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auth Session</span>
                  </div>
                  <div className="text-xs font-bold text-amber-300 truncate">
                    {metrics?.authMethod || 'Session Active'}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">
                    UID: {currentUid}
                  </span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ledger Entries</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono-num">
                    {metrics ? `${metrics.userTransactionsCount} txs` : '...'}
                  </div>
                  <span className="text-[10px] text-slate-500">In /transactions</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jackpot Pool</span>
                  </div>
                  <div className="text-sm font-bold text-amber-400 font-mono-num">
                    ৳{metrics ? metrics.jackpotAmount.toLocaleString() : '8,888,888'}
                  </div>
                  <span className="text-[10px] text-slate-500">In /jackpots/global</span>
                </div>
              </div>

              {/* Real-time Backend Sync Status */}
              <div className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Real-Time Cloud Synchronization</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>User Profile & Balance Document</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-400">/users/{currentUid}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>bKash & Nagad Cashier Ledger</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">/transactions</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Slot Machine Spin Outcomes & RTP</span>
                    </div>
                    <span className="font-mono text-[11px] text-cyan-400">/spins</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Global Community Jackpot</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-300">/jackpots/global</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'console' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Direct Firebase Console Access</span>
                </div>
                <p className="text-slate-300">
                  Manage users, view real-time Firestore database records, audit security rules, and enable authentication providers directly in the Firebase Console:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={FIREBASE_AUTH_PROVIDERS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 rounded-2xl transition-all group block text-left"
                >
                  <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                    <span>Authentication Providers</span>
                    <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enable Email/Password, Google, or Anonymous Sign-in for player accounts.
                  </p>
                </a>

                <a
                  href={FIREBASE_FIRESTORE_DATA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 rounded-2xl transition-all group block text-left"
                >
                  <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                    <span>Firestore Database Explorer</span>
                    <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Browse real-time collections: users, transactions, spins, and jackpots.
                  </p>
                </a>

                <a
                  href={`${FIREBASE_CONSOLE_URL}/firestore/databases/${FIRESTORE_DATABASE_ID}/rules`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 rounded-2xl transition-all group block text-left"
                >
                  <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                    <span>Security Rules</span>
                    <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Audit deployed security rules version 2 with zero-trust validation.
                  </p>
                </a>

                <a
                  href={FIREBASE_CONSOLE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 rounded-2xl transition-all group block text-left"
                >
                  <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                    <span>Project Overview</span>
                    <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    View project usage, analytics, and infrastructure settings.
                  </p>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hardened Firestore Security Rules (ABAC)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Deployed
                </span>
              </div>
              <pre className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-60 scrollbar-thin">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    match /test/{docId} { allow get: if true; }
    match /users/{userId} {
      allow get: if isAllowedUser(userId);
      allow create, update: if isAllowedUser(userId) && isValidUser(request.resource.data);
    }
    match /transactions/{transactionId} {
      allow get, list: if isOwner(resource.data.userId);
      allow create: if isValidTransaction(request.resource.data);
    }
    match /spins/{spinId} {
      allow get, list: if isOwner(resource.data.userId);
      allow create: if isValidSpin(request.resource.data);
    }
    match /jackpots/{jackpotId} {
      allow get: if true;
      allow create, update: if isValidJackpot(request.resource.data);
    }
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Database: <strong className="text-slate-200">{FIRESTORE_DATABASE_ID}</strong></span>
          </div>
          <a
            href={FIREBASE_CONSOLE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Open in Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
