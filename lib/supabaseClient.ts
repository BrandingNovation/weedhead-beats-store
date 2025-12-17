/// <reference types="../vite-env.d.ts" />
import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials missing!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "MISSING");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "MISSING");
  console.error("");
  console.error("🔧 To fix this locally:");
  console.error("   1. Run: ./setup-env.sh");
  console.error("   2. Or manually create .env file with your Supabase credentials");
  console.error("   3. Get values from Coolify → Your App → Environment Variables");
  console.error("   4. Restart dev server after creating .env");
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'placeholder-key'
);