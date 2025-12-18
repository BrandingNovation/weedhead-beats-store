#!/bin/bash

echo "🔧 Setting up .env file for local development"
echo ""
echo "This script will help you configure your environment variables."
echo "You'll need your Supabase credentials from Coolify."
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "📝 Enter your Supabase URL (from Coolify → Environment Variables → VITE_SUPABASE_URL):"
echo "   Example: https://supabase.brandingnovations.com"
read -p "VITE_SUPABASE_URL: " SUPABASE_URL

echo ""
echo "📝 Enter your Supabase Anon Key (from Coolify → Environment Variables → VITE_SUPABASE_ANON_KEY):"
echo "   This is a long string starting with 'eyJ...'"
read -p "VITE_SUPABASE_ANON_KEY: " SUPABASE_KEY

echo ""
echo "📝 Enter your Gemini API Key (optional, press Enter to skip):"
read -p "VITE_API_KEY: " API_KEY

echo ""
echo "📝 Enter your Stripe Publishable Key (optional, press Enter to skip):"
read -p "VITE_STRIPE_PUBLISHABLE_KEY: " STRIPE_KEY

echo ""
echo "📝 Enter your PayPal Client ID (optional, press Enter to skip):"
read -p "VITE_PAYPAL_CLIENT_ID: " PAYPAL_ID

# Create .env file
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}

# Optional: Other API keys
VITE_API_KEY=${API_KEY:-}
VITE_STRIPE_PUBLISHABLE_KEY=${STRIPE_KEY:-}
VITE_PAYPAL_CLIENT_ID=${PAYPAL_ID:-}
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Your .env file contains:"
echo "   VITE_SUPABASE_URL: ${SUPABASE_URL:0:50}..."
echo "   VITE_SUPABASE_ANON_KEY: ${SUPABASE_KEY:0:50}..."
echo ""
echo "🔄 Now restart your dev server:"
echo "   1. Stop current server (Ctrl+C)"
echo "   2. Run: npm run dev"
echo "   3. Hard refresh browser (Cmd+Shift+R)"
echo ""


