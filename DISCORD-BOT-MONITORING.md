# Discord Bot Player Monitoring - Setup Complete

## ✅ What Was Implemented

### 1. Discord Bot API Server
- **HTTP Server** running on port `3001`
- **Endpoints:**
  - `POST /api/player/join` - Game reports when player launches
  - `POST /api/player/leave` - Game reports when player exits
  - `GET /api/players/online` - Get list of currently online players

### 2. Player Tracking
- Bot tracks all online players in real-time
- Stores player data: username, playerId, join time, version
- Automatically cleans up stale players (5 minute timeout)
- Updates Discord bot activity status with player count

### 3. Game Integration
- Game automatically reports player join when launched
- Game reports player leave when closed
- Player ID and username generation
- Graceful error handling (works even if bot is offline)

### 4. Discord Commands
- `/online` - View currently online players
- `/serverstatus` - Check server status with online player count
- Bot activity shows: "X players online"

## 🚀 How It Works

### When Player Launches Game (EXE):
1. Game generates unique player ID
2. Game gets/sets username (from localStorage or prompt)
3. Game sends POST request to `http://localhost:3001/api/player/join`
4. Bot receives request and adds player to online list
5. Bot sends notification to Discord game-logs channel
6. Bot updates activity status

### When Player Closes Game:
1. Game sends POST request to `http://localhost:3001/api/player/leave`
2. Bot removes player from online list
3. Bot calculates play time
4. Bot sends notification to Discord game-logs channel
5. Bot updates activity status

## 📋 Usage

### Start Discord Bot:
```bash
npm run bot
```

### Start Bot in Development Mode (auto-restart):
```bash
npm run bot:dev
```

### Check Online Players:
In Discord, use: `/online`

### Check Server Status:
In Discord, use: `/serverstatus`

## 🔧 Configuration

The bot API server runs on port `3001` by default. To change it:
1. Set `API_PORT` in `.env` file
2. Update `discordBotAPI` in `js/main.js` to match

## 📊 Features

- ✅ Real-time player tracking
- ✅ Automatic player cleanup (stale detection)
- ✅ Discord notifications for join/leave
- ✅ Bot activity status updates
- ✅ Play time tracking
- ✅ Works with EXE and web versions
- ✅ Graceful error handling

## 🎮 Testing

1. Start the bot: `npm run bot`
2. Launch the game (EXE or web)
3. Check Discord for join notification
4. Use `/online` command to see yourself
5. Close the game
6. Check Discord for leave notification

The bot is now monitoring online players! 🎉

