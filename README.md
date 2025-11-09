# GRiD - CoresNewGame

A complete 3D video game built with Three.js, featuring an open world, 10,000 unique bikes, intergalactic travel, Discord integration, and more.

## 🎮 Game Features

- **🌍 Fully Open World** - Infinite procedurally generated world
- **🚲 10,000 Unique Bikes** - Each with unique body kits and designs
- **🌌 51 Planets** - Travel between planets via teleportation system
- **⚔️ Combat System** - Fight enemies and level up
- **🏆 Achievements** - 13+ achievements to unlock
- **📦 Mod Support** - Install and manage custom mods
- **🎯 Mission System** - Complete missions for rewards
- **💾 Save/Load System** - Auto-save and manual save
- **🎵 Sound System** - Background music and sound effects
- **📊 Leaderboard** - Compete with other players
- **🗺️ Minimap** - Navigate the world easily
- **💬 Discord Integration** - Rich presence and webhooks
- **🤖 Discord Bot** - Full-featured bot for your server

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CoresNewGame.git
cd CoresNewGame

# Install dependencies
npm install

# Start development server
npm run dev
```

### Run Game Locally

```bash
# Web version
npm run game:serve

# Or use Next.js
npm run dev
```

### Run Discord Bot

```bash
# Create .env file (see discord-bot/ENV-TEMPLATE.txt)
npm run bot

# Development mode (auto-restart)
npm run bot:dev
```

## 📁 Project Structure

```
CoresNewGame/
├── pages/                 # Next.js pages
├── public/               # Static assets
│   ├── game/            # Game files
│   ├── website/         # Website files
│   └── videogame/       # Game assets
├── discord-bot/         # Discord bot
├── js/                  # Game JavaScript
├── css/                 # Game styles
├── styles/              # Next.js styles
├── package.json         # Dependencies
├── next.config.js      # Next.js config
├── vercel.json         # Vercel config
└── README.md           # This file
```

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/CoresNewGame.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `DISCORD_BOT_TOKEN`
     - `DISCORD_CLIENT_ID`
     - `DISCORD_CLIENT_SECRET`
     - `DISCORD_GUILD_ID`
     - `DISCORD_OWNER_ID`
     - `GAME_CHAT_WEBHOOK`
     - `GAME_LOGS_WEBHOOK`
   - Deploy!

3. **Or use Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel
   ```

### Environment Variables

Create `.env.local` for local development:
```env
DISCORD_BOT_TOKEN=your_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
DISCORD_OWNER_ID=your_owner_id
GAME_CHAT_WEBHOOK=your_webhook
GAME_LOGS_WEBHOOK=your_webhook
```

## 🎮 Game Controls

- **WASD** - Move
- **Mouse** - Look around
- **Space** - Jump
- **Shift** - Run
- **P** - Open Printer (near HUB tower)
- **M** - Mod Manager
- **L** - Leaderboard
- **T** - Teleportation System
- **N** - Toggle Minimap
- **ESC** - Pause Menu

## 🤖 Discord Bot Commands

- `/help` - Get help
- `/gameinfo` - Game information
- `/serverstatus` - Server status
- `/player [username]` - Player stats
- `/leaderboard` - Top players
- `/planets` - List planets
- `/admin` - Admin commands (Owner/Admin only)

## 📦 Technologies Used

- **Three.js** - 3D graphics
- **Next.js** - Web framework
- **Discord.js** - Discord bot
- **Electron** - Desktop app (optional)

## 🔧 Development

### Game Development
- Edit files in `js/` directory
- Styles in `css/` directory
- Assets in `videogame/` directory

### Bot Development
- Bot code in `discord-bot/bot.js`
- Commands in `discord-bot/bot.js` (handleCommand method)

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Game Owner: Torey5721

## 🔗 Links

- **Discord Server:** https://discord.gg/vxt64amrgt
- **Website:** [Your Vercel URL]
- **GitHub:** https://github.com/YOUR_USERNAME/CoresNewGame

## 🐛 Issues & Support

Report issues on GitHub Issues or join our Discord server.

---

**Made with ❤️ for the GRiD community**
