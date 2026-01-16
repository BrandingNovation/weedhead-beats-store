/**
 * WeedheadBeats Track Uploader Component with Database Integration
 * 
 * This component uploads tracks to Storage Box AND saves metadata to Supabase database.
 * 
 * Usage:
 *   <TrackUploaderWithDatabase 
 *     supabaseClient={supabase}
 *     userId={user.id}
 *     onUploadComplete={(track) => console.log('Uploaded:', track)} 
 *   />
 */

import { useState, useRef, useEffect } from 'react';
import { uploadTrack, UploadResult } from '../utils/storageApi';
import { testConnection } from '../lib/supabaseClient';

interface TrackUploaderWithDatabaseProps {
  supabaseClient: any; // Supabase client instance
  userId: string; // Current user ID
  onUploadComplete?: (track: TrackData) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  tableName?: string; // Database table name (default: 'tracks')
  skipDatabaseSave?: boolean; // Skip database save (default: false) - useful if main form handles saving
}

interface TrackData {
  id: string;
  title: string;
  url: string;
  fileName: string;
  size: number;
  type: string;
  uploadedAt: string;
  user_id?: string;
}

export const TrackUploaderWithDatabase: React.FC<TrackUploaderWithDatabaseProps> = ({
  supabaseClient,
  userId,
  onUploadComplete,
  onUploadError,
  className = '',
  tableName = 'tracks',
  skipDatabaseSave = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check database connection on mount (non-blocking - don't prevent uploads)
  useEffect(() => {
    const checkConnection = async () => {
      if (!supabaseClient) {
        setConnectionStatus('error');
        setError('Supabase client not available');
        return;
      }

      try {
        const result = await testConnection();
        if (result.success) {
          setConnectionStatus('connected');
          setError(null);
        } else {
          setConnectionStatus('error');
          // Don't set error - just warn, uploads can still work without DB
          console.warn('[TrackUploader] Database connection issue (non-blocking):', result.error);
        }
      } catch (err) {
        setConnectionStatus('error');
        // Don't set error - just warn, uploads can still work without DB
        console.warn('[TrackUploader] Database check failed (non-blocking):', err);
      }
    };

    checkConnection();
  }, [supabaseClient]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please select an audio file (MP3, WAV, OGG, or M4A)';
      setError(errorMsg);
      if (onUploadError) onUploadError(new Error(errorMsg));
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 100MB';
      setError(errorMsg);
      if (onUploadError) onUploadError(new Error(errorMsg));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress (since fetch doesn't support progress events natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Step 1: Upload to Storage Box
      setUploadProgress(30);
      let result: UploadResult;
      try {
        result = await uploadTrack(file, 'weedheadbeats/tracks');
        console.log('[TrackUploader] ✅ File uploaded to Storage Box:', result.url);
      } catch (uploadError: any) {
        clearInterval(progressInterval);
        console.error('[TrackUploader] ❌ Storage Box upload failed:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message || 'Unknown error'}. Please check your API key and network connection.`);
      }

      clearInterval(progressInterval);
      setUploadProgress(70);

      // Step 2: Create track object with server URL
      const newTrack: TrackData = {
        id: crypto.randomUUID(), // Use UUID instead of timestamp for better uniqueness
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: result.url, // ✅ Server URL instead of local data URL
        fileName: result.fileName,
        size: result.size,
        type: result.type,
        uploadedAt: new Date().toISOString(),
        user_id: userId
      };

      // Step 3: Save to Supabase database (optional - skip if main form handles it)
      setUploadProgress(85);
      let savedTrack: TrackData = newTrack;
      
      if (!skipDatabaseSave) {
        // Validate supabase client
        if (!supabaseClient) {
          throw new Error('Supabase client is not available. Please check your database configuration.');
        }

        // Validate userId
        if (!userId) {
          throw new Error('User ID is required to save track to database.');
        }

        console.log('[TrackUploader] Saving to database:', {
          table: tableName,
          userId,
          trackId: newTrack.id,
        });

        try {
          const { data: dbTrack, error: dbError } = await supabaseClient
            .from(tableName)
            .insert({
              id: newTrack.id,
              title: newTrack.title,
              url: newTrack.url, // Try url column first (for new schema)
              file_name: newTrack.fileName,
              file_size: newTrack.size,
              file_type: newTrack.type,
              uploaded_at: newTrack.uploadedAt,
              user_id: userId,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!dbError && dbTrack) {
            savedTrack = {
              ...newTrack,
              id: dbTrack.id || newTrack.id
            };
            console.log('[TrackUploader] ✅ Track saved to database:', dbTrack);
          } else {
            // Provide helpful error messages based on error type
            let errorMessage = `Database save failed: ${dbError?.message || 'Unknown error'}`;
            
            if (dbError?.code === 'PGRST116' || dbError?.message?.includes('does not exist')) {
              errorMessage = `Table "${tableName}" does not exist. Please run the SQL from DATABASE-SETUP.md in your Supabase SQL Editor.`;
            } else if (dbError?.code === '42501' || dbError?.message?.includes('permission denied') || dbError?.message?.includes('RLS')) {
              errorMessage = `Permission denied. Check your Row Level Security (RLS) policies for the "${tableName}" table. Make sure users can insert their own tracks.`;
            } else if (dbError?.message?.includes('JWT') || dbError?.message?.includes('auth') || dbError?.message?.includes('Invalid authentication')) {
              errorMessage = `Authentication error: ${dbError.message}. Check your Supabase configuration. Since you're using self-hosted Supabase in Coolify, verify VITE_SUPABASE_ANON_KEY is correct.`;
            } else if (dbError?.message?.includes('foreign key') || dbError?.message?.includes('user_id')) {
              errorMessage = `Invalid user ID. Make sure the user is authenticated and the user_id exists in auth.users.`;
            }

            // If url column doesn't exist, try audio column (for existing tracks table)
            const { error: audioError } = await supabaseClient
              .from(tableName)
              .insert({
                id: newTrack.id,
                title: newTrack.title,
                audio: newTrack.url, // Use audio column for existing schema
                user_id: userId,
                created_at: new Date().toISOString()
              });
            
            if (audioError) {
              console.error('[TrackUploader] Database error details:', {
                code: dbError?.code,
                message: dbError?.message,
                details: dbError?.details,
                hint: dbError?.hint,
              });
              // Don't throw - log warning but continue with upload success
              // File is already uploaded to Storage Box, so that part succeeded
              console.warn('[TrackUploader] ⚠️ Database save failed, but file upload succeeded. File URL:', newTrack.url);
              console.warn('[TrackUploader] Error:', errorMessage);
            } else {
              console.log('[TrackUploader] ✅ Track saved to database (audio column)');
            }
          }
        } catch (dbErr: any) {
          console.error('[TrackUploader] ❌ Database save failed:', dbErr);
          
          // Enhanced error logging
          if (dbErr instanceof Error) {
            console.error('[TrackUploader] Error details:', {
              name: dbErr.name,
              message: dbErr.message,
              stack: dbErr.stack,
            });
          }
          
          // Don't throw - allow upload to succeed even if DB save fails
          // The file is already uploaded to Storage Box, so that part succeeded
          console.warn('[TrackUploader] ⚠️ Upload to Storage Box succeeded, but database save failed. File is available at:', newTrack.url);
          // Continue with the upload completion - file is still uploaded
        }
      } else {
        console.log('[TrackUploader] ℹ️ Database save skipped (main form will handle track saving)');
      }

      setUploadProgress(100);

      // Call completion callback - file upload succeeded even if DB save failed
      if (onUploadComplete) {
        onUploadComplete(savedTrack);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset state after a delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('[TrackUploader] ❌ Upload failed:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('[TrackUploader] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      setUploading(false);
      setUploadProgress(0);
      
      // Clear file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="track-upload-input-db"
      />
      <label
        htmlFor="track-upload-input-db"
        className={`inline-block px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all ${
          uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-brand-green hover:bg-brand-green/80 text-white'
        }`}
      >
        {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Track to Storage Box'}
      </label>
      
      {connectionStatus === 'checking' && (
        <div className="mt-2 text-blue-600 text-sm">
          🔍 Checking database connection...
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          <strong>ℹ️ Database Connection Issue (Non-blocking):</strong>
          <div className="mt-1">File uploads will still work, but database save may fail. Check browser console for details.</div>
          <div className="mt-2 text-xs">
            <strong>Note:</strong> This won't prevent file uploads. Only database saving will be affected.
          </div>
        </div>
      )}

      {error && connectionStatus === 'connected' && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {uploadProgress < 30 && 'Uploading file...'}
            {uploadProgress >= 30 && uploadProgress < 70 && 'Processing...'}
            {uploadProgress >= 70 && uploadProgress < 85 && 'Saving to database...'}
            {uploadProgress >= 85 && 'Almost done...'}
          </div>
        </div>
      )}
    </div>
  );
};
