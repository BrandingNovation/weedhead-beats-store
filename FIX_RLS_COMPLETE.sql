-- Complete RLS Fix for Profiles Table
-- Run this entire block in Supabase SQL Editor

-- Step 1: Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 4: Create SELECT policy (most important for fetching profile)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Step 5: Create UPDATE policy
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 6: Create INSERT policy
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 7: Create admin view all policy
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Step 8: Verify policies were created
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as has_using
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 9: Test the query (should work now)
-- Replace with your user ID
SELECT * FROM profiles WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';


