# Game Server Setup Guide

## Overview
This guide explains how to set up and deploy the GRiD game server. **The game server is hosted on ULTRA**, which provides the infrastructure for the entire GRiD game server.

## Architecture

The game server consists of:
1. **WebSocket Server** (`server/gameServer.js`) - Handles real-time multiplayer connections
2. **Next.js API Routes** (`pages/api/game-server/`) - HTTP endpoints for server management
3. **Game Client** (`js/gameServerClient.js`) - Client-side WebSocket connection

## Server Hosting

### ULTRA Hosting

**The entire GRiD game server is hosted on ULTRA.** ULTRA provides:
- Game server infrastructure
- WebSocket server hosting
- Real-time multiplayer support
- Server monitoring and management

The game client automatically connects to the ULTRA-hosted server when players launch the game.

## Deployment Options

### Option 1: Deploy WebSocket Server Separately (Recommended)

Since Vercel doesn't support WebSocket servers natively, deploy the WebSocket server separately:

#### Using ULTRA (Current Setup)
The game server is currently hosted on ULTRA. Configuration:
- Server URL: Configured via `NEXT_PUBLIC_GAME_SERVER_URL` environment variable
- WebSocket endpoint: `wss://your-ultra-server.com/game`
- All players connect to the same ULTRA-hosted server

#### Using Railway (Alternative)
1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Add new service → Deploy from GitHub
5. Set root directory to `/server`
6. Set start command: `node gameServer.js`
7. Add environment variable: `PORT=3001`
8. Railway will provide a URL like: `your-server.railway.app`
9. Update `NEXT_PUBLIC_GAME_SERVER_URL` in Vercel to: `wss://your-server.railway.app/game`

#### Using Render
1. Create account at [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set:
   - Build Command: `npm install`
   - Start Command: `node server/gameServer.js`
   - Environment: Node
5. Add environment variable: `PORT=3001`
6. Render will provide a URL
7. Update `NEXT_PUBLIC_GAME_SERVER_URL` in Vercel

#### Using DigitalOcean App Platform
1. Create account at [DigitalOcean](https://www.digitalocean.com)
2. Create new App
3. Connect GitHub repository
4. Configure:
   - Type: Web Service
   - Build Command: `npm install`
   - Run Command: `node server/gameServer.js`
   - Port: 3001
5. Add environment variables
6. Update `NEXT_PUBLIC_GAME_SERVER_URL` in Vercel

### Option 2: Use Socket.io with Compatible Hosting

If you prefer Socket.io, you can use services that support it:
- [Socket.io Cloud](https://www.socket.io/cloud)
- [Pusher](https://pusher.com)
- [Ably](https://ably.com)

## Domain Setup

### Step 1: Purchase Domain
1. Purchase a domain from:
   - [Namecheap](https://www.namecheap.com)
   - [GoDaddy](https://www.godaddy.com)
   - [Google Domains](https://domains.google)

### Step 2: Configure DNS

#### For WebSocket Server (Railway/Render/etc.)
1. Add a CNAME record:
   - Name: `game` or `server`
   - Value: `your-server.railway.app` (or your hosting provider's URL)
   - TTL: 3600

#### For Website (Vercel)
1. In Vercel dashboard:
   - Go to your project → Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Add `www.yourdomain.com`
2. Vercel will provide DNS records to add:
   - A record: `@` → Vercel IP
   - CNAME record: `www` → Vercel CNAME

### Step 3: SSL Certificate
- Railway/Render/DigitalOcean provide SSL automatically
- Vercel provides SSL automatically
- Ensure WebSocket uses `wss://` (secure WebSocket)

## Environment Variables

### Vercel Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_GAME_SERVER_URL=wss://game.yourdomain.com/game
GAME_SERVER_URL=wss://game.yourdomain.com/game
GAME_SERVER_REGION=us-east-1
MAX_PLAYERS=100
ADMIN_KEY=your-secret-admin-key-here
```

### WebSocket Server Environment Variables
Add these in your hosting platform:

```
PORT=3001
NODE_ENV=production
MAX_PLAYERS=100
```

## Testing

1. **Test WebSocket Server:**
   ```bash
   # Install ws package
   npm install ws
   
   # Run server locally
   node server/gameServer.js
   
   # Test connection
   # Use WebSocket client or browser console:
   const ws = new WebSocket('ws://localhost:3001/game');
   ws.onopen = () => console.log('Connected!');
   ws.onmessage = (e) => console.log(JSON.parse(e.data));
   ```

2. **Test API Routes:**
   ```bash
   # Get server status
   curl https://yourdomain.com/api/game-server/status
   ```

3. **Test in Game:**
   - Open game in browser
   - Check browser console for connection messages
   - Multiple players should see each other

## Monitoring

### Server Health Check
Create a health check endpoint:

```javascript
// pages/api/game-server/health.js
export default async function handler(req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
    });
}
```

### Logging
- Railway/Render provide built-in logs
- Use services like [Logtail](https://logtail.com) or [Datadog](https://datadoghq.com) for advanced logging

## Scaling

### Horizontal Scaling
- Use load balancer (Railway/Render provide this)
- Use Redis for shared state between instances
- Use database for persistent player data

### Vertical Scaling
- Upgrade server resources in hosting platform
- Monitor CPU and memory usage

## Security

1. **Rate Limiting:** Implement rate limiting on WebSocket connections
2. **Authentication:** Add player authentication
3. **Input Validation:** Validate all player inputs
4. **DDoS Protection:** Use Cloudflare or similar
5. **Admin Key:** Keep `ADMIN_KEY` secret

## Cost Estimation

- **Railway:** ~$5-20/month (depending on usage)
- **Render:** Free tier available, ~$7/month for production
- **DigitalOcean:** ~$5-12/month
- **Vercel:** Free tier available, Pro $20/month
- **Domain:** ~$10-15/year

## Support

For issues or questions:
- Check server logs in hosting platform
- Check browser console for client errors
- Test WebSocket connection manually
- Verify environment variables are set correctly

