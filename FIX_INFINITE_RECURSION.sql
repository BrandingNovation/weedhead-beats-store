-- Fix Infinite Recursion in RLS Policy
-- The "Admins can view all profiles" policy causes infinite recursion
-- because it queries profiles within the profiles policy

-- Step 1: Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 2: Keep only the essential policies
-- Users can view their own profile (this is what you need)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Step 3: Update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 4: Insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 5: Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Test - this should work now
-- Replace with your user ID
SELECT * FROM profiles WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';

-- Note: If you need admins to view all profiles, we'll need a different approach
-- that doesn't cause recursion (like using a SECURITY DEFINER function)

