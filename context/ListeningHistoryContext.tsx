import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';

interface ListeningHistoryItem {
  id: string;
  user_id: string;
  track_id: string;
  track_title: string;
  listened_at: string;
  duration_seconds?: number;
  track?: Track;
}

interface ListeningStats {
  totalPlays: number;
  uniqueTracks: number;
  totalDuration: number;
  mostPlayedTrack?: Track;
  favoriteGenre?: string;
  favoriteBPM?: number;
}

interface ListeningHistoryContextType {
  history: ListeningHistoryItem[];
  stats: ListeningStats;
  isLoading: boolean;
  error: string | null;
  addListeningEvent: (track: Track, duration?: number) => Promise<void>;
  getRecentHistory: (limit?: number) => ListeningHistoryItem[];
  getMostPlayedTracks: (limit?: number) => { track: Track; playCount: number }[];
  getRecommendations: () => Track[];
}

const ListeningHistoryContext = createContext<ListeningHistoryContextType | undefined>(undefined);

export const ListeningHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ListeningHistoryItem[]>([]);
  const [stats, setStats] = useState<ListeningStats>({
    totalPlays: 0,
    uniqueTracks: 0,
    totalDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('listening_history')
          .select('*')
          .eq('user_id', user.id)
          .order('listened_at', { ascending: false })
          .limit(100);

        if (fetchError) {
          // Table might not exist yet - that's okay
          if (fetchError.code !== 'PGRST116' && fetchError.code !== '42P01') {
            console.error('Error loading listening history:', fetchError);
            setError(fetchError.message);
          }
          setIsLoading(false);
          return;
        }

        setHistory(data || []);
        calculateStats(data || []);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error in loadHistory:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadHistory();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadHistory();
      } else if (event === 'SIGNED_OUT') {
        setHistory([]);
        setStats({ totalPlays: 0, uniqueTracks: 0, totalDuration: 0 });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const calculateStats = useCallback((historyData: ListeningHistoryItem[]) => {
    const totalPlays = historyData.length;
    const uniqueTracks = new Set(historyData.map(item => item.track_id)).size;
    const totalDuration = historyData.reduce((sum, item) => sum + (item.duration_seconds || 0), 0);

    // Find most played track
    const trackCounts = new Map<string, number>();
    historyData.forEach(item => {
      trackCounts.set(item.track_id, (trackCounts.get(item.track_id) || 0) + 1);
    });

    const mostPlayedId = Array.from(trackCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    setStats({
      totalPlays,
      uniqueTracks,
      totalDuration,
      mostPlayedTrack: historyData.find(item => item.track_id === mostPlayedId)?.track
    });
  }, []);

  const addListeningEvent = useCallback(async (track: Track, duration?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const listeningEvent = {
        user_id: user.id,
        track_id: track.id.toString(),
        track_title: track.title,
        listened_at: new Date().toISOString(),
        duration_seconds: duration || 0
      };

      const { error: insertError } = await supabase
        .from('listening_history')
        .insert([listeningEvent]);

      if (insertError) {
        // Table might not exist - that's okay, just log it
        if (insertError.code !== 'PGRST116' && insertError.code !== '42P01') {
          console.error('Error adding listening event:', insertError);
        }
        return;
      }

      // Add to local state
      const newItem: ListeningHistoryItem = {
        id: crypto.randomUUID(),
        ...listeningEvent,
        track
      };

      setHistory(prev => [newItem, ...prev].slice(0, 100));
      calculateStats([newItem, ...history].slice(0, 100));
    } catch (err: any) {
      console.error('Error in addListeningEvent:', err);
    }
  }, [history, calculateStats]);

  const getRecentHistory = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  const getMostPlayedTracks = useCallback((limit: number = 10) => {
    const trackCounts = new Map<string, { track: Track; count: number }>();
    
    history.forEach(item => {
      if (item.track) {
        const existing = trackCounts.get(item.track_id);
        if (existing) {
          existing.count++;
        } else {
          trackCounts.set(item.track_id, { track: item.track, count: 1 });
        }
      }
    });

    return Array.from(trackCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ track, count }) => ({ track, playCount: count }));
  }, [history]);

  const getRecommendations = useCallback(() => {
    // Simple recommendation: based on most played tracks' genre/BPM
    const mostPlayed = getMostPlayedTracks(5);
    if (mostPlayed.length === 0) return [];

    // Get favorite genre and BPM from most played
    const genres = mostPlayed.map(({ track }) => track.mood || track.category).filter(Boolean);
    const bpms = mostPlayed.map(({ track }) => typeof track.bpm === 'number' ? track.bpm : parseInt(track.bpm)).filter(Boolean);

    // This would ideally query tracks matching these preferences
    // For now, return empty - will be enhanced with actual track recommendations
    return [];
  }, [getMostPlayedTracks]);

  return (
    <ListeningHistoryContext.Provider
      value={{
        history,
        stats,
        isLoading,
        error,
        addListeningEvent,
        getRecentHistory,
        getMostPlayedTracks,
        getRecommendations
      }}
    >
      {children}
    </ListeningHistoryContext.Provider>
  );
};

export const useListeningHistory = () => {
  const context = useContext(ListeningHistoryContext);
  if (context === undefined) {
    throw new Error('useListeningHistory must be used within a ListeningHistoryProvider');
  }
  return context;
};
