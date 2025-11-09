# How to Create Your .env File

## Quick Setup

1. **Copy the template:**
   - Open `discord-bot/ENV-TEMPLATE.txt`
   - Copy all the content

2. **Create .env file:**
   - In the project root directory (same level as package.json)
   - Create a new file named `.env` (with the dot at the beginning)
   - Paste the copied content

3. **Verify:**
   - The .env file should be in: `i:\videogame\.env`
   - It should contain all the Discord credentials
   - The file is automatically ignored by git (.gitignore)

## File Location

```
videogame/
├── .env                    ← Create this file here
├── package.json
├── discord-bot/
│   ├── bot.js
│   ├── index.js
│   └── ENV-TEMPLATE.txt   ← Copy from here
└── ...
```

## Content to Copy

The `.env` file should contain:

```env
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET_HERE
DISCORD_GUILD_ID=YOUR_DISCORD_GUILD_ID_HERE
DISCORD_OWNER_ID=YOUR_DISCORD_OWNER_ID_HERE
GAME_CHAT_WEBHOOK=YOUR_GAME_CHAT_WEBHOOK_URL_HERE
GAME_LOGS_WEBHOOK=YOUR_GAME_LOGS_WEBHOOK_URL_HERE
DISCORD_INVITE_URL=https://discord.gg/vxt64amrgt
BOT_PREFIX=!
BOT_STATUS=online
BOT_ACTIVITY_TYPE=PLAYING
BOT_ACTIVITY_NAME=GRiD - 3D Video Game
SERVER_STATUS=online
SERVER_NAME=GRiD Game Server
```

## Verification

After creating the .env file, run:
```bash
npm run bot
```

The bot should load the environment variables automatically via `dotenv`.

## Troubleshooting

**If bot doesn't load env vars:**
- Make sure `.env` is in the project root (not in discord-bot folder)
- Check that `dotenv` is installed: `npm install dotenv`
- Verify file name is exactly `.env` (not `.env.txt` or `env`)

**If you see "DISCORD_BOT_TOKEN not set":**
- Check .env file exists and has correct values
- Make sure there are no extra spaces around the `=` sign
- Verify the file is saved

The bot has fallback values hardcoded, so it will work even without .env, but using .env is recommended for security.

