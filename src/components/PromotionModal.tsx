import React from 'react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Check, ArrowRight } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBonus: (amount: number, bonusName: string) => void;
  claimedBonuses: string[];
  onOpenDeposit: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onClaimBonus,
  claimedBonuses,
  onOpenDeposit,
}) => {
  if (!isOpen) return null;

  const PROMOS = [
    {
      id: 'welcome_100',
      title: '100% First Deposit Match Bonus',
      subtitle: 'Exclusive for bKash & Nagad players',
      reward: 'Up to ৳5,000 Bonus',
      bonusAmount: 500,
      description: 'Double your initial deposit instantly! Valid for all JILI, FC, and JDB slot games with only 1x turnover requirement.',
      color: 'from-amber-500/20 via-neutral-900 to-neutral-900',
      borderColor: 'border-amber-500/40',
      instantClaimable: true,
    },
    {
      id: 'daily_rebate',
      title: '1.2% Unlimited Daily Slot Rebate',
      subtitle: 'Calculated on all valid bets',
      reward: '৳250 Daily Cash',
      bonusAmount: 250,
      description: 'Enjoy 1.2% daily cash rebate regardless of win or loss. Paid automatically every single day without turnover caps.',
      color: 'from-purple-500/20 via-neutral-900 to-neutral-900',
      borderColor: 'border-purple-500/40',
      instantClaimable: true,
    },
    {
      id: 'free_spins_pack',
      title: 'Super Ace 50 Free Spins Welcome Pack',
      subtitle: 'Special JILI Promotion',
      reward: '৳300 Free Spins Value',
      bonusAmount: 300,
      description: 'Try JILI Super Ace with 50 complimentary spins! Golden card cascade features and combo multipliers unlocked.',
      color: 'from-emerald-500/20 via-neutral-900 to-neutral-900',
      borderColor: 'border-emerald-500/40',
      instantClaimable: true,
    },
  ];

  const handleClaim = (promo: typeof PROMOS[0]) => {
    soundManager.playJackpotSound();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClaimBonus(promo.bonusAmount, promo.title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Promotions & Bonuses</h3>
              <p className="text-xs text-slate-400">bKash & Nagad Special Rewards</p>
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

        {/* Promo List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {PROMOS.map((promo) => {
            const isClaimed = claimedBonuses.includes(promo.id);

            return (
              <div
                key={promo.id}
                className={`p-4 rounded-2xl border bg-gradient-to-r ${promo.color} ${promo.borderColor} flex flex-col justify-between gap-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{promo.title}</h4>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">{promo.subtitle}</p>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{promo.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono-num font-bold text-amber-300 block bg-neutral-950/80 px-2.5 py-1 rounded-lg border border-neutral-800">
                      {promo.reward}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">T&C Apply · 1x Wagering</span>

                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="w-4 h-4" /> Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(promo)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Claim ৳{promo.bonusAmount} Free
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-xs">
          <span className="text-slate-400">Deposit more to unlock VIP tier cashbacks!</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenDeposit();
            }}
            className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300"
          >
            Deposit Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
