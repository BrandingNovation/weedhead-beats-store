# Weedhead Beats AI Store - Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- A self-hosted Supabase instance (via Coolify)
- Google Gemini API key (optional, for AI features)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API Key (for AI features)
VITE_API_KEY=your-gemini-api-key-here

# Stripe Configuration (Optional - for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key-here

# PayPal Configuration (Optional - for payments)
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id-here
```

## Database Setup

### Option A: New Database Installation

1. **Run the SQL Script**
   - Log in to your Supabase Dashboard (https://app.supabase.com or your self-hosted instance)
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query** or the **+** button to create a new query
   - Open the `supabase_setup.sql` file from this project
   - **Copy the entire contents** of the file (Cmd+A / Ctrl+A, then Cmd+C / Ctrl+C)
   - **Paste it into the SQL Editor** (Cmd+V / Ctrl+V)
   - Click **Run** or press **Ctrl+Enter** (Windows/Linux) or **Cmd+Enter** (Mac)
   - Wait for the script to complete (you should see "Success. No rows returned")
   - ✅ All tables, policies, and functions are now created!

### Option B: Existing Database Migration

If you already have a database set up and want to add the new features (merch, orders, cart):

1. **Run the Migration Script**
   - Open your Supabase SQL Editor
   - Create a new query
   - Open the `migration_add_merch_and_orders.sql` file
   - Copy and paste the entire contents
   - Click **Run**
   - ✅ New features are now added to your existing database!

2. **Create Storage Buckets**
   - Go to Storage in your Supabase dashboard
   - Create two public buckets:
     - `covers` - for track cover images
     - `audio` - for audio files
   - Set both buckets to **Public**
   - Set file size limits:
     - `covers`: 50MB max
     - `audio`: 100MB max
   - Set allowed MIME types:
     - `covers`: `image/jpeg`, `image/png`, `image/webp`
     - `audio`: `audio/mpeg`, `audio/wav`, `audio/mp3`, `audio/m4a`

3. **Set Up Admin User**
   - Sign up a user through the app
   - In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'your-admin-email@example.com';
   ```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Features

- ✅ Full-stack beat store with Supabase backend
- ✅ User authentication and profiles
- ✅ Track/beat management (CRUD operations)
- ✅ Blog post management with AI generation
- ✅ Admin dashboard
- ✅ Audio player with playlist
- ✅ Shopping cart functionality
- ✅ AI-powered concierge (Gemini integration)
- ✅ File uploads to Supabase Storage

## Troubleshooting

### Database Connection Issues
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that your Supabase instance is accessible
- Ensure RLS policies are set up correctly

### Storage Upload Issues
- Verify storage buckets are created and set to public
- Check storage policies in the SQL script
- Ensure file sizes are within limits

### AI Features Not Working
- Verify `VITE_API_KEY` is set correctly
- Check that you have a valid Gemini API key
- The app will work without AI features, but the concierge won't function

## Project Structure

```
├── App.tsx                 # Main application component
├── components/            # React components
│   ├── BeatRow.tsx
│   ├── InputArea.tsx
│   ├── MessageItem.tsx
│   ├── Player.tsx
│   └── Sidebar.tsx
├── lib/
│   └── supabaseClient.ts  # Supabase client configuration
├── services/
│   └── geminiService.ts    # Gemini AI service
├── types.ts               # TypeScript type definitions
└── supabase_setup.sql     # Database setup script
```

## License

This project is private and proprietary.

