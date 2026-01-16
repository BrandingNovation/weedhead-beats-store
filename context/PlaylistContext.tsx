import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Playlist, PlaylistTrack, Track, ProductCategory } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  playlistTracks: Track[];
  isLoading: boolean;
  error: string | null;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<Playlist | null>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  loadPlaylistTracks: (playlistId: string) => Promise<void>;
  updatePlaylist: (playlistId: string, updates: { name?: string; description?: string; isPublic?: boolean }) => Promise<void>;
  isTrackInPlaylist: (playlistId: string, trackId: string) => boolean;
  refreshPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const refreshPlaylists = useCallback(async () => {
    if (!userId) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching playlists:', fetchError);
        setError('Failed to load playlists');
        setIsLoading(false);
        return;
      }

      if (data) {
        const formattedPlaylists: Playlist[] = data.map(p => ({
          id: p.id,
          userId: p.user_id,
          name: p.name || 'Untitled Playlist',
          description: p.description || undefined,
          coverImage: p.cover_image || undefined,
          isPublic: p.is_public || false,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || p.created_at || new Date().toISOString(),
        }));
        setPlaylists(formattedPlaylists);
      }
    } catch (err) {
      console.error('Error in refreshPlaylists:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load playlists when user changes
  useEffect(() => {
    refreshPlaylists();
  }, [refreshPlaylists]);

  const createPlaylist = useCallback(async (name: string, description?: string, isPublic: boolean = false): Promise<Playlist | null> => {
    if (!userId) {
      setError('You must be logged in to create playlists');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('playlists')
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description?.trim() || null,
          is_public: isPublic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating playlist:', createError);
        setError('Failed to create playlist');
        setIsLoading(false);
        return null;
      }

      const newPlaylist: Playlist = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || undefined,
        coverImage: data.cover_image || undefined,
        isPublic: data.is_public || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      };

      setPlaylists(prev => [newPlaylist, ...prev]);
      setIsLoading(false);
      return newPlaylist;
    } catch (err) {
      console.error('Error in createPlaylist:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
      return null;
    }
  }, [userId]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First delete all tracks from the playlist
      const { error: tracksError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId);

      if (tracksError) {
        console.error('Error deleting playlist tracks:', tracksError);
      }

      // Then delete the playlist
      const { error: deleteError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (deleteError) {
        console.error('Error deleting playlist:', deleteError);
        setError('Failed to delete playlist');
        setIsLoading(false);
        return;
      }

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
        setPlaylistTracks([]);
      }
    } catch (err) {
      console.error('Error in deletePlaylist:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPlaylist]);

  const addTrackToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if track is already in playlist
      const { data: existing } = await supabase
        .from('playlist_tracks')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('track_id', track.id)
        .single();

      if (existing) {
        setError('Track is already in this playlist');
        setIsLoading(false);
        return;
      }

      // Get current max position
      const { data: positions } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = positions && positions.length > 0 ? (positions[0].position || 0) + 1 : 0;

      const { error: insertError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: track.id,
          position: nextPosition,
        });

      if (insertError) {
        console.error('Error adding track to playlist:', insertError);
        setError('Failed to add track to playlist');
        setIsLoading(false);
        return;
      }

      // Update playlist updated_at
      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      // Reload playlist tracks if this is the current playlist
      if (currentPlaylist?.id === playlistId) {
        await loadPlaylistTracks(playlistId);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error in addTrackToPlaylist:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  }, [currentPlaylist]);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      if (deleteError) {
        console.error('Error removing track from playlist:', deleteError);
        setError('Failed to remove track from playlist');
        setIsLoading(false);
        return;
      }

      // Update playlist updated_at
      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      // Reload playlist tracks if this is the current playlist
      if (currentPlaylist?.id === playlistId) {
        await loadPlaylistTracks(playlistId);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error in removeTrackFromPlaylist:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  }, [currentPlaylist]);

  const loadPlaylistTracks = useCallback(async (playlistId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: playlistTracksData, error: tracksError } = await supabase
        .from('playlist_tracks')
        .select('track_id, position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (tracksError) {
        console.error('Error fetching playlist tracks:', tracksError);
        setError('Failed to load playlist tracks');
        setIsLoading(false);
        return;
      }

      if (!playlistTracksData || playlistTracksData.length === 0) {
        setPlaylistTracks([]);
        setIsLoading(false);
        return;
      }

      const trackIds = playlistTracksData.map(pt => pt.track_id);
      const { data: tracksData, error: tracksFetchError } = await supabase
        .from('tracks')
        .select('*')
        .in('id', trackIds);

      if (tracksFetchError) {
        console.error('Error fetching tracks:', tracksFetchError);
        setError('Failed to load track details');
        setIsLoading(false);
        return;
      }

      if (tracksData) {
        // Map tracks in the correct order
        const orderedTracks: Track[] = playlistTracksData
          .map(pt => {
            const trackData = tracksData.find(t => t.id === pt.track_id);
            if (!trackData) return null;
            const track: Track = {
              id: trackData.id,
              title: trackData.title || trackData.name || 'Untitled',
              producer: trackData.producer || trackData.artist || 'Unknown',
              bpm: trackData.bpm || 0,
              key: trackData.key || '',
              price: trackData.price || 0,
              mood: trackData.mood || trackData.genre || 'Dark',
              tags: trackData.tags || [],
              cover: trackData.cover_image || trackData.image_url || '',
              audio: trackData.audio_url || trackData.url || '',
              description: trackData.description || '',
              category: (trackData.category || 'beat') as ProductCategory,
              youtubeUrl: trackData.youtube_url || '',
            };
            return track;
          })
          .filter((t): t is Track => t !== null);

        setPlaylistTracks(orderedTracks);
      }
    } catch (err) {
      console.error('Error in loadPlaylistTracks:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePlaylist = useCallback(async (playlistId: string, updates: { name?: string; description?: string; isPublic?: boolean }) => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.description !== undefined) updateData.description = updates.description.trim() || null;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

      const { error: updateError } = await supabase
        .from('playlists')
        .update(updateData)
        .eq('id', playlistId);

      if (updateError) {
        console.error('Error updating playlist:', updateError);
        setError('Failed to update playlist');
        setIsLoading(false);
        return;
      }

      await refreshPlaylists();
      if (currentPlaylist?.id === playlistId) {
        const updated = playlists.find(p => p.id === playlistId);
        if (updated) {
          setCurrentPlaylist({
            ...updated,
            ...updates,
          });
        }
      }
    } catch (err) {
      console.error('Error in updatePlaylist:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPlaylist, playlists, refreshPlaylists]);

  const isTrackInPlaylist = useCallback((playlistId: string, trackId: string): boolean => {
    if (currentPlaylist?.id === playlistId) {
      return playlistTracks.some(t => t.id === trackId);
    }
    return false;
  }, [currentPlaylist, playlistTracks]);

  return (
    <PlaylistContext.Provider value={{
      playlists,
      currentPlaylist,
      playlistTracks,
      isLoading,
      error,
      createPlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      setCurrentPlaylist,
      loadPlaylistTracks,
      updatePlaylist,
      isTrackInPlaylist,
      refreshPlaylists,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
