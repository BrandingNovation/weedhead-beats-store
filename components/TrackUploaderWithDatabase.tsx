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

import { useState, useRef } from 'react';
import { uploadTrack, UploadResult } from '../utils/storageApi';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const result: UploadResult = await uploadTrack(file, 'weedheadbeats/tracks');

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
        // Try to save metadata to database, but don't fail if it doesn't work
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
            console.log('✅ Track metadata saved to database');
          } else {
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
              console.warn('⚠️ Could not save to database (main form will save it):', audioError.message);
              // Don't throw - the main form will save the track with the audio URL
            } else {
              console.log('✅ Track metadata saved to database (audio column)');
            }
          }
        } catch (dbErr: any) {
          // Database save is optional - main form will save the track
          console.warn('⚠️ Database save skipped (main form will handle it):', dbErr.message);
        }
      } else {
        console.log('ℹ️ Database save skipped (main form will handle track saving)');
      }

      setUploadProgress(100);

      // Call completion callback
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
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error(errorMessage));
      }
      setUploading(false);
      setUploadProgress(0);
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
      
      {error && (
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
