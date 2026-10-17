import React, { useState } from 'react';
import { Transaction } from '../types';
import { soundManager } from '../utils/audio';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TransactionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const TransactionsDrawer: React.FC<TransactionsDrawerProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleCopy = (trxId: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(trxId);
    setCopiedId(trxId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Transaction History</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Segmented Control */}
        <div className="p-3 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            {(['all', 'deposit', 'withdrawal'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  soundManager.playClick();
                  setFilter(tab);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filter === tab
                    ? 'bg-amber-400 text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List of Transactions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs text-slate-600 mt-1">Make a deposit to start spinning</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isWin = tx.type === 'win';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isDeposit
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isWin
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isDeposit || isWin ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {tx.type} {tx.method ? `(${tx.method.toUpperCase()})` : tx.gameTitle || ''}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono-num">
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold font-mono-num ${
                          isDeposit || isWin ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {isDeposit || isWin ? '+' : '-'}৳{tx.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        {tx.status === 'completed' && (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {tx.status === 'processing' && (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold animate-pulse">
                            <Clock className="w-3 h-3" /> Processing (2m)
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="text-rose-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TrxID row if present */}
                  {tx.trxId && (
                    <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">TrxID: {tx.trxId}</span>
                      <button
                        onClick={() => handleCopy(tx.trxId!)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                      >
                        {copiedId === tx.trxId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === tx.trxId ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 text-[11px] text-slate-400 text-center">
          Payment processing powered by Bangladesh bKash & Nagad instant merchant network.
        </div>
      </div>
    </div>
  );
};
