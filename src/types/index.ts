export type Provider = 'ALL' | 'JILI' | 'FC' | 'JDB';

export type PaymentMethod = 'bkash' | 'nagad';

export interface SlotSymbol {
  id: string;
  name: string;
  symbol: string;
  multiplier3: number;
  multiplier4?: number;
  multiplier5?: number;
  color: string;
  isWild?: boolean;
  isScatter?: boolean;
  isBonus?: boolean;
}

export interface Game {
  id: string;
  title: string;
  provider: 'JILI' | 'FC' | 'JDB';
  category: 'Video Slot' | 'Classic Slot' | 'Cascade Multiplier' | 'Jackpot Slot';
  reels: number;
  rows: number;
  paylines: number;
  rtp: string;
  volatility: 'Low' | 'Medium' | 'High' | 'Very High';
  minBet: number;
  maxBet: number;
  image: string;
  features: string[];
  description: string;
  symbols: SlotSymbol[];
  specialFeatureName: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  method?: PaymentMethod;
  amount: number;
  fee?: number;
  netAmount?: number;
  status: 'completed' | 'processing' | 'failed';
  timestamp: number;
  trxId?: string;
  accountNumber?: string;
  gameTitle?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  balance: number;
  vipLevel: number;
  totalDeposit: number;
  totalWithdraw: number;
  avatar: string;
  defaultBkash: string;
  defaultNagad: string;
  withdrawalPin: string;
  joinedDate: string;
}

export interface VIPTier {
  level: number;
  name: string;
  title: string;
  minTurnover: number;
  cashbackPercent: number; // Monthly cashback percentage
  dailyWithdrawalLimit: number; // Max daily total withdrawal in BDT
  singleWithdrawalLimit: number; // Max single transaction withdrawal in BDT
  dailyWithdrawCount: number; // Number of withdrawals per day
  levelUpBonus: number; // Instant cash bonus when reaching level
  perks: string[];
  badgeColor: string;
  accentGradient: string;
}

export interface VIPUserStats {
  turnover: number; // Total wagering volume
  currentLevel: number;
  claimedLevelBonuses: number[]; // Array of level numbers claimed
  monthlyCashbackClaimed: number; // Timestamp of last claimed cashback
}

export interface ReferralFriend {
  id: string;
  phone: string;
  registeredAt: number;
  firstDepositAmount: number;
  status: 'completed' | 'pending';
  rewardAmount: number;
  claimed: boolean;
}

export interface ReferralProgramStats {
  referralCode: string;
  totalInvited: number;
  successfulDeposits: number;
  totalEarned: number;
  unclaimedBonus: number;
  friends: ReferralFriend[];
}


