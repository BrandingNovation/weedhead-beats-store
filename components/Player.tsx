import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ShoppingCart } from 'lucide-react';
import { Track } from '../types';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onBuy?: (track: Track) => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, onPlayPause, onBuy }) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find the audio element in the DOM
  useEffect(() => {
    const audio = document.querySelector('audio') as HTMLAudioElement;
    if (audio) {
      audioRef.current = audio;
      
      const updateProgress = () => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const total = audioRef.current.duration || 0;
          setCurrentTime(current);
          setDuration(total);
          if (total > 0) {
            setProgress((current / total) * 100);
          }
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-black/90 backdrop-blur-xl border-t border-brand-slate z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col py-2 px-4">
        {/* Top Row: Track Info and Purchase Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title} 
              className="h-10 w-10 rounded-md object-cover border border-brand-slate shadow-lg flex-shrink-0"
            />
            <div className="overflow-hidden min-w-0">
              <h4 className="font-bold text-white truncate text-sm">{currentTrack.title}</h4>
              <p className="text-xs text-brand-teal truncate">{currentTrack.producer}</p>
            </div>
          </div>
          <button 
            onClick={() => onBuy && currentTrack && onBuy(currentTrack)}
            className="flex items-center gap-1.5 bg-brand-green hover:bg-brand-green/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg shadow-brand-green/20 flex-shrink-0"
          >
            <ShoppingCart size={14} />
            <span>${currentTrack.price}</span>
          </button>
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-center gap-4 mb-1">
          <button className="text-brand-teal hover:text-white transition-colors"><SkipBack size={18} /></button>
          <button 
            onClick={onPlayPause}
            className="h-9 w-9 bg-brand-green rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-brand-green/20"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button className="text-brand-teal hover:text-white transition-colors"><SkipForward size={18} /></button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-xs font-mono text-brand-teal">
          <span className="text-[10px]">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-brand-slate rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (audioRef.current && duration > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = percent * duration;
              }
            }}
          >
            <div 
              className="h-full bg-brand-green relative"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center h-20 px-8">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            className="h-12 w-12 rounded-md object-cover border border-brand-slate shadow-lg"
          />
          <div className="overflow-hidden">
            <h4 className="font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-xs text-brand-teal truncate">{currentTrack.producer}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="flex items-center gap-6 mb-1">
            <button className="text-brand-teal hover:text-white transition-colors"><SkipBack size={20} /></button>
            <button 
              onClick={onPlayPause}
              className="h-10 w-10 bg-brand-green rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-brand-green/20"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-brand-teal hover:text-white transition-colors"><SkipForward size={20} /></button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 text-xs font-mono text-brand-teal">
            <span>{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1 bg-brand-slate rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                if (audioRef.current && duration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  audioRef.current.currentTime = percent * duration;
                }
              }}
            >
              <div 
                className="h-full bg-brand-green relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-sm" />
              </div>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-1/4 flex items-center justify-end gap-4">
          <div className="hidden lg:flex items-center gap-2 text-brand-teal">
            <Volume2 size={18} />
            <div className="w-20 h-1 bg-brand-slate rounded-full">
              <div className="w-2/3 h-full bg-brand-green rounded-full" />
            </div>
          </div>
          <button 
            onClick={() => onBuy && currentTrack && onBuy(currentTrack)}
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/80 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-green/20"
          >
            <ShoppingCart size={16} />
            <span>${currentTrack.price}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
