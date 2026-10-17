import React, { useState } from 'react';
import { ReferralProgramStats, ReferralFriend } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  UserPlus,
  Send
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ReferralProgramStats;
  onClaimReward: (amount: number, friendId?: string) => void;
  onSimulateFriendDeposit: (phone: string, depositAmount: number) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  stats,
  onClaimReward,
  onSimulateFriendDeposit,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [simPhone, setSimPhone] = useState<string>('017');
  const [simDeposit, setSimDeposit] = useState<number>(1000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dhakaslots.com';
  const inviteLink = `${origin}/?ref=${stats.referralCode}`;

  const handleCopyLink = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(stats.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppShare = () => {
    soundManager.playClick();
    const text = encodeURIComponent(
      `Play authentic JILI, FC, and JDB slots on DhakaSlots! Deposit with bKash and Nagad. Use my invite code ${stats.referralCode} to get ৳100 Free Bonus on your first deposit: ${inviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleClaimAll = () => {
    if (stats.unclaimedBonus <= 0) return;
    soundManager.playJackpotSound();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onClaimReward(stats.unclaimedBonus);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      onSimulateFriendDeposit(simPhone.length >= 11 ? simPhone : `017${Math.floor(10000000 + Math.random() * 90000000)}`, simDeposit);
      soundManager.playWinChime(2);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Referral Program (বন্ধু আমন্ত্রণ)</h3>
              <p className="text-xs text-slate-400">Invite Friends & Earn ৳250 Cash per First Deposit</p>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Invite Banner & Link Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900/90 to-neutral-950 border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Your Referral Code</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black font-mono-num text-white tracking-widest">{stats.referralCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </button>
            </div>

            {/* Invite URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Your Unique Invite URL:</label>
              <div className="flex items-center bg-neutral-950 p-2 rounded-xl border border-neutral-800 text-xs">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="bg-transparent text-slate-200 font-mono text-[11px] flex-1 outline-none truncate pr-2 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shrink-0 transition-colors shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Referral Reward Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold flex items-center justify-center mb-2">
                1
              </div>
              <h5 className="font-bold text-white text-xs">1. Send Invite</h5>
              <p className="text-slate-400 text-[11px] mt-1">
                Share your invite link with your friends on WhatsApp or social media.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 font-bold flex items-center justify-center mb-2">
                2
              </div>
              <h5 className="font-bold text-white text-xs">2. Friend Deposits</h5>
              <p className="text-slate-400 text-[11px] mt-1">
                Friend signs up & completes their first deposit (min ৳500) with bKash or Nagad.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 font-bold flex items-center justify-center mb-2">
                3
              </div>
              <h5 className="font-bold text-white text-xs">3. Both Get Rewarded</h5>
              <p className="text-slate-400 text-[11px] mt-1">
                You get <strong>৳250 Cash</strong> immediately; your friend gets a <strong>৳100 Free Bet</strong>!
              </p>
            </div>
          </div>

          {/* Referral Metrics & Claim Bar */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Invited</span>
                <span className="text-lg font-black font-mono-num text-white">{stats.totalInvited}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Deposited</span>
                <span className="text-lg font-black font-mono-num text-emerald-400">{stats.successfulDeposits}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Earned</span>
                <span className="text-lg font-black font-mono-num text-amber-300">৳{stats.totalEarned.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Unclaimed Bonus</span>
                <span className="text-lg font-black font-mono-num text-emerald-400">
                  ৳{stats.unclaimedBonus.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleClaimAll}
                disabled={stats.unclaimedBonus <= 0}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                Claim to Balance
              </button>
            </div>
          </div>

          {/* Invited Friends Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Referred Friends Ledger
              </h4>
              <span className="text-xs text-slate-400 font-mono-num">
                {stats.friends.length} Friends
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden">
              {stats.friends.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <p>No referred friends yet.</p>
                  <p className="mt-1 text-slate-600">Share your link above or test with the simulator below!</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/80 text-xs">
                  {stats.friends.map((friend) => (
                    <div key={friend.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-white font-mono-num">{friend.phone}</div>
                        <div className="text-[11px] text-slate-400 font-mono-num">
                          Joined {new Date(friend.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-[11px] font-mono-num text-slate-300 block">
                          Deposit: {friend.status === 'completed' ? `৳${friend.firstDepositAmount.toLocaleString()}` : 'None'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            friend.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {friend.status === 'completed' ? '1st Deposit Done' : 'Waiting for Deposit'}
                        </span>
                      </div>

                      <div className="text-right">
                        {friend.status === 'completed' ? (
                          friend.claimed ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ৳{friend.rewardAmount} Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                soundManager.playJackpotSound();
                                confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                                onClaimReward(friend.rewardAmount, friend.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm"
                            >
                              Claim ৳{friend.rewardAmount}
                            </button>
                          )
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" /> Pending (৳0)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Friend Invite Simulator */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Referral Testing Sandbox (Simulate Friend's First Deposit)</span>
            </div>
            <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
              Test how the referral loop functions in real-time. Simulate a friend signing up with your invite link and making their first bKash or Nagad deposit to see your ৳250 reward generated!
            </p>

            <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                placeholder="Friend Phone (017...)"
                className="w-full sm:w-44 bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-xs font-mono-num text-white focus:outline-none focus:border-amber-400"
              />
              <select
                value={simDeposit}
                onChange={(e) => setSimDeposit(Number(e.target.value))}
                className="w-full sm:w-40 bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-xs font-mono-num text-white focus:outline-none focus:border-amber-400"
              >
                <option value={500}>1st Deposit: ৳500</option>
                <option value={1000}>1st Deposit: ৳1,000</option>
                <option value={2000}>1st Deposit: ৳2,000</option>
                <option value={5000}>1st Deposit: ৳5,000</option>
              </select>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isSimulating ? 'Simulating...' : 'Simulate Friend 1st Deposit'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>Referred bonuses come with 0x wagering requirements and can be withdrawn immediately.</span>
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
