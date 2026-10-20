import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game, SlotSymbol } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Info,
  ChevronLeft,
  Sparkles,
  Trophy,
  Plus,
  Minus,
  Coins
} from 'lucide-react';

interface SlotGameEngineProps {
  game: Game;
  balance: number;
  onUpdateBalance: (newBalance: number, delta: number, type: 'bet' | 'win', details?: string) => void;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
}

export const SlotGameEngine: React.FC<SlotGameEngineProps> = ({
  game,
  balance,
  onUpdateBalance,
  onBackToLobby,
  onOpenDeposit,
}) => {
  const isFortuneGems = game.id === 'jili-fortune-gems';
  const isSuperAce = game.id === 'jili-super-ace';
  const numReels = isFortuneGems ? 3 : 5;
  const numRows = 3;

  // Selected bet
  const [bet, setBet] = useState<number>(Math.max(game.minBet, 20));
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);

  // Multiplier feature for Super Ace / Fortune Gems
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [fortuneMultiplierReel, setFortuneMultiplierReel] = useState<number>(1);

  // Free spins mode
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);
  const isFreeSpin = freeSpinsRemaining > 0;

  // Win stats
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('');
  const [winningCells, setWinningCells] = useState<{ reel: number; row: number }[]>([]);
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; title: string; amount: number } | null>(null);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  // Reel stopping state
  const [reelsStopped, setReelsStopped] = useState<boolean[]>(Array(numReels).fill(true));

  // Current symbols displayed on grid [reelIndex][rowIndex]
  const [grid, setGrid] = useState<SlotSymbol[][]>(() => {
    return Array.from({ length: numReels }, () =>
      Array.from({ length: numRows }, () => {
        const randIdx = Math.floor(Math.random() * game.symbols.length);
        return game.symbols[randIdx];
      })
    );
  });

  const autoSpinRef = useRef<number>(autoSpinCount);
  autoSpinRef.current = autoSpinCount;

  const isSpinningRef = useRef<boolean>(isSpinning);
  isSpinningRef.current = isSpinning;

  // Sound toggle
  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Adjust bet
  const increaseBet = () => {
    soundManager.playClick();
    const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    const next = steps.find((s) => s > bet && s <= game.maxBet);
    if (next) setBet(next);
  };

  const decreaseBet = () => {
    soundManager.playClick();
    const steps = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10];
    const prev = steps.find((s) => s < bet && s >= game.minBet);
    if (prev) setBet(prev);
  };

  const setMaxBet = () => {
    soundManager.playClick();
    setBet(game.maxBet);
  };

  // Core Spin Logic
  const handleSpin = useCallback(() => {
    if (isSpinningRef.current) return;

    // Check balance if not in free spin mode - reject spin on insufficient credits
    const isFreeSpin = freeSpinsRemaining > 0;
    if (!isFreeSpin && balance < bet) {
      soundManager.playClick();
      setWinMessage('অপর্যাপ্ত ব্যালেন্স! স্পিন প্রত্যাখ্যাত হয়েছে। অনুগ্রহ করে bKash বা Nagad দিয়ে ডিপোজিট করুন। (Insufficient credits: Spin rejected.)');
      setAutoSpinCount(0);
      return;
    }

    setIsSpinning(true);
    setWinningCells([]);
    setWinMessage('');
    setShowCelebration(null);
    setReelsStopped(Array(numReels).fill(false));

    if (!isFreeSpin) {
      // Deduct bet from balance
      onUpdateBalance(balance - bet, -bet, 'bet', `Bet on ${game.title}`);
    } else {
      setFreeSpinsRemaining((prev) => prev - 1);
    }

    soundManager.playSpinSound();

    // Prepare outcome grid
    const newGrid: SlotSymbol[][] = [];
    for (let r = 0; r < numReels; r++) {
      const reelCol: SlotSymbol[] = [];
      for (let row = 0; row < numRows; row++) {
        // Weighted symbol pick: favor lower symbols slightly for realistic casino volatility
        const rand = Math.random();
        let picked: SlotSymbol;
        if (rand < 0.08) {
          // Wild or Scatter
          const specialSymbols = game.symbols.filter((s) => s.isWild || s.isScatter);
          picked = specialSymbols[Math.floor(Math.random() * specialSymbols.length)] || game.symbols[0];
        } else if (rand < 0.40) {
          // High paying symbols
          const highPaying = game.symbols.slice(0, 3);
          picked = highPaying[Math.floor(Math.random() * highPaying.length)];
        } else {
          // Normal symbols
          const normalSymbols = game.symbols.slice(3);
          picked = normalSymbols[Math.floor(Math.random() * normalSymbols.length)] || game.symbols[0];
        }
        reelCol.push(picked);
      }
      newGrid.push(reelCol);
    }

    // Fortune Gems 4th Multiplier Wheel
    const fortuneMultipliers = [1, 1, 2, 2, 3, 5, 10, 15];
    const pickedFortuneMultiplier = fortuneMultipliers[Math.floor(Math.random() * fortuneMultipliers.length)];

    // Staggered reel stop timing
    const baseDelay = isTurbo ? 200 : 380;
    const stagger = isTurbo ? 120 : 250;

    for (let i = 0; i < numReels; i++) {
      setTimeout(() => {
        setReelsStopped((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        soundManager.playReelStop(i);
      }, baseDelay + i * stagger);
    }

    // Total time until all reels stop
    const totalSpinTime = baseDelay + numReels * stagger + (isTurbo ? 80 : 150);

    setTimeout(() => {
      setGrid(newGrid);
      setFortuneMultiplierReel(pickedFortuneMultiplier);

      // Evaluate Win
      evaluateOutcome(newGrid, pickedFortuneMultiplier, isFreeSpin);
      setIsSpinning(false);
    }, totalSpinTime);
  }, [balance, bet, freeSpinsRemaining, game, isTurbo, numReels, numRows, onUpdateBalance]);

  // Evaluate payouts
  const evaluateOutcome = (
    currentGrid: SlotSymbol[][],
    fortuneMult: number,
    isFreeSpin: boolean
  ) => {
    let totalWinMultiplier = 0;
    const winningHits: { reel: number; row: number }[] = [];

    // Standard paylines to test:
    // Line 0: Middle [r][1]
    // Line 1: Top [r][0]
    // Line 2: Bottom [r][2]
    // Line 3: V shape [0][0], [1][1], [2][2], [3][1], [4][0]
    // Line 4: Inverted V [0][2], [1][1], [2][0], [3][1], [4][2]

    const paylinePatterns = [
      [1, 1, 1, 1, 1], // Center
      [0, 0, 0, 0, 0], // Top
      [2, 2, 2, 2, 2], // Bottom
      [0, 1, 2, 1, 0], // V-shape
      [2, 1, 0, 1, 2], // Inverted V
    ];

    paylinePatterns.forEach((pattern) => {
      const lineSymbols = pattern.slice(0, numReels).map((rowIdx, reelIdx) => ({
        symbol: currentGrid[reelIdx][rowIdx],
        reel: reelIdx,
        row: rowIdx,
      }));

      // Check for match from left to right
      const first = lineSymbols[0].symbol;
      let matchCount = 1;

      for (let i = 1; i < lineSymbols.length; i++) {
        const curr = lineSymbols[i].symbol;
        if (curr.id === first.id || curr.isWild || first.isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      // Check if match qualifies for payout
      if (matchCount >= 3) {
        const scoringSymbol = first.isWild ? lineSymbols.find((s) => !s.symbol.isWild)?.symbol || first : first;
        let lineMult = 0;
        if (matchCount === 3) lineMult = scoringSymbol.multiplier3;
        if (matchCount === 4 && scoringSymbol.multiplier4) lineMult = scoringSymbol.multiplier4;
        if (matchCount >= 5 && scoringSymbol.multiplier5) lineMult = scoringSymbol.multiplier5;

        if (lineMult > 0) {
          totalWinMultiplier += lineMult;
          for (let m = 0; m < matchCount; m++) {
            winningHits.push({ reel: lineSymbols[m].reel, row: lineSymbols[m].row });
          }
        }
      }
    });

    // Check Scatter symbols for Free Spins trigger
    let scatterCount = 0;
    currentGrid.forEach((col, rIdx) => {
      col.forEach((sym, rowIdx) => {
        if (sym.isScatter) {
          scatterCount++;
          winningHits.push({ reel: rIdx, row: rowIdx });
        }
      });
    });

    // Bonus / Multiplier calculations
    let multiplierBonus = 1;
    if (isFortuneGems) {
      multiplierBonus = fortuneMult;
    } else if (isSuperAce) {
      if (totalWinMultiplier > 0) {
        const nextCombo = comboMultiplier === 1 ? 2 : comboMultiplier === 2 ? 3 : comboMultiplier === 3 ? 5 : 10;
        setComboMultiplier(nextCombo);
        multiplierBonus = comboMultiplier;
      } else {
        setComboMultiplier(1);
      }
    }

    const finalPayout = Math.round(bet * totalWinMultiplier * multiplierBonus);

    // Free Spins Award (3 or more scatters)
    if (scatterCount >= 3) {
      const freeSpinsAwarded = 10;
      setFreeSpinsRemaining((prev) => prev + freeSpinsAwarded);
      soundManager.playJackpotSound();
      setWinMessage(`🎉 BONUS TRIGGERED! ${freeSpinsAwarded} FREE SPINS AWARDED!`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    if (finalPayout > 0) {
      setLastWin(finalPayout);
      setWinningCells(winningHits);
      soundManager.playWinChime(totalWinMultiplier * multiplierBonus);

      if (isFreeSpin) {
        setFreeSpinsTotalWon((prev) => prev + finalPayout);
      }

      // Credit winnings to balance
      onUpdateBalance(balance + finalPayout, finalPayout, 'win', `Won on ${game.title}`);

      // Big Win Tiers
      const winRatio = finalPayout / bet;
      if (winRatio >= 25) {
        setShowCelebration({ show: true, title: 'SUPER MEGA WIN!', amount: finalPayout });
        soundManager.playJackpotSound();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } else if (winRatio >= 10) {
        setShowCelebration({ show: true, title: 'MEGA WIN!', amount: finalPayout });
        soundManager.playJackpotSound();
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } });
      } else if (winRatio >= 5) {
        setShowCelebration({ show: true, title: 'BIG WIN!', amount: finalPayout });
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      } else {
        setWinMessage(`WIN ৳${finalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}!`);
      }
    } else {
      setLastWin(0);
      setWinningCells([]);
    }
  };

  // Auto spin lifecycle loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpinCount > 0 && !isSpinning) {
      if (balance < bet && freeSpinsRemaining <= 0) {
        setAutoSpinCount(0);
        setWinMessage('অপর্যাপ্ত ব্যালেন্স! অটো-স্পিন বন্ধ করা হয়েছে। (Auto-spin stopped: Insufficient balance)');
        return;
      }
      timer = setTimeout(() => {
        setAutoSpinCount((prev) => Math.max(0, prev - 1));
        handleSpin();
      }, isTurbo ? 600 : 1200);
    }
    return () => clearTimeout(timer);
  }, [autoSpinCount, isSpinning, handleSpin, isTurbo, balance, bet, freeSpinsRemaining]);

  // Free spins loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (freeSpinsRemaining > 0 && !isSpinning && autoSpinCount === 0) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [freeSpinsRemaining, isSpinning, handleSpin, autoSpinCount]);

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-3 sm:p-6 max-w-6xl mx-auto">
      {/* Top Game Bar Contract */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-200 bg-neutral-900/90 border border-amber-500/30 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Lobby
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{game.title}</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {game.provider}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{game.paylines} Ways</span>
              <span>·</span>
              <span>RTP {game.rtp}</span>
              <span>·</span>
              <span>{game.volatility} Volatility</span>
            </div>
          </div>
        </div>

        {/* Balance & Settings */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-neutral-900/95 border border-amber-500/40 rounded-lg flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Balance</div>
              <div className="text-sm font-mono-num font-bold text-amber-300">
                ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDeposit}
            className="px-3 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm"
          >
            + Deposit
          </button>

          <button
            onClick={() => setShowPaytable(true)}
            className="p-2 text-slate-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700"
            title="Paytable & Rules"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2 text-slate-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Slot Cabinet Area */}
      <div className="relative my-4 flex-1 flex flex-col justify-center items-center">
        {/* Free Spins Alert Banner */}
        {freeSpinsRemaining > 0 && (
          <div className="mb-3 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 border border-pink-500/50 flex items-center gap-4 text-pink-200 animate-pulse shadow-lg">
            <Sparkles className="w-5 h-5 text-pink-300" />
            <span className="font-bold text-sm tracking-wide">
              FREE SPINS MODE: <span className="text-white text-base font-extrabold">{freeSpinsRemaining}</span> SPINS LEFT
            </span>
            <span className="text-xs font-mono-num text-pink-300">
              Won: ৳{freeSpinsTotalWon.toLocaleString()}
            </span>
          </div>
        )}

        {/* Super Ace Multiplier Ladder Bar */}
        {isSuperAce && (
          <div className="w-full max-w-2xl mb-3 p-2 bg-neutral-950/80 border border-amber-500/30 rounded-xl flex items-center justify-between gap-1 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] px-2">Combo Meter:</span>
            {[1, 2, 3, 5, 10].map((mult) => (
              <div
                key={mult}
                className={`flex-1 text-center py-1 rounded font-bold transition-all ${
                  comboMultiplier === mult
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md scale-105'
                    : 'bg-neutral-900 text-slate-400 border border-neutral-800'
                }`}
              >
                x{mult}
              </div>
            ))}
          </div>
        )}

        {/* Slot Machine Reels Stage */}
        <div className="relative w-full max-w-3xl bg-neutral-950/95 border-2 border-amber-500/40 rounded-2xl p-3 sm:p-5 shadow-2xl gold-border-glow">
          {/* Machine Header Marquee */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/20 text-xs text-amber-200">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold tracking-wider">{game.specialFeatureName}</span>
            </div>
            <div className="text-[11px] font-mono-num text-slate-400">
              PAYLINES: {game.paylines}
            </div>
          </div>

          {/* Reel Grid */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 bg-neutral-900/95 p-3 rounded-xl border border-neutral-800 overflow-hidden relative">
            {grid.map((reelCol, reelIdx) => {
              const isColSpinning = isSpinning && !reelsStopped[reelIdx];

              return (
                <div
                  key={reelIdx}
                  className={`flex-1 flex flex-col gap-2 rounded-lg bg-neutral-950/90 p-1 sm:p-2 border border-neutral-800/80 relative transition-all ${
                    isColSpinning ? 'opacity-90' : 'opacity-100'
                  }`}
                >
                  {reelCol.map((symbol, rowIdx) => {
                    const isWinning = winningCells.some(
                      (c) => c.reel === reelIdx && c.row === rowIdx
                    );

                    return (
                      <div
                        key={rowIdx}
                        className={`h-16 sm:h-24 rounded-lg flex flex-col items-center justify-center relative transition-all transform ${
                          isColSpinning
                            ? 'animate-reel-spin'
                            : isWinning
                            ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg scale-105 z-10'
                            : 'bg-neutral-900/60 border border-neutral-800/60'
                        }`}
                      >
                        <span className="text-3xl sm:text-4xl filter drop-shadow">
                          {symbol.symbol}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold mt-1 truncate max-w-full px-1 ${
                            symbol.isWild
                              ? 'text-amber-400 font-extrabold'
                              : symbol.isScatter
                              ? 'text-pink-400 font-extrabold'
                              : 'text-slate-300'
                          }`}
                        >
                          {symbol.name}
                        </span>

                        {symbol.isWild && (
                          <span className="absolute top-1 right-1 text-[8px] bg-amber-500 text-black font-extrabold px-1 rounded">
                            WILD
                          </span>
                        )}
                        {symbol.isScatter && (
                          <span className="absolute top-1 right-1 text-[8px] bg-pink-500 text-white font-extrabold px-1 rounded">
                            SCATTER
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Fortune Gems Dedicated 4th Multiplier Wheel */}
            {isFortuneGems && (
              <div className="w-20 sm:w-28 flex flex-col items-center justify-center bg-gradient-to-b from-amber-950/70 via-neutral-900 to-amber-950/70 border-2 border-amber-500/60 rounded-xl p-2 relative shadow-inner">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 mb-2">4th Reel</span>
                <div
                  className={`w-14 sm:w-20 h-28 rounded-lg flex flex-col items-center justify-center bg-neutral-950 border border-amber-400/80 shadow-lg ${
                    isSpinning ? 'animate-pulse' : ''
                  }`}
                >
                  <span className="text-xs text-slate-400 font-medium">MULT</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-amber-300">
                    x{fortuneMultiplierReel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Win / Feedback Banner */}
          <div className="mt-3 py-2 px-4 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Result:</span>
              <span className="font-bold text-amber-300">
                {winMessage || (lastWin > 0 ? `৳${lastWin.toLocaleString()} WON` : 'Spin to Play')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono-num">
              <span className="text-slate-400">
                Bet: <strong className="text-white">৳{bet}</strong>
              </span>
              <span className="text-slate-400">
                Win: <strong className="text-emerald-400">৳{lastWin}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Console */}
      <div className="w-full max-w-3xl mx-auto bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bet Adjustments */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Bet:</span>
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={decreaseBet}
                disabled={isSpinning || bet <= game.minBet}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono-num font-bold text-sm text-amber-300 min-w-[70px] text-center">
                ৳{bet}
              </span>
              <button
                onClick={increaseBet}
                disabled={isSpinning || bet >= game.maxBet}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={setMaxBet}
              disabled={isSpinning}
              className="px-2.5 py-1.5 text-xs font-bold text-amber-300 bg-neutral-900 border border-amber-500/30 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              MAX
            </button>
          </div>

          {/* Turbo & Auto Spin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsTurbo(!isTurbo);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isTurbo
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-neutral-900 text-slate-400 border-neutral-800 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'text-amber-400 fill-amber-400' : ''}`} />
              Turbo
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                if (autoSpinCount > 0) {
                  setAutoSpinCount(0);
                } else {
                  setAutoSpinCount(20);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                autoSpinCount > 0
                  ? 'bg-purple-900/60 text-purple-200 border-purple-500/60 animate-pulse'
                  : 'bg-neutral-900 text-slate-400 border-neutral-800 hover:text-white'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${autoSpinCount > 0 ? 'animate-spin' : ''}`} />
              {autoSpinCount > 0 ? `Auto: ${autoSpinCount}` : 'Auto (20)'}
            </button>
          </div>

          {/* Primary Spin Action Button */}
          <div className="flex items-center gap-2">
            {(!isFreeSpin && balance < bet) && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenDeposit();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
                title="ডিপোজিট করতে ক্লিক করুন"
              >
                <Coins className="w-3.5 h-3.5 fill-black" />
                <span>ডিপোজিট করুন</span>
              </button>
            )}

            <button
              onClick={handleSpin}
              disabled={isSpinning || (!isFreeSpin && balance < bet)}
              className={`px-8 py-3 rounded-xl font-extrabold text-base tracking-wider uppercase transition-all shadow-lg ${
                isSpinning
                  ? 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                  : (!isFreeSpin && balance < bet)
                  ? 'bg-neutral-900 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-75 shadow-none'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/30 active:scale-95 cursor-pointer'
              }`}
              title={(!isFreeSpin && balance < bet) ? 'অপর্যাপ্ত ব্যালেন্স! স্পিন করতে ডিপোজিট করুন' : 'স্পিন করুন'}
            >
              {isSpinning
                ? 'SPINNING...'
                : (!isFreeSpin && balance < bet)
                ? 'অপর্যাপ্ত ক্রেডিট'
                : 'SPIN'}
            </button>
          </div>
        </div>
      </div>

      {/* Win Celebration Popup */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl gold-border-glow relative">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-amber-400 uppercase tracking-widest font-display">
              {showCelebration.title}
            </h3>
            <div className="my-4 text-4xl sm:text-5xl font-black font-mono-num text-white">
              ৳{showCelebration.amount.toLocaleString()}
            </div>
            <p className="text-xs text-amber-200/80 mb-6">
              Congratulations! Winnings have been credited to your wallet balance.
            </p>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowCelebration(null);
              }}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-extrabold text-black text-sm uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg"
            >
              Collect & Continue
            </button>
          </div>
        </div>
      )}

      {/* Paytable & Rules Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                {game.title} - Paytable & Features
              </h3>
              <button
                onClick={() => setShowPaytable(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-1">Game Description</h4>
                <p className="text-slate-300 leading-relaxed">{game.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-2">Symbol Payout Multipliers</h4>
                <div className="grid grid-cols-2 gap-2">
                  {game.symbols.map((s) => (
                    <div key={s.id} className="p-2 bg-neutral-950/80 rounded border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{s.symbol}</span>
                        <div>
                          <div className="font-semibold text-white">{s.name}</div>
                          {s.isWild && <span className="text-[10px] text-amber-400">Substitutes all</span>}
                          {s.isScatter && <span className="text-[10px] text-pink-400">Triggers Free Spins</span>}
                        </div>
                      </div>
                      <div className="text-right font-mono-num text-amber-300 font-bold">
                        3x: {s.multiplier3}x
                        {s.multiplier4 && <div>4x: {s.multiplier4}x</div>}
                        {s.multiplier5 && <div>5x: {s.multiplier5}x</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-1">Payment & Payout Rules</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Wins pay from left to right on adjacent reels across active paylines.</li>
                  <li>3 or more Scatters award 10 Free Spins with guaranteed multipliers.</li>
                  <li>All payouts automatically convert to your BDT balance for instant bKash/Nagad withdrawal.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowPaytable(false)}
              className="mt-6 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
