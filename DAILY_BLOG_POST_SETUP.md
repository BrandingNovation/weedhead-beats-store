# Daily Blog Post Automation Setup

This guide explains how to set up automatic daily blog post generation.

## 🎯 What It Does

The script automatically:
1. Generates a new blog post using AI (Gemini)
2. Creates a blog image
3. Uploads the image to Supabase Storage
4. Saves the post to Supabase database
5. Publishes it immediately

## 📋 Prerequisites

1. **Environment Variables** set up:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_KEY` (Gemini API key)

2. **Supabase Setup**:
   - `posts` table exists
   - `site_content` table exists (from migration)
   - `covers` storage bucket exists and is public

## 🚀 Setup Options

### Option 1: Manual Run (Testing)

Test the script manually first:

```bash
# From project root
node scripts/daily-blog-post.js

# Or with a specific topic
node scripts/daily-blog-post.js "Hip Hop Production"
```

### Option 2: Cron Job (Linux/Mac)

1. **Make setup script executable:**
   ```bash
   chmod +x scripts/setup-daily-blog-cron.sh
   ```

2. **Run setup script:**
   ```bash
   ./scripts/setup-daily-blog-cron.sh
   ```

3. **Verify cron job:**
   ```bash
   crontab -l
   ```

The script will run **daily at 9:00 AM**.

### Option 3: Systemd Timer (Linux)

Create a systemd service and timer:

**Create service file** (`/etc/systemd/system/daily-blog.service`):
```ini
[Unit]
Description=Daily Blog Post Generator
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/path/to/weedhead-beats-store
Environment="VITE_SUPABASE_URL=your-url"
Environment="VITE_SUPABASE_ANON_KEY=your-key"
Environment="VITE_API_KEY=your-key"
ExecStart=/usr/bin/node scripts/daily-blog-post.js
```

**Create timer file** (`/etc/systemd/system/daily-blog.timer`):
```ini
[Unit]
Description=Run Daily Blog Post Generator
Requires=daily-blog.service

[Timer]
OnCalendar=daily
OnCalendar=09:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Enable and start:**
```bash
sudo systemctl enable daily-blog.timer
sudo systemctl start daily-blog.timer
sudo systemctl status daily-blog.timer
```

### Option 4: GitHub Actions (Cloud)

Create `.github/workflows/daily-blog.yml`:

```yaml
name: Daily Blog Post

on:
  schedule:
    - cron: '0 9 * * *' # Daily at 9 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  generate-blog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/daily-blog-post.js
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
```

### Option 5: Coolify Scheduled Tasks

If using Coolify, you can set up a scheduled task:

1. Go to **Coolify → Your Project → Scheduled Tasks**
2. Click **"New Scheduled Task"**
3. Configure:
   - **Name**: Daily Blog Post
   - **Schedule**: `0 9 * * *` (daily at 9 AM)
   - **Command**: `node scripts/daily-blog-post.js`
   - **Environment Variables**: Add all required vars

## 🔧 Configuration

### Change Schedule Time

Edit the cron entry or timer to change when it runs:

```bash
# Edit cron job
crontab -e

# Change time (format: minute hour day month weekday)
# Example: Run at 6 PM daily
0 18 * * * cd /path/to/project && node scripts/daily-blog-post.js
```

### Change Default Topics

Edit `scripts/daily-blog-post.js` and modify the `DEFAULT_TOPICS` array:

```javascript
const DEFAULT_TOPICS = [
  'Your Custom Topic',
  'Another Topic',
  // ...
];
```

### Specify Topic Manually

```bash
node scripts/daily-blog-post.js "Your Custom Topic"
```

## 📊 Monitoring

### Check Logs

**Cron job logs:**
```bash
tail -f logs/daily-blog.log
```

**Systemd logs:**
```bash
journalctl -u daily-blog.service -f
```

### Verify Posts

Check Supabase Dashboard → Table Editor → `posts` table to see generated posts.

## 🐛 Troubleshooting

### Script Fails with "Missing credentials"

**Fix**: Set environment variables:
```bash
export VITE_SUPABASE_URL="your-url"
export VITE_SUPABASE_ANON_KEY="your-key"
export VITE_API_KEY="your-key"
```

Or create a `.env` file in the project root.

### Script Fails with "Model not found"

**Fix**: The script tries multiple models. If all fail, check:
- Gemini API key is valid
- API key has access to the models
- You're using a paid account (for premium models)

### Image Upload Fails

**Fix**: 
- Check `covers` bucket exists in Supabase Storage
- Check bucket is public
- Check RLS policies allow uploads

### Cron Job Not Running

**Fix**:
1. Check cron service is running: `sudo service cron status`
2. Check cron logs: `grep CRON /var/log/syslog`
3. Verify cron job exists: `crontab -l`
4. Check script path is absolute in cron entry

## 📝 Manual Testing

Before setting up automation, test manually:

```bash
# Test with default topic
node scripts/daily-blog-post.js

# Test with custom topic
node scripts/daily-blog-post.js "Trap Beats"

# Check if post was created
# Go to Supabase Dashboard → posts table
```

## ✅ Verification Checklist

After setup:
- [ ] Script runs manually without errors
- [ ] Post appears in Supabase `posts` table
- [ ] Image is uploaded to Storage
- [ ] Cron job/timer is scheduled
- [ ] Logs are being written
- [ ] Post appears on website

---

**Note**: The script uses the same AI models and prompts as the web interface, so posts will have the same quality and format.

