import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials missing!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "MISSING");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "MISSING");
  console.error("Please check your environment variables in Coolify.");
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'placeholder-key'
);