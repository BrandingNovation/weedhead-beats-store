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
    // Validate file type - check both MIME type and file extension
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4', 'audio/x-m4a'];
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      throw new Error(`File type ${file.type || fileExtension} not allowed. Allowed types: MP3, WAV, OGG, M4A`);
    }
    
    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size must be less than 100MB');
    }
    
    // Ensure file size is not 0
    if (file.size === 0) {
      throw new Error('File is empty. Please select a valid audio file.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Log file details for debugging
    console.log('[Storage API] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    console.log('[Storage API] Uploading file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      path: path,
      apiEndpoint: `${STORAGE_API}/upload?path=${encodeURIComponent(path)}`,
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY?.length || 0
    });

    let response: Response;
    try {
      response = await fetch(`${STORAGE_API}/upload?path=${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: formData
      });
    } catch (networkError: any) {
      console.error('[Storage API] Network error:', networkError);
      throw new Error(`Network error: ${networkError.message || 'Failed to connect to storage server'}`);
    }
    
    console.log('[Storage API] Response status:', response.status, response.statusText);
    console.log('[Storage API] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'Upload failed';
      let errorDetails: any = {};
      
      // Try to get error details
      const contentType = response.headers.get('content-type');
      console.log('[Storage API] Error content-type:', contentType);
      
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          errorDetails = errorData;
          console.error('[Storage API] Error response (JSON):', errorData);
        } else {
          // Try to parse HTML error or plain text
          const errorText = await response.text();
          console.error('[Storage API] Error response (text/HTML):', errorText.substring(0, 500));
          
          // Try to extract error message from HTML
          const errorMatch = errorText.match(/<pre>([^<]+)/i) || errorText.match(/Error:\s*([^\n<]+)/i);
          if (errorMatch) {
            errorMessage = errorMatch[1].trim();
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            if (errorText.length < 200) {
              errorMessage += ` - ${errorText}`;
            }
          }
          errorDetails = { rawResponse: errorText.substring(0, 500) };
        }
      } catch (parseError) {
        console.error('[Storage API] Failed to parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText} - Unable to parse error response`;
      }
      
      // Provide specific error messages
      if (response.status === 401 || response.status === 403) {
        errorMessage = `Authentication failed (${response.status}). Please check your Storage API key. ${errorMessage}`;
      } else if (response.status === 413) {
        errorMessage = 'File too large. Maximum file size is 100MB.';
      } else if (response.status === 500) {
        errorMessage = `Server error (500). ${errorMessage}. Please check the browser console for details.`;
      }
      
      console.error('[Storage API] Full error details:', {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorDetails
      });
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('[Storage API] Upload successful:', data);
    
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
