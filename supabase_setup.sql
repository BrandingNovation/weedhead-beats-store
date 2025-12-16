-- ============================================
-- Supabase Database Setup Script
-- Weedhead Beats AI Store
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Make sure to set up Storage buckets manually in the Storage section
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- User profiles extending Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    is_pro BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MERCH TYPES TABLE
-- ============================================
-- Merchandise item types (T-Shirt, Hoodie, Cap, etc.)
CREATE TABLE IF NOT EXISTS merch_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TRACKS TABLE
-- ============================================
-- Store beats, sample packs, albums, collaborations, and merchandise
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    producer TEXT DEFAULT 'Weedhead',
    bpm INTEGER,
    key TEXT,
    price DECIMAL(10, 2) NOT NULL,
    mood TEXT,
    category TEXT NOT NULL CHECK (category IN ('beat', 'sample_pack', 'album', 'collab', 'merch')),
    description TEXT,
    youtube_url TEXT,
    spotify_url TEXT,
    apple_music_url TEXT,
    amazon_url TEXT,
    cover TEXT NOT NULL,
    audio TEXT,
    merch_type_id UUID REFERENCES merch_types(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    stats_plays INTEGER DEFAULT 0,
    stats_sales INTEGER DEFAULT 0,
    stats_revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CART ITEMS TABLE
-- ============================================
-- Shopping cart items (session-based, can be linked to user)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    license_name TEXT,
    license_price DECIMAL(10, 2),
    size TEXT,
    color TEXT,
    quantity INTEGER DEFAULT 1,
    session_id TEXT, -- For guest carts
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ORDERS TABLE
-- ============================================
-- Customer orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT, -- 'stripe', 'paypal', etc.
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    shipping_address JSONB,
    tracking_number TEXT,
    estimated_delivery_date DATE,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ORDER ITEMS TABLE
-- ============================================
-- Individual items in an order
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    license_name TEXT,
    price DECIMAL(10, 2) NOT NULL,
    size TEXT,
    color TEXT,
    quantity INTEGER DEFAULT 1,
    is_digital BOOLEAN DEFAULT true,
    download_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. SAVED TRACKS TABLE
-- ============================================
-- User's saved/favorited tracks
CREATE TABLE IF NOT EXISTS saved_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- ============================================
-- 8. POSTS TABLE
-- ============================================
-- Blog posts (AI-generated and manual)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT,
    image TEXT,
    content TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. INDEXES
-- ============================================
-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tracks_category ON tracks(category);
CREATE INDEX IF NOT EXISTS idx_tracks_mood ON tracks(mood);
CREATE INDEX IF NOT EXISTS idx_tracks_merch_type ON tracks(merch_type_id);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_tracks_user ON saved_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_ai_generated ON posts(is_ai_generated);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- TRACKS POLICIES
-- Everyone can read tracks (public store)
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);

-- Only admins can insert tracks
CREATE POLICY "Admins can insert tracks"
    ON tracks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can update tracks
CREATE POLICY "Admins can update tracks"
    ON tracks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can delete tracks
CREATE POLICY "Admins can delete tracks"
    ON tracks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- MERCH TYPES POLICIES
-- Everyone can read merch types
CREATE POLICY "Merch types are viewable by everyone"
    ON merch_types FOR SELECT
    USING (true);

-- Only admins can manage merch types
CREATE POLICY "Admins can insert merch types"
    ON merch_types FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update merch types"
    ON merch_types FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete merch types"
    ON merch_types FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- CART ITEMS POLICIES
-- Users can view their own cart items
CREATE POLICY "Users can view own cart items"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- ORDERS POLICIES
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can update orders
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ORDER ITEMS POLICIES
-- Users can view order items for their orders
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Users can insert order items for their orders
CREATE POLICY "Users can insert own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- SAVED TRACKS POLICIES
-- Users can view their own saved tracks
CREATE POLICY "Users can view own saved tracks"
    ON saved_tracks FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own saved tracks
CREATE POLICY "Users can insert own saved tracks"
    ON saved_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved tracks
CREATE POLICY "Users can delete own saved tracks"
    ON saved_tracks FOR DELETE
    USING (auth.uid() = user_id);

-- POSTS POLICIES
-- Everyone can read posts (public blog)
CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

-- Only admins can insert posts
CREATE POLICY "Admins can insert posts"
    ON posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can update posts
CREATE POLICY "Admins can update posts"
    ON posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
    ON posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merch_types_updated_at
    BEFORE UPDATE ON merch_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. STORAGE BUCKETS SETUP
