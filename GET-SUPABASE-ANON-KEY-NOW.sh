#!/bin/bash
# Quick script to get Supabase anon key from server
# This works even if you can't login to Supabase Studio

echo "🔑 Getting Supabase Anon Key from Server..."
echo ""

SERVER="root@65.21.109.247"
SUPABASE_DIR="/data/coolify/services/wk04oowwwk0c48cg8ssw84og"

echo "📡 Connecting to server..."
echo ""

ssh $SERVER << 'ENDSSH'
SUPABASE_DIR="/data/coolify/services/wk04oowwwk0c48cg8ssw84og"

echo "📂 Checking Supabase service directory..."
if [ ! -d "$SUPABASE_DIR" ]; then
    echo "❌ Supabase directory not found: $SUPABASE_DIR"
    echo "🔍 Searching for Supabase services..."
    find /data/coolify/services -type d -name "*supabase*" 2>/dev/null | head -5
    exit 1
fi

echo "✅ Found Supabase service directory"
echo ""

echo "🔑 Looking for anon key in .env file..."
if [ -f "$SUPABASE_DIR/.env" ]; then
    echo ""
    echo "📋 ANON KEY FOUND:"
    echo "=================="
    grep -i "ANON_KEY\|SUPABASE_ANON\|POSTGRES_ANON" "$SUPABASE_DIR/.env" | head -3
    echo ""
    echo "📋 Full anon key (for copying):"
    ANON_KEY=$(grep -i "ANON_KEY" "$SUPABASE_DIR/.env" | head -1 | cut -d'=' -f2 | tr -d ' "')
    if [ ! -z "$ANON_KEY" ]; then
        echo "$ANON_KEY"
    else
        echo "⚠️  Could not extract anon key. Showing raw .env content:"
        grep -i "ANON" "$SUPABASE_DIR/.env" | head -5
    fi
else
    echo "❌ .env file not found"
    echo "📂 Listing directory contents:"
    ls -la "$SUPABASE_DIR" | head -10
fi

echo ""
echo "🔍 Alternative: Checking Docker containers..."
docker ps | grep -i supabase | head -3

echo ""
echo "📋 To get anon key from container:"
echo "   docker exec <supabase-container> env | grep ANON_KEY"

ENDSSH

echo ""
echo "✅ Done!"
echo ""
echo "📝 Next Steps:"
echo "   1. Copy the anon key from above"
echo "   2. Go to Coolify → Your App → Environment Variables"
echo "   3. Update VITE_SUPABASE_ANON_KEY with the key"
echo "   4. Redeploy your application"
