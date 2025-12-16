import { createClient } from '@supabase/supabase-js';

declare const process: any;

const getEnvVar = (key: string) => {
  // Try process.env (polyfilled by Vite config)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore
  }

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase credentials missing! Check your .env file.");
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'placeholder-key'
);