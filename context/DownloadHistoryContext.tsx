import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';

interface DownloadRecord {
  id: string;
  user_id: string;
  track_id: string;
  track_title: string;
  license_type: 'basic' | 'premium' | 'exclusive';
  file_type: 'audio' | 'stems' | 'license';
  file_url: string;
  file_name: string;
  file_size?: number;
  downloaded_at: string;
  download_count: number;
  track?: Track;
}

interface DownloadStats {
  totalDownloads: number;
  uniqueTracks: number;
  totalSize: number;
  recentDownloads: DownloadRecord[];
}

interface DownloadHistoryContextType {
  downloads: DownloadRecord[];
  stats: DownloadStats;
  isLoading: boolean;
  error: string | null;
  recordDownload: (track: Track, licenseType: string, fileType: 'audio' | 'stems' | 'license', fileUrl: string, fileName: string, fileSize?: number) => Promise<void>;
  getRecentDownloads: (limit?: number) => DownloadRecord[];
  getDownloadsByTrack: (trackId: string) => DownloadRecord[];
  clearDownloadHistory: () => Promise<void>;
}

const DownloadHistoryContext = createContext<DownloadHistoryContextType | undefined>(undefined);

export const DownloadHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    uniqueTracks: 0,
    totalSize: 0,
    recentDownloads: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('download_history')
          .select('*')
          .eq('user_id', user.id)
          .order('downloaded_at', { ascending: false })
          .limit(100);

        if (fetchError) {
          // Table might not exist yet - that's okay
          if (fetchError.code !== 'PGRST116' && fetchError.code !== '42P01') {
            console.error('Error loading download history:', fetchError);
            setError(fetchError.message);
          }
          setIsLoading(false);
          return;
        }

        setDownloads(data || []);
        calculateStats(data || []);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error in loadDownloads:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadDownloads();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadDownloads();
      } else if (event === 'SIGNED_OUT') {
        setDownloads([]);
        setStats({ totalDownloads: 0, uniqueTracks: 0, totalSize: 0, recentDownloads: [] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const calculateStats = useCallback((downloadData: DownloadRecord[]) => {
    const totalDownloads = downloadData.length;
    const uniqueTracks = new Set(downloadData.map(item => item.track_id)).size;
    const totalSize = downloadData.reduce((sum, item) => sum + (item.file_size || 0), 0);
    const recentDownloads = downloadData.slice(0, 10);

    setStats({
      totalDownloads,
      uniqueTracks,
      totalSize,
      recentDownloads
    });
  }, []);

  const recordDownload = useCallback(async (
    track: Track,
    licenseType: 'basic' | 'premium' | 'exclusive',
    fileType: 'audio' | 'stems' | 'license',
    fileUrl: string,
    fileName: string,
    fileSize?: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const downloadRecord = {
        user_id: user.id,
        track_id: track.id.toString(),
        track_title: track.title,
        license_type: licenseType,
        file_type: fileType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize || 0,
        downloaded_at: new Date().toISOString(),
        download_count: 1
      };

      const { error: insertError } = await supabase
        .from('download_history')
        .insert([downloadRecord]);

      if (insertError) {
        // Table might not exist - that's okay, just log it
        if (insertError.code !== 'PGRST116' && insertError.code !== '42P01') {
          console.error('Error recording download:', insertError);
        }
        return;
      }

      // Add to local state
      const newRecord: DownloadRecord = {
        id: crypto.randomUUID(),
        ...downloadRecord,
        track
      };

      setDownloads(prev => [newRecord, ...prev].slice(0, 100));
      calculateStats([newRecord, ...downloads].slice(0, 100));
    } catch (err: any) {
      console.error('Error in recordDownload:', err);
    }
  }, [downloads, calculateStats]);

  const getRecentDownloads = useCallback((limit: number = 10) => {
    return downloads.slice(0, limit);
  }, [downloads]);

  const getDownloadsByTrack = useCallback((trackId: string) => {
    return downloads.filter(d => d.track_id === trackId);
  }, [downloads]);

  const clearDownloadHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('download_history')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        if (deleteError.code !== 'PGRST116' && deleteError.code !== '42P01') {
          throw deleteError;
        }
        return;
      }

      setDownloads([]);
      setStats({ totalDownloads: 0, uniqueTracks: 0, totalSize: 0, recentDownloads: [] });
    } catch (err: any) {
      console.error('Error in clearDownloadHistory:', err);
      throw err;
    }
  }, []);

  return (
    <DownloadHistoryContext.Provider
      value={{
        downloads,
        stats,
        isLoading,
        error,
        recordDownload,
        getRecentDownloads,
        getDownloadsByTrack,
        clearDownloadHistory
      }}
    >
      {children}
    </DownloadHistoryContext.Provider>
  );
};

export const useDownloadHistory = () => {
  const context = useContext(DownloadHistoryContext);
  if (context === undefined) {
    throw new Error('useDownloadHistory must be used within a DownloadHistoryProvider');
  }
  return context;
};
