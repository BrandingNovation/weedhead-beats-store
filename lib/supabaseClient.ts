/// <reference types="../vite-env.d.ts" />
import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env
let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Validate URL format
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Check and log issues
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials missing!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? `"${supabaseUrl}"` : "MISSING");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set (hidden)" : "MISSING");
  console.error("");
  console.error("🔧 To fix:");
  console.error("   1. Go to Coolify → Your App → Environment Variables");
  console.error("   2. Add/Update VITE_SUPABASE_URL (must start with https://)");
  console.error("   3. Add/Update VITE_SUPABASE_ANON_KEY");
  console.error("   4. Make sure both are checked: Available at Buildtime & Runtime");
  console.error("   5. Redeploy your application");
}

// Validate URL format
if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.error("❌ Invalid Supabase URL format!");
  console.error("   Current value:", supabaseUrl);
  console.error("   URL must start with http:// or https://");
  console.error("   Example: https://your-project.supabase.co");
  // Don't use invalid URL, set to empty to trigger fallback
  supabaseUrl = '';
}

// Use fallback values if missing (but log warning)
const finalUrl = supabaseUrl || 'http://localhost:54321';
const finalKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Using fallback values. App may not work correctly until environment variables are set.");
}

export const supabase = createClient(finalUrl, finalKey);