import React, { useState, useEffect } from 'react';
import { Sparkles, Music, TrendingUp, Clock } from 'lucide-react';
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

  if (loading) {
    return (
      <div className={`text-gray-400 ${className}`}>Loading recommendations...</div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((track) => (
              <button
                key={track.id}
                onClick={() => onSelectTrack?.(track)}
                className="bg-surface border border-white/10 rounded-xl p-4 hover:bg-surface-highlight transition-colors text-left"
              >
                {track.cover && (
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="font-medium text-white truncate">{track.title}</div>
                {track.producer && (
                  <div className="text-sm text-gray-400 truncate">{track.producer}</div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  {track.category && <span>{track.category}</span>}
                  {track.bpm && (
                    <span>• {typeof track.bpm === 'string' ? track.bpm : `${track.bpm} BPM`}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Similar Tracks */}
      {currentTrack && similarTracks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">More Like This</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarTracks.slice(0, 6).map((track) => (
              <button
                key={track.id}
                onClick={() => onSelectTrack?.(track)}
                className="bg-surface border border-white/10 rounded-xl p-4 hover:bg-surface-highlight transition-colors text-left"
              >
                {track.cover && (
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="font-medium text-white truncate">{track.title}</div>
                {track.producer && (
                  <div className="text-sm text-gray-400 truncate">{track.producer}</div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  {track.category && <span>{track.category}</span>}
                  {track.bpm && (
                    <span>• {typeof track.bpm === 'string' ? track.bpm : `${track.bpm} BPM`}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && similarTracks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start listening to get personalized recommendations!</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
