# Where is the Multiple Images Upload Field?

## Location in the Form

The **"Product Images * (Multiple images allowed)"** field appears in **TWO places**:

### 1. **Upload Track/Merch Tab** (Dashboard → Upload Track/Merch)

**Location in form order:**
1. Title *
2. BPM
3. Key
4. Price
5. Mood
6. **Category** ← Select "Merchandise" here
7. Description * (Required for Merch)
8. YouTube URL
9. **🟢 PRODUCT IMAGES * (Multiple images allowed)** ← **HERE!** (Only shows when Category = "Merchandise")
10. Audio File (Optional for Merch)
11. Stems (ZIP File)

**Visual Location:**
- Right after the "YouTube URL" field
- Before the "Audio File" field
- In a **highlighted green box** with border
- Label says: "Product Images * (Multiple images allowed - Hold Ctrl/Cmd to select multiple)"

### 2. **Inventory Tab** (Dashboard → Inventory → Edit Track)

**Location in form order:**
1. Title *
2. BPM
3. Key
4. Price
5. Mood
6. **Category** ← Select "Merchandise" here
7. Description * (Required for Merch)
8. YouTube URL
9. **🟢 PRODUCT IMAGES * (Multiple images allowed)** ← **HERE!** (Only shows when Category = "Merchandise")
10. Audio File (Optional for Merch)
11. Stems (ZIP File)

## How to See It

1. **Go to Dashboard** (click your avatar → Dashboard)
2. **Click "Upload Track/Merch" tab** (or go to Inventory → Edit a track)
3. **Select "Merchandise" from the Category dropdown**
4. **Scroll down** past the Description and YouTube URL fields
5. **Look for a green highlighted box** with:
   - Green border
   - Image icon
   - Text: "Product Images * (Multiple images allowed - Hold Ctrl/Cmd to select multiple)"
   - File input button
   - Tip text below

## If You Don't See It

**Check:**
- ✅ Is Category set to "Merchandise"? (not "Beat", "Sample Pack", etc.)
- ✅ Are you scrolling down far enough? (It's after YouTube URL)
- ✅ Are you on the correct tab? (Upload Track/Merch OR Inventory → Edit)

**If still not visible:**
- Open browser console (F12) and check for errors
- Look for console.log message: "Category changed to: merch"
- Try refreshing the page
- Make sure you're logged in as admin

## What It Looks Like

```
┌─────────────────────────────────────────────────────────┐
│ 🖼️ PRODUCT IMAGES * (Multiple images allowed - Hold     │
│    Ctrl/Cmd to select multiple)                          │
│                                                          │
│ [Choose File] button (with green border)                │
│                                                          │
│ 💡 Tip: Select multiple images (hold Ctrl on            │
│    Windows/Linux or Cmd on Mac) to show different       │
│    angles, colors, or details. The first image will be  │
│    used as the cover/thumbnail.                         │
└─────────────────────────────────────────────────────────┘
```

This box has a **green background tint** and **green border** to make it stand out!

