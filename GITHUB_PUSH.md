# Push to GitHub - Quick Guide

## ✅ Step 1: Create GitHub Repository

1. Go to https://github.com and log in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `weedhead-beats-store` (or your preferred name)
4. Description: "Weedhead Beats AI Store - E-commerce platform with merch, orders, blog, and AI features"
5. Choose **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **"Create repository"**

## ✅ Step 2: Copy Repository URL

After creating the repo, GitHub will show you a page with commands. Copy the repository URL:
- It will look like: `https://github.com/YOUR_USERNAME/weedhead-beats-store.git`
- Or SSH: `git@github.com:YOUR_USERNAME/weedhead-beats-store.git`

## ✅ Step 3: Add Remote and Push

Run these commands in your terminal (replace YOUR_USERNAME with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/weedhead-beats-store.git
git branch -M main
git push -u origin main
```

## 🔐 Authentication

If GitHub asks for authentication:
- **Personal Access Token**: Use a GitHub Personal Access Token (not password)
- Create one at: https://github.com/settings/tokens
- Select scopes: `repo` (full control of private repositories)

## ✅ Done!

Your code is now on GitHub! You can:
- View it at: `https://github.com/YOUR_USERNAME/weedhead-beats-store`
- Connect it to Coolify for deployment
- Share it with others

