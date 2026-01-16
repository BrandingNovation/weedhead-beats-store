#!/bin/bash

# Setup Daily Blog Post Cron Job
# This script sets up a cron job to run the daily blog post generator

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CRON_LOG="$PROJECT_DIR/logs/daily-blog.log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$CRON_LOG")"

# Get the full path to the script
DAILY_BLOG_SCRIPT="$SCRIPT_DIR/daily-blog-post.js"

# Check if script exists
if [ ! -f "$DAILY_BLOG_SCRIPT" ]; then
    echo "❌ Error: Script not found at $DAILY_BLOG_SCRIPT"
    exit 1
fi

# Make script executable
chmod +x "$DAILY_BLOG_SCRIPT"

# Create cron job entry (runs daily at 9 AM)
CRON_ENTRY="0 9 * * * cd $PROJECT_DIR && node $DAILY_BLOG_SCRIPT >> $CRON_LOG 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$DAILY_BLOG_SCRIPT"; then
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "$DAILY_BLOG_SCRIPT" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ Daily blog post cron job installed!"
echo ""
echo "📅 Schedule: Daily at 9:00 AM"
echo "📝 Script: $DAILY_BLOG_SCRIPT"
echo "📋 Logs: $CRON_LOG"
echo ""
echo "To view cron jobs: crontab -l"
echo "To remove cron job: crontab -e (then delete the line)"
echo "To test manually: node $DAILY_BLOG_SCRIPT"



