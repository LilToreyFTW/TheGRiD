# Complete Deployment Instructions for CoresNewGame

## 🎯 Repository: CoresNewGame
## 🌐 Deployment: Vercel

## Step-by-Step Deployment Guide

### Step 1: Prepare Your Project

```bash
# Install all dependencies
npm install

# Run setup script to organize files
# Windows:
powershell -ExecutionPolicy Bypass -File scripts/setup-nextjs.ps1

# Linux/Mac:
chmod +x scripts/setup-nextjs.sh
./scripts/setup-nextjs.sh
```

### Step 2: Initialize Git Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: GRiD - Complete 3D Video Game with Discord Bot"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: **CoresNewGame**
3. Description: **GRiD - 3D Video Game with Discord Bot Integration**
4. Visibility: Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 4: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/CoresNewGame.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 5: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose your **CoresNewGame** repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables:**
   Go to "Environment Variables" and add:
   ```
   DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
   DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE
   DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET_HERE
   DISCORD_GUILD_ID=YOUR_DISCORD_GUILD_ID_HERE
   DISCORD_OWNER_ID=YOUR_DISCORD_OWNER_ID_HERE
   GAME_CHAT_WEBHOOK=YOUR_GAME_CHAT_WEBHOOK_URL_HERE
   GAME_LOGS_WEBHOOK=YOUR_GAME_LOGS_WEBHOOK_URL_HERE
   NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/vxt64amrgt
   ```
   
   **Important:** Add these for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to project (first time)
vercel link

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 6: Verify Deployment

After deployment, check:

1. **Vercel Dashboard:**
   - ✅ Build completed successfully
   - ✅ Deployment is live
   - ✅ No errors in logs

2. **Test URLs:**
   - Home: `https://cores-new-game.vercel.app`
   - Game: `https://cores-new-game.vercel.app/game`
   - Website: `https://cores-new-game.vercel.app/website`

3. **Test Features:**
   - ✅ Game loads and runs
   - ✅ Website displays correctly
   - ✅ Discord links work
   - ✅ All pages accessible

## 📋 Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Files organized (run setup script)
- [ ] Git repository initialized
- [ ] Code committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Site accessible
- [ ] Game working
- [ ] Website working

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Run `npm install` again
- Check `package.json` has all dependencies
- Verify Node.js version (needs 18+)

**Error: "Next.js not detected"**
- Verify `package.json` has `next` dependency
- Check `next.config.js` exists
- Ensure root directory is correct

### Files Not Loading

**Game files not found:**
- Verify files are in `public/game/` directory
- Check file paths in code use `/game/` prefix
- Ensure `next.config.js` rewrites are correct

**Static assets not loading:**
- Check files are in `public/` directory
- Verify paths use `/` prefix (not relative)
- Check browser console for 404 errors

### Environment Variables Not Working

**Variables not loading:**
- Verify variables in Vercel dashboard
- Check variable names match code
- Redeploy after adding variables
- Ensure variables added for all environments

## 🎉 Post-Deployment

### Update README.md
- Replace `YOUR_USERNAME` with your GitHub username
- Update deployment URLs
- Add your custom domain (if configured)

### Set Up Custom Domain (Optional)
1. Vercel Dashboard > Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed

### Enable Analytics (Optional)
1. Vercel Dashboard > Project Settings > Analytics
2. Enable Vercel Analytics

## 📊 Your Deployment URLs

After successful deployment:

- **Vercel:** `https://cores-new-game.vercel.app`
- **GitHub:** `https://github.com/YOUR_USERNAME/CoresNewGame`
- **Game Direct:** `https://cores-new-game.vercel.app/game/index.html`
- **Website Direct:** `https://cores-new-game.vercel.app/website/index.html`

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Next.js dev server
npm run game:serve       # Game only (standalone)

# Production
npm run build            # Build Next.js
npm run start            # Start production server

# Discord Bot
npm run bot              # Run bot
npm run bot:dev          # Run bot (dev mode)

# Deployment
git add .
git commit -m "Update"
git push origin main     # Auto-deploys to Vercel
```

## ✅ Success!

Your complete game is now:
- ✅ On GitHub as **CoresNewGame**
- ✅ Deployed to Vercel
- ✅ Accessible worldwide
- ✅ Ready for players!

🎮 **Happy Gaming!**

