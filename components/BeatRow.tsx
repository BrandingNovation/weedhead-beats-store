import React from 'react';
import { Play, Pause, ShoppingCart, Download, Heart } from 'lucide-react';
import { Track } from '../types';

interface BeatRowProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: () => void;
}

const BeatRow: React.FC<BeatRowProps> = ({ track, isPlaying, isCurrent, onPlay }) => {
  return (
    <div className={`
      group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border border-transparent
      ${isCurrent ? 'bg-slate-800/60 border-indigo-500/30' : 'hover:bg-slate-800/40 hover:border-slate-700'}
    `}>
      {/* Cover & Play */}
      <div className="relative shrink-0">
        <img 
          src={track.cover} 
          alt={track.title} 
          className={`h-16 w-16 rounded-lg object-cover transition-all ${isCurrent && isPlaying ? 'animate-pulse' : ''}`}
        />
        <div className={`
          absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
          ${isCurrent ? 'opacity-100' : ''}
        `}>
          <button 
            onClick={onPlay}
            className="p-2 bg-white rounded-full text-slate-900 shadow-lg transform hover:scale-110 transition-transform"
          >
            {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-base truncate ${isCurrent ? 'text-indigo-300' : 'text-slate-100'}`}>
          {track.title}
        </h3>
        <p className="text-sm text-slate-400 truncate">{track.producer} • {track.bpm} BPM • {track.key}</p>
        
        {/* Tags */}
        {track.tags && track.tags.length > 0 && (
          <div className="flex gap-2 mt-1.5">
            {track.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Waveform Visualization (Static for now) */}
      <div className="hidden lg:flex flex-1 items-center gap-1 h-8 opacity-40 px-4">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1 bg-slate-200 rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'animate-music-bar' : ''}`}
            style={{ 
              height: `${Math.max(20, Math.random() * 100)}%`,
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Download size={18} />
        </button>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
          <ShoppingCart size={16} />
          <span>${track.price}</span>
        </button>
      </div>
    </div>
  );
};

export default BeatRow;
