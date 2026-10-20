/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Game, Provider, Transaction, VIPUserStats, ReferralProgramStats, UserProfile } from './types';
import { SLOT_GAMES } from './data/games';
import { getVIPTierByTurnover, getNextVIPTier, calculateTurnoverProgress } from './data/vip';
import { soundManager } from './utils/audio';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { GameCard } from './components/GameCard';
import { SlotGameEngine } from './components/SlotGameEngine';
import { PaymentModal } from './components/PaymentModal';
import { TransactionsDrawer } from './components/TransactionsDrawer';
import { PromotionModal } from './components/PromotionModal';
import { VIPClubModal } from './components/VIPClubModal';
import { ReferralModal } from './components/ReferralModal';
import { SupportModal } from './components/SupportModal';
import { CasinoMenuBar } from './components/CasinoMenuBar';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { AuthModal } from './components/AuthModal';
import { TopAuthBanner } from './components/TopAuthBanner';
import { FirebaseBackendModal } from './components/FirebaseBackendModal';
import {
  testFirebaseConnection,
  listenAuthState,
  syncUserDataToFirestore,
  fetchUserDataFromFirestore,
  logTransactionToFirestore,
  logSpinToFirestore,
  logOutUser,
  subscribeToJackpot,
  incrementJackpotInFirestore,
  fetchUserTransactionsFromFirestore,
} from './lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  Sparkles,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Crown,
  TrendingUp,
  Gift,
  ChevronRight,
  Users,
  Copy,
  Check,
  Headphones,
  Settings
} from 'lucide-react';

