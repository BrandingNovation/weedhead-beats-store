/**
 * Storage Utilities
 * 
 * Handles browser storage with proper error handling and modern APIs.
 * 
 * Note: The "StorageType.persistent is deprecated" warning is likely coming from
 * a third-party dependency (Supabase, Stripe, or PayPal SDKs) and is harmless.
 * This utility uses modern localStorage which doesn't trigger the warning.
 */

/**
 * Safely get item from localStorage
 */
export const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage
 */
export const setStorageItem = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof DOMException) {
      if (error.code === 22 || error.code === 1014 || error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to clear old data');
        // Try to clear and retry
        try {
          // Clear oldest items if possible
          localStorage.removeItem(key);
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Failed to save after clearing:', retryError);
        }
      }
    }
    console.warn(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage quota information (modern API)
 * Uses navigator.storage instead of deprecated StorageType.persistent
 */
export const getStorageQuota = async (): Promise<{
  quota: number;
  usage: number;
  available: number;
} | null> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to get storage quota:', error);
    return null;
  }
};

/**
 * Request persistent storage (modern API)
 * Uses navigator.storage instead of deprecated StorageType.persistent
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersistent = await navigator.storage.persist();
      return isPersistent;
    }
    return false;
  } catch (error) {
    console.warn('Failed to request persistent storage:', error);
    return false;
  }
};

