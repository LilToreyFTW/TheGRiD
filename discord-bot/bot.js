// ADDED - Full Discord Bot for GRiD Game
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

class GridDiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        this.token = process.env.DISCORD_BOT_TOKEN || '';
        this.clientId = process.env.DISCORD_CLIENT_ID || '';
        this.guildId = process.env.DISCORD_GUILD_ID || '';
        
        // ADDED - Owner configuration
        this.ownerId = process.env.DISCORD_OWNER_ID || '1368087024401252393'; // Discord Owner and Game Owner User ID
        this.defaultGuildId = '1436947681560760414'; // Default Guild ID
        
        // Use provided IDs if env vars not set (fallback for quick setup)
        if (!this.token) this.token = 'YOUR_DISCORD_BOT_TOKEN_HERE';
        if (!this.clientId) this.clientId = 'YOUR_DISCORD_CLIENT_ID_HERE';
        if (!this.guildId) this.guildId = this.defaultGuildId;
        
        // Game webhook URLs (can be overridden by env vars)
        this.gameChatWebhook = process.env.GAME_CHAT_WEBHOOK || 'https://discord.com/api/webhooks/1436948279114862643/xIMi1mRyp86e0cjYMkQuWSFWZ51BXxWVxL3POADwSwKYycsyPLNikXp7XyBbamXK1iA2';
        this.gameLogsWebhook = process.env.GAME_LOGS_WEBHOOK || 'https://discord.com/api/webhooks/1436948466143334401/dqx3vm12WvbV9UzyUYqASeJmFUvlLeayJtW6wGaRKhTptBDEku96k4cbr-UR7Zom4NFw';
        
        // Game data storage (in production, use a database)
        this.gameData = {
            players: new Map(),
            leaderboard: [],
            serverStatus: 'online'
        };
        
        this.setupEventHandlers();
        this.setupCommands();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`✅ Discord Bot logged in as ${this.client.user.tag}!`);
            console.log(`👤 Owner ID: ${this.ownerId}`);
            console.log(`🏠 Guild ID: ${this.guildId}`);
            this.client.user.setActivity('GRiD - 3D Video Game', { type: ActivityType.Playing });
            this.updateServerStatus();
            
            // ADDED - Send startup notification to owner
            this.notifyOwner('✅ GRiD Bot is now online!');
        });

        this.client.on('interactionCreate', async interaction => {
            if (interaction.isChatInputCommand()) {
                await this.handleCommand(interaction);
            }
        });

        this.client.on('messageCreate', async message => {
            if (message.author.bot) return;
            // Handle game chat relay if needed
        });
    }

    async setupCommands() {
        const commands = [
            // Game Info Commands
            new SlashCommandBuilder()
                .setName('gameinfo')
                .setDescription('Get information about GRiD game'),
            
            new SlashCommandBuilder()
                .setName('serverstatus')
                .setDescription('Check game server status'),
            
            // Player Commands
            new SlashCommandBuilder()
                .setName('player')
                .setDescription('Get player statistics')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Player username')
                        .setRequired(false)),
            
            new SlashCommandBuilder()
                .setName('leaderboard')
                .setDescription('View the game leaderboard')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number')
                        .setRequired(false)),
            
            // Achievement Commands
            new SlashCommandBuilder()
                .setName('achievements')
                .setDescription('View player achievements')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Player username')
                        .setRequired(false)),
            
            // Planet Commands
            new SlashCommandBuilder()
                .setName('planets')
                .setDescription('List all available planets'),
            
            new SlashCommandBuilder()
                .setName('planet')
                .setDescription('Get information about a planet')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Planet name')
                        .setRequired(true)
                        .setAutocomplete(true)),
            
            // Mod Commands
            new SlashCommandBuilder()
                .setName('mods')
                .setDescription('List available game mods'),
            
            new SlashCommandBuilder()
                .setName('mod')
                .setDescription('Get information about a mod')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Mod name')
                        .setRequired(true)),
            
            // Admin Commands
            new SlashCommandBuilder()
                .setName('admin')
                .setDescription('Admin commands (Owner/Admin only)')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('announce')
                        .setDescription('Announce to game-chat channel')
                        .addStringOption(option =>
                            option.setName('message')
                                .setDescription('Announcement message')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('setstatus')
                        .setDescription('Set server status')
                        .addStringOption(option =>
                            option.setName('status')
                                .setDescription('Server status')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Online', value: 'online' },
                                    { name: 'Offline', value: 'offline' },
                                    { name: 'Maintenance', value: 'maintenance' }
                                )))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('broadcast')
                        .setDescription('Broadcast message to all players')
                        .addStringOption(option =>
                            option.setName('message')
                                .setDescription('Broadcast message')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('playerdata')
                        .setDescription('Get player data (Owner only)')
                        .addStringOption(option =>
                            option.setName('username')
                                .setDescription('Player username')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('restart')
                        .setDescription('Restart bot (Owner only)')),
            
            // Help Command
            new SlashCommandBuilder()
                .setName('help')
                .setDescription('Get help with bot commands'),
            
            // Link Command
            new SlashCommandBuilder()
                .setName('link')
                .setDescription('Link your Discord account to your game account')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Your game username')
                        .setRequired(true)),
        ];

        const rest = new REST({ version: '10' }).setToken(this.token);

        try {
            console.log('🔄 Registering slash commands...');
            
            if (this.guildId) {
                // Guild commands (faster, for testing)
                await rest.put(
                    Routes.applicationGuildCommands(this.clientId, this.guildId),
                    { body: commands }
                );
            } else {
                // Global commands (takes up to 1 hour)
                await rest.put(
                    Routes.applicationCommands(this.clientId),
                    { body: commands }
                );
            }
            
            console.log('✅ Successfully registered slash commands!');
        } catch (error) {
            console.error('❌ Error registering commands:', error);
        }
    }

    async handleCommand(interaction) {
        const { commandName } = interaction;

        try {
            switch (commandName) {
                case 'gameinfo':
                    await this.handleGameInfo(interaction);
                    break;
                case 'serverstatus':
                    await this.handleServerStatus(interaction);
                    break;
                case 'player':
                    await this.handlePlayer(interaction);
                    break;
                case 'leaderboard':
                    await this.handleLeaderboard(interaction);
                    break;
                case 'achievements':
                    await this.handleAchievements(interaction);
                    break;
                case 'planets':
                    await this.handlePlanets(interaction);
                    break;
                case 'planet':
                    await this.handlePlanet(interaction);
                    break;
                case 'mods':
                    await this.handleMods(interaction);
                    break;
                case 'mod':
                    await this.handleMod(interaction);
                    break;
                case 'admin':
                    await this.handleAdmin(interaction);
                    break;
                case 'help':
                    await this.handleHelp(interaction);
                    break;
                case 'link':
                    await this.handleLink(interaction);
                    break;
                default:
                    await interaction.reply({ content: 'Unknown command!', ephemeral: true });
            }
        } catch (error) {
            console.error(`Error handling command ${commandName}:`, error);
            await interaction.reply({ 
                content: 'An error occurred while executing this command!', 
                ephemeral: true 
            });
        }
    }

    async handleGameInfo(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 GRiD - 3D Video Game')
            .setDescription('An immersive open-world 3D game featuring 10,000 unique bikes, intergalactic travel, and endless exploration!')
            .setColor(0x00ffff)
            .addFields(
                { name: '🌍 Open World', value: 'Fully explorable infinite world', inline: true },
                { name: '🚲 10K Bikes', value: '10,000 unique moped bike designs', inline: true },
                { name: '🌌 51 Planets', value: 'Travel between 51 unique planets', inline: true },
                { name: '⚔️ Combat System', value: 'Fight enemies and level up', inline: true },
                { name: '🏆 Achievements', value: 'Unlock achievements and rewards', inline: true },
                { name: '📦 Mod Support', value: 'Install custom mods', inline: true },
                { name: '🔗 Download', value: '[Get GRiD](https://your-website.com)', inline: false },
                { name: '💬 Discord', value: '[Join Server](https://discord.gg/vxt64amrgt)', inline: false }
            )
            .setThumbnail('https://via.placeholder.com/128')
            .setFooter({ text: 'GRiD Game Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleServerStatus(interaction) {
        const status = this.gameData.serverStatus;
        const statusEmoji = status === 'online' ? '🟢' : status === 'maintenance' ? '🟡' : '🔴';
        const statusColor = status === 'online' ? 0x4CAF50 : status === 'maintenance' ? 0xffaa00 : 0xf44336;

        const embed = new EmbedBuilder()
            .setTitle(`${statusEmoji} Server Status`)
            .setDescription(`**Status:** ${status.toUpperCase()}`)
            .setColor(statusColor)
            .addFields(
                { name: 'Players Online', value: this.gameData.players.size.toString(), inline: true },
                { name: 'Uptime', value: this.getUptime(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handlePlayer(interaction) {
        const username = interaction.options.getString('username') || interaction.user.username;
        const player = this.gameData.players.get(username.toLowerCase()) || this.getDefaultPlayerData(username);

        const embed = new EmbedBuilder()
            .setTitle(`👤 Player: ${username}`)
            .setColor(0x5865F2)
            .addFields(
                { name: 'Level', value: player.level.toString(), inline: true },
                { name: 'Score', value: player.score.toLocaleString(), inline: true },
                { name: 'Kills', value: player.kills.toString(), inline: true },
                { name: 'Deaths', value: player.deaths.toString(), inline: true },
                { name: 'K/D Ratio', value: (player.kills / Math.max(player.deaths, 1)).toFixed(2), inline: true },
                { name: 'Planets Visited', value: player.planetsVisited.toString(), inline: true },
                { name: 'Achievements', value: `${player.achievements}/${player.totalAchievements}`, inline: true },
                { name: 'Play Time', value: this.formatPlayTime(player.playTime), inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleLeaderboard(interaction) {
        const page = interaction.options.getInteger('page') || 1;
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Sort by score
        const sorted = Array.from(this.gameData.players.values())
            .sort((a, b) => b.score - a.score)
            .slice(startIndex, endIndex);

        if (sorted.length === 0) {
            await interaction.reply({ content: 'No players found on the leaderboard!', ephemeral: true });
            return;
        }

        const leaderboardText = sorted.map((player, index) => {
            const rank = startIndex + index + 1;
            return `**${rank}.** ${player.username} - ${player.score.toLocaleString()} points (Level ${player.level})`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🏆 Leaderboard')
            .setDescription(leaderboardText)
            .setColor(0xffaa00)
            .setFooter({ text: `Page ${page}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleAchievements(interaction) {
        const username = interaction.options.getString('username') || interaction.user.username;
        const player = this.gameData.players.get(username.toLowerCase()) || this.getDefaultPlayerData(username);

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Achievements: ${username}`)
            .setDescription(`**Unlocked:** ${player.achievements}/${player.totalAchievements}`)
            .setColor(0xffaa00)
            .addFields(
                { name: 'Recent Achievements', value: player.recentAchievements.join('\n') || 'None', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handlePlanets(interaction) {
        const planets = [
            'Nexus', 'Tower', 'Aurora', 'Nebula', 'Stellar', 'Cosmic', 'Void', 'Eclipse', 'Solar', 'Lunar',
            'Mars', 'Venus', 'Jupiter', 'Saturn', 'Neptune', 'Uranus', 'Pluto', 'Mercury', 'Titan', 'Europa',
            'Andromeda', 'Orion', 'Pegasus', 'Cygnus', 'Lyra', 'Draco', 'Cassiopeia', 'Ursa', 'Leo', 'Virgo',
            'Sagittarius', 'Scorpio', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Libra', 'Capricorn',
            'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'EDZ'
        ];

        const unlockedPlanets = planets.slice(0, 10);
        const lockedPlanets = planets.slice(10);

        const embed = new EmbedBuilder()
            .setTitle('🌌 Available Planets')
            .setDescription('Travel between 51 unique planets!')
            .setColor(0x5865F2)
            .addFields(
                { name: '✅ Unlocked (10)', value: unlockedPlanets.join(', '), inline: false },
                { name: '🔒 Locked (41)', value: `${lockedPlanets.length} planets waiting to be discovered!`, inline: false }
            )
            .setFooter({ text: 'Use /planet <name> for more info' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handlePlanet(interaction) {
        const planetName = interaction.options.getString('name');
        const planets = {
            'nexus': { name: 'Nexus', description: 'The central hub planet', color: 0x00ffff },
            'tower': { name: 'Tower', description: 'Home to the HUB tower', color: 0xff00ff },
            'edz': { name: 'EDZ', description: 'European Dead Zone', color: 0x8B4513 }
        };

        const planet = planets[planetName.toLowerCase()] || { 
            name: planetName, 
            description: 'A mysterious planet waiting to be explored', 
            color: 0x5865F2 
        };

        const embed = new EmbedBuilder()
            .setTitle(`🌍 ${planet.name}`)
            .setDescription(planet.description)
            .setColor(planet.color)
            .addFields(
                { name: 'Status', value: '✅ Unlocked', inline: true },
                { name: 'Players Visited', value: '0', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleMods(interaction) {
        const mods = [
            { name: 'Enhanced Graphics Pack', downloads: 1250, version: '1.0.0' },
            { name: 'Custom Bike Skins', downloads: 890, version: '2.1.0' },
            { name: 'Weapon Pack Expansion', downloads: 650, version: '1.5.0' }
        ];

        const modsText = mods.map(mod => 
            `**${mod.name}** v${mod.version} - ${mod.downloads.toLocaleString()} downloads`
        ).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('📦 Available Mods')
            .setDescription(modsText)
            .setColor(0x2196F3)
            .setFooter({ text: 'Download mods from the game website' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleMod(interaction) {
        const modName = interaction.options.getString('name');
        
        const embed = new EmbedBuilder()
            .setTitle(`📦 Mod: ${modName}`)
            .setDescription('Mod information')
            .setColor(0x2196F3)
            .addFields(
                { name: 'Version', value: '1.0.0', inline: true },
                { name: 'Downloads', value: '0', inline: true },
                { name: 'Status', value: '✅ Available', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleAdmin(interaction) {
        // ADDED - Check if user is owner or has admin permissions
        const isOwner = interaction.user.id === this.ownerId;
        const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
        
        if (!isOwner && !isAdmin) {
            await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'announce') {
            const message = interaction.options.getString('message');
            await this.sendToGameChat('📢 **Announcement:** ' + message);
            await interaction.reply({ content: '✅ Announcement sent to game-chat!', ephemeral: true });
        } else if (subcommand === 'setstatus') {
            const status = interaction.options.getString('status');
            this.gameData.serverStatus = status;
            await interaction.reply({ content: `✅ Server status set to: ${status}`, ephemeral: true });
        } else if (subcommand === 'broadcast') {
            // Owner only command
            if (interaction.user.id !== this.ownerId) {
                await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
                return;
            }
            const message = interaction.options.getString('message');
            await this.sendToGameChat('📢 **Broadcast:** ' + message);
            await this.sendToGameLogs('Broadcast', `Owner broadcasted: ${message}`, {}, 0xff0000);
            await interaction.reply({ content: '✅ Broadcast sent!', ephemeral: true });
        } else if (subcommand === 'playerdata') {
            // Owner only command
            if (interaction.user.id !== this.ownerId) {
                await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
                return;
            }
            const username = interaction.options.getString('username');
            const player = this.gameData.players.get(username.toLowerCase());
            
            if (!player) {
                await interaction.reply({ content: `❌ Player "${username}" not found!`, ephemeral: true });
                return;
            }
            
            const embed = new EmbedBuilder()
                .setTitle(`👤 Player Data: ${username}`)
                .setDescription('```json\n' + JSON.stringify(player, null, 2) + '\n```')
                .setColor(0x5865F2)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'restart') {
            // Owner only command
            if (interaction.user.id !== this.ownerId) {
                await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
                return;
            }
            await interaction.reply({ content: '🔄 Restarting bot...', ephemeral: true });
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        }
    }

    async handleHelp(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 GRiD Bot Commands')
            .setDescription('Here are all available commands:')
            .setColor(0x00ffff)
            .addFields(
                { name: '📊 Game Info', value: '`/gameinfo` - Get game information\n`/serverstatus` - Check server status', inline: false },
                { name: '👤 Player', value: '`/player [username]` - View player stats\n`/leaderboard [page]` - View leaderboard\n`/achievements [username]` - View achievements', inline: false },
                { name: '🌌 Planets', value: '`/planets` - List all planets\n`/planet <name>` - Get planet info', inline: false },
                { name: '📦 Mods', value: '`/mods` - List available mods\n`/mod <name>` - Get mod info', inline: false },
                { name: '🔗 Account', value: '`/link <username>` - Link Discord to game account', inline: false },
                { name: '❓ Help', value: '`/help` - Show this help message', inline: false }
            )
            .setFooter({ text: 'GRiD Game Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleLink(interaction) {
        const username = interaction.options.getString('username');
        const userId = interaction.user.id;

        // Store link (in production, use database)
        this.gameData.players.set(username.toLowerCase(), {
            ...this.getDefaultPlayerData(username),
            discordId: userId
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Account Linked!')
            .setDescription(`Your Discord account has been linked to **${username}**`)
            .setColor(0x4CAF50)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Utility methods
    getDefaultPlayerData(username) {
        return {
            username: username,
            level: 1,
            score: 0,
            kills: 0,
            deaths: 0,
            planetsVisited: 0,
            achievements: 0,
            totalAchievements: 13,
            playTime: 0,
            recentAchievements: []
        };
    }

    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    getUptime() {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        return `${days}d ${hours}h`;
    }

    async sendToGameChat(message) {
        try {
            await fetch(this.gameChatWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            });
        } catch (error) {
            console.error('Error sending to game-chat:', error);
        }
    }

    async sendToGameLogs(title, description, fields = {}, color = 0x00ffff) {
        try {
            const embed = {
                title: title,
                description: description,
                color: color,
                timestamp: new Date().toISOString(),
                fields: []
            };

            for (const [key, value] of Object.entries(fields)) {
                embed.fields.push({
                    name: key,
                    value: String(value),
                    inline: true
                });
            }

            await fetch(this.gameLogsWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'GRiD Bot',
                    embeds: [embed]
                })
            });
        } catch (error) {
            console.error('Error sending to game-logs:', error);
        }
    }

    async updateServerStatus() {
        setInterval(() => {
            // Update bot status
            const playerCount = this.gameData.players.size;
            this.client.user.setActivity(`${playerCount} players online`, { type: ActivityType.Watching });
        }, 60000); // Update every minute
    }

    async notifyOwner(message) {
        try {
            const owner = await this.client.users.fetch(this.ownerId);
            if (owner) {
                await owner.send(`🤖 GRiD Bot: ${message}`);
            }
        } catch (error) {
            console.warn('Could not send DM to owner:', error);
        }
    }

    isOwner(userId) {
        return userId === this.ownerId;
    }

    async start() {
        if (!this.token) {
            console.error('❌ DISCORD_BOT_TOKEN not set! Please set it in your environment variables.');
            return;
        }
        await this.client.login(this.token);
    }
}

// Start bot
const bot = new GridDiscordBot();
bot.start().catch(console.error);

module.exports = GridDiscordBot;

