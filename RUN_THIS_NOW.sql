-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR RIGHT NOW ⚠️
-- This fixes the infinite recursion error

-- Step 1: Drop the problematic admin policy (this is causing the infinite recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 2: Recreate the essential policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 3: Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ✅ Done! Now sign out and sign back in to your app.


