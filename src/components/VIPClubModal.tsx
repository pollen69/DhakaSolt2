import React from 'react';
import { VIPTier, VIPUserStats } from '../types';
import { VIP_TIERS, getNextVIPTier, calculateTurnoverProgress, calculateMonthlyCashback } from '../data/vip';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Crown,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Coins,
  CheckCircle2,
  Gift
} from 'lucide-react';

interface VIPClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: VIPTier;
  vipStats: VIPUserStats;
  onClaimCashback: (amount: number) => void;
  onClaimLevelBonus: (level: number, amount: number) => void;
  onOpenDeposit: () => void;
}

export const VIPClubModal: React.FC<VIPClubModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  vipStats,
  onClaimCashback,
  onClaimLevelBonus,
  onOpenDeposit,
}) => {
  if (!isOpen) return null;

  const nextTier = getNextVIPTier(currentTier.level);
  const progress = calculateTurnoverProgress(vipStats.turnover, currentTier, nextTier);
  const monthlyCashback = calculateMonthlyCashback(vipStats.turnover, currentTier);

  // Check if level bonus is claimable
  const isLevelBonusClaimed = vipStats.claimedLevelBonuses.includes(currentTier.level);
  const hasClaimableCashback = monthlyCashback > 0;

  const handleCashbackClaim = () => {
    if (!hasClaimableCashback) return;
    soundManager.playJackpotSound();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    onClaimCashback(monthlyCashback);
  };

  const handleLevelBonusClaim = () => {
    if (isLevelBonusClaimed) return;
    soundManager.playJackpotSound();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    onClaimLevelBonus(currentTier.level, currentTier.levelUpBonus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg">
              <Crown className="w-6 h-6 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">VIP Royalty Loyalty Club</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentTier.badgeColor}`}>
                  {currentTier.name} Tier
                </span>
              </div>
              <p className="text-xs text-slate-400">Monthly Cashbacks & Higher bKash/Nagad Withdrawal Limits</p>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Level Overview & Progress Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900/80 to-neutral-950 border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Your Current Status</span>
                <h4 className="text-2xl font-black text-white font-display mt-0.5">{currentTier.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Wagering Turnover: <strong className="text-white font-mono-num font-bold">৳{vipStats.turnover.toLocaleString()}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Cashback Rate: <strong className="text-amber-300 font-bold">{currentTier.cashbackPercent}%</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Daily Cashout: <strong className="text-emerald-400 font-bold">৳{currentTier.dailyWithdrawalLimit.toLocaleString()}</strong></span>
                </div>
              </div>

              {nextTier && (
                <div className="text-right sm:self-center">
                  <span className="text-xs text-slate-400 block">Next Milestone</span>
                  <span className="text-sm font-bold text-amber-300">{nextTier.title}</span>
                  <span className="text-[11px] text-slate-400 font-mono-num block mt-0.5">
                    ৳{progress.remaining.toLocaleString()} more needed
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {nextTier ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">{currentTier.name} (৳{currentTier.minTurnover.toLocaleString()})</span>
                  <span className="text-amber-400 font-mono-num font-bold">{progress.percent}%</span>
                  <span className="text-slate-400">{nextTier.name} (৳{nextTier.minTurnover.toLocaleString()})</span>
                </div>
                <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>You have unlocked the highest VIP Tier: <strong>Royal Crown</strong>! You enjoy maximum privileges.</span>
              </div>
            )}
          </div>

          {/* Dual Action Cards: Monthly Cashback & Level Bonus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Monthly Cashback Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Monthly Cashback</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                    Cycle Active
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xs text-slate-400">Available to Claim ({currentTier.cashbackPercent}% of Turnover):</div>
                  <div className="text-3xl font-black font-mono-num text-emerald-400 mt-1">
                    ৳{monthlyCashback.toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Calculated automatically on every bet you place across JILI, FC, and JDB slot machines. Credited with 0x wagering requirement!
                </p>
              </div>

              <button
                onClick={handleCashbackClaim}
                disabled={!hasClaimableCashback}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-md"
              >
                <Coins className="w-4 h-4" />
                {hasClaimableCashback ? `Claim ৳${monthlyCashback.toLocaleString()} Cashback` : 'Spin to Accumulate Cashback'}
              </button>
            </div>

            {/* 2. Level-Up Bonus Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Level-Up Cash Reward</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                    {currentTier.name} Reward
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xs text-slate-400">Instant Tier Upgrade Prize:</div>
                  <div className="text-3xl font-black font-mono-num text-amber-300 mt-1">
                    ৳{currentTier.levelUpBonus.toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Granted as a reward for advancing in the VIP ranks. Reach higher wagering tiers to unlock up to ৳25,000 in level-up bonuses.
                </p>
              </div>

              {isLevelBonusClaimed ? (
                <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Level Bonus Claimed
                </div>
              ) : (
                <button
                  onClick={handleLevelBonusClaim}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Claim ৳{currentTier.levelUpBonus.toLocaleString()} Level Bonus
                </button>
              )}
            </div>
          </div>

          {/* Full VIP Tier Table Comparison */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                VIP Tier Structure & Withdrawal Privileges
              </h4>
              <span className="text-xs text-slate-400 font-mono-num">6 Loyalty Tiers</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">VIP Tier</th>
                    <th className="py-3 px-4 font-bold">Wager Requirement</th>
                    <th className="py-3 px-4 font-bold">Monthly Cashback</th>
                    <th className="py-3 px-4 font-bold">Single Cashout Max</th>
                    <th className="py-3 px-4 font-bold">Daily Cashout Limit</th>
                    <th className="py-3 px-4 font-bold">Level Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 font-mono-num">
                  {VIP_TIERS.map((tier) => {
                    const isCurrent = tier.level === currentTier.level;

                    return (
                      <tr
                        key={tier.level}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-amber-500/10 font-bold text-white'
                            : 'hover:bg-neutral-900/50 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-4 font-sans font-bold flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${tier.badgeColor}`}>
                            VIP {tier.level}
                          </span>
                          <span>{tier.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] uppercase bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold tracking-wider font-sans">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tier.minTurnover === 0 ? '৳0 (Starting)' : `৳${tier.minTurnover.toLocaleString()}`}
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          {tier.cashbackPercent}%
                        </td>
                        <td className="py-3 px-4 text-amber-300">
                          ৳{tier.singleWithdrawalLimit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-white font-bold">
                          ৳{tier.dailyWithdrawalLimit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-yellow-400">
                          ৳{tier.levelUpBonus.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Every ৳1 bet placed across JILI, FC, and JDB slots contributes 100% to your VIP turnover.</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenDeposit();
            }}
            className="flex items-center gap-1.5 font-bold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Deposit & Level Up <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
