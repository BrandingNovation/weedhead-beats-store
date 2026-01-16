-- Check if profile exists for your user
SELECT 
    p.id,
    p.name,
    p.is_admin,
    p.is_pro,
    u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'info@brandingnovations.com';

-- If the above returns nothing, run this to create the profile:
INSERT INTO profiles (id, name, avatar_url, is_admin, is_pro, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', NULL) as avatar_url,
    true as is_admin,
    true as is_pro,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email = 'info@brandingnovations.com'
ON CONFLICT (id) DO UPDATE SET 
    name = COALESCE(EXCLUDED.name, profiles.name),
    is_admin = true,
    is_pro = true,
    updated_at = NOW();

-- Verify RLS policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- If policies are missing, recreate them:
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Final check - should return your profile
SELECT 
    p.id,
    p.name,
    p.is_admin,
    u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'info@brandingnovations.com';



