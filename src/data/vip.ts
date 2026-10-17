import { VIPTier } from '../types';

export const VIP_TIERS: VIPTier[] = [
  {
    level: 1,
    name: 'Bronze',
    title: 'VIP 1 Bronze',
    minTurnover: 0,
    cashbackPercent: 1.0,
    dailyWithdrawalLimit: 25000,
    singleWithdrawalLimit: 10000,
    dailyWithdrawCount: 3,
    levelUpBonus: 100,
    badgeColor: 'text-amber-600 bg-amber-600/10 border-amber-600/30',
    accentGradient: 'from-amber-700 to-amber-900',
    perks: [
      '1.0% Monthly Cash Rebate on Turnover',
      'Max ৳10,000 per Single Withdrawal',
      '৳25,000 Daily Total Cashout Limit',
      'Standard 24/7 bKash & Nagad Processing',
      '৳100 Starter Level Bonus'
    ]
  },
  {
    level: 2,
    name: 'Silver',
    title: 'VIP 2 Silver',
    minTurnover: 25000,
    cashbackPercent: 2.0,
    dailyWithdrawalLimit: 50000,
    singleWithdrawalLimit: 25000,
    dailyWithdrawCount: 5,
    levelUpBonus: 300,
    badgeColor: 'text-slate-300 bg-slate-400/10 border-slate-400/30',
    accentGradient: 'from-slate-400 to-slate-600',
    perks: [
      '2.0% Monthly Cash Rebate on Turnover',
      'Max ৳25,000 per Single Withdrawal',
      '৳50,000 Daily Total Cashout Limit',
      '5 Daily Withdrawal Transactions',
      '৳300 Level-Up Cash Reward'
    ]
  },
  {
    level: 3,
    name: 'Gold',
    title: 'VIP 3 Gold',
    minTurnover: 100000,
    cashbackPercent: 3.5,
    dailyWithdrawalLimit: 100000,
    singleWithdrawalLimit: 50000,
    dailyWithdrawCount: 10,
    levelUpBonus: 1000,
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/40',
    accentGradient: 'from-amber-400 to-yellow-600',
    perks: [
      '3.5% Monthly Cash Rebate on Turnover',
      'Max ৳50,000 per Single Withdrawal',
      '৳100,000 Daily Total Cashout Limit',
      '10 Daily Withdrawal Transactions',
      'Priority Cashier Queue (Fast Track)',
      '৳1,000 Instant Level-Up Bonus'
    ]
  },
  {
    level: 4,
    name: 'Platinum',
    title: 'VIP 4 Platinum',
    minTurnover: 500000,
    cashbackPercent: 5.0,
    dailyWithdrawalLimit: 250000,
    singleWithdrawalLimit: 100000,
    dailyWithdrawCount: 15,
    levelUpBonus: 3000,
    badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/40',
    accentGradient: 'from-cyan-400 to-blue-600',
    perks: [
      '5.0% Monthly Cash Rebate on Turnover',
      'Max ৳100,000 per Single Withdrawal',
      '৳250,000 Daily Total Cashout Limit',
      'Express 60-Second bKash/Nagad Dispatch',
      'Exclusive JILI & FC Mystery Spin Gifts',
      '৳3,000 Level-Up Cash Reward'
    ]
  },
  {
    level: 5,
    name: 'Diamond',
    title: 'VIP 5 Diamond',
    minTurnover: 2000000,
    cashbackPercent: 7.5,
    dailyWithdrawalLimit: 500000,
    singleWithdrawalLimit: 250000,
    dailyWithdrawCount: 25,
    levelUpBonus: 10000,
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/40',
    accentGradient: 'from-purple-400 to-pink-600',
    perks: [
      '7.5% Monthly Cash Rebate on Turnover',
      'Max ৳250,000 per Single Withdrawal',
      '৳500,000 Daily Total Cashout Limit',
      'Dedicated 1-on-1 WhatsApp VIP Host',
      'Zero Daily Withdrawal Count Limits',
      '৳10,000 Instant Level-Up Bonus'
    ]
  },
  {
    level: 6,
    name: 'Royal Crown',
    title: 'VIP 6 Royal Crown',
    minTurnover: 10000000,
    cashbackPercent: 10.0,
    dailyWithdrawalLimit: 1500000,
    singleWithdrawalLimit: 500000,
    dailyWithdrawCount: 999,
    levelUpBonus: 25000,
    badgeColor: 'text-yellow-300 bg-yellow-400/15 border-yellow-400/50',
    accentGradient: 'from-yellow-300 via-amber-400 to-red-500',
    perks: [
      '10.0% Highest Monthly Cash Rebate',
      'Max ৳500,000 per Single Withdrawal',
      '৳1,500,000 Daily Total Cashout Limit',
      'Instant Unlimited VIP Agent Withdrawals',
      'Personal High Roller Casino Concierge',
      '৳25,000 Grand Royal Bonus'
    ]
  }
];

export function getVIPTierByTurnover(turnover: number): VIPTier {
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (turnover >= VIP_TIERS[i].minTurnover) {
      return VIP_TIERS[i];
    }
  }
  return VIP_TIERS[0];
}

export function getNextVIPTier(currentLevel: number): VIPTier | null {
  return VIP_TIERS.find((t) => t.level === currentLevel + 1) || null;
}

export function calculateTurnoverProgress(
  turnover: number,
  currentTier: VIPTier,
  nextTier: VIPTier | null
): { percent: number; remaining: number } {
  if (!nextTier) {
    return { percent: 100, remaining: 0 };
  }
  const range = nextTier.minTurnover - currentTier.minTurnover;
  const currentInTier = turnover - currentTier.minTurnover;
  const rawPercent = (currentInTier / range) * 100;
  const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const remaining = Math.max(0, nextTier.minTurnover - turnover);
  return { percent, remaining };
}

export function calculateMonthlyCashback(turnover: number, tier: VIPTier): number {
  if (turnover <= 0) return 0;
  return Math.round((turnover * (tier.cashbackPercent / 100)));
}
