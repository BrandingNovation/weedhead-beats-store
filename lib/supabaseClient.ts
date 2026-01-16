/// <reference types="../vite-env.d.ts" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Enhanced validation with detailed error messages
const validateConfig = () => {
  const errors: string[] = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set in environment variables');
  } else if (!supabaseUrl.startsWith('http')) {
    errors.push('VITE_SUPABASE_URL appears to be invalid (should start with https://)');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set in environment variables');
  } else if (supabaseAnonKey.length < 50) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  if (errors.length > 0) {
    console.error('❌ Supabase Configuration Errors:', errors);
    console.error('Please check your .env.local or .env file and ensure:');
    console.error('  - VITE_SUPABASE_URL is set to your Supabase project URL');
    console.error('  - VITE_SUPABASE_ANON_KEY is set to your Supabase anon/public key');
    return false;
  }
  
  return true;
};

const isValid = validateConfig();

// Create client with enhanced error handling
// Don't use placeholders - fail fast if env vars are missing
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('❌ CRITICAL: VITE_SUPABASE_URL is not set or is placeholder!');
  console.error('Please set VITE_SUPABASE_URL in your environment variables.');
  console.error('For Coolify deployment, add it in: Application → Environment Variables');
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key' || supabaseAnonKey.length < 50) {
  console.error('❌ CRITICAL: VITE_SUPABASE_ANON_KEY is not set or is invalid!');
  console.error('Please set VITE_SUPABASE_ANON_KEY in your environment variables.');
  console.error('For Coolify deployment, add it in: Application → Environment Variables');
  console.error('Get the key from: Services → Supabase → Environment Variables → ANON_KEY');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://supabase.brandingnovations.com', // Use actual default instead of placeholder
  supabaseAnonKey || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTU4NDYwMCwiZXhwIjo0OTIxMjU4MjAwLCJyb2xlIjoiYW5vbiJ9.cUOOuFlC8qsXFCCMfFAIMQmGXI-CFj28QHLTK4EACnI', // Use actual anon key as fallback
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'weedheadbeats@1.0.0',
      },
    },
  }
);

// Connection status tracking
let connectionStatus: 'unknown' | 'connected' | 'disconnected' | 'error' = 'unknown';
let lastConnectionCheck: number = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection is successful
 */
export const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isValid) {
      return {
        success: false,
        error: 'Supabase configuration is invalid. Check environment variables.',
      };
    }

    // Simple connection test - try to query a table
    const { error } = await supabase.from('tracks').select('id').limit(1);
    
    // If we get a specific error about table not existing, that's actually OK
    // (means connection works but table needs to be created)
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        // Table doesn't exist - connection is fine, just need to create table
        connectionStatus = 'connected';
        lastConnectionCheck = Date.now();
        return {
          success: true,
          error: 'Connection OK, but database table does not exist.',
        };
      }
      
      // Other errors might indicate connection issues
      // Check for authentication errors (401, invalid credentials, JWT issues)
      const errorMsg = (error.message || '').toLowerCase();
      const isAuthError = errorMsg.includes('jwt') || 
                         errorMsg.includes('auth') || 
                         errorMsg.includes('invalid authentication') || 
                         errorMsg.includes('unauthorized') ||
                         errorMsg.includes('authentication credentials') ||
                         error.code === 'PGRST301' || 
                         error.code === 'PGRST302' ||
                         (error as any)?.status === 401 ||
                         (error as any)?.statusCode === 401;
      
      if (isAuthError) {
        connectionStatus = 'error';
        return {
          success: false,
          error: `Authentication error: ${error.message}. Your VITE_SUPABASE_ANON_KEY is invalid or expired. Since you're using self-hosted Supabase in Coolify, check the Supabase service environment variables in Coolify UI or the .env file at /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env`,
        };
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        connectionStatus = 'disconnected';
        return {
          success: false,
          error: `Network error: ${error.message}. Check your internet connection and VITE_SUPABASE_URL.`,
        };
      }
    }
    
    connectionStatus = 'connected';
    lastConnectionCheck = Date.now();
    return { success: true };
  } catch (error) {
    connectionStatus = 'error';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection test failed:', error);
    return {
      success: false,
      error: `Connection failed: ${errorMessage}`,
    };
  }
};

/**
 * Get current connection status (with caching)
 */
export const getConnectionStatus = async (): Promise<'connected' | 'disconnected' | 'error'> => {
  const now = Date.now();
  
  // Use cached status if recent
  if (connectionStatus !== 'unknown' && (now - lastConnectionCheck) < CONNECTION_CHECK_INTERVAL) {
    return connectionStatus;
  }
  
  // Test connection
  const result = await testConnection();
  const finalStatus = result.success ? 'connected' : 'error';
  return finalStatus;
};

/**
 * Ensure database connection before operations
 */
export const ensureConnection = async (): Promise<void> => {
  const status = await getConnectionStatus();
  if (status !== 'connected') {
    const result = await testConnection();
    if (!result.success) {
      throw new Error(`Database connection failed: ${result.error}`);
    }
  }
};

// Log configuration status on import
if (isValid) {
  console.log('✅ Supabase client initialized');
  console.log('📍 URL:', supabaseUrl.substring(0, 30) + '...');
} else {
  console.error('❌ Supabase client initialized with invalid configuration');
}

export default supabase;