import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ShoppingCart, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Track } from '../types';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onBuy?: (track: Track) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSkipPrevious?: () => void;
  onSkipNext?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  isShuffleOn?: boolean;
  onShuffleToggle?: () => void;
  repeatMode?: 'off' | 'all' | 'one';
  onRepeatToggle?: () => void;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

const Player: React.FC<PlayerProps> = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onBuy,
  volume = 0.8,
  onVolumeChange,
  onSkipPrevious,
  onSkipNext,
  isMuted = false,
  onMuteToggle,
  isShuffleOn = false,
  onShuffleToggle,
  repeatMode = 'off',
  onRepeatToggle,
  playbackRate = 1,
  onPlaybackRateChange
}) => {
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
          if (isFinite(current) && !isNaN(current) && current >= 0) {
            setCurrentTime(current);
          }
          if (isFinite(total) && !isNaN(total) && total > 0) {
            setDuration(total);
            if (isFinite(current) && !isNaN(current) && current >= 0) {
              setProgress(Math.min(100, Math.max(0, (current / total) * 100)));
            }
          }
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          const dur = audioRef.current.duration;
          if (isFinite(dur) && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        }
      });
      audio.addEventListener('durationchange', () => {
        if (audioRef.current) {
          const dur = audioRef.current.duration;
          if (isFinite(dur) && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        }
      });

      // Apply volume
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
      }

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [currentTrack, volume, isMuted]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newVolume = percent;
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!currentTrack) return null;

  const safeProgress = isFinite(progress) && !isNaN(progress) ? Math.min(100, Math.max(0, progress)) : 0;

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
        <div className="flex items-center justify-center gap-3 mb-1">
          <button 
            onClick={onShuffleToggle}
            className={`transition-colors ${isShuffleOn ? 'text-brand-green' : 'text-brand-teal hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={16} fill={isShuffleOn ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={onSkipPrevious}
            className="text-brand-teal hover:text-white transition-colors"
            disabled={!onSkipPrevious}
            title="Previous"
          >
            <SkipBack size={18} />
          </button>
          <button 
            onClick={onPlayPause}
            className="h-9 w-9 bg-brand-green rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-brand-green/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button 
            onClick={onSkipNext}
            className="text-brand-teal hover:text-white transition-colors"
            disabled={!onSkipNext}
            title="Next"
          >
            <SkipForward size={18} />
          </button>
          <button 
            onClick={onRepeatToggle}
            className={`transition-colors ${repeatMode !== 'off' ? 'text-brand-green' : 'text-brand-teal hover:text-white'}`}
            title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={16} fill="currentColor" />
            ) : (
              <Repeat size={16} fill={repeatMode === 'all' ? 'currentColor' : 'none'} />
            )}
          </button>
          {/* Speed Control - Mobile */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-white">Speed:</span>
            <div className="relative">
              <select
                value={playbackRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  if (onPlaybackRateChange) onPlaybackRateChange(rate);
                  const audio = document.querySelector('audio') as HTMLAudioElement;
                  if (audio) audio.playbackRate = rate;
                }}
                className="player-speed-select bg-transparent border border-brand-slate rounded px-1 py-0.5 pr-4 text-[10px] focus:outline-none focus:border-brand-green text-white cursor-pointer"
                style={{ 
                  colorScheme: 'dark', 
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="0.5" style={{ background: '#000', color: '#fff' }}>0.5x</option>
                <option value="0.75" style={{ background: '#000', color: '#fff' }}>0.75x</option>
                <option value="1" style={{ background: '#000', color: '#fff' }}>1x</option>
                <option value="1.25" style={{ background: '#000', color: '#fff' }}>1.25x</option>
                <option value="1.5" style={{ background: '#000', color: '#fff' }}>1.5x</option>
                <option value="2" style={{ background: '#000', color: '#fff' }}>2x</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-xs font-mono text-brand-teal">
          <span className="text-[10px]">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-brand-slate rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (audioRef.current && duration > 0 && isFinite(duration)) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const newTime = percent * duration;
                if (isFinite(newTime) && newTime >= 0) {
                  audioRef.current.currentTime = newTime;
                }
              }
            }}
          >
            <div 
              className="h-full bg-brand-green relative"
              style={{ width: `${safeProgress}%` }}
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
          <div className="flex items-center gap-4 mb-1">
            <button 
              onClick={onShuffleToggle}
              className={`transition-colors ${isShuffleOn ? 'text-brand-green' : 'text-brand-teal hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle size={18} fill={isShuffleOn ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={onSkipPrevious}
              className="text-brand-teal hover:text-white transition-colors"
              disabled={!onSkipPrevious}
              title="Previous"
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={onPlayPause}
              className="h-10 w-10 bg-brand-green rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-brand-green/20"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={onSkipNext}
              className="text-brand-teal hover:text-white transition-colors"
              disabled={!onSkipNext}
              title="Next"
            >
              <SkipForward size={20} />
            </button>
            <button 
              onClick={onRepeatToggle}
              className={`transition-colors ${repeatMode !== 'off' ? 'text-brand-green' : 'text-brand-teal hover:text-white'}`}
              title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
            >
              {repeatMode === 'one' ? (
                <Repeat1 size={18} fill="currentColor" />
              ) : (
                <Repeat size={18} fill={repeatMode === 'all' ? 'currentColor' : 'none'} />
              )}
            </button>
            {/* Speed Control */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] text-white">Speed:</span>
              <div className="relative">
                <select
                  value={playbackRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    if (onPlaybackRateChange) onPlaybackRateChange(rate);
                    const audio = document.querySelector('audio') as HTMLAudioElement;
                    if (audio) audio.playbackRate = rate;
                  }}
                  className="player-speed-select bg-transparent border border-brand-slate rounded px-2 py-1 pr-6 text-xs focus:outline-none focus:border-brand-green text-white cursor-pointer"
                  style={{ 
                    colorScheme: 'dark', 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="0.5" style={{ background: '#000', color: '#fff' }}>0.5x</option>
                  <option value="0.75" style={{ background: '#000', color: '#fff' }}>0.75x</option>
                  <option value="1" style={{ background: '#000', color: '#fff' }}>1x</option>
                  <option value="1.25" style={{ background: '#000', color: '#fff' }}>1.25x</option>
                  <option value="1.5" style={{ background: '#000', color: '#fff' }}>1.5x</option>
                  <option value="2" style={{ background: '#000', color: '#fff' }}>2x</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 text-xs font-mono text-brand-teal">
            <span>{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1 bg-brand-slate rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                if (audioRef.current && duration > 0 && isFinite(duration)) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const newTime = percent * duration;
                  if (isFinite(newTime) && newTime >= 0) {
                    audioRef.current.currentTime = newTime;
                  }
                }
              }}
            >
              <div 
                className="h-full bg-brand-green relative"
                style={{ width: `${safeProgress}%` }}
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
            <button 
              onClick={onMuteToggle}
              className="hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div 
              className="w-20 h-1 bg-brand-slate rounded-full cursor-pointer relative"
              onClick={handleVolumeClick}
            >
              <div 
                className="h-full bg-brand-green rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, volume * 100))}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-transparent cursor-pointer opacity-0 absolute"
              style={{ marginLeft: '-80px' }}
            />
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
