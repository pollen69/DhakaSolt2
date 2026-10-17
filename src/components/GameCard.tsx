import React, { useState } from 'react';
import { Game } from '../types';
import { soundManager } from '../utils/audio';
import { Play, Flame, Star } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'JILI':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'FC':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'JDB':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-neutral-800 text-slate-300 border-neutral-700';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-neutral-900/90 border border-neutral-800/80 hover:border-amber-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5">
      {/* Thumbnail Aspect Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
        {!imageError ? (
          <img
            src={game.image}
            alt={game.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* High-polish CSS fallback if image fails */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-center">
            <span className="text-4xl mb-2">🎰</span>
            <span className="text-sm font-bold text-amber-400 font-display">{game.title}</span>
            <span className="text-xs text-slate-500 mt-1">{game.provider} Gaming</span>
          </div>
        )}

        {/* Floating Provider Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getProviderBadge(game.provider)}`}>
            {game.provider}
          </span>
        </div>

        {/* Interactive Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClick();
            onToggleFavorite?.(game.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 border cursor-pointer ${
            isFavorite
              ? 'bg-amber-500/25 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105'
              : 'bg-black/60 border-white/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/60 hover:scale-110'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* Hot / Popular Indicator */}
        {(game.id === 'jili-super-ace' || game.id === 'jdb-dragon-treasure') && (
          <div className="absolute top-2.5 right-11 z-10 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <Flame className="w-3 h-3 fill-white" />
            HOT
          </div>
        )}

        {/* Hover Overlay Play Button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 backdrop-blur-[2px]">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlay(game);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
          >
            <Play className="w-4 h-4 fill-black" />
            Play Now
          </button>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
              {game.title}
            </h3>
            <span className="text-[11px] font-mono-num text-amber-300 font-semibold shrink-0">
              {game.rtp}
            </span>
          </div>

          {/* Clean Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{game.category}</span>
            <span aria-hidden="true">·</span>
            <span>{game.paylines} Ways</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 font-medium">{game.volatility}</span>
          </div>
        </div>

        {/* Quick Launch Mobile Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onPlay(game);
          }}
          className="mt-2 w-full py-2 bg-neutral-800 group-hover:bg-amber-400 text-slate-200 group-hover:text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Play Game
        </button>
      </div>
    </div>
  );
};
