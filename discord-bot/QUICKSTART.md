# Quick Start Guide - GRiD Discord Bot

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it **"GRiD Bot"**
4. Go to **"Bot"** section → Click **"Add Bot"**
5. Copy the **Bot Token** (you'll need this)
6. Enable **"Message Content Intent"** under Privileged Gateway Intents
7. Go to **"OAuth2"** → **"URL Generator"**
8. Select scopes: `bot`, `applications.commands`
9. Select permissions: `Send Messages`, `Embed Links`, `Read Message History`
10. Copy the generated URL and invite bot to your server

### Step 3: Get Your IDs
1. **Client ID**: Go to "General Information" → Copy "Application ID"
2. **Guild ID**: Enable Developer Mode in Discord → Right-click server → "Copy Server ID"

### Step 4: Create .env File
Create a `.env` file in the project root:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here
```

### Step 5: Run the Bot
```bash
# Production
npm run bot

# Development (auto-restart on changes)
npm run bot:dev
```

## ✅ Verification

Once running, you should see:
```
✅ Discord Bot logged in as GRiD Bot#1234!
🔄 Registering slash commands...
✅ Successfully registered slash commands!
```

## 📋 Available Commands

Try these commands in your Discord server:
- `/help` - See all commands
- `/gameinfo` - Get game information
- `/serverstatus` - Check server status
- `/player` - View player stats
- `/leaderboard` - View leaderboard
- `/planets` - List all planets

## 🔧 Troubleshooting

**Bot won't start:**
- Check that `.env` file exists and has correct values
- Verify bot token is correct
- Make sure bot has proper permissions in server

**Commands not showing:**
- Wait up to 1 hour for global commands (or use GUILD_ID for instant)
- Make sure bot has `applications.commands` scope
- Try kicking and re-inviting bot

**Bot offline:**
- Check console for errors
- Verify bot token hasn't been reset
- Check bot is in your server

## 📚 Next Steps

- Read `discord-bot/README.md` for full documentation
- Read `discord-bot/CONFIG.md` for configuration details
- Customize commands in `discord-bot/bot.js`
- Add database integration for persistent storage

## 🎮 Integration

The bot integrates with your game's webhook system:
- Game events automatically log to Discord
- Use `/admin announce` to send messages to game-chat
- Player stats sync with game data

Happy botting! 🤖