export default function App() {
  // Clean initial profile definition
  const BLANK_PROFILE: UserProfile = {
    id: '',
    username: '',
    fullName: '',
    phone: '',
    email: '',
    balance: 0,
    vipLevel: 1,
    totalDeposit: 0,
    totalWithdraw: 0,
    avatar: '👤',
    defaultBkash: '',
    defaultNagad: '',
    withdrawalPin: '1234',
    joinedDate: '',
  };

  // Automatically purge legacy demo accounts and mock balances from cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('dhaka_slots_user_profile');
      const uid = localStorage.getItem('dhaka_slots_player_uid');
      if (
        cached &&
        (cached.includes('Parag') ||
          cached.includes('DS-784219') ||
          cached.includes('akib') ||
          cached.includes('Demo') ||
          cached.includes('demo') ||
          !uid ||
          uid.startsWith('player_'))
      ) {
        localStorage.removeItem('dhaka_slots_user_profile');
        localStorage.removeItem('dhaka_slots_balance');
        localStorage.removeItem('dhaka_slots_transactions');
        localStorage.removeItem('dhaka_slots_vip_stats');
        localStorage.removeItem('dhaka_slots_referral_stats');
        localStorage.removeItem('dhaka_slots_player_uid');
      }
    } catch {
      // Ignore
    }
  }

  // Local state: strictly 0 balance for unauthenticated users
  const [balance, setBalance] = useState<number>(() => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('dhaka_slots_player_uid') : null;
    if (!uid || uid.startsWith('player_')) return 0;
    const saved = localStorage.getItem('dhaka_slots_balance');
    return saved !== null ? Math.max(0, parseFloat(saved)) : 0;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dhaka_slots_user_profile');
    const uid = typeof window !== 'undefined' ? localStorage.getItem('dhaka_slots_player_uid') : null;
    if (saved && uid && !uid.startsWith('player_')) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.id &&
          parsed.username &&
          !parsed.username.toLowerCase().includes('demo') &&
          parsed.id !== 'DS-784219' &&
          parsed.username !== 'Parag_Player'
        ) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return BLANK_PROFILE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dhaka_slots_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          !parsed.some((t: any) => t.id === 'tx_init_1')
        ) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return [];
  });

  const [claimedBonuses, setClaimedBonuses] = useState<string[]>(() => {
    const saved = localStorage.getItem('dhaka_slots_claimed_bonuses');
    return saved ? JSON.parse(saved) : [];
  });

  // VIP Loyalty State - clean start at Level 1 with 0 turnover
  const [vipStats, setVipStats] = useState<VIPUserStats>(() => {
    const saved = localStorage.getItem('dhaka_slots_vip_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.turnover === 'number' && parsed.turnover !== 35000) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return {
      turnover: 0,
      currentLevel: 1,
      claimedLevelBonuses: [],
      monthlyCashbackClaimed: 0,
    };
  });

  // Referral Program State - clean start
  const [referralStats, setReferralStats] = useState<ReferralProgramStats>(() => {
    const saved = localStorage.getItem('dhaka_slots_referral_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.totalInvited !== 3) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return {
      referralCode: '',
      totalInvited: 0,
      successfulDeposits: 0,
      totalEarned: 0,
      unclaimedBonus: 0,
      friends: [],
    };
  });

  // Navigation & Modal states
  const [selectedProvider, setSelectedProvider] = useState<Provider>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [cashierTab, setCashierTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPromosOpen, setIsPromosOpen] = useState<boolean>(false);
  const [isVIPOpen, setIsVIPOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);
  const [quickCopied, setQuickCopied] = useState<boolean>(false);

  // Favorites stored in local storage and synced with Firebase
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dhaka_slots_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (gameId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      try {
        localStorage.setItem('dhaka_slots_favorites', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save favorites to localStorage', err);
      }
      return next;
    });
  };

  // Firebase connection and authentication state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string>('');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [jackpotAmount, setJackpotAmount] = useState<number>(8888888);

  // Derive current VIP tier
  const currentTier = getVIPTierByTurnover(vipStats.turnover);
  const nextTier = getNextVIPTier(currentTier.level);
  const tierProgress = calculateTurnoverProgress(vipStats.turnover, currentTier, nextTier);

  // Initialize Firebase & verify Firestore connectivity
  useEffect(() => {
    testFirebaseConnection().then((connected) => {
      if (connected) setIsFirebaseConnected(true);
    });

    // Subscribe to global progressive jackpot pool
    const unsubJackpot = subscribeToJackpot((jp) => {
      if (jp && typeof jp.grand === 'number') {
        setJackpotAmount(jp.grand);
      }
    });

    const unsubscribeAuth = listenAuthState(async (user, uid) => {
      setFirebaseUser(user);
      setFirebaseUid(uid);
      setIsFirebaseConnected(true);
      if (uid) {
        try {
          const remoteData = await fetchUserDataFromFirestore(uid);
          if (remoteData) {
            if (typeof remoteData.balance === 'number') {
              setBalance(remoteData.balance);
            }
            if (Array.isArray(remoteData.favorites) && remoteData.favorites.length > 0) {
              setFavorites(remoteData.favorites);
            }
            if (remoteData.displayName) {
              setProfile((prev) => ({
                ...prev,
                username: remoteData.displayName,
                fullName: remoteData.displayName,
                email: remoteData.email || prev.email,
                phone: remoteData.phoneNumber || prev.phone,
              }));
            }
          } else {
            await syncUserDataToFirestore(uid, {
              balance,
              vipPoints: vipStats.turnover,
              displayName: profile.fullName,
              phoneNumber: profile.phone,
              favorites,
            });
          }

          // Fetch user transactions from Firestore
          const remoteTxs = await fetchUserTransactionsFromFirestore(uid);
          if (remoteTxs && remoteTxs.length > 0) {
            setTransactions(remoteTxs);
          }
        } catch (err) {
          console.warn('[Firebase] Initial sync notice:', err);
        }
      }
    });

    return () => {
      unsubJackpot();
      unsubscribeAuth();
    };
  }, []);

  // Check if player has an active authenticated account
  const isAuthenticated = Boolean(
    (firebaseUser && !firebaseUser.isAnonymous) ||
    (firebaseUid && !firebaseUid.startsWith('player_')) ||
    (profile.id && profile.username && !profile.username.toLowerCase().includes('demo') && profile.id !== 'DS-784219' && profile.username !== 'Parag_Player')
  );

  // Auth Success Handler: registered or signed in users start with clean 0 balance (or remote balance)
  const handleAuthSuccess = async (uid: string, username: string) => {
    setFirebaseUid(uid);
    setIsFirebaseConnected(true);
    localStorage.setItem('dhaka_slots_player_uid', uid);

    try {
      const remote = await fetchUserDataFromFirestore(uid);
      if (remote) {
        const userBal = typeof remote.balance === 'number' ? remote.balance : 0;
        setBalance(userBal);
        localStorage.setItem('dhaka_slots_balance', userBal.toString());
        if (Array.isArray(remote.favorites)) setFavorites(remote.favorites);
        const remoteProf: UserProfile = {
          id: uid,
          username: remote.displayName || username || 'VIP_Player',
          fullName: remote.displayName || username || 'VIP Player',
          phone: remote.phoneNumber || '',
          email: remote.email || '',
          balance: userBal,
          vipLevel: 1,
          totalDeposit: 0,
          totalWithdraw: 0,
          avatar: '👑',
          defaultBkash: remote.phoneNumber || '',
          defaultNagad: remote.phoneNumber || '',
          withdrawalPin: '1234',
          joinedDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
        };
        setProfile(remoteProf);
        localStorage.setItem('dhaka_slots_user_profile', JSON.stringify(remoteProf));
      } else {
        const newProf: UserProfile = {
          id: uid,
          username: username || 'VIP_Player',
          fullName: username || 'VIP Player',
          phone: '',
          email: `${username
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')}@dhakaslots.vip`,
          balance: 0,
          vipLevel: 1,
          totalDeposit: 0,
          totalWithdraw: 0,
          avatar: '👑',
          defaultBkash: '',
          defaultNagad: '',
          withdrawalPin: '1234',
          joinedDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
        };
        setBalance(0);
        setProfile(newProf);
        localStorage.setItem('dhaka_slots_user_profile', JSON.stringify(newProf));
        localStorage.setItem('dhaka_slots_balance', '0');
        await syncUserDataToFirestore(uid, {
          balance: 0,
          vipPoints: 0,
          displayName: newProf.fullName,
          email: newProf.email,
        });
      }
      const remoteTxs = await fetchUserTransactionsFromFirestore(uid);
      setTransactions(remoteTxs || []);
    } catch (err) {
      console.warn('[Firebase] Auth success sync issue:', err);
    }
  };

  // Sign Out Handler: thoroughly reset to fresh clean unauthenticated state
  const handleSignOut = async () => {
    soundManager.playClick();
    await logOutUser();
    setFirebaseUser(null);
    setFirebaseUid('');
    setBalance(0);
    setProfile(BLANK_PROFILE);
    setTransactions([]);
    setVipStats({
      turnover: 0,
      currentLevel: 1,
      claimedLevelBonuses: [],
      monthlyCashbackClaimed: 0,
    });
    localStorage.removeItem('dhaka_slots_player_uid');
    localStorage.removeItem('dhaka_slots_user_profile');
    localStorage.removeItem('dhaka_slots_balance');
    localStorage.removeItem('dhaka_slots_transactions');
    localStorage.removeItem('dhaka_slots_vip_stats');
  };

  // Sync player profile, balance & favorites to Firebase Firestore
  useEffect(() => {
    if (firebaseUid) {
      syncUserDataToFirestore(firebaseUid, {
        balance,
        vipPoints: vipStats.turnover,
        displayName: profile.fullName,
        phoneNumber: profile.phone,
        favorites,
      });
    }
  }, [balance, vipStats.turnover, favorites, firebaseUid, profile.fullName, profile.phone]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('dhaka_slots_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('dhaka_slots_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('dhaka_slots_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dhaka_slots_claimed_bonuses', JSON.stringify(claimedBonuses));
  }, [claimedBonuses]);

  useEffect(() => {
    localStorage.setItem('dhaka_slots_vip_stats', JSON.stringify(vipStats));
  }, [vipStats]);

  useEffect(() => {
    localStorage.setItem('dhaka_slots_referral_stats', JSON.stringify(referralStats));
  }, [referralStats]);

  // Balance Update Handler (accumulates wagering turnover for VIP level)
  const handleUpdateBalance = (
    newBalance: number,
    delta: number,
    type: 'bet' | 'win',
    details?: string
  ) => {
    setBalance(newBalance);

    if (Math.abs(delta) > 0) {
      const newTx: Transaction = {
        id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 5),
        type,
        amount: Math.abs(delta),
        status: 'completed',
        timestamp: Date.now(),
        gameTitle: details,
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);

      // Log spin outcome to Firestore
      if (firebaseUid) {
        logSpinToFirestore(firebaseUid, {
          gameId: selectedGame?.id || 'slot-game',
          gameTitle: details || selectedGame?.title || 'Slot Machine',
          betAmount: type === 'bet' ? Math.abs(delta) : 0,
          winAmount: type === 'win' ? Math.abs(delta) : 0,
        });
      }
    }

    // Accumulate wagering volume toward VIP tier & increment community jackpot
    if (type === 'bet') {
      const wagerAmt = Math.abs(delta);
      incrementJackpotInFirestore(wagerAmt);
      setVipStats((prev) => {
        const newTurnover = prev.turnover + wagerAmt;
        const newTier = getVIPTierByTurnover(newTurnover);
        return {
          ...prev,
          turnover: newTurnover,
          currentLevel: newTier.level,
        };
      });
    }
  };

  // Deposit Success Handler
  const handleDepositSuccess = (amount: number, newTx: Transaction) => {
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [newTx, ...prev]);
    setProfile((prev) => ({
      ...prev,
      totalDeposit: prev.totalDeposit + amount,
    }));

    if (firebaseUid) {
      logTransactionToFirestore(firebaseUid, newTx);
    }
  };

  // Withdraw Success Handler
  const handleWithdrawSuccess = (amount: number, newTx: Transaction) => {
    setBalance((prev) => Math.max(0, prev - amount));
    setTransactions((prev) => [newTx, ...prev]);
    setProfile((prev) => ({
      ...prev,
      totalWithdraw: prev.totalWithdraw + amount,
    }));

    if (firebaseUid) {
      logTransactionToFirestore(firebaseUid, newTx);
    }

    // Simulate completion after 20 seconds
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === newTx.id ? { ...t, status: 'completed' } : t))
      );
    }, 20000);
  };

  // Claim Promotion Bonus
  const handleClaimBonus = (amount: number, bonusName: string) => {
    setBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: 'tx_bonus_' + Date.now(),
      type: 'win',
      amount,
      status: 'completed',
      timestamp: Date.now(),
      gameTitle: `Bonus: ${bonusName}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setClaimedBonuses((prev) => [...prev, bonusName]);
  };

  // Claim VIP Monthly Cashback
  const handleClaimCashback = (amount: number) => {
    setBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: 'tx_vip_cashback_' + Date.now(),
      type: 'win',
      amount,
      status: 'completed',
      timestamp: Date.now(),
      gameTitle: `VIP ${currentTier.name} Monthly Cashback (${currentTier.cashbackPercent}%)`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setVipStats((prev) => ({
      ...prev,
      monthlyCashbackClaimed: Date.now(),
    }));
  };

  // Claim VIP Level-Up Bonus
  const handleClaimLevelBonus = (level: number, amount: number) => {
    setBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: 'tx_vip_levelup_' + Date.now(),
      type: 'win',
      amount,
      status: 'completed',
      timestamp: Date.now(),
      gameTitle: `VIP ${currentTier.name} Level-Up Reward`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setVipStats((prev) => ({
      ...prev,
      claimedLevelBonuses: [...prev.claimedLevelBonuses, level],
    }));
  };

  // Claim Referral Commission Reward
  const handleClaimReferralReward = (amount: number, friendId?: string) => {
    setBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: 'tx_ref_' + Date.now(),
      type: 'win',
      amount,
      status: 'completed',
      timestamp: Date.now(),
      gameTitle: 'Referral Invite Bonus (1st Deposit Reward)',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setReferralStats((prev) => {
      const updatedFriends = prev.friends.map((f) => {
        if (friendId) {
          return f.id === friendId ? { ...f, claimed: true } : f;
        }
        return f.status === 'completed' ? { ...f, claimed: true } : f;
      });

      return {
        ...prev,
        totalEarned: prev.totalEarned + amount,
        unclaimedBonus: Math.max(0, prev.unclaimedBonus - amount),
        friends: updatedFriends,
      };
    });
  };

  // Simulate friend sign-up and deposit
  const handleSimulateFriendDeposit = (phone: string, depositAmount: number) => {
    const maskedPhone = phone.length >= 11 ? `${phone.substring(0, 3)}***${phone.substring(7)}` : `017***${Math.floor(1000 + Math.random() * 9000)}`;
    const newFriend = {
      id: 'ref_' + Date.now(),
      phone: maskedPhone,
      registeredAt: Date.now(),
      firstDepositAmount: depositAmount,
      status: 'completed' as const,
      rewardAmount: 250,
      claimed: false,
    };

    setReferralStats((prev) => ({
      ...prev,
      totalInvited: prev.totalInvited + 1,
      successfulDeposits: prev.successfulDeposits + 1,
      unclaimedBonus: prev.unclaimedBonus + 250,
      friends: [newFriend, ...prev.friends],
    }));
  };

  // Quick Copy Invite Link from Lobby
  const handleQuickCopyLink = () => {
    soundManager.playClick();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dhakaslots.com';
    navigator.clipboard.writeText(`${origin}/?ref=${referralStats.referralCode}`);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2000);
  };

  // Sound Toggle
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };


  // Filtered games
  const filteredGames = SLOT_GAMES.filter((g) => {
    if (selectedCategory === 'FAVORITES') {
      const matchesSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());
      return favorites.includes(g.id) && matchesSearch;
    }

    const matchesProvider = selectedProvider === 'ALL' || g.provider === selectedProvider;
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Bar Navigation with Menu Toggle & Account Settings */}
      <Navbar
        balance={balance}
        profile={profile}
        currentTier={currentTier}
        selectedProvider={selectedProvider}
        isAuthenticated={isAuthenticated}
        onSelectProvider={(p) => {
          setSelectedGame(null);
          setSelectedCategory('ALL');
          setSelectedProvider(p);
        }}
        onOpenDeposit={() => {
          setCashierTab('deposit');
          setIsCashierOpen(true);
        }}
        onOpenWithdraw={() => {
          setCashierTab('withdraw');
          setIsCashierOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPromos={() => setIsPromosOpen(true)}
        onOpenVIP={() => setIsVIPOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onSignOut={handleSignOut}
        firebaseUser={firebaseUser}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {selectedGame ? (
          /* Active Slot Machine View */
          <SlotGameEngine
            game={selectedGame}
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onBackToLobby={() => setSelectedGame(null)}
            onOpenDeposit={() => {
              setCashierTab('deposit');
              setIsCashierOpen(true);
            }}
          />
        ) : (
          /* Casino Lobby View */
          <>
            {/* Top of Homepage: Prominent Player Login / Registration / Own Account Status Banner */}
            <TopAuthBanner
              isAuthenticated={isAuthenticated}
              profile={profile}
              balance={balance}
              currentTier={currentTier}
              isFirebaseConnected={isFirebaseConnected}
              onOpenAuth={(mode) => {
                setAuthModalMode(mode || 'login');
                setIsAuthOpen(true);
              }}
              onOpenBackendModal={() => setIsBackendModalOpen(true)}
              onOpenDeposit={() => {
                setCashierTab('deposit');
                setIsCashierOpen(true);
              }}
              onOpenWithdraw={() => {
                setCashierTab('withdraw');
                setIsCashierOpen(true);
              }}
              onSignOut={handleSignOut}
              onAuthSuccess={handleAuthSuccess}
            />

            {/* Dedicated Casino Category & Provider Menu Bar with Settings */}
            <CasinoMenuBar
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              favoriteCount={favorites.length}
              onOpenDeposit={() => {
                setCashierTab('deposit');
                setIsCashierOpen(true);
              }}
              onOpenVIP={() => setIsVIPOpen(true)}
              onOpenReferral={() => setIsReferralOpen(true)}
              onOpenPromos={() => setIsPromosOpen(true)}
              onOpenSupport={() => setIsSupportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Hero Showcase with Progressive Jackpot */}
            <HeroBanner
              isAuthenticated={isAuthenticated}
              onOpenDeposit={() => {
                setCashierTab('deposit');
                setIsCashierOpen(true);
              }}
              onOpenRegister={() => {
                setAuthModalMode('register');
                setIsAuthOpen(true);
              }}
              onOpenLogin={() => {
                setAuthModalMode('login');
                setIsAuthOpen(true);
              }}
              onPlayFeatured={() => {
                setSelectedProvider('ALL');
                setSelectedCategory('ALL');
              }}
            />

            {/* Games Grid Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
                    <span>
                      {selectedCategory === 'FAVORITES'
                        ? '⭐ My Favorite Slots'
                        : selectedCategory !== 'ALL'
                        ? `${selectedCategory}s`
                        : selectedProvider === 'ALL'
                        ? 'Featured Slot Machines'
                        : `${selectedProvider} Gaming Slots`}
                    </span>
                    {selectedCategory === 'FAVORITES' && (
                      <span className="text-xs font-mono-num font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {filteredGames.length}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{filteredGames.length} Verified Titles</span>
                    <span aria-hidden="true">·</span>
                    <span>97%+ Certified RTP</span>
                    <span aria-hidden="true">·</span>
                    <span>Instant Payouts</span>
                  </div>
                </div>
              </div>

              {filteredGames.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-slate-400">
                  {selectedCategory === 'FAVORITES' ? (
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        ⭐
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">No Favorite Slots Saved</h3>
                      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                        Tap the star icon on any slot machine card to save it here for fast 1-click access anytime.
                      </p>
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedCategory('ALL');
                          setSelectedProvider('ALL');
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md"
                      >
                        Browse All Slots
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">No slot games match your filter "{searchQuery || selectedCategory}".</p>
                      <button
                        onClick={() => {
                          setSelectedProvider('ALL');
                          setSelectedCategory('ALL');
                          setSearchQuery('');
                        }}
                        className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-lg transition-colors"
                      >
                        Reset Filter
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onPlay={(g) => {
                        setSelectedGame(g);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* bKash & Nagad Payment Assurance Strip */}
            <section className="mb-12 rounded-3xl bg-neutral-950/90 border border-neutral-800/80 p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    BANGLADESH OFFICIAL PAYMENT GATEWAY
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Fast & Secure Deposits via <span className="text-[#e2136e]">bKash</span> & <span className="text-[#f26522]">Nagad</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Enjoy seamless, automatic balance crediting 24/7. Simply send money to our verified merchant or personal agent numbers and paste your transaction ID (TrxID) for instant deposit.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setCashierTab('deposit');
                        setIsCashierOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all shadow-md flex items-center gap-2"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      Deposit Now (৳100 - ৳100,000)
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setCashierTab('withdraw');
                        setIsCashierOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      Instant Withdrawal ({currentTier.name} VIP: Max ৳{currentTier.singleWithdrawalLimit.toLocaleString()})
                    </button>
                  </div>
                </div>

                {/* Visual Payment Channel Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#e2136e]/10 border border-[#e2136e]/30 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#e2136e] flex items-center justify-center text-white font-black text-lg mb-3 shadow-md">
                        bK
                      </div>
                      <h4 className="font-bold text-white text-base">bKash Personal / Agent</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Instant TrxID verification. 0% gateway deposit and withdrawal fees.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#e2136e]/20 text-[11px] text-pink-300 font-mono-num font-semibold">
                      Speed: Instant · 24/7
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f26522]/10 border border-[#f26522]/30 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#f26522] flex items-center justify-center text-white font-black text-lg mb-3 shadow-md">
                        NG
                      </div>
                      <h4 className="font-bold text-white text-base">Nagad Personal / Agent</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Fast Bangladesh Post Office digital wallet with zero charges.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#f26522]/20 text-[11px] text-orange-300 font-mono-num font-semibold">
                      Speed: Instant · 24/7
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* VIP Loyalty Programme & Referral Programme (Bottom of the Page) */}
            <section className="mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Crown className="w-4 h-4 text-amber-400" />
                    EXCLUSIVE REWARDS & COMMUNITY
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    VIP Loyalty & Referral Programs
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accumulate turnover for monthly cashbacks and higher daily withdrawal limits, or invite friends to earn instant cash rewards.
                  </p>
                </div>
              </div>

              {/* Twin Rewards Grid: VIP Loyalty Strip & Referral Invite Strip */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. VIP Loyalty Banner Strip */}
                <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/90 border border-amber-500/30 flex flex-col justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-md shrink-0">
                      <Crown className="w-6 h-6 fill-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">VIP Loyalty Program</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${currentTier.badgeColor}`}>
                          {currentTier.title}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Cashback: <span className="text-emerald-400 font-bold">{currentTier.cashbackPercent}%</span>
                        <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
                        Cashout: <span className="text-amber-300 font-mono-num font-bold">৳{currentTier.dailyWithdrawalLimit.toLocaleString()}/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono-num">
                        <span>Wagered: ৳{vipStats.turnover.toLocaleString()}</span>
                        {nextTier && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{tierProgress.percent}% to {nextTier.name} (৳{tierProgress.remaining.toLocaleString()} left)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] text-slate-400">Turnover accumulates automatically with every spin</span>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setIsVIPOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      VIP Club
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Referral Invite & Earn Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/90 border border-emerald-500/30 flex flex-col justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black shadow-md shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Invite & Earn (রেফারেল)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono-num">
                          Code: {referralStats.referralCode}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Reward: <span className="text-emerald-400 font-bold">৳250 Cash per Friend</span>
                        <span className="mx-2 text-slate-600" aria-hidden="true">·</span>
                        Friend gets: <span className="text-amber-300 font-bold">৳100 Free Bet</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono-num">
                        <span>Invited: {referralStats.totalInvited}</span>
                        <span aria-hidden="true">·</span>
                        <span>Earned: ৳{referralStats.totalEarned.toLocaleString()}</span>
                        {referralStats.unclaimedBonus > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-400 font-bold">৳{referralStats.unclaimedBonus} Ready to Claim!</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 gap-2">
                    <button
                      onClick={handleQuickCopyLink}
                      className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800"
                    >
                      {quickCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {quickCopied ? 'Link Copied!' : 'Copy Invite Link'}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setIsReferralOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Manage Referrals
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>


      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 px-4 sm:px-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-amber-500/40 shrink-0 shadow-sm bg-neutral-900">
              <img
                src="/images/dhakaslots_logo_crest_1792258104215.jpg"
                alt="DhakaSlots Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-extrabold text-white text-sm">
              DHAKA<span className="text-amber-400">SLOTS</span>
            </span>
            <span>·</span>
            <span>Licensed Online Casino & Slot Games Portal</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Account Settings
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              24/7 Agent Support
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthOpen(true);
              }}
              className="hover:text-amber-400 text-amber-300 font-semibold transition-colors"
            >
              Player Log In / Register
            </button>
            <span>·</span>
            <span>bKash & Nagad Verified Merchant</span>
            <span>·</span>
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer p-1 rounded-lg hover:bg-neutral-800"
              title="Open Firebase Console & Live Backend Diagnostics"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' : 'bg-amber-400 animate-pulse'}`} />
              <span className={isFirebaseConnected ? 'text-emerald-400/90 font-medium' : 'text-amber-400'}>
                {isFirebaseConnected ? 'Firebase Console & Backend Hub' : 'Firebase Connecting...'}
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* Cashier Payment Modal */}
      <PaymentModal
        isOpen={isCashierOpen}
        initialTab={cashierTab}
        onClose={() => setIsCashierOpen(false)}
        balance={balance}
        currentTier={currentTier}
        onOpenVIP={() => setIsVIPOpen(true)}
        onDepositSuccess={handleDepositSuccess}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        currentTier={currentTier}
        onUpdateProfile={setProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFirebaseConnected={isFirebaseConnected}
        firebaseUserId={firebaseUid || firebaseUser?.uid}
        firebaseUser={firebaseUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* VIP Club Modal */}
      <VIPClubModal
        isOpen={isVIPOpen}
        onClose={() => setIsVIPOpen(false)}
        currentTier={currentTier}
        vipStats={vipStats}
        onClaimCashback={handleClaimCashback}
        onClaimLevelBonus={handleClaimLevelBonus}
        onOpenDeposit={() => {
          setCashierTab('deposit');
          setIsCashierOpen(true);
        }}
      />

      {/* Referral Program Modal */}
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        stats={referralStats}
        onClaimReward={handleClaimReferralReward}
        onSimulateFriendDeposit={handleSimulateFriendDeposit}
      />

      {/* 24/7 Live Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onOpenDeposit={() => {
          setCashierTab('deposit');
          setIsCashierOpen(true);
        }}
      />

      {/* Transaction History Drawer */}
      <TransactionsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
      />

      {/* Promotions Modal */}
      <PromotionModal
        isOpen={isPromosOpen}
        onClose={() => setIsPromosOpen(false)}
        onClaimBonus={handleClaimBonus}
        claimedBonuses={claimedBonuses}
        onOpenDeposit={() => {
          setCashierTab('deposit');
          setIsCashierOpen(true);
        }}
      />

      {/* Authentication Modal (Log In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Firebase Console & Live Backend Hub Modal */}
      <FirebaseBackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        currentUid={firebaseUid}
      />
    </div>
  );
}
