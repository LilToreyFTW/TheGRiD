# ULTRA Hosting Configuration

## Overview

**ULTRA hosts the entire GRiD game server.** This document describes the ULTRA hosting setup and configuration for The GRiD game.

## Server Architecture

ULTRA provides:
- **Game Server Infrastructure** - Hosts the WebSocket server for real-time multiplayer
- **Single Server Architecture** - All players connect to the same ULTRA-hosted server
- **Server Monitoring** - ULTRA provides monitoring and management tools
- **Scalability** - ULTRA handles server scaling and load balancing

## Configuration

### Environment Variables

The game client connects to the ULTRA-hosted server via the `NEXT_PUBLIC_GAME_SERVER_URL` environment variable:

```env
NEXT_PUBLIC_GAME_SERVER_URL=wss://your-ultra-server.com/game
```

### Game Client Connection

The game client (`js/gameServerClient.js`) automatically connects to the ULTRA-hosted server when players launch the game:

```javascript
// js/gameServerClient.js
this.serverUrl = serverUrl || process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'ws://localhost:3001/game';
```

### WebSocket Server

The game server (`server/gameServer.js`) runs on ULTRA and handles:
- Player connections and disconnections
- Real-time position updates
- Chat messages
- Game state synchronization
- Player actions

## Server Features

### Single Server Architecture

- **One Server for All Players** - Everyone connects to the same ULTRA-hosted server
- **Real-time Synchronization** - All players see each other in real-time
- **Persistent World** - The game world persists across player sessions

### Player Monitoring

The Discord bot monitors online players via the ULTRA-hosted server:
- Tracks player join/leave events
- Reports player count to Discord
- Logs game events to Discord webhooks

## Deployment

### ULTRA Server Setup

1. Deploy `server/gameServer.js` to ULTRA
2. Configure environment variables on ULTRA:
   - `PORT=3001` (or your preferred port)
   - `NODE_ENV=production`
   - `MAX_PLAYERS=100` (or your preferred limit)
3. Set up SSL/TLS for secure WebSocket connections (`wss://`)
4. Configure firewall rules to allow WebSocket connections

### Client Configuration

1. Set `NEXT_PUBLIC_GAME_SERVER_URL` in Vercel environment variables:
   ```
   NEXT_PUBLIC_GAME_SERVER_URL=wss://your-ultra-server.com/game
   ```
2. The game client will automatically connect to the ULTRA server
3. Players launching the game (EXE or web) will connect to ULTRA

## Monitoring

### Server Health

Monitor the ULTRA server via:
- ULTRA dashboard (server metrics, logs, uptime)
- Health check endpoint: `https://your-ultra-server.com/health`
- Discord bot status commands (`/serverstatus`)

### Player Tracking

- Real-time player count via Discord bot
- Player join/leave events logged to Discord webhooks
- Server status displayed in-game and on Discord

## Security

### SSL/TLS

- Use `wss://` (secure WebSocket) for production
- ULTRA should provide SSL certificates automatically
- Ensure all connections are encrypted

### Rate Limiting

- Implement rate limiting on WebSocket connections
- Prevent DDoS attacks
- Monitor for suspicious activity

### Authentication

- Player authentication can be added via Discord OAuth
- Admin commands require Discord role verification
- Owner commands require owner role verification

## Troubleshooting

### Connection Issues

1. **Check Server URL:**
   - Verify `NEXT_PUBLIC_GAME_SERVER_URL` is set correctly
   - Ensure URL uses `wss://` for secure connections

2. **Check Server Status:**
   - Verify ULTRA server is running
   - Check ULTRA dashboard for server status
   - Test WebSocket connection manually

3. **Check Firewall:**
   - Ensure ULTRA firewall allows WebSocket connections
   - Verify port is open and accessible

### Performance Issues

1. **Monitor Server Resources:**
   - Check CPU and memory usage on ULTRA
   - Monitor network bandwidth
   - Review player count limits

2. **Optimize Game Server:**
   - Adjust broadcast frequency
   - Implement player culling (only send updates for nearby players)
   - Use compression for WebSocket messages

## Support

For ULTRA hosting issues:
- Check ULTRA documentation
- Review ULTRA server logs
- Contact ULTRA support if needed

For game server issues:
- Check `server/gameServer.js` logs
- Review Discord bot logs
- Test WebSocket connection manually

## Notes

- The game server runs independently from the website (Vercel)
- The website (Vercel) serves the game client and website
- The game server (ULTRA) handles multiplayer connections
- Both must be running for full game functionality

