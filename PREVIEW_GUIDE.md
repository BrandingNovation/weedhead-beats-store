# Preview Your App - Quick Guide

## 🚀 Local Preview

The development server should be starting! 

### Access Your App:

1. **Open your browser**
2. **Go to**: `http://localhost:5173`
   - Vite's default port is `5173`
   - If that port is busy, Vite will use the next available port (check terminal output)

### What You'll See:

- ✅ **Store** - Browse beats, albums, sample packs, merch
- ✅ **Merch Section** - T-Shirts, Hoodies, Caps, Mugs, Stickers
- ✅ **Collabs** - Collaboration projects
- ✅ **Blog** - Clickable blog posts
- ✅ **Cart** - Shopping cart functionality
- ✅ **Sign In** - Authentication (will use Demo Mode if Supabase not connected)

---

## 🔧 If Server Didn't Start

### Check Terminal Output:
Look for a message like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Manual Start:
```bash
npm run dev
```

### If Port is Busy:
Vite will automatically use the next available port (5174, 5175, etc.)
Check the terminal output for the actual URL.

---

## 🌐 Network Preview (Share with Others)

To access from other devices on your network:

```bash
npm run dev -- --host
```

Then access via:
- `http://YOUR_IP_ADDRESS:5173`
- Or check terminal for the network URL

---

## 📱 Test Features

### Store Features:
- [ ] Browse different sections (Beats, Albums, Merch)
- [ ] Filter by mood/merch type
- [ ] Add items to cart
- [ ] View product details (merch items)
- [ ] Play audio tracks

### Blog:
- [ ] Click on blog posts (should open modal)
- [ ] Scroll to see infinite loading

### Authentication:
- [ ] Click "Sign In"
- [ ] Try "Enter Demo Mode" if Supabase not connected
- [ ] Create account / Sign in

### Admin Features (if logged in as admin):
- [ ] Access Dashboard
- [ ] Upload tracks
- [ ] Manage blog posts
- [ ] Edit CMS content

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### "Cannot find module"
```bash
npm install
```

### "Page not loading"
- Check terminal for errors
- Make sure you're using the correct URL from terminal
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

## ✅ Quick Checklist

- [ ] Server is running (check terminal)
- [ ] Browser opened to `http://localhost:5173`
- [ ] No errors in browser console (F12)
- [ ] Can see the homepage
- [ ] Can navigate between sections

---

**Your app should now be running! Check the terminal for the exact URL.** 🎉



