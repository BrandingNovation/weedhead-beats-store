-- ============================================
-- Migration Script: Add Merchandise & Orders
-- Weedhead Beats AI Store
-- ============================================
-- Run this script if you already have an existing database
-- This adds all new features: merch, orders, cart, streaming links
-- ============================================

-- ============================================
-- 1. ADD MERCH CATEGORY TO TRACKS
-- ============================================
-- Update tracks table to include 'merch' category
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_category_check;
ALTER TABLE tracks ADD CONSTRAINT tracks_category_check 
    CHECK (category IN ('beat', 'sample_pack', 'album', 'collab', 'merch'));

-- Make bpm and key nullable (merch items don't need these)
ALTER TABLE tracks ALTER COLUMN bpm DROP NOT NULL;
ALTER TABLE tracks ALTER COLUMN audio DROP NOT NULL;

-- ============================================
-- 2. ADD STREAMING LINKS TO TRACKS
-- ============================================
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS apple_music_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS amazon_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS stats_revenue DECIMAL(10, 2) DEFAULT 0;

-- ============================================
-- 3. CREATE MERCH TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merch_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS merch_type_id UUID REFERENCES merch_types(id) ON DELETE SET NULL;

-- ============================================
-- 4. CREATE CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    license_name TEXT,
    license_price DECIMAL(10, 2),
    size TEXT,
    color TEXT,
    quantity INTEGER DEFAULT 1,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CREATE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    shipping_address JSONB,
    tracking_number TEXT,
    estimated_delivery_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CREATE ORDER ITEMS TABLE
-- ============================================
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
-- 7. CREATE SAVED TRACKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- ============================================
-- 8. ADD INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tracks_merch_type ON tracks(merch_type_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_tracks_user ON saved_tracks(user_id);

-- ============================================
-- 9. ENABLE RLS
-- ============================================
ALTER TABLE merch_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tracks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. ADD RLS POLICIES
-- ============================================

-- MERCH TYPES POLICIES
DROP POLICY IF EXISTS "Merch types are viewable by everyone" ON merch_types;
CREATE POLICY "Merch types are viewable by everyone"
    ON merch_types FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can insert merch types" ON merch_types;
CREATE POLICY "Admins can insert merch types"
    ON merch_types FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update merch types" ON merch_types;
CREATE POLICY "Admins can update merch types"
    ON merch_types FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete merch types" ON merch_types;
CREATE POLICY "Admins can delete merch types"
    ON merch_types FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- CART ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
CREATE POLICY "Users can view own cart items"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
CREATE POLICY "Users can insert own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- SAVED TRACKS POLICIES
DROP POLICY IF EXISTS "Users can view own saved tracks" ON saved_tracks;
CREATE POLICY "Users can view own saved tracks"
    ON saved_tracks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved tracks" ON saved_tracks;
CREATE POLICY "Users can insert own saved tracks"
    ON saved_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved tracks" ON saved_tracks;
CREATE POLICY "Users can delete own saved tracks"
    ON saved_tracks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 11. ADD TRIGGERS
-- ============================================
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
-- 12. ADD HELPER FUNCTIONS
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
-- 13. INSERT SAMPLE MERCH TYPES
-- ============================================
INSERT INTO merch_types (name, description) VALUES
    ('T-Shirt', 'Premium cotton t-shirts with Weedhead Beats logo'),
    ('Hoodie', 'Comfortable hoodies perfect for late night studio sessions'),
    ('Sticker Pack', 'Set of premium vinyl stickers with Weedhead Beats designs'),
    ('Cap', 'Snapback caps with embroidered logo'),
    ('Mug', 'Ceramic mugs perfect for your morning coffee while making beats')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All new features have been added:
-- ✅ Merchandise support with types
-- ✅ Shopping cart functionality
-- ✅ Order management system
-- ✅ Saved/favorited tracks
-- ✅ Streaming links for albums
-- ✅ Size, color, and quantity support
-- ============================================

