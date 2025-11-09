# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository `CoresNewGame`
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   In Vercel dashboard, go to Project Settings > Environment Variables:
   
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

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://cores-new-game.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Vercel Configuration

The `vercel.json` file is already configured with:
- ✅ Next.js framework detection
- ✅ Environment variables
- ✅ Rewrites for game and website routes
- ✅ Security headers
- ✅ Build settings

## Project Settings in Vercel

### Build & Development Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### Environment Variables
Add all variables from `.env` file in Vercel dashboard:
- Project Settings > Environment Variables
- Add for Production, Preview, and Development

### Domains
- Default: `cores-new-game.vercel.app`
- Add custom domain: Project Settings > Domains

## File Structure for Vercel

```
CoresNewGame/
├── pages/              # Next.js pages (routed automatically)
│   ├── index.js       # Home page (/)
│   ├── game.js        # Game page (/game)
│   └── website.js     # Website page (/website)
├── public/            # Static files (served at root)
│   ├── game/         # Game files (/game/*)
│   └── website/      # Website files (/website/*)
├── styles/           # Global styles
├── next.config.js    # Next.js configuration
├── vercel.json       # Vercel configuration
└── package.json      # Dependencies
```

## Routes

- `/` - Home page (Next.js)
- `/game` - Game page (Next.js iframe or direct)
- `/website` - Website page (Next.js iframe or direct)
- `/game/*` - Static game files
- `/website/*` - Static website files

## Build Output

Vercel will:
1. Install dependencies (`npm install`)
2. Build Next.js app (`npm run build`)
3. Deploy to edge network
4. Provide HTTPS automatically

## Monitoring

- **Deployments:** View in Vercel dashboard
- **Logs:** Real-time logs in Vercel dashboard
- **Analytics:** Enable in Project Settings > Analytics

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Check Node.js version (needs 18+)

**Environment Variables Not Working:**
- Verify variables are set in Vercel dashboard
- Check variable names match code
- Redeploy after adding variables

**Static Files Not Loading:**
- Verify files are in `public/` directory
- Check file paths in code
- Ensure `next.config.js` is configured

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Site accessible
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

## Next Steps

1. **Set up custom domain** (optional)
2. **Enable analytics** in Vercel
3. **Set up monitoring** and alerts
4. **Configure CI/CD** for auto-deployments

Your game is now live on Vercel! 🚀

