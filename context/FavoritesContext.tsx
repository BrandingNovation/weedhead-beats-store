import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Track } from '../types';
import { supabase } from '../lib/supabaseClient';

interface FavoritesContextType {
  favorites: Track[];
  addFavorite: (track: Track) => Promise<void>;
  removeFavorite: (trackId: string | number) => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  isFavorite: (trackId: string | number) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('weedhead_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load favorites from Supabase when user is logged in
  useEffect(() => {
    const loadFavoritesFromSupabase = async () => {
      if (!userId) {
        // If no user, just use localStorage favorites
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('saved_tracks')
          .select('track_id')
          .eq('user_id', userId);

        if (error) {
          console.error('Error loading favorites from Supabase:', error);
          // Fall back to localStorage
          return;
        }

        if (data && data.length > 0) {
          // Get track details for each favorite
          const trackIds = data.map(item => item.track_id);
          const { data: tracksData, error: tracksError } = await supabase
            .from('tracks')
            .select('*')
            .in('id', trackIds);

          if (tracksError) {
            console.error('Error loading track details:', tracksError);
            return;
          }

          if (tracksData) {
            // Convert Supabase track format to Track interface
            const formattedTracks: Track[] = tracksData.map((t: any) => ({
              id: t.id,
              title: t.title || t.name || 'Untitled',
              producer: t.producer || t.artist || 'Unknown',
              bpm: t.bpm || 0,
              key: t.key || '',
              price: t.price || 0,
              mood: t.mood || t.genre || 'Dark',
              tags: t.tags || [],
              cover: t.cover_image || t.image_url || '',
              audio: t.audio_url || t.url || '',
              description: t.description || '',
              category: (t.category || 'beat') as any,
              youtubeUrl: t.youtube_url || '',
              spotifyUrl: t.spotify_url || '',
              appleMusicUrl: t.apple_music_url || '',
            }));

            setFavorites(formattedTracks);
            // Sync to localStorage
            localStorage.setItem('weedhead_favorites', JSON.stringify(formattedTracks));
          }
        }
      } catch (error) {
        console.error('Error in loadFavoritesFromSupabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoritesFromSupabase();
  }, [userId]);

  // Sync favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('weedhead_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const addFavorite = useCallback(async (track: Track) => {
    if (favorites.find(t => t.id === track.id)) {
      return; // Already favorited
    }

    const newFavorites = [...favorites, track];
    setFavorites(newFavorites);

    // Save to Supabase if user is logged in
    if (userId) {
      try {
        const { error } = await supabase
          .from('saved_tracks')
          .insert({
            user_id: userId,
            track_id: track.id,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error saving favorite to Supabase:', error);
          // Don't revert - keep in localStorage
        }
      } catch (error) {
        console.error('Error in addFavorite Supabase call:', error);
      }
    }
  }, [favorites, userId]);

  const removeFavorite = useCallback(async (trackId: string | number) => {
    setFavorites(prev => prev.filter(t => t.id !== trackId));

    // Remove from Supabase if user is logged in
    if (userId) {
      try {
        const { error } = await supabase
          .from('saved_tracks')
          .delete()
          .eq('user_id', userId)
          .eq('track_id', trackId);

        if (error) {
          console.error('Error removing favorite from Supabase:', error);
        }
      } catch (error) {
        console.error('Error in removeFavorite Supabase call:', error);
      }
    }
  }, [userId]);

  const toggleFavorite = useCallback(async (track: Track) => {
    if (isFavorite(track.id)) {
      await removeFavorite(track.id);
    } else {
      await addFavorite(track);
    }
  }, [favorites, userId]);

  const isFavorite = useCallback((trackId: string | number) => {
    return favorites.some(t => t.id === trackId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      isLoading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
