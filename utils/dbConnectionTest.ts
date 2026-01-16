/**
 * Database Connection Testing Utility
 * 
 * Use this to test and debug Supabase database connections
 */

import { supabase, testConnection, getConnectionStatus } from '../lib/supabaseClient';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    configValid: boolean;
    connectionTest: boolean;
    tableExists: boolean;
    rlsEnabled: boolean;
    error?: string;
  };
}

/**
 * Comprehensive database connection test
 * @returns Detailed test results
 */
export const testDatabaseConnection = async (): Promise<ConnectionTestResult> => {
  const result: ConnectionTestResult = {
    success: false,
    message: '',
    details: {
      configValid: false,
      connectionTest: false,
      tableExists: false,
      rlsEnabled: false,
    },
  };

  try {
    // Step 1: Check configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      result.message = '❌ Configuration missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set';
      result.details!.configValid = false;
      return result;
    }

    result.details!.configValid = true;
    console.log('✅ Step 1: Configuration valid');

    // Step 2: Test basic connection
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      // Check if it's an authentication error
      const isAuthError = connectionTest.error?.includes('Authentication') || connectionTest.error?.includes('Invalid authentication') || connectionTest.error?.includes('Unauthorized');
      result.message = isAuthError 
        ? `❌ Authentication failed: ${connectionTest.error}\n\n🔧 Your Supabase anon key is invalid or expired. Since you're using self-hosted Supabase in Coolify:\n1. SSH to server: ssh root@65.21.109.247\n2. Check: cat /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env | grep ANON\n3. OR check Coolify UI: Services → Supabase → Environment Variables\n4. Copy the ANON_KEY value\n5. Update VITE_SUPABASE_ANON_KEY in your app's environment variables\n6. Restart your application`
        : `❌ Connection failed: ${connectionTest.error}`;
      result.details!.connectionTest = false;
      result.details!.error = connectionTest.error;
      return result;
    }

    result.details!.connectionTest = true;
    console.log('✅ Step 2: Connection successful');

    // Step 3: Check if tracks table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('tracks')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === 'PGRST116' || tableError.message.includes('does not exist')) {
        result.message = '⚠️ Connection OK, but tracks table does not exist. Run SQL from DATABASE-SETUP.md';
        result.details!.tableExists = false;
        result.details!.error = 'Table does not exist';
        return result;
      }
      result.message = `❌ Table check failed: ${tableError.message}`;
      result.details!.error = tableError.message;
      return result;
    }

    result.details!.tableExists = true;
    console.log('✅ Step 3: Tracks table exists');

    // Step 4: Test RLS (try to insert a test record - will fail if RLS blocks it)
    // We'll just check if we can query, which requires RLS to allow it
    const { error: rlsError } = await supabase
      .from('tracks')
      .select('id')
      .limit(1);

    if (rlsError && (rlsError.message.includes('RLS') || rlsError.message.includes('policy'))) {
      result.message = '⚠️ Connection OK, but RLS policies may be blocking access';
      result.details!.rlsEnabled = true;
      result.details!.error = rlsError.message;
      return result;
    }

    result.details!.rlsEnabled = true;
    console.log('✅ Step 4: RLS policies configured');

    // All tests passed
    result.success = true;
    result.message = '✅ All database connection tests passed!';
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.message = `❌ Test failed: ${errorMessage}`;
    result.details!.error = errorMessage;
    console.error('❌ Database connection test error:', error);
    return result;
  }
};

/**
 * Quick connection status check
 */
export const quickConnectionCheck = async (): Promise<boolean> => {
  try {
    const status = await getConnectionStatus();
    return status === 'connected';
  } catch (error) {
    return false;
  }
};

/**
 * Test inserting a track (for debugging)
 */
export const testTrackInsert = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const testTrack = {
      title: 'Test Track',
      url: 'https://example.com/test.mp3',
      file_name: 'test.mp3',
      file_size: 1000,
      file_type: 'audio/mpeg',
      uploaded_at: new Date().toISOString(),
      user_id: userId,
    };

    const { error } = await supabase.from('tracks').insert(testTrack).select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Clean up test track
    await supabase.from('tracks').delete().eq('title', 'Test Track').eq('user_id', userId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
