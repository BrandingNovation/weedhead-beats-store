# Weedhead Beats - AI Store 🎹

A premium, AI-powered beat store and producer dashboard built with **React**, **Supabase**, and **Google Gemini 2.5**.

![App Screenshot](https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop)

## 🚀 Features

- **Storefront**: Browse beats, sample packs, and collabs with a sleek, dark-mode UI.
- **AI Studio Concierge**: Integrated Gemini 2.5 chatbot that helps artists write lyrics, find rhyme schemes, and understand music theory for specific tracks.
- **Admin Dashboard**: Upload tracks, manage inventory, and view sales stats.
- **AI Blog Generator**: Automatically generate SEO-friendly producer news using Gemini 2.5 + Grounding (Google Search).
- **Audio Player**: persistent footer player with queue management.
- **Backend**: Supabase Auth (with Row Level Security) and Storage.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons.
- **AI**: Google Gemini API (`@google/genai` SDK).
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Build Tool**: Vite.

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/weedhead-beats.git
cd weedhead-beats
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (copy `.env.example`):
```bash
cp .env.example .env
```
Fill in your keys:
- `API_KEY`: Your Google Gemini API key.
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### 4. Run the development server
```bash
npm run dev
```

## 🗄️ Database Setup (Supabase)

The app includes a SQL snippet in `lib/supabaseClient.ts` comments. Run that SQL in your Supabase SQL Editor to create the necessary tables (`tracks`, `profiles`, `posts`) and enable policies.

## 🔒 Security Note

The `supabaseClient.ts` file contains fallback keys for the demo environment. For production, ensure you remove these fallbacks and strictly use environment variables.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
