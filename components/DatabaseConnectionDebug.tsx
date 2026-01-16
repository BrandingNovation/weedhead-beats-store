/**
 * Database Connection Debug Component
 * 
 * Use this component to test and debug Supabase database connections
 * 
 * Usage:
 *   <DatabaseConnectionDebug />
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { testDatabaseConnection, quickConnectionCheck } from '../utils/dbConnectionTest';

export const DatabaseConnectionDebug: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quickStatus, setQuickStatus] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('[DatabaseConnectionDebug] Component mounted');
  }, []);

  const runFullTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const testResult = await testDatabaseConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const runQuickCheck = async () => {
    setQuickStatus(null);
    try {
      const status = await quickConnectionCheck();
      setQuickStatus(status);
    } catch (error) {
      setQuickStatus(false);
    }
  };

  useEffect(() => {
    runQuickCheck();
  }, []);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">🔍 Database Connection Debug</h2>
      
      <div className="space-y-4">
        {/* Quick Status */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={runQuickCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quick Check
            </button>
            {quickStatus !== null && (
              <span className={`font-semibold ${quickStatus ? 'text-green-600' : 'text-red-600'}`}>
                {quickStatus ? '✅ Connected' : '❌ Disconnected'}
              </span>
            )}
          </div>
        </div>

        {/* Full Test */}
        <div>
          <button
            onClick={runFullTest}
            disabled={testing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {testing ? 'Testing...' : 'Run Full Test'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </div>
            {result.message.includes('Authentication') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>🔑 Quick Fix (Self-Hosted Supabase in Coolify):</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-yellow-800">
                  <li>SSH into your server: <code className="bg-yellow-100 px-1 rounded">ssh root@65.21.109.247</code></li>
                  <li>Check Supabase service env file: <code className="bg-yellow-100 px-1 rounded">cat /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env | grep ANON</code></li>
                  <li>OR check in Coolify UI: Go to Services → Supabase → Environment Variables</li>
                  <li>Copy the <strong>ANON_KEY</strong> or <strong>SUPABASE_ANON_KEY</strong> value</li>
                  <li>Update <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your app's environment variables (Coolify UI or .env.local)</li>
                  <li>Restart your application</li>
                </ol>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <strong>💡 Note:</strong> Your Supabase is self-hosted at <code>https://supabase.brandingnovations.com</code>. The anon key is in your Coolify Supabase service configuration.
                </div>
              </div>
            )}
            
            {result.details && (
              <div className="text-sm space-y-1">
                <div className={result.details.configValid ? 'text-green-600' : 'text-red-600'}>
                  {result.details.configValid ? '✅' : '❌'} Configuration Valid
                </div>
                <div className={result.details.connectionTest ? 'text-green-600' : 'text-red-600'}>
                  {result.details.connectionTest ? '✅' : '❌'} Connection Test
                </div>
                <div className={result.details.tableExists ? 'text-green-600' : 'text-red-600'}>
                  {result.details.tableExists ? '✅' : '❌'} Tracks Table Exists
                </div>
                <div className={result.details.rlsEnabled ? 'text-green-600' : 'text-red-600'}>
                  {result.details.rlsEnabled ? '✅' : '❌'} RLS Policies Configured
                </div>
                
                {result.details.error && (
                  <div className="mt-2 text-red-600">
                    <strong>Error:</strong> {result.details.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Environment Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <strong>Environment Variables:</strong>
          <div className="mt-1 space-y-1">
            <div>
              VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
            </div>
            <div>
              VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
            </div>
          </div>
        </div>

        {/* Supabase Client Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <strong>Supabase Client:</strong>
          <div className="mt-1">
            {supabase ? '✅ Initialized' : '❌ Not initialized'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionDebug;
