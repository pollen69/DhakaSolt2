import React, { useState } from 'react';
import { PaymentMethod, Transaction, VIPTier } from '../types';
import { soundManager } from '../utils/audio';
import {
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Hash,
  AlertCircle,
  Loader2,
  Crown
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  initialTab?: 'deposit' | 'withdraw';
  onClose: () => void;
  balance: number;
  currentTier?: VIPTier;
  onOpenVIP?: () => void;
  onDepositSuccess: (amount: number, transaction: Transaction) => void;
  onWithdrawSuccess: (amount: number, transaction: Transaction) => void;
}

const BKASH_AGENT = '01614-418086';
const NAGAD_AGENT = '01614-418086';

const DEPOSIT_PRESETS = [200, 500, 1000, 2000, 5000, 10000, 25000];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  initialTab = 'deposit',
  onClose,
  balance,
  currentTier,
  onOpenVIP,
  onDepositSuccess,
  onWithdrawSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [senderPhone, setSenderPhone] = useState<string>('017');
  const [trxId, setTrxId] = useState<string>('');
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [receiverPhone, setReceiverPhone] = useState<string>('017');
  const [accountType, setAccountType] = useState<'Personal' | 'Agent'>('Personal');

  if (!isOpen) return null;

  const currentAgentNumber = method === 'bkash' ? BKASH_AGENT : NAGAD_AGENT;

  const handleCopyNumber = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(currentAgentNumber.replace('-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateTrxId = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = method === 'bkash' ? 'BK' : 'NG';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (!depositAmount || depositAmount < 100) {
      setStatusMessage({ type: 'error', text: 'Minimum deposit is ৳100.' });
      return;
    }
    if (depositAmount > 100000) {
      setStatusMessage({ type: 'error', text: 'Maximum single deposit is ৳100,000.' });
      return;
    }
    if (!trxId.trim() || trxId.trim().length < 6) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Transaction ID (TrxID) from your bKash/Nagad app or SMS.' });
      return;
    }
    if (!senderPhone || senderPhone.length < 11) {
      setStatusMessage({ type: 'error', text: 'Please enter your 11-digit sender phone number.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    // Simulate real-time payment gateway verification
    setTimeout(() => {
      setIsLoading(false);
      const cleanTrx = trxId.toUpperCase().trim();
      const hasReferralBonus = referralCodeInput.trim().length >= 4;
      const totalCredited = hasReferralBonus ? depositAmount + 100 : depositAmount;

        const newTx: Transaction = {
          id: 'tx_' + Date.now(),
          type: 'deposit',
          method,
          amount: totalCredited,
          status: 'completed',
          timestamp: Date.now(),
          trxId: cleanTrx,
          accountNumber: senderPhone,
        };

        soundManager.playCoinSound();
        onDepositSuccess(totalCredited, newTx);
        setStatusMessage({
          type: 'success',
          text: hasReferralBonus
            ? `৳${depositAmount.toLocaleString()} + ৳100 Referral Welcome Bonus credited via ${method.toUpperCase()}! TrxID: ${cleanTrx}`
            : `৳${depositAmount.toLocaleString()} successfully credited via ${method.toUpperCase()}! TrxID: ${cleanTrx}`,
        });
        setTrxId('');
      }, 1400);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (!withdrawAmount || withdrawAmount < 500) {
      setStatusMessage({ type: 'error', text: 'Minimum withdrawal is ৳500.' });
      return;
    }
    if (withdrawAmount > balance) {
      setStatusMessage({ type: 'error', text: 'Insufficient wallet balance for this withdrawal.' });
      return;
    }
    if (currentTier && withdrawAmount > currentTier.singleWithdrawalLimit) {
      setStatusMessage({
        type: 'error',
        text: `Your ${currentTier.title} tier allows max ৳${currentTier.singleWithdrawalLimit.toLocaleString()} per single withdrawal. Wager more in slots to upgrade VIP limits!`,
      });
      return;
    }
    if (!receiverPhone || receiverPhone.length < 11) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 11-digit bKash/Nagad recipient number.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    // Simulate instant withdrawal dispatch
    setTimeout(() => {
      setIsLoading(false);
      const generatedTrx = generateTrxId();
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        type: 'withdrawal',
        method,
        amount: withdrawAmount,
        status: 'processing',
        timestamp: Date.now(),
        trxId: generatedTrx,
        accountNumber: receiverPhone,
      };

      soundManager.playWinChime(2);
      onWithdrawSuccess(withdrawAmount, newTx);
      setStatusMessage({
        type: 'success',
        text: `Withdrawal request for ৳${withdrawAmount.toLocaleString()} submitted to ${receiverPhone}! Processing takes 2-5 minutes.`,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Cashier & Wallet
            </h3>
            <p className="text-xs text-slate-400">Instant Bangladesh Payment Gateway</p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Balance Bar */}
        <div className="px-6 py-3 bg-neutral-900/50 border-b border-neutral-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Available Balance:</span>
          <span className="text-base font-bold font-mono-num text-amber-300">
            ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Tab Switcher: Deposit / Withdraw */}
        <div className="grid grid-cols-2 p-2 bg-neutral-900/40 border-b border-neutral-800 gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('deposit');
              setStatusMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deposit'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Deposit (জমা)
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('withdraw');
              setStatusMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'withdraw'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw (উত্তোলন)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Method Selection (bKash vs Nagad) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMethod('bkash');
                }}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  method === 'bkash'
                    ? 'border-[#e2136e] bg-[#e2136e]/10 shadow-lg'
                    : 'border-neutral-800 bg-neutral-900/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#e2136e] flex items-center justify-center text-white font-black text-sm shrink-0">
                  bK
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">bKash</div>
                  <div className="text-[11px] text-[#e2136e] font-semibold">বিকাশ ক্যাশআউট/পেমেন্ট</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMethod('nagad');
                }}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  method === 'nagad'
                    ? 'border-[#f26522] bg-[#f26522]/10 shadow-lg'
                    : 'border-neutral-800 bg-neutral-900/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#f26522] flex items-center justify-center text-white font-black text-sm shrink-0">
                  NG
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Nagad</div>
                  <div className="text-[11px] text-[#f26522] font-semibold">নগদ ক্যাশআউট/পেমেন্ট</div>
                </div>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/50'
                  : 'bg-rose-950/60 text-rose-200 border-rose-500/50'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: DEPOSIT */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Agent / Merchant Info Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  method === 'bkash'
                    ? 'bg-[#e2136e]/5 border-[#e2136e]/30'
                    : 'bg-[#f26522]/5 border-[#f26522]/30'
                }`}
              >
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Send Money / Cash Out to {method.toUpperCase()} Agent:</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Online 24/7</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                  <span className="font-mono-num font-bold text-base text-amber-300 tracking-wider">
                    {currentAgentNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Amount Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deposit Amount (টাকা):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DEPOSIT_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setDepositAmount(amt);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-num transition-all ${
                        depositAmount === amt
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'bg-neutral-900 text-slate-300 border border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      ৳{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min={100}
                    max={100000}
                    value={depositAmount || ''}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-8 pr-3 text-sm font-mono-num text-white focus:outline-none focus:border-amber-400"
                    placeholder="Enter custom amount (min ৳100)"
                    required
                  />
                </div>
              </div>

              {/* Sender Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  Your {method.toUpperCase()} Mobile Number:
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-sm font-mono-num text-white focus:outline-none focus:border-amber-400"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              {/* TrxID Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    Transaction ID (TrxID):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTrxId(generateTrxId());
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Generate Test TrxID
                  </button>
                </div>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-sm font-mono-num uppercase text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. 9B8X24KL"
                  required
                />
              </div>

              {/* Optional Referral Code Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Referral / Invite Code (Optional):
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold font-mono-num">+৳100 Welcome Free Bet</span>
                </div>
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-xs font-mono-num uppercase text-white focus:outline-none focus:border-amber-400 placeholder:normal-case placeholder:text-slate-600"
                  placeholder="e.g. DHAKA777"
                />
              </div>

              {/* Submit Deposit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black text-sm uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying Transaction...
                  </>
                ) : (
                  `Confirm ৳${depositAmount.toLocaleString()} Deposit`
                )}
              </button>

              <div className="text-[11px] text-slate-500 leading-normal">
                💡 <strong>How to deposit:</strong> Send Money or Cash Out to our {method.toUpperCase()} agent number above. Copy the TrxID from your SMS receipt, paste it here, and submit.
              </div>
            </form>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* VIP Limit Notice */}
              {currentTier && (
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{currentTier.title} Cashout Limit</span>
                        <span className={`text-[9px] px-1 rounded border ${currentTier.badgeColor}`}>
                          {currentTier.cashbackPercent}% Cashback
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                        Single: ৳{currentTier.singleWithdrawalLimit.toLocaleString()} · Daily: ৳{currentTier.dailyWithdrawalLimit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {onOpenVIP && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVIP();
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[11px] underline shrink-0 ml-2"
                    >
                      VIP Club →
                    </button>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  Your {method.toUpperCase()} Number (উত্তোলন একাউন্ট):
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-3 text-sm font-mono-num text-white focus:outline-none focus:border-amber-400"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Personal', 'Agent'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        accountType === type
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-900 text-slate-400'
                      }`}
                    >
                      {type} Account
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdraw Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Withdrawal Amount (টাকা):
                  </label>
                  <span className="text-xs font-mono-num text-slate-400">
                    Max: ৳{Math.floor(balance).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[
                    { label: '25%', val: Math.floor(balance * 0.25) },
                    { label: '50%', val: Math.floor(balance * 0.5) },
                    { label: '75%', val: Math.floor(balance * 0.75) },
                    { label: '100%', val: Math.floor(balance) },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setWithdrawAmount(Math.max(500, p.val));
                      }}
                      className="py-1 bg-neutral-900 hover:bg-neutral-800 text-slate-300 border border-neutral-800 rounded-lg text-xs font-semibold"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    min={500}
                    max={balance}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-8 pr-3 text-sm font-mono-num text-white focus:outline-none focus:border-amber-400"
                    placeholder="Min ৳500"
                    required
                  />
                </div>
              </div>

              {/* Calculation Preview */}
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Withdrawal Amount:</span>
                  <span className="font-mono-num text-white">৳{withdrawAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gateway Fee (0%):</span>
                  <span className="font-mono-num text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-neutral-800">
                  <span>You will receive:</span>
                  <span className="font-mono-num text-amber-300">৳{withdrawAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Withdraw Button */}
              <button
                type="submit"
                disabled={isLoading || balance < 500}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black text-sm uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payout...
                  </>
                ) : (
                  `Withdraw ৳${withdrawAmount.toLocaleString()} via ${method.toUpperCase()}`
                )}
              </button>

              <div className="text-[11px] text-slate-500 leading-normal">
                ⚡ <strong>Instant Payout:</strong> bKash and Nagad withdrawals are processed within 2–5 minutes directly to your account.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
