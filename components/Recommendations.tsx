import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { recommendationService } from '../services/recommendationService';
import { Track } from '../types';

interface ListeningHistoryItem {
  trackId: string;
  playedAt: string;
  playCount?: number;
  completed?: boolean;
}

interface RecommendationsProps {
  tracks: Track[];
  listeningHistory?: ListeningHistoryItem[];
  currentTrack?: Track;
  onSelectTrack?: (track: Track) => void;
  className?: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  tracks,
  listeningHistory = [],
  currentTrack,
  onSelectTrack,
  className = '',
}) => {
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecommendations();
  }, [tracks, listeningHistory]);

  useEffect(() => {
    if (currentTrack) {
      loadSimilarTracks();
    }
  }, [currentTrack, tracks]);

  const loadRecommendations = () => {
    setLoading(true);
    try {
      const recs = recommendationService.getRecommendations(tracks, listeningHistory);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarTracks = () => {
    if (!currentTrack) return;
    try {
      const similar = recommendationService.getSimilarTracks(currentTrack, tracks, 10);
      setSimilarTracks(similar);
    } catch (error) {
      console.error('Error loading similar tracks:', error);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return null; // Don't show loading state
  }

  const displayTracks = currentTrack && similarTracks.length > 0 ? similarTracks : recommendations;

  if (displayTracks.length === 0) {
    return null; // Don't show empty state
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {currentTrack && similarTracks.length > 0 ? 'More Like This' : 'Recommended for You'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-transparent border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-transparent border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => onSelectTrack?.(track)}
            className="flex-shrink-0 w-64 group relative"
          >
            <div className="relative overflow-hidden rounded-lg">
              {track.cover ? (
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-64 h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-64 h-64 bg-brand-slate/20 flex items-center justify-center">
                  <Play className="w-12 h-12 text-brand-teal/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-left">
              <div className="font-semibold text-white truncate">{track.title}</div>
              {track.producer && (
                <div className="text-sm text-brand-teal truncate">{track.producer}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
