import React from 'react';
import { Provider } from '../types';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  Crown,
  Users,
  Gift,
  ArrowDownLeft,
  Headphones,
  Search,
  Flame,
  Layers,
  Settings
} from 'lucide-react';

interface CasinoMenuBarProps {
  selectedProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoriteCount?: number;
  onOpenDeposit: () => void;
  onOpenVIP: () => void;
  onOpenReferral: () => void;
  onOpenPromos: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
}

export const CasinoMenuBar: React.FC<CasinoMenuBarProps> = ({
  selectedProvider,
  onSelectProvider,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  favoriteCount = 0,
  onOpenDeposit,
  onOpenVIP,
  onOpenReferral,
  onOpenPromos,
  onOpenSupport,
  onOpenSettings,
}) => {
  const MENU_ITEMS = [
    {
      id: 'ALL',
      label: 'All Slots',
      icon: '🎰',
      type: 'provider',
    },
    {
      id: 'FAVORITES',
      label: 'Favorites',
      icon: '⭐',
      type: 'category',
    },
    {
      id: 'JILI',
      label: 'JILI Games',
      icon: '👑',
      type: 'provider',
    },
    {
      id: 'FC',
      label: 'FC Slots',
      icon: '🏮',
      type: 'provider',
    },
    {
      id: 'JDB',
      label: 'JDB Slots',
      icon: '🐉',
      type: 'provider',
    },
    {
      id: 'Jackpot Slot',
      label: 'Jackpots',
      icon: '💎',
      type: 'category',
    },
    {
      id: 'Cascade Multiplier',
      label: 'Cascades',
      icon: '⚡',
      type: 'category',
    },
  ];

  return (
    <div className="sticky top-16 z-30 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 mb-6 py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Horizontal Scrollable Menu Item Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {MENU_ITEMS.map((item) => {
            const isProvider = item.type === 'provider';
            const isActive = isProvider
              ? selectedProvider === item.id && selectedCategory === 'ALL'
              : selectedCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  if (isProvider) {
                    onSelectCategory('ALL');
                    onSelectProvider(item.id as Provider);
                  } else {
                    onSelectCategory(item.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-400 text-black shadow-md scale-102 font-extrabold'
                    : 'text-slate-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'FAVORITES' && favoriteCount > 0 && (
                  <span
                    className={`ml-1 text-[10px] font-mono-num px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-black text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {favoriteCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Separator */}
          <div className="w-[1px] h-6 bg-neutral-800 mx-1 shrink-0" />

          {/* Quick Action Menu Tabs */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenVIP();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>VIP Club</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenReferral();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Referrals</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPromos();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Bonuses</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSupport();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 Support</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-slate-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search slot or provider..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
