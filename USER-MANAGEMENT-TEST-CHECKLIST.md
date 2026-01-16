# User Management Component - Browser Testing Checklist

## ✅ Code Integration Status
- ✅ Component created: `components/AdminUserManagement.tsx`
- ✅ Import added to `App.tsx`
- ✅ "Users" tab added to admin dashboard
- ✅ Component render condition added
- ✅ No TypeScript errors

## 🧪 Testing Steps

### 1. Start Dev Server
```bash
cd /Users/elements/Downloads/supabase-weedhead-beats---ai-store
npm run dev
```
**Note:** If you get port permission errors, try:
- Kill any processes on ports 5173-5176: `lsof -ti:5173 | xargs kill -9`
- Or use a different port: `npm run dev -- --port 3001`

### 2. Navigate to Admin Dashboard
1. Open browser: `http://localhost:5173` (or your port)
2. Log in as an admin user (email contains "admin" or has `is_admin: true` in profiles table)
3. Click on "Dashboard" or navigate to admin section
4. Look for the "Users" tab in the admin navigation

### 3. Test User Management Features

#### ✅ Verify Users Tab Appears
- [ ] "Users" tab is visible in admin dashboard navigation
- [ ] Tab has User icon
- [ ] Clicking tab shows User Management component

#### ✅ Test User List Loading
- [ ] Component shows loading spinner initially
- [ ] Users list loads and displays
- [ ] Each user shows:
  - [ ] Avatar image
  - [ ] Name
  - [ ] Email address
  - [ ] Role badges (Admin/Pro/User)
  - [ ] Activity stats (orders, comments, playlists)
  - [ ] Last active date

#### ✅ Test Search Functionality
- [ ] Search bar is visible
- [ ] Type a user's name → filters correctly
- [ ] Type a user's email → filters correctly
- [ ] Clear search → shows all users again

#### ✅ Test Edit User Modal
- [ ] Click edit button (pencil icon) on a user
- [ ] Modal opens with user details
- [ ] Name field is editable
- [ ] Email field is disabled (read-only)
- [ ] Admin checkbox works
- [ ] Pro checkbox works
- [ ] Click "Save Changes" → updates successfully
- [ ] Success toast appears
- [ ] User list updates with new data
- [ ] Click "Cancel" → closes modal without saving

#### ✅ Test Role Updates
- [ ] Toggle Admin checkbox → saves correctly
- [ ] Toggle Pro checkbox → saves correctly
- [ ] Check both Admin and Pro → both save
- [ ] Uncheck both → saves as regular user
- [ ] Verify role badges update in user list after save

#### ✅ Test Error Handling
- [ ] If profiles table doesn't exist → shows empty state gracefully
- [ ] If no users found → shows "No users found" message
- [ ] If save fails → shows error toast

### 4. Potential Issues to Watch For

#### ⚠️ RLS (Row Level Security) Issues
If you see "permission denied" errors:
- The `profiles` table might have RLS policies that prevent admin access
- **Fix:** Update RLS policies to allow admins to read all profiles:
```sql
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### ⚠️ Missing Tables
If stats show 0 for all users:
- Check if these tables exist: `orders`, `track_comments`, `playlists`, `favorites`
- Component handles missing tables gracefully (shows 0)

#### ⚠️ Profile Fields
If user data is incomplete:
- Ensure `profiles` table has: `id`, `email`, `name`, `avatar_url`, `is_admin`, `is_pro`, `created_at`
- Component uses fallbacks for missing data

### 5. Expected Behavior

#### ✅ Success Case
- Users load from `profiles` table
- Stats are calculated from related tables
- Search filters work instantly
- Edit modal saves changes to database
- UI updates reflect changes immediately

#### ⚠️ Edge Cases
- Empty profiles table → Shows "No users found"
- No search results → Shows "No users found"
- Network error → Shows error in console, component handles gracefully

## 🐛 Debugging Tips

### Check Browser Console
- Open DevTools (F12)
- Look for any errors in Console tab
- Check Network tab for failed API calls

### Check Supabase
1. Go to Supabase Dashboard
2. Check `profiles` table exists
3. Verify RLS policies allow admin access
4. Check if user has `is_admin: true` in their profile

### Common Fixes

**Issue:** "Users tab not showing"
- **Fix:** Verify you're logged in as admin (`user?.isAdmin === true`)

**Issue:** "No users loading"
- **Fix:** Check `profiles` table exists and has data
- **Fix:** Check RLS policies allow reading profiles

**Issue:** "Can't edit users"
- **Fix:** Check RLS policies allow updating profiles for admins
- **Fix:** Verify `profiles` table has `is_admin` and `is_pro` columns

**Issue:** "Stats showing 0"
- **Fix:** Check if `orders`, `track_comments`, `playlists`, `favorites` tables exist
- **Fix:** Component handles missing tables gracefully (0 is expected if tables don't exist)

## ✅ Success Criteria

The component is working correctly if:
1. ✅ Users tab appears in admin dashboard
2. ✅ User list loads and displays correctly
3. ✅ Search filters users
4. ✅ Edit modal opens and saves changes
5. ✅ Role updates persist in database
6. ✅ UI updates reflect changes immediately

---

**Ready to test!** Follow the steps above and report any issues you encounter.