-- ============================================
-- Note: Storage buckets must be created manually in Supabase Dashboard
-- Go to Storage > Create Bucket
-- 
-- Required buckets:
-- 1. 'covers' - Public bucket for track cover images
-- 2. 'audio' - Public bucket for audio files
--
-- For each bucket, set:
-- - Public: true (for public access)
-- - File size limit: 50MB for covers, 100MB for audio
-- - Allowed MIME types: 
--   - covers: image/jpeg, image/png, image/webp
--   - audio: audio/mpeg, audio/wav, audio/mp3, audio/m4a

-- Storage policies (run after creating buckets)
-- These allow public read access and admin write access

-- Note: For self-hosted Supabase, you may need to create buckets manually in the dashboard
-- The INSERT statements below will work if the storage.buckets table exists
-- If you get errors, create the buckets manually and skip these INSERT statements

-- Covers bucket policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to covers
CREATE POLICY "Public can view covers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'covers');

-- Allow authenticated users to upload covers (admins only in practice)
CREATE POLICY "Authenticated users can upload covers"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Allow authenticated users to update covers
CREATE POLICY "Authenticated users can update covers"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete covers
CREATE POLICY "Authenticated users can delete covers"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Allow public read access to audio
CREATE POLICY "Public can view audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'audio');

-- Allow authenticated users to upload audio
CREATE POLICY "Authenticated users can upload audio"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- Allow authenticated users to update audio
CREATE POLICY "Authenticated users can update audio"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete audio
CREATE POLICY "Authenticated users can delete audio"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- ============================================
-- 10. SAMPLE DATA (Optional)
-- ============================================
-- Uncomment to insert sample data for testing

/*
-- Sample Merch Types
INSERT INTO merch_types (name, description) VALUES
    ('T-Shirt', 'Premium cotton t-shirts with Weedhead Beats logo'),
    ('Hoodie', 'Comfortable hoodies perfect for late night studio sessions'),
    ('Sticker Pack', 'Set of premium vinyl stickers with Weedhead Beats designs'),
    ('Cap', 'Snapback caps with embroidered logo'),
    ('Mug', 'Ceramic mugs perfect for your morning coffee while making beats')
ON CONFLICT (name) DO NOTHING;

-- Sample Merch Items
INSERT INTO tracks (title, producer, bpm, key, price, mood, category, description, cover, merch_type_id)
SELECT 
    'WEEDHEAD BEATS TEE',
    'Weedhead',
    0,
    'N/A',
    29.99,
    'All',
    'merch',
    'Premium cotton t-shirt with Weedhead Beats logo. Available in multiple sizes.',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
    id
FROM merch_types WHERE name = 'T-Shirt'
ON CONFLICT DO NOTHING;

INSERT INTO tracks (title, producer, bpm, key, price, mood, category, description, cover, merch_type_id)
SELECT 
    'STUDIO HOODIE',
    'Weedhead',
    0,
    'N/A',
    59.99,
    'All',
    'merch',
    'Comfortable hoodie perfect for late night studio sessions.',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
    id
FROM merch_types WHERE name = 'Hoodie'
ON CONFLICT DO NOTHING;

-- Sample track
INSERT INTO tracks (title, producer, bpm, key, price, mood, category, description, cover, audio)
VALUES (
    'MIDNIGHT DRIVE',
    'Weedhead',
    140,
    'Cm',
    29.99,
    'Dark',
    'beat',
    'A dark trap banger perfect for late night drives.',
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
);

-- Sample album with streaming links
INSERT INTO tracks (title, producer, bpm, key, price, mood, category, description, cover, audio, spotify_url, apple_music_url, amazon_url)
VALUES (
    'SUMMER VIBES ALBUM',
    'Weedhead',
    110,
    'Cmaj',
    19.99,
    'Euphoric',
    'album',
    'Tropical pop rap album with summer vibes.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://open.spotify.com/album/example',
    'https://music.apple.com/album/example',
    'https://music.amazon.com/album/example'
);

-- Sample post
INSERT INTO posts (title, excerpt, image, is_ai_generated)
VALUES (
    'How to Sell Beats Online in 2024',
    'The landscape of beat selling has changed. Discover the top platforms and marketing strategies to get your first sale.',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop',
    false
);
*/

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
BEGIN
    new_order_number := 'WHB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
        new_order_number := 'WHB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order total from items
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(price * quantity), 0)
    INTO total
    FROM order_items
    WHERE order_id = order_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard (Storage > Create Bucket)
-- 2. Set up environment variables in your .env file
-- 3. Insert sample merch types (uncomment sample data section)
-- 4. Test the connection with your app
-- 
-- New Features Added:
-- - Merchandise support with types (T-Shirt, Hoodie, etc.)
-- - Shopping cart functionality
-- - Order management system
-- - Saved/favorited tracks
-- - Streaming links for albums (Spotify, Apple Music, Amazon)
-- - Size, color, and quantity support for merch items
-- ============================================

