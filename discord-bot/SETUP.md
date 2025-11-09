# GRiD Discord Bot - Configured

## ✅ Bot Credentials Configured

Your Discord bot has been configured with the following credentials:

- **Guild ID**: `1436947681560760414`
- **Owner User ID**: `1368087024401252393`
- **Client ID**: `1436950847907958855`
- **Bot Token**: Configured in code (use .env for production)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Bot
```bash
# Production
npm run bot

# Development (auto-restart)
npm run bot:dev
```

The bot will automatically use the configured credentials!

## 👑 Owner Features

As the bot owner (User ID: 1368087024401252393), you have access to:

- `/admin broadcast <message>` - Broadcast to all players
- `/admin playerdata <username>` - Get detailed player data
- `/admin restart` - Restart the bot
- All regular admin commands

## 🔒 Security Note

**For production**, move credentials to `.env` file:

```env
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE
DISCORD_GUILD_ID=YOUR_DISCORD_GUILD_ID_HERE
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET_HERE
```

The bot currently has credentials hardcoded for quick setup, but using environment variables is recommended for security.

## 📋 Bot Status

Once running, you should see:
```
✅ Discord Bot logged in as GRiD Bot#1234!
👤 Owner ID: 1368087024401252393
🏠 Guild ID: 1436947681560760414
🔄 Registering slash commands...
✅ Successfully registered slash commands!
```

## 🎮 Commands Available

- `/help` - Get help
- `/gameinfo` - Game information
- `/serverstatus` - Server status
- `/player [username]` - Player stats
- `/leaderboard` - Top players
- `/planets` - List planets
- `/admin` - Admin commands (Owner/Admin only)

## 🔔 Owner Notifications

The bot will send you a DM when it starts up, confirming it's online.

## 📚 Documentation

- See `discord-bot/README.md` for full documentation
- See `discord-bot/CONFIG.md` for configuration details
- See `discord-bot/QUICKSTART.md` for setup guide

Your bot is ready to go! 🚀

