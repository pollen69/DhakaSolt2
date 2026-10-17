import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import {
  Headphones,
  Send,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
}) => {
  const [chatMessage, setChatMessage] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! Welcome to DhakaSlots 24/7 Live Support. How can we assist you with bKash/Nagad deposits or slot games today?',
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    soundManager.playClick();
    const userText = chatMessage.trim();
    setChatMessage('');

    const newMsgs = [
      ...messages,
      { sender: 'user' as const, text: userText, time: 'Just now' },
    ];
    setMessages(newMsgs);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = 'Thank you for contacting DhakaSlots. Our agent has received your query and verified your account status.';
      const lower = userText.toLowerCase();

      if (lower.includes('deposit') || lower.includes('bkash') || lower.includes('nagad') || lower.includes('টাকা') || lower.includes('জমা')) {
        reply = 'To deposit: Send Money or Cash Out to our active Agent Number (01614-418086), copy the TrxID from your SMS receipt, and submit it in the Cashier. Balance is credited instantly!';
      } else if (lower.includes('withdraw') || lower.includes('উত্তোলন')) {
        reply = 'Withdrawals are processed directly to your bKash or Nagad personal/agent number within 2 to 5 minutes with 0% gateway fees.';
      } else if (lower.includes('jili') || lower.includes('super ace') || lower.includes('game') || lower.includes('slot')) {
        reply = 'JILI Super Ace, Fortune Gems, FC Night Market, and JDB Dragon Treasure all feature certified 97%+ RTP with cascading multipliers and free spin bonuses!';
      } else if (lower.includes('vip') || lower.includes('cashback')) {
        reply = 'Every bet you place increases your VIP turnover. Enjoy up to 10% monthly cashback and elevated withdrawal limits in the VIP Club!';
      }

      soundManager.playWinChime(1);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, time: 'Just now' },
      ]);
    }, 1000);
  };

  const FAQS = [
    {
      q: 'How long does a bKash or Nagad deposit take?',
      a: 'Deposits are credited automatically within 1 to 2 minutes after submitting your Transaction ID (TrxID).',
    },
    {
      q: 'What is the minimum deposit and withdrawal limit?',
      a: 'Minimum deposit is ৳100. Minimum withdrawal is ৳500 with up to ৳500,000 per transaction depending on your VIP rank.',
    },
    {
      q: 'Are JILI, FC, and JDB slot games provably fair?',
      a: 'Yes! All slot outcomes are powered by certified random number generators (RNG) with verified 97%+ RTP payout rates.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">24/7 Live Customer Care</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">DhakaSlots Official Support & Help Center</p>
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* WhatsApp Direct Contact Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Official WhatsApp Support:</span>
                <span className="text-emerald-300 font-mono-num font-semibold">+880 1614-418086</span>
              </div>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=8801614418086"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm"
            >
              Chat <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Live Chat Box */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 flex flex-col h-56 justify-between">
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-400 text-black font-medium rounded-tr-none'
                        : 'bg-neutral-950 text-slate-200 border border-neutral-800 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-neutral-950 p-2 rounded-xl border border-neutral-800 w-28">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-400 ml-1">Typing...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about deposits, withdrawals, or slots..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black transition-colors"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick FAQ Accordion */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Frequently Asked Questions (প্রায়শই জিজ্ঞাসিত প্রশ্ন)
            </h4>
            <div className="space-y-2">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-xs">
                  <div className="font-bold text-white">{faq.q}</div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>24/7 Agent Hotline: 01614-418086</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenDeposit();
            }}
            className="font-bold text-amber-400 hover:text-amber-300"
          >
            Go to Cashier →
          </button>
        </div>
      </div>
    </div>
  );
};
