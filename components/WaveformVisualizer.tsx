import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformVisualizerProps {
  audioUrl: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioUrl,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onPlayPause,
  height = 80,
  waveColor = '#ec1313',
  progressColor = '#ff4444',
  cursorColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Load audio and generate waveform
  useEffect(() => {
    if (!audioUrl) return;

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
        
        // Generate waveform data
        const channelData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of bars in waveform
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            const index = i * blockSize + j;
            if (index < channelData.length) {
              sum += Math.abs(channelData[index]);
            }
          }
          waveform.push(sum / blockSize);
        }
        
        // Normalize waveform data
        const max = Math.max(...waveform);
        const normalized = waveform.map(value => (value / max) * 0.8 + 0.1);
        setWaveformData(normalized);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading audio for waveform:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const canvasHeight = canvas.height;
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * width;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Draw waveform bars
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * canvasHeight * 0.9;
      const y = (canvasHeight - barHeight) / 2;
      
      // Determine if this bar is before or after progress
      const barCenterX = x + barWidth / 2;
      const isPastProgress = barCenterX <= progressX;
      
      ctx.fillStyle = isPastProgress ? progressColor : waveColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw progress cursor
    if (progressX > 0 && progressX < width) {
      ctx.strokeStyle = cursorColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, canvasHeight);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration, progressColor, waveColor, cursorColor]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / canvas.width;
    const seekTime = progress * duration;
    onSeek(seekTime);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-gray-400 text-sm">Loading waveform...</div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{ display: 'block' }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
          className="bg-primary/80 hover:bg-primary rounded-full p-2 pointer-events-auto transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default WaveformVisualizer;
