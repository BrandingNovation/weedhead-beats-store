import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';

interface AudioPlayerWithTempoProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  autoPlay?: boolean;
}

const AudioPlayerWithTempo: React.FC<AudioPlayerWithTempoProps> = ({
  audioUrl,
  title,
  artist,
  onEnded,
  onTimeUpdate,
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackRateNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [pitchShift, setPitchShift] = useState(0); // Semitones
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaElementSource(audioRef.current);
    sourceNodeRef.current = source;

    const gainNode = audioContext.createGain();
    gainNodeRef.current = gainNode;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle pitch shift (simplified - using playback rate affects pitch)
  // For true pitch correction, would need a pitch shifter algorithm
  useEffect(() => {
    // Note: True pitch shifting without tempo change requires more complex processing
    // This is a simplified version that adjusts playback rate
    // For production, consider using a library like SoundTouch.js or Tone.js
    if (audioRef.current && pitchShift !== 0) {
      // Approximate: 1 semitone = ~1.05946x rate change
      const rateMultiplier = Math.pow(2, pitchShift / 12);
      audioRef.current.playbackRate = playbackRate * rateMultiplier;
    } else if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [pitchShift, playbackRate]);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onEnded) onEnded();
  }, [onEnded]);

  // Control functions
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  }, [duration]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface rounded-xl p-4 space-y-4">
      {/* Track Info */}
      {(title || artist) && (
        <div className="text-center">
          {title && <div className="text-lg font-semibold text-white">{title}</div>}
          {artist && <div className="text-sm text-gray-400">{artist}</div>}
        </div>
      )}

      {/* Waveform Visualizer */}
      <WaveformVisualizer
        audioUrl={audioUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onPlayPause={togglePlayPause}
        height={80}
      />

      {/* Time Display */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => skip(-10)}
          className="p-2 hover:bg-surface-highlight rounded-full transition-colors"
          title="Rewind 10s"
        >
          <SkipBack className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="p-3 bg-primary hover:bg-primary-dark rounded-full transition-colors disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        
        <button
          onClick={() => skip(10)}
          className="p-2 hover:bg-surface-highlight rounded-full transition-colors"
          title="Forward 10s"
        >
          <SkipForward className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tempo & Pitch Controls */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        {/* Playback Speed */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Speed</label>
            <span className="text-sm text-white font-medium">{playbackRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span>1x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Pitch Shift */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Pitch</label>
            <span className="text-sm text-white font-medium">
              {pitchShift > 0 ? '+' : ''}{pitchShift} semitones
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitchShift}
            onChange={(e) => setPitchShift(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-12</span>
            <span>0</span>
            <span>+12</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-surface-highlight rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs text-gray-400 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        autoPlay={autoPlay}
        preload="metadata"
      />
    </div>
  );
};

export default AudioPlayerWithTempo;
