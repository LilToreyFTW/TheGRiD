# GRiD Discord Bot Configuration

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# Optional: For faster command registration during development
# Leave empty for global commands (takes up to 1 hour to register)
```

## Getting Your Bot Token

1. Go to https://discord.com/developers/applications
2. Select your application (or create a new one)
3. Go to "Bot" section
4. Click "Reset Token" if needed
5. Copy the token

## Getting Your Client ID

1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to "General Information"
4. Copy the "Application ID"

## Getting Your Guild ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on your server
3. Click "Copy Server ID"

## Bot Permissions

The bot needs the following permissions:
- Send Messages
- Embed Links
- Read Message History
- Use Slash Commands
- Manage Messages (for admin commands)

## Inviting the Bot

Use this URL (replace CLIENT_ID with your client ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025508416&scope=bot%20applications.commands
```

Or use the OAuth2 URL Generator in Discord Developer Portal:
1. Go to OAuth2 > URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Manage Messages`
4. Copy and use the generated URL

