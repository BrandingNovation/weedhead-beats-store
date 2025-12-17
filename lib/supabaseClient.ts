// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Set up Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: "VITE_SUPABASE_URL" and/or "VITE_SUPABASE_ANON_KEY". Please ensure these are set in your environment configuration. Refer to the documentation for redeployment instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);