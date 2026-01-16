/**
 * WeedheadBeats Storage API Utility
 * 
 * This file handles uploading tracks to the Branding Novations Storage Box
 * instead of saving them to local storage.
 * 
 * Usage:
 *   import { uploadTrack } from '@/utils/storageApi';
 *   const result = await uploadTrack(file);
 */

const STORAGE_API = 'https://api.brandingnovations.com/api/storage';
const API_KEY = import.meta.env.VITE_STORAGE_API_KEY || 
                import.meta.env.NEXT_PUBLIC_STORAGE_API_KEY || 
                process.env?.NEXT_PUBLIC_STORAGE_API_KEY || 
                process.env?.REACT_APP_STORAGE_API_KEY || 
                process.env?.VITE_STORAGE_API_KEY ||
                '10db9c5e773a93769bf8313a90be928af98c17c145db2a58f128bb55031d7438';

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  size: number;
  type: string;
}

/**
 * Upload a track file to Storage Box
 * @param file - The audio file to upload
 * @param path - Optional path (default: 'weedheadbeats/tracks')
 * @returns Promise with upload result containing server URL
 */
export const uploadTrack = async (file: File, path: string = 'weedheadbeats/tracks'): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: MP3, WAV, OGG, M4A`);
    }
    
    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size must be less than 100MB');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${STORAGE_API}/upload?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      size: data.size,
      type: data.type
    };
  } catch (error) {
    console.error('[Storage API] Track upload failed:', error);
    throw error;
  }
};

/**
 * Upload an image file to Storage Box
 * @param file - The image file to upload
 * @param path - Optional path (default: 'weedheadbeats/images')
 */
export const uploadImage = async (file: File, path: string = 'weedheadbeats/images'): Promise<UploadResult> => {
  return uploadTrack(file, path);
};

/**
 * Delete a file from Storage Box
 * @param fileName - The file path to delete
 */
export const deleteFile = async (fileName: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${STORAGE_API}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ fileName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Storage API] File delete failed:', error);
    throw error;
  }
};

/**
 * Check if a file exists
 * @param fileName - The file path to check
 */
export const fileExists = async (fileName: string): Promise<{ exists: boolean; info: any }> => {
  try {
    const response = await fetch(`${STORAGE_API}/exists?fileName=${encodeURIComponent(fileName)}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Check failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Storage API] File exists check failed:', error);
    throw error;
  }
};
