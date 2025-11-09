# GRiD Discord Bot

A comprehensive Discord bot for the GRiD game server, providing game statistics, leaderboards, planet information, mod management, and more.

## Features

- 🎮 **Game Information** - Get details about GRiD game
- 📊 **Player Statistics** - View player stats, levels, scores
- 🏆 **Leaderboard** - View top players
- 🌌 **Planet System** - Browse and get info about planets
- 📦 **Mod Management** - List and get info about mods
- 🎯 **Achievements** - View player achievements
- 🔗 **Account Linking** - Link Discord to game account
- 👮 **Admin Commands** - Announcements and server management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "GRiD Bot"
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the bot token
7. Enable "Message Content Intent" under Privileged Gateway Intents
8. Go to "OAuth2" > "URL Generator"
9. Select scopes: `bot`, `applications.commands`
10. Select bot permissions: `Send Messages`, `Embed Links`, `Read Message History`
11. Copy the generated URL and invite bot to your server

### 3. Set Environment Variables

Create a `.env` file in the project root:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here (optional, for faster command registration)
```

Or set them in your system environment variables.

### 4. Run the Bot

```bash
# Production
npm run bot

# Development (with auto-restart)
npm run bot:dev
```

## Commands

### Game Commands
- `/gameinfo` - Get information about GRiD game
- `/serverstatus` - Check game server status

### Player Commands
- `/player [username]` - Get player statistics
- `/leaderboard [page]` - View the game leaderboard
- `/achievements [username]` - View player achievements

### Planet Commands
- `/planets` - List all available planets
- `/planet <name>` - Get information about a planet

### Mod Commands
- `/mods` - List available game mods
- `/mod <name>` - Get information about a mod

### Account Commands
- `/link <username>` - Link your Discord account to your game account

### Admin Commands
- `/admin announce <message>` - Send announcement to game-chat channel
- `/admin setstatus <status>` - Set server status (online/offline/maintenance)

### Help
- `/help` - Get help with bot commands

## Integration with Game

The bot integrates with the game's webhook system:
- **Game-chat webhook**: For announcements and chat relay
- **Game-logs webhook**: For receiving game events

## Configuration

Edit `discord-bot/bot.js` to customize:
- Webhook URLs
- Command responses
- Embed colors and styling
- Data storage (currently in-memory, should use database in production)

## Production Deployment

For production, consider:
1. Using a database (MongoDB, PostgreSQL) instead of in-memory storage
2. Adding error logging (Winston, Sentry)
3. Adding rate limiting
4. Using environment variables for all sensitive data
5. Setting up process manager (PM2)
6. Adding health checks

## License

Same as GRiD game project.

