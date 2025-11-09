// ADDED - Full Discord Bot for GRiD Game
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class GridDiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences
            ]
        });
        
        this.token = process.env.DISCORD_BOT_TOKEN || '';
        this.clientId = process.env.DISCORD_CLIENT_ID || '';
        this.guildId = process.env.DISCORD_GUILD_ID || '';
        
        // ADDED - Role definitions
        this.roles = {
            NOVICE_GAME_JOINER: 'Novice Game Joiner',
            CIVILIAN_DISCORD: 'Civilian Discord Role',
            OWNER_PANEL: 'Owner Panel Role',
            OWNER_PANEL_SERVER: 'Owner panel server room role',
            GAME_OWNER: 'Game Owner role',
            OWNER_MENU: 'Owner Menu Role',
            ADMIN_ACCESS: 'Admin access',
            ADMIN_MENU: 'Admin Menu access',
            ADMIN_VEHICLE: 'Admin Vehicle Menu',
            CIVILIAN: 'Civilian Role'
        };
        
        // ADDED - Role permissions mapping
        this.rolePermissions = {
            'Game Owner role': {
                inGame: ['all_doors', 'all_chests', 'weapon_chests', 'free_xp', 'admin_menu', 'owner_menu', 'vehicle_spawner', 'unlimited_cash'],
                discord: ['all_commands', 'manage_roles', 'manage_server']
            },
            'Owner Menu Role': {
                inGame: ['owner_menu', 'all_doors', 'all_chests', 'weapon_chests'],
                discord: ['owner_commands']
            },
            'Owner Panel Role': {
                inGame: ['owner_panel'],
                discord: ['panel_access']
            },
            'Owner panel server room role': {
                inGame: ['server_room'],
                discord: ['server_room_access']
            },
            'Admin access': {
                inGame: ['all_doors', 'all_chests', 'weapon_chests', 'free_xp'],
                discord: ['admin_commands']
            },
            'Admin Menu access': {
                inGame: ['admin_menu', 'all_doors', 'all_chests'],
                discord: ['admin_menu_commands']
            },
            'Admin Vehicle Menu': {
                inGame: ['vehicle_spawner', 'all_doors'],
                discord: ['vehicle_commands']
            },
            'Civilian Role': {
                inGame: ['explore', 'jobs', 'cash_rewards', '150k_every_6h'],
                discord: ['civilian_commands']
            },
            'Civilian Discord Role': {
                inGame: ['basic_access'],
                discord: ['basic_discord']
            },
            'Novice Game Joiner': {
                inGame: ['tutorial', 'basic_access'],
                discord: ['welcome']
            }
        };
        
        // ADDED - Character definitions
        this.startingCharacters = {
            'Hunter Cowboy': {
                name: 'Hunter Cowboy',
                description: 'Out in the wilderness mid hunting a deer. Uses an ATV to get around.',
                spawnLocation: { x: 0, y: 2, z: 0 },
                vehicle: 'atv',
                startingItems: ['hunting_rifle', 'atv_key']
            },
            'Astronaught Cowboy': {
                name: 'Astronaught Cowboy',
                description: 'Mid west desert field. A flock of horses roam and circle. Must tame the black horse.',
                spawnLocation: { x: 100, y: 2, z: 100 },
                vehicle: 'horse',
                startingItems: ['lasso', 'saddle']
            },
            'Space Astronaught Cowboy': {
                name: 'Space Astronaught Cowboy',
                description: 'Starts out living abandoned in a pod in space, lost.',
                spawnLocation: { x: -100, y: 50, z: -100 },
                vehicle: 'space_pod',
                startingItems: ['space_suit', 'pod_key']
            }
        };
        
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
            onlinePlayers: new Map(), // Track currently online players
            leaderboard: [],
            serverStatus: 'online',
            characters: new Map(), // User characters
            playerRoles: new Map(), // Discord roles -> game permissions
            pendingCommands: new Map() // Commands from Discord to execute in game
        };
        
        this.apiPort = process.env.API_PORT || 3001;
        this.apiServer = null;
        
        this.setupEventHandlers();
        this.setupCommands();
        this.setupAPIServer();
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
            
            // ADDED - Setup role monitoring
            this.setupRoleMonitoring();
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
        
        // ADDED - Handle new member joins
        this.client.on('guildMemberAdd', async member => {
            await this.handleNewMember(member);
        });
        
        // ADDED - Handle member updates (role changes)
        this.client.on('guildMemberUpdate', async (oldMember, newMember) => {
            await this.handleMemberRoleUpdate(oldMember, newMember);
        });
    }
    
    async setupRoleMonitoring() {
        // ADDED - Ensure all roles exist, create if missing
        const guild = await this.client.guilds.fetch(this.guildId);
        if (!guild) {
            console.warn('⚠️ Could not fetch guild for role setup');
            return;
        }
        
        const existingRoles = await guild.roles.fetch();
        const roleNames = Object.values(this.roles);
        
        for (const roleName of roleNames) {
            const role = existingRoles.find(r => r.name === roleName);
            if (!role) {
                try {
                    await guild.roles.create({
                        name: roleName,
                        color: this.getRoleColor(roleName),
                        mentionable: false,
                        reason: 'Auto-created role for GRiD game'
                    });
                    console.log(`✅ Created role: ${roleName}`);
                } catch (error) {
                    console.error(`❌ Failed to create role ${roleName}:`, error);
                }
            }
        }
        
        // ADDED - Assign Game Owner role to owner
        try {
            const ownerMember = await guild.members.fetch(this.ownerId);
            const gameOwnerRole = existingRoles.find(r => r.name === this.roles.GAME_OWNER);
            if (ownerMember && gameOwnerRole && !ownerMember.roles.cache.has(gameOwnerRole.id)) {
                await ownerMember.roles.add(gameOwnerRole);
                console.log(`✅ Assigned Game Owner role to owner`);
            }
        } catch (error) {
            console.warn('⚠️ Could not assign owner role:', error.message);
        }
    }
    
    getRoleColor(roleName) {
        const colors = {
            'Game Owner role': 0xff0000,
            'Owner Menu Role': 0xff6600,
            'Owner Panel Role': 0xff9900,
            'Admin access': 0x00ff00,
            'Admin Menu access': 0x00cc00,
            'Admin Vehicle Menu': 0x009900,
            'Civilian Role': 0x0099ff,
            'Civilian Discord Role': 0x6699ff,
            'Novice Game Joiner': 0xcccccc
        };
        return colors[roleName] || 0x99aab5;
    }
    
    async handleNewMember(member) {
        // ADDED - Auto-assign roles to new Discord members
        try {
            const guild = member.guild;
            const roles = await guild.roles.fetch();
            
            // Assign Novice Game Joiner role
            const noviceRole = roles.find(r => r.name === this.roles.NOVICE_GAME_JOINER);
            if (noviceRole) {
                await member.roles.add(noviceRole);
                console.log(`✅ Assigned ${this.roles.NOVICE_GAME_JOINER} to ${member.user.tag}`);
            }
            
            // Assign Civilian Discord Role
            const civilianDiscordRole = roles.find(r => r.name === this.roles.CIVILIAN_DISCORD);
            if (civilianDiscordRole) {
                await member.roles.add(civilianDiscordRole);
                console.log(`✅ Assigned ${this.roles.CIVILIAN_DISCORD} to ${member.user.tag}`);
            }
            
            // Send welcome message
            await this.sendToGameLogs(
                '👋 New Member Joined',
                `**${member.user.tag}** joined the Discord server`,
                {
                    'User ID': member.user.id,
                    'Roles Assigned': `${this.roles.NOVICE_GAME_JOINER}, ${this.roles.CIVILIAN_DISCORD}`
                },
                0x4CAF50
            );
            
            // Send welcome DM
            try {
                await member.send(`Welcome to GRiD! 🎮\n\nYou've been assigned:\n- ${this.roles.NOVICE_GAME_JOINER}\n- ${this.roles.CIVILIAN_DISCORD}\n\nDownload the game and start playing!`);
            } catch (error) {
                // User might have DMs disabled
            }
        } catch (error) {
            console.error('Error handling new member:', error);
        }
    }
    
    async handleMemberRoleUpdate(oldMember, newMember) {
        // ADDED - Monitor role changes and update game permissions
        const oldRoles = oldMember.roles.cache.map(r => r.name);
        const newRoles = newMember.roles.cache.map(r => r.name);
        
        const addedRoles = newRoles.filter(r => !oldRoles.includes(r));
        const removedRoles = oldRoles.filter(r => !newRoles.includes(r));
        
        if (addedRoles.length > 0 || removedRoles.length > 0) {
            console.log(`Role update for ${newMember.user.tag}:`);
            if (addedRoles.length > 0) console.log(`  Added: ${addedRoles.join(', ')}`);
            if (removedRoles.length > 0) console.log(`  Removed: ${removedRoles.join(', ')}`);
            
            // Notify game about role changes
            await this.notifyGameRoleChange(newMember.user.id, newRoles);
        }
    }
    
    async notifyGameRoleChange(userId, roles) {
        // ADDED - Send role update to game API
        try {
            await fetch(`http://localhost:3001/api/player/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    roles,
                    permissions: this.getPermissionsForRoles(roles)
                })
            });
        } catch (error) {
            // Game might not be running
        }
    }
    
    getPermissionsForRoles(roleNames) {
        // ADDED - Get combined permissions for multiple roles
        const permissions = {
            inGame: [],
            discord: []
        };
        
        for (const roleName of roleNames) {
            const rolePerms = this.rolePermissions[roleName];
            if (rolePerms) {
                permissions.inGame.push(...rolePerms.inGame);
                permissions.discord.push(...rolePerms.discord);
            }
        }
        
        // Remove duplicates
        permissions.inGame = [...new Set(permissions.inGame)];
        permissions.discord = [...new Set(permissions.discord)];
        
        return permissions;
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
            
            new SlashCommandBuilder()
                .setName('online')
                .setDescription('View currently online players'),
            
            // ADDED - Role Management Commands
            new SlashCommandBuilder()
                .setName('role')
                .setDescription('Manage player roles')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('assign')
                        .setDescription('Assign a role to a user')
                        .addUserOption(option =>
                            option.setName('user')
                                .setDescription('User to assign role to')
                                .setRequired(true))
                        .addStringOption(option =>
                            option.setName('role')
                                .setDescription('Role to assign')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Novice Game Joiner', value: 'Novice Game Joiner' },
                                    { name: 'Civilian Discord Role', value: 'Civilian Discord Role' },
                                    { name: 'Civilian Role', value: 'Civilian Role' },
                                    { name: 'Admin access', value: 'Admin access' },
                                    { name: 'Admin Menu access', value: 'Admin Menu access' },
                                    { name: 'Admin Vehicle Menu', value: 'Admin Vehicle Menu' },
                                    { name: 'Owner Menu Role', value: 'Owner Menu Role' },
                                    { name: 'Game Owner role', value: 'Game Owner role' }
                                ))),
            
            new SlashCommandBuilder()
                .setName('character')
                .setDescription('Character management')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('create')
                        .setDescription('Create a new character')
                        .addStringOption(option =>
                            option.setName('name')
                                .setDescription('Character name')
                                .setRequired(true))
                        .addStringOption(option =>
                            option.setName('type')
                                .setDescription('Starting character type')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Hunter Cowboy', value: 'Hunter Cowboy' },
                                    { name: 'Astronaught Cowboy', value: 'Astronaught Cowboy' },
                                    { name: 'Space Astronaught Cowboy', value: 'Space Astronaught Cowboy' }
                                ))),
            
            new SlashCommandBuilder()
                .setName('admin')
                .setDescription('Admin commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('spawn')
                        .setDescription('Spawn item/vehicle (Admin only)')
                        .addStringOption(option =>
                            option.setName('type')
                                .setDescription('What to spawn')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Vehicle', value: 'vehicle' },
                                    { name: 'Weapon', value: 'weapon' },
                                    { name: 'Cash', value: 'cash' }
                                ))
                        .addStringOption(option =>
                            option.setName('item')
                                .setDescription('Item name')
                                .setRequired(true))),
            
            new SlashCommandBuilder()
                .setName('owner')
                .setDescription('Owner commands (Game Owner only)')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('givecash')
                        .setDescription('Give cash to player')
                        .addUserOption(option =>
                            option.setName('user')
                                .setDescription('User to give cash to')
                                .setRequired(true))
                        .addIntegerOption(option =>
                            option.setName('amount')
                                .setDescription('Amount of cash')
                                .setRequired(true))),
            
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
                case 'online':
                    await this.handleOnlinePlayers(interaction);
                    break;
                case 'role':
                    await this.handleRoleCommand(interaction);
                    break;
                case 'character':
                    await this.handleCharacterCommand(interaction);
                    break;
                case 'admin':
                    await this.handleAdminCommand(interaction);
                    break;
                case 'owner':
                    await this.handleOwnerCommand(interaction);
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
                { name: 'Players Online', value: this.gameData.onlinePlayers.size.toString(), inline: true },
                { name: 'Total Players', value: this.gameData.players.size.toString(), inline: true },
                { name: 'Uptime', value: this.getUptime(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleOnlinePlayers(interaction) {
        const onlinePlayers = Array.from(this.gameData.onlinePlayers.values());
        
        if (onlinePlayers.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('👥 Online Players')
                .setDescription('No players currently online')
                .setColor(0x888888)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // Show first 20 players
        const displayPlayers = onlinePlayers.slice(0, 20);
        const playersText = displayPlayers.map((player, index) => {
            const playTime = Math.floor((Date.now() - player.joinTime) / 1000);
            return `${index + 1}. **${player.username}** - ${this.formatPlayTime(playTime)}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`👥 Online Players (${onlinePlayers.length})`)
            .setDescription(playersText)
            .setColor(0x4CAF50)
            .setFooter({ text: onlinePlayers.length > 20 ? `Showing first 20 of ${onlinePlayers.length} players` : '' })
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

    async handleRoleCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'assign') {
            // Check permissions
            const isOwner = interaction.user.id === this.ownerId;
            const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
            const hasOwnerRole = interaction.member.roles.cache.some(r => 
                r.name === this.roles.GAME_OWNER || r.name === this.roles.OWNER_MENU
            );
            
            if (!isOwner && !isAdmin && !hasOwnerRole) {
                await interaction.reply({ content: '❌ You do not have permission to assign roles!', ephemeral: true });
                return;
            }
            
            const targetUser = interaction.options.getUser('user');
            const roleName = interaction.options.getString('role');
            
            try {
                const guild = interaction.guild;
                const member = await guild.members.fetch(targetUser.id);
                const role = guild.roles.cache.find(r => r.name === roleName);
                
                if (!role) {
                    await interaction.reply({ content: `❌ Role "${roleName}" not found!`, ephemeral: true });
                    return;
                }
                
                if (member.roles.cache.has(role.id)) {
                    await interaction.reply({ content: `✅ ${targetUser.tag} already has the ${roleName} role!`, ephemeral: true });
                    return;
                }
                
                await member.roles.add(role);
                await interaction.reply({ 
                    content: `✅ Successfully assigned **${roleName}** to ${targetUser.tag}!`,
                    ephemeral: true 
                });
                
                // Notify game about role change
                await this.notifyGameRoleChange(targetUser.id, member.roles.cache.map(r => r.name));
            } catch (error) {
                await interaction.reply({ content: `❌ Error assigning role: ${error.message}`, ephemeral: true });
            }
        }
    }
    
    async handleCharacterCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'create') {
            const characterName = interaction.options.getString('name');
            const characterType = interaction.options.getString('type');
            
            // Check if user has less than 3 characters
            const userId = interaction.user.id;
            const userCharacters = this.getUserCharacters(userId);
            
            if (userCharacters.length >= 3) {
                await interaction.reply({ 
                    content: '❌ You already have the maximum of 3 characters!', 
                    ephemeral: true 
                });
                return;
            }
            
            const characterData = this.startingCharacters[characterType];
            if (!characterData) {
                await interaction.reply({ content: '❌ Invalid character type!', ephemeral: true });
                return;
            }
            
            // Create character
            const character = {
                id: Date.now().toString(),
                userId,
                name: characterName,
                type: characterType,
                ...characterData,
                cash: 0,
                level: 1,
                jobs: [],
                createdAt: Date.now()
            };
            
            this.saveUserCharacter(userId, character);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Character Created!')
                .setDescription(`**${characterName}** - ${characterType}`)
                .setColor(0x4CAF50)
                .addFields(
                    { name: 'Starting Location', value: `X: ${characterData.spawnLocation.x}, Y: ${characterData.spawnLocation.y}, Z: ${characterData.spawnLocation.z}`, inline: false },
                    { name: 'Starting Vehicle', value: characterData.vehicle, inline: true },
                    { name: 'Starting Items', value: characterData.startingItems.join(', '), inline: false }
                )
                .setFooter({ text: `Characters: ${userCharacters.length + 1}/3` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    
    async handleAdminCommand(interaction) {
        // Check if user has admin role
        const hasAdminRole = interaction.member.roles.cache.some(r => 
            r.name === this.roles.ADMIN_ACCESS || 
            r.name === this.roles.ADMIN_MENU ||
            r.name === this.roles.GAME_OWNER
        );
        
        if (!hasAdminRole) {
            await interaction.reply({ content: '❌ You do not have admin permissions!', ephemeral: true });
            return;
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'spawn') {
            const type = interaction.options.getString('type');
            const item = interaction.options.getString('item');
            
            // Send spawn command to game
            await this.sendSpawnCommandToGame(interaction.user.id, type, item);
            
            await interaction.reply({ 
                content: `✅ Spawn command sent: ${type} - ${item}\n\nThis will spawn in-game when you launch the game.`,
                ephemeral: true 
            });
        }
    }
    
    async handleOwnerCommand(interaction) {
        // Check if user is owner
        const isOwner = interaction.user.id === this.ownerId;
        const hasOwnerRole = interaction.member.roles.cache.some(r => 
            r.name === this.roles.GAME_OWNER
        );
        
        if (!isOwner && !hasOwnerRole) {
            await interaction.reply({ content: '❌ Only the game owner can use this command!', ephemeral: true });
            return;
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'givecash') {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            
            // Send cash command to game
            await this.sendCashCommandToGame(targetUser.id, amount);
            
            await interaction.reply({ 
                content: `✅ Giving ${amount.toLocaleString()} cash to ${targetUser.tag}\n\nThis will be applied in-game.`,
                ephemeral: true 
            });
        }
    }
    
    async sendSpawnCommandToGame(userId, type, item) {
        try {
            await fetch(`http://localhost:3001/api/admin/spawn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type, item })
            });
        } catch (error) {
            console.warn('Could not send spawn command to game:', error);
        }
    }
    
    async sendCashCommandToGame(userId, amount) {
        try {
            await fetch(`http://localhost:3001/api/admin/cash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount })
            });
        } catch (error) {
            console.warn('Could not send cash command to game:', error);
        }
    }
    
    getUserCharacters(userId) {
        // Get user's characters from storage
        const key = `characters_${userId}`;
        const stored = this.gameData.characters || new Map();
        return stored.get(userId) || [];
    }
    
    saveUserCharacter(userId, character) {
        // Save character to storage
        if (!this.gameData.characters) {
            this.gameData.characters = new Map();
        }
        const characters = this.gameData.characters.get(userId) || [];
        characters.push(character);
        this.gameData.characters.set(userId, characters);
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
            // Update bot status (already handled by updateBotActivity)
            this.updateBotActivity();
            
            // Clean up stale players (if they haven't updated in 5 minutes)
            const now = Date.now();
            for (const [playerId, player] of this.gameData.onlinePlayers.entries()) {
                if (now - player.lastSeen > 300000) { // 5 minutes
                    console.log(`🧹 Removing stale player: ${player.username} (${playerId})`);
                    this.gameData.onlinePlayers.delete(playerId);
                    this.updateBotActivity();
                }
            }
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

    setupAPIServer() {
        // ADDED - HTTP API server for game to report player status
        this.apiServer = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method;

            // CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (pathname === '/api/player/join' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        this.handlePlayerJoin(data);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Player joined' }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
            } else if (pathname === '/api/player/leave' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        this.handlePlayerLeave(data);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Player left' }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
            } else if (pathname === '/api/players/online' && method === 'GET') {
                const onlinePlayers = Array.from(this.gameData.onlinePlayers.values());
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, players: onlinePlayers, count: onlinePlayers.length }));
            } else if (pathname === '/api/player/roles' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { userId, roles, permissions } = data;
                        this.gameData.playerRoles.set(userId, { roles, permissions });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Roles updated' }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
            } else if (pathname === '/api/player/roles' && method === 'GET') {
                const parsedUrl = url.parse(req.url, true);
                const userId = parsedUrl.query.userId;
                if (userId && this.gameData.playerRoles.has(userId)) {
                    const roleData = this.gameData.playerRoles.get(userId);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, ...roleData }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, roles: [], permissions: { inGame: [], discord: [] } }));
                }
            } else if (pathname === '/api/admin/spawn' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { userId, type, item } = data;
                        if (!this.gameData.pendingCommands) {
                            this.gameData.pendingCommands = new Map();
                        }
                        if (!this.gameData.pendingCommands.has(userId)) {
                            this.gameData.pendingCommands.set(userId, []);
                        }
                        this.gameData.pendingCommands.get(userId).push({
                            type: 'spawn',
                            data: { type, item },
                            timestamp: Date.now()
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Spawn command queued' }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
            } else if (pathname === '/api/admin/cash' && method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { userId, amount } = data;
                        if (!this.gameData.pendingCommands) {
                            this.gameData.pendingCommands = new Map();
                        }
                        if (!this.gameData.pendingCommands.has(userId)) {
                            this.gameData.pendingCommands.set(userId, []);
                        }
                        this.gameData.pendingCommands.get(userId).push({
                            type: 'cash',
                            data: { amount },
                            timestamp: Date.now()
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Cash command queued' }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
            } else if (pathname === '/api/player/commands' && method === 'GET') {
                const parsedUrl = url.parse(req.url, true);
                const userId = parsedUrl.query.userId;
                if (userId && this.gameData.pendingCommands && this.gameData.pendingCommands.has(userId)) {
                    const commands = this.gameData.pendingCommands.get(userId);
                    this.gameData.pendingCommands.delete(userId); // Clear after reading
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, commands }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, commands: [] }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Not found' }));
            }
        });

        this.apiServer.on('error', (error) => {
            console.error('❌ API Server error:', error);
        });
    }

    handlePlayerJoin(data) {
        const { username, playerId, version } = data;
        const joinTime = Date.now();
        
        if (!username || !playerId) {
            console.warn('Invalid player join data:', data);
            return;
        }

        // Store online player
        this.gameData.onlinePlayers.set(playerId, {
            username,
            playerId,
            version: version || '1.0.0',
            joinTime,
            lastSeen: joinTime
        });

        // Update player data
        if (!this.gameData.players.has(username.toLowerCase())) {
            this.gameData.players.set(username.toLowerCase(), this.getDefaultPlayerData(username));
        }

        console.log(`✅ Player joined: ${username} (${playerId})`);
        
        // Send to Discord
        this.sendToGameLogs(
            '🎮 Player Joined',
            `**${username}** joined the game`,
            {
                'Player ID': playerId,
                'Version': version || '1.0.0',
                'Online Players': this.gameData.onlinePlayers.size.toString()
            },
            0x4CAF50
        );

        // Update bot activity
        this.updateBotActivity();
    }

    handlePlayerLeave(data) {
        const { username, playerId } = data;
        
        if (!playerId) {
            console.warn('Invalid player leave data:', data);
            return;
        }

        const player = this.gameData.onlinePlayers.get(playerId);
        if (player) {
            const playTime = Math.floor((Date.now() - player.joinTime) / 1000);
            console.log(`👋 Player left: ${player.username || username} (${playerId}) - Played for ${playTime}s`);
            
            // Update player stats
            if (this.gameData.players.has((player.username || username).toLowerCase())) {
                const playerData = this.gameData.players.get((player.username || username).toLowerCase());
                playerData.playTime += playTime;
            }

            // Remove from online players
            this.gameData.onlinePlayers.delete(playerId);

            // Send to Discord
            this.sendToGameLogs(
                '👋 Player Left',
                `**${player.username || username}** left the game`,
                {
                    'Play Time': this.formatPlayTime(playTime),
                    'Online Players': this.gameData.onlinePlayers.size.toString()
                },
                0xff9800
            );

            // Update bot activity
            this.updateBotActivity();
        }
    }

    updateBotActivity() {
        const playerCount = this.gameData.onlinePlayers.size;
        this.client.user.setActivity(`${playerCount} player${playerCount !== 1 ? 's' : ''} online`, { 
            type: ActivityType.Watching 
        });
    }

    async start() {
        if (!this.token) {
            console.error('❌ DISCORD_BOT_TOKEN not set! Please set it in your environment variables.');
            return;
        }
        
        // Start API server
        this.apiServer.listen(this.apiPort, () => {
            console.log(`🌐 API Server listening on port ${this.apiPort}`);
            console.log(`   Endpoints:`);
            console.log(`   POST /api/player/join - Report player join`);
            console.log(`   POST /api/player/leave - Report player leave`);
            console.log(`   GET /api/players/online - Get online players`);
            console.log(`   POST /api/player/roles - Update player roles`);
            console.log(`   GET /api/player/roles - Get player roles`);
            console.log(`   POST /api/admin/spawn - Admin spawn command`);
            console.log(`   POST /api/admin/cash - Admin cash command`);
            console.log(`   GET /api/player/commands - Get pending commands`);
        });
        
        await this.client.login(this.token);
    }
}

// Start bot
const bot = new GridDiscordBot();
bot.start().catch(console.error);

module.exports = GridDiscordBot;

