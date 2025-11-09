// ADDED - Main game entry point
import * as THREE from 'three';
import { Player } from './player.js';
import { GameWorld } from './world.js';
import { Game } from './game.js';
import { BikeGridManager } from './bikeGrid.js';
import { GRiDConfig, GRiDBranding } from '../gametitle/GRiD/config.js';
import { GRiDAssets } from '../gametitle/GRiD/assets.js';
import { ThreeJSDevTools, PerformanceProfiler } from '../threeJS_Development/devTools.js';
import { VideoGameUtils, GameStateManager } from '../videogame/utils.js';
// ADDED - New systems
import { ModelPrinter } from './printer.js';
import { OwnerAuth, PrinterUI } from './printerAuth.js';
import { HUBTower } from './hubTower.js';
import { MultiplayerServer, PlayerSync } from './multiplayer.js';
import { AdvancedGraphics } from './graphics.js';
// ADDED - Mod system
import { ModManager } from './modManager.js';
import { ModManagerUI } from './modManagerUI.js';
// ADDED - Open world system
import { OpenWorldSystem } from './openWorld.js';
// ADDED - Voxel terrain system
import { VoxelTerrain } from './voxelTerrain.js';
import { OrbitControls } from './orbitControls.js';
// ADDED - Leaderboard system
import { Leaderboard, LeaderboardUI } from './leaderboard.js';
// ADDED - Sound system
import { SoundManager } from './soundManager.js';
// ADDED - Achievements system
import { AchievementsSystem } from './achievements.js';
// ADDED - Settings and pause menu
import { SettingsManager, PauseMenu } from './settings.js';
// ADDED - Achievement notification
import { AchievementNotification } from './achievementNotification.js';
// ADDED - Tutorial system
import { TutorialSystem } from './tutorial.js';
// ADDED - Save/Load system
import { SaveLoadSystem } from './saveLoad.js';
// ADDED - Planet system
import { PlanetSystem } from './planets.js';
// ADDED - Teleportation system
import { TeleportationSystem } from './teleportation.js';
// ADDED - Combat system
import { CombatSystem } from './combat.js';
// ADDED - Mission system
import { MissionSystem } from './missions.js';
// ADDED - Inventory system
import { InventorySystem } from './inventory.js';
// ADDED - Progression system
import { GameProgression } from './progression.js';
// ADDED - Minimap system
import { MinimapSystem } from './minimap.js';
// ADDED - Discord integration
import { DiscordIntegration } from './discord.js';
// ADDED - Discord webhooks
import { DiscordWebhooks } from './discordWebhooks.js';
// ADDED - Character selection
import { CharacterSelectionSystem } from './characterSelection.js';
// ADDED - Role permissions
import { RolePermissionsSystem } from './rolePermissions.js';
// ADDED - Cash system
import { CashSystem } from './cashSystem.js';
// ADDED - Job system
import { JobSystem } from './jobSystem.js';
// ADDED - Admin menu
import { AdminMenuSystem } from './adminMenu.js';
// ADDED - Game server client
import { GameServerClient } from './gameServerClient.js';
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.world = null;
        this.game = null;
        this.bikeGrid = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        
        // ADDED - Integrated utilities
        this.grIDAssets = null;
        this.devTools = null;
        this.profiler = new PerformanceProfiler();
        this.stateManager = new GameStateManager();
        this.inputManager = VideoGameUtils.createInputManager();
        this.saveSystem = VideoGameUtils.createSaveSystem();
        
        // ADDED - New systems
        this.advancedGraphics = null;
        this.hubTower = null;
        this.printer = null;
        this.ownerAuth = new OwnerAuth();
        this.printerUI = null;
        this.multiplayerServer = new MultiplayerServer();
        this.playerSync = null;
        this.combatEnabled = true; // ADDED - Combat system enabled
        // ADDED - Mod system
        this.modManager = new ModManager();
        this.modManager.gameApp = this; // ADDED - Link gameApp for webhook access
        this.modManagerUI = null;
        // ADDED - Open world system
        this.openWorld = null;
        // ADDED - Voxel terrain system
        this.voxelTerrain = null;
        this.orbitControls = null;
        this.useVoxelTerrain = false; // Toggle between voxel and open world (set to false for open world)
        // ADDED - Leaderboard system
        this.leaderboard = new Leaderboard();
        this.leaderboardUI = null;
        // ADDED - Sound system
        this.soundManager = new SoundManager();
        // ADDED - Achievements system
        this.achievementsSystem = new AchievementsSystem();
        // ADDED - Settings and pause menu
        this.settingsManager = new SettingsManager();
        this.pauseMenu = null;
        // ADDED - Achievement notification
        this.achievementNotification = new AchievementNotification();
        // ADDED - Tutorial system
        this.tutorialSystem = new TutorialSystem();
        // ADDED - Save/Load system
        this.saveLoadSystem = new SaveLoadSystem();
        // ADDED - Planet system
        this.planetSystem = null;
        // ADDED - Teleportation system
        this.teleportationSystem = null;
        // ADDED - Combat system
        this.combatSystem = null;
        // ADDED - Mission system
        this.missionSystem = new MissionSystem();
        // ADDED - Inventory system
        this.inventorySystem = new InventorySystem();
        // ADDED - Progression system
        this.progressionSystem = null;
        // ADDED - Minimap system
        this.minimapSystem = null;
        // ADDED - Discord integration
        this.discordIntegration = new DiscordIntegration();
        
        // ADDED - Player tracking for Discord bot
        this.playerId = this.generatePlayerId();
        this.playerUsername = this.getPlayerUsername();
        this.discordBotAPI = 'http://localhost:3001'; // Discord bot API endpoint
        
        // ADDED - Character selection system
        this.characterSelection = null;
        // ADDED - Role permissions system
        this.rolePermissions = null;
        // ADDED - Cash system
        this.cashSystem = null;
        // ADDED - Job system
        this.jobSystem = null;
        // ADDED - Admin menu
        this.adminMenu = null;
        // ADDED - Game server client (connects to WebSocket server)
        this.gameServerClient = null;
        const serverUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'ws://localhost:3001/game';
        if (typeof WebSocket !== 'undefined') {
            this.gameServerClient = new GameServerClient(serverUrl);
            this.gameServerClient.onConnect(() => {
                console.log('✅ Connected to game server');
            });
            this.gameServerClient.onMessage((data) => {
                this.handleServerMessage(data);
            });
            this.gameServerClient.connect();
        }
        
        // ADDED - Vehicle spawner
        this.vehicleSpawner = null;
        // ADDED - Game server client (connects to WebSocket server)
        this.gameServerClient = null;
        // ADDED - Player permissions
        this.playerPermissions = {};
        
        this.init();
    }

    generatePlayerId() {
        // Generate unique player ID
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getPlayerUsername() {
        // Get username from localStorage or prompt
        let username = localStorage.getItem('grid_username');
        if (!username) {
            username = 'Player' + Math.floor(Math.random() * 10000);
            localStorage.setItem('grid_username', username);
        }
        return username;
    }

    async reportPlayerJoin() {
        // Report player join to Discord bot
        try {
            const response = await fetch(`${this.discordBotAPI}/api/player/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.playerUsername,
                    playerId: this.playerId,
                    version: '1.0.0'
                })
            });
            const data = await response.json();
            if (data.success) {
                console.log('✅ Reported player join to Discord bot');
            }
        } catch (error) {
            console.warn('⚠️ Could not report player join to Discord bot:', error.message);
            // Bot might not be running, that's okay
        }
    }

    async reportPlayerLeave() {
        // Report player leave to Discord bot
        try {
            await fetch(`${this.discordBotAPI}/api/player/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.playerUsername,
                    playerId: this.playerId
                })
            });
            console.log('✅ Reported player leave to Discord bot');
        } catch (error) {
            // Silently fail - bot might not be running
        }
    }

    init() {
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // ADDED - Dark digital/arcade background
        this.renderer.setClearColor(0x000000); // Pure black for arcade feel

        // ADDED - Initialize GRiD assets
        this.grIDAssets = new GRiDAssets();
        this.grIDAssets.loadAssets();

        // ADDED - Initialize dev tools (can be toggled)
        this.devTools = new ThreeJSDevTools(this.scene, this.camera, this.renderer);
        // Uncomment to enable dev helpers:
        // this.devTools.addGridHelper(500, 50);
        // this.devTools.addAxesHelper(10);

        // Setup camera (increased far plane for open world)
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            5000  // Much larger for open world exploration
        );
        this.camera.position.set(0, 5, 10);

        // ADDED - Initialize advanced graphics system (after camera is created)
        try {
            this.advancedGraphics = new AdvancedGraphics(this.renderer, this.scene, this.camera);
            // Apply ray tracing if supported
            if (this.advancedGraphics.graphicsSettings.rayTracing) {
                this.advancedGraphics.setupRayTracedLighting();
                this.advancedGraphics.enhanceMaterials();
            }
        } catch (error) {
            console.error('Error initializing advanced graphics:', error);
            // Continue with basic graphics
        }

        // ADDED - Create HUB Tower
        this.hubTower = new HUBTower(this.scene);

        // ADDED - Initialize Planet System (50 planets, first 10 unlocked)
        this.planetSystem = new PlanetSystem(this.scene);

        // ADDED - Create 3D Printer in HUB room
        const printerPos = this.hubTower.getPrinterPosition();
        this.printer = new ModelPrinter(this.scene, printerPos);
        this.printerUI = new PrinterUI(this.printer, this.ownerAuth);

        // ADDED - Initialize multiplayer server
        this.multiplayerServer.initialize();

        // Create game world
        this.world = new GameWorld(this.scene);

        // ADDED - Initialize open world system
        this.openWorld = new OpenWorldSystem(this.scene);
        // Load initial chunks around spawn
        this.openWorld.updateChunks(new THREE.Vector3(0, 2, 0));

        // ADDED - Initialize voxel terrain system
        if (this.useVoxelTerrain) {
            this.voxelTerrain = new VoxelTerrain(this.scene, 16, 64);
            // Set initial camera position for voxel viewing
            this.camera.position.set(0, 30, 30);
            // Load initial chunks
            this.voxelTerrain.updateChunks(this.camera.position, 3);
            
            // Setup orbit controls for voxel exploration
            this.orbitControls = new OrbitControls(this.camera, this.canvas);
            this.orbitControls.target.set(0, 10, 0);
        }

        // Create bike grid manager (10K bikes)
        this.bikeGrid = new BikeGridManager(this.scene);
        this.bikeGrid.initialize();

        // Create player
        this.player = new Player(this.scene, this.camera);
        // ADDED - Link systems to player
        this.player.setSoundManager(this.soundManager);
        this.player.setAchievementsSystem(this.achievementsSystem);

        // ADDED - Initialize Teleportation System (after player is created)
        this.teleportationSystem = new TeleportationSystem(this.scene, this.planetSystem, this.player);
        this.teleportationSystem.missionSystem = this.missionSystem; // Link mission system
        this.teleportationSystem.gameApp = this; // ADDED - Link game app for webhooks

        // ADDED - Initialize Combat System
        this.combatSystem = new CombatSystem(this.scene, this.player);

        // ADDED - Spawn some enemies for combat
        this.combatSystem.spawnEnemies(5, 50); // Spawn 5 enemies in 50 unit radius

        // ADDED - Initialize Progression System
        this.progressionSystem = new GameProgression(this);

        // ADDED - Initialize Minimap System
        this.minimapSystem = new MinimapSystem(this.scene, this.camera, this.player);
        this.minimapSystem.setGameApp(this);

        // ADDED - Initialize Discord Integration
        this.discordIntegration.initialize();
        this.discordIntegration.updateGameState('menu');

        // ADDED - Initialize Cash System
        this.cashSystem = new CashSystem(this);

        // ADDED - Initialize Job System
        this.jobSystem = new JobSystem(this);

        // ADDED - Initialize Vehicle Spawner
        this.vehicleSpawner = new VehicleSpawnerSystem(this.scene, this);

        // ADDED - Initialize Game Server Client (connects to WebSocket server)
        const serverUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 
                         (typeof window !== 'undefined' && window.location.protocol === 'https:' 
                          ? 'wss://game.yourdomain.com/game' 
                          : 'ws://localhost:3001/game');
        
        if (typeof WebSocket !== 'undefined') {
            try {
                this.gameServerClient = new GameServerClient(serverUrl);
                this.gameServerClient.onConnect(() => {
                    console.log('✅ Connected to game server');
                });
                this.gameServerClient.onDisconnect(() => {
                    console.log('⚠️ Disconnected from game server');
                });
                this.gameServerClient.onMessage((data) => {
                    this.handleServerMessage(data);
                });
                this.gameServerClient.connect();
            } catch (error) {
                console.warn('⚠️ Could not initialize game server client:', error);
            }
        }

        // ADDED - Initialize Role Permissions System
        this.rolePermissions = new RolePermissionsSystem(this);
        this.rolePermissions.initialize();

        // ADDED - Initialize Admin Menu
        this.adminMenu = new AdminMenuSystem(this);

        // ADDED - Initialize Character Selection (but don't show yet - wait for start button)
        this.characterSelection = new CharacterSelectionSystem(this);
        // Character selection will be shown when start button is clicked if no character selected

        // ADDED - Report player join to Discord bot API
        this.reportPlayerJoin();
        
        // ADDED - Log player join to webhooks
        if (this.discordWebhooks) {
            this.discordWebhooks.logPlayerJoin(this.playerUsername);
        }
        
        // ADDED - Setup window close handler to report player leave
        window.addEventListener('beforeunload', () => {
            this.reportPlayerLeave();
        });

        // ADDED - Start initial missions
        this.missionSystem.startMission('tutorial_move');
        this.missionSystem.startMission('tutorial_collect');
        this.missionSystem.startMission('explore_nexus');

        // ADDED - Initialize player sync for multiplayer
        this.playerSync = new PlayerSync(this.scene, this.multiplayerServer);
        if (this.player.yawObject) {
            this.playerSync.registerLocalPlayer(this.player.yawObject);
        }

        // Create game instance
        this.game = new Game(this.player, this.world);
        // ADDED - Link systems to game
        if (this.openWorld) {
            this.game.setOpenWorld(this.openWorld);
        }
        this.game.setSoundManager(this.soundManager);
        this.game.setAchievementsSystem(this.achievementsSystem);
        this.game.setProgressionSystem(this.progressionSystem);
        this.game.setInventorySystem(this.inventorySystem);

        // ADDED - Initialize mod manager UI
        try {
            this.modManagerUI = new ModManagerUI(this.modManager);
            this.modManager.loadInstalledMods();
            this.modManager.loadAllMods().catch(err => {
                console.warn('Error loading mods:', err);
            });
        } catch (error) {
            console.error('Error initializing mod manager:', error);
            // Continue without mod manager if it fails
        }

        // ADDED - Initialize leaderboard UI
        this.leaderboardUI = new LeaderboardUI(this.leaderboard, this.multiplayerServer);
        
        // ADDED - Add local player to leaderboard
        this.leaderboard.addPlayer('local', 'You', 0, 0, 0);

        // ADDED - Initialize pause menu
        this.pauseMenu = new PauseMenu(this, this.settingsManager);

        // ADDED - Setup achievement notifications
        this.achievementsSystem.onAchievementUnlocked = (achievement) => {
            this.achievementNotification.show(achievement);
            if (this.soundManager) {
                this.soundManager.playSuccess();
            }
            // ADDED - Give experience for achievements
            if (this.progressionSystem) {
                this.progressionSystem.addExperience(achievement.reward || 50);
            }
            // ADDED - Log achievement to Discord
            if (this.discordWebhooks) {
                this.discordWebhooks.logAchievement(
                    this.playerUsername,
                    achievement.name,
                    achievement.description
                );
            }
        };

        // ADDED - Setup mission completion notifications
        this.missionSystem.onMissionComplete = (mission) => {
            if (this.achievementNotification) {
                this.achievementNotification.show({
                    name: `Mission Complete: ${mission.name}`,
                    description: `Reward: ${mission.reward} XP`,
                    icon: '🎯',
                    reward: mission.reward
                });
            }
            if (this.progressionSystem) {
                this.progressionSystem.addExperience(mission.reward);
            }
            if (this.soundManager) {
                this.soundManager.playSuccess();
            }
            // ADDED - Log mission completion to Discord
            if (this.discordWebhooks) {
                this.discordWebhooks.logMissionComplete(
                    this.playerUsername,
                    mission.name,
                    mission.reward || 50
                );
            }
        };

        // ADDED - Try to load saved game
        if (this.saveLoadSystem.hasSave()) {
            this.saveLoadSystem.load(this);
        }

        // ADDED - Start background music
        this.soundManager.startMusic();

        // Setup event listeners
        this.setupEventListeners();

        // Hide start screen and start game
        console.log('Calling setupUI()...');
        this.setupUI();

        // Start animation loop
        console.log('Starting animation loop...');
        this.animate();
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // ADDED - Printer interaction (press P to open printer UI)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                // Check if player is near printer
                const playerPos = this.player.yawObject.position;
                const printerPos = this.hubTower.getPrinterPosition();
                const distance = playerPos.distanceTo(printerPos);
                
                if (distance < 5) {
                    this.printerUI.show();
                }
            }
            
            // ADDED - Mod manager (press M to open mod manager)
            if (e.code === 'KeyM' && this.modManagerUI) {
                this.modManagerUI.show();
            }
            
            // ADDED - Leaderboard (press L to toggle leaderboard)
            if (e.code === 'KeyL' && this.leaderboardUI) {
                this.leaderboardUI.toggle();
            }
            
            // ADDED - Teleportation (press T to open teleportation menu)
            if (e.code === 'KeyT' && this.teleportationSystem) {
                this.teleportationSystem.toggle();
                // ADDED - Update Discord presence
                if (this.discordIntegration && this.teleportationSystem.container.style.display !== 'none') {
                    this.discordIntegration.updateGameState('teleporting');
                }
            }
            
                // ADDED - Admin menu (press F1)
                if (e.code === 'F1' && this.adminMenu) {
                    this.adminMenu.toggle();
                }
                
                // ADDED - Pause menu (press ESC or Pause)
                if (e.code === 'Escape' || e.code === 'Pause') {
                    if (this.pauseMenu && this.isRunning) {
                        this.pauseMenu.toggle();
                        // ADDED - Update Discord presence when pausing
                        if (this.discordIntegration) {
                            this.discordIntegration.updateGameState(this.pauseMenu.isVisible ? 'paused' : 'playing');
                        }
                    } else {
                        // Close other UI windows
                        if (this.modManagerUI) this.modManagerUI.hide();
                        if (this.printerUI) this.printerUI.hide();
                        if (this.leaderboardUI) this.leaderboardUI.hide();
                        if (this.teleportationSystem) this.teleportationSystem.hide();
                        if (this.adminMenu) this.adminMenu.hide();
                    }
                }
            });
        }

    startGame() {
        console.log('startGame() called');
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // Apply character spawn location if available
        if (this.characterSelection) {
            const selectedChar = this.characterSelection.getSelectedCharacter();
            if (selectedChar && this.player && this.player.yawObject) {
                console.log('Applying character spawn location:', selectedChar.spawnLocation);
                this.player.yawObject.position.set(
                    selectedChar.spawnLocation.x,
                    selectedChar.spawnLocation.y,
                    selectedChar.spawnLocation.z
                );
            }
        }
        
        console.log('Setting isRunning to true');
        this.isRunning = true;
        
        if (this.game) {
            console.log('Starting game...');
            this.game.start();
        } else {
            console.error('Game instance not found!');
        }
        
        if (this.player) {
            console.log('Enabling player controls...');
            this.player.enableControls();
        } else {
            console.error('Player instance not found!');
        }
        
        // Play UI sound
        if (this.soundManager) {
            this.soundManager.playUI();
        }
        
        // Update Discord presence
        if (this.discordIntegration) {
            this.discordIntegration.updateGameState('playing');
        }
        
        // Log game start
        if (this.discordWebhooks) {
            this.discordWebhooks.logGameStart(this.playerUsername);
        }
        
        // Report player join when game starts
        this.reportPlayerJoin();
        
        console.log('Game started successfully!');
    }

    setupUI() {
        console.log('setupUI() called');
        const startButton = document.getElementById('start-button');
        const restartButton = document.getElementById('restart-button');
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        if (!startButton) {
            console.error('Start button not found!');
            return;
        }

        console.log('Start button found, attaching event listener...');
        startButton.addEventListener('click', () => {
            console.log('Start button clicked!');
            // Check if character is selected first
            if (!this.characterSelection || !this.characterSelection.hasSelectedCharacter()) {
                console.log('No character selected, showing character selection...');
                // Show character selection instead of starting game
                if (startScreen) {
                    startScreen.style.display = 'none';
                }
                if (this.characterSelection) {
                    this.characterSelection.show();
                } else {
                    console.error('Character selection system not initialized!');
                    // Fallback: start game anyway if character selection isn't available
                    console.log('Starting game without character selection...');
                    this.startGame();
                }
                return;
            }

            console.log('Character selected, starting game...');
            // Character is selected, start the game
            this.startGame();
        });

        if (restartButton) {
            restartButton.addEventListener('click', () => {
                gameOverScreen.style.display = 'none';
                this.restart();
                // ADDED - Play UI sound
                if (this.soundManager) {
                    this.soundManager.playUI();
                }
            });
        }
    }

    setupGameStates() {
        // ADDED - Register game states
        this.stateManager.registerState('menu', {
            enter: () => {
                console.log('Entered menu state');
            },
            update: () => {},
            exit: () => {}
        });

        this.stateManager.registerState('playing', {
            enter: () => {
                console.log('Entered playing state');
            },
            update: (deltaTime) => {},
            exit: () => {}
        });

        this.stateManager.setState('menu');
    }

    returnToMenu() {
        this.isRunning = false;
        if (this.player) {
            this.player.disableControls();
        }
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('game-over-screen').style.display = 'none';
        if (this.pauseMenu) {
            this.pauseMenu.hide();
        }
    }

    restart() {
        // Reset game state
        this.game.reset();
        this.player.reset();
        this.world.reset();
        if (this.bikeGrid) {
            this.bikeGrid.reset();
        }
        this.isRunning = true;
        this.game.start();
        this.player.enableControls();
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'player_join':
                console.log(`Player joined: ${data.player.username}`);
                // Add player to scene
                break;
            case 'player_leave':
                console.log(`Player left: ${data.playerId}`);
                // Remove player from scene
                break;
            case 'player_update':
                // Update other player's position
                // This would update remote players in the scene
                break;
            case 'game_state':
                // Update game state with server data
                break;
            case 'chat':
                // Display chat message
                console.log(`[${data.username}]: ${data.message}`);
                break;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isRunning) return;
        // ADDED - Don't update if paused
        if (this.pauseMenu && this.pauseMenu.isVisible) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        const deltaTime = this.clock.getDelta();

        // ADDED - Update game server with player position
        if (this.gameServerClient && this.gameServerClient.connected && this.player && this.player.yawObject) {
            const position = this.player.yawObject.position;
            const rotation = this.player.yawObject.rotation;
            this.gameServerClient.updatePosition(
                { x: position.x, y: position.y, z: position.z },
                { x: rotation.x, y: rotation.y, z: rotation.z }
            );
        }

        // Update player
        this.player.update(deltaTime);

        // ADDED - Update player sync for multiplayer
        if (this.playerSync) {
            this.playerSync.updateLocalPlayer(this.player.yawObject);
            this.playerSync.update(deltaTime);
        }

        // ADDED - Update printer
        if (this.printer) {
            this.printer.update(deltaTime);
        }

        // Update bike grid
        if (this.bikeGrid) {
            this.bikeGrid.update(deltaTime);
            // Update LOD based on camera position
            const cameraPos = this.player.yawObject ? this.player.yawObject.position.clone() : this.camera.position.clone();
            this.bikeGrid.updateLOD(cameraPos);
            
            // ADDED - Update achievements for bikes seen
            if (this.achievementsSystem && this.bikeGrid.getBikeCount) {
                const bikeCount = this.bikeGrid.getBikeCount();
                if (bikeCount > this.achievementsSystem.stats.bikesSeen) {
                    this.achievementsSystem.setStat('bikesSeen', bikeCount);
                }
            }
        }

        // ADDED - Update planet markers
        if (this.planetSystem) {
            this.planetSystem.updateMarkers(deltaTime);
        }

        // ADDED - Update combat system
        if (this.combatSystem && this.combatEnabled !== false) {
            this.combatSystem.updateEnemies(deltaTime);
            // ADDED - Update Discord presence if in combat
            if (this.combatSystem.enemies.length > 0 && this.discordIntegration) {
                this.discordIntegration.updateGameState('combat');
            }
        }

        // ADDED - Update minimap
        if (this.minimapSystem) {
            this.minimapSystem.update();
        }

        // ADDED - Update progression
        if (this.progressionSystem) {
            this.progressionSystem.updatePlayTime(deltaTime);
        }

        // ADDED - Update open world system (procedural generation)
        if (this.openWorld && this.player.yawObject && !this.useVoxelTerrain) {
            const playerPos = this.player.yawObject.position;
            this.openWorld.update(deltaTime, playerPos);
        }

        // ADDED - Update voxel terrain system
        if (this.voxelTerrain) {
            const cameraPos = this.camera.position;
            this.voxelTerrain.updateChunks(cameraPos, 3);
        }

        // ADDED - Update orbit controls
        if (this.orbitControls && this.useVoxelTerrain) {
            this.orbitControls.update();
        }

        // Update game
        this.game.update(deltaTime);

        // ADDED - Update leaderboard with current score
        if (this.leaderboard && this.game && this.isRunning) {
            this.leaderboard.addPlayer('local', 'You', this.game.getScore(), 0, 0);
            this.leaderboard.update();
        }

        // ADDED - Update achievements
        if (this.achievementsSystem && this.game) {
            this.achievementsSystem.setStat('score', this.game.getScore());
            this.achievementsSystem.setStat('playTime', deltaTime);
            this.achievementsSystem.checkAchievements();
        }

        // ADDED - Update missions
        if (this.missionSystem && this.player && this.player.yawObject) {
            const playerPos = this.player.yawObject.position;
            const activeMissions = this.missionSystem.getActiveMissions();
            
            activeMissions.forEach(mission => {
                if (mission.type === 'distance') {
                    // Track distance traveled
                    const distance = playerPos.length();
                    this.missionSystem.updateMission(mission.id, distance);
                } else if (mission.type === 'collect') {
                    // Track collectibles
                    const collected = this.achievementsSystem?.stats?.collectiblesCollected || 0;
                    this.missionSystem.updateMission(mission.id, collected);
                } else if (mission.type === 'score') {
                    // Track score
                    const score = this.game?.getScore() || 0;
                    this.missionSystem.updateMission(mission.id, score);
                } else if (mission.type === 'planet') {
                    // Track planet visits
                    const currentPlanet = this.planetSystem?.getCurrentPlanet();
                    if (currentPlanet === mission.target) {
                        this.missionSystem.updateMission(mission.id, 1);
                    }
                }
            });
        }

        // ADDED - Auto-save game
        if (this.saveLoadSystem && this.isRunning) {
            this.saveLoadSystem.autoSave(this, Date.now());
        }

        // ADDED - Update game state manager
        this.stateManager.update(deltaTime);

        // ADDED - Performance profiling
        this.profiler.mark('frame-end');
        if (this.profiler.marks.has('frame-start')) {
            this.profiler.measure('frame', 'frame-start', 'frame-end');
        }
        this.profiler.mark('frame-start');

        // Update HUD
        this.updateHUD();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    updateHUD() {
        // Update score
        document.getElementById('score-value').textContent = this.game.getScore();

        // Update health
        document.getElementById('health-value').textContent = Math.max(0, Math.floor(this.player.getHealth()));

        // Update bike count
        if (this.bikeGrid) {
            document.getElementById('bikes-value').textContent = this.bikeGrid.getBikeCount().toLocaleString();
        }

        // ADDED - Update level
        if (this.progressionSystem) {
            const levelEl = document.getElementById('level-value');
            if (levelEl) {
                levelEl.textContent = this.progressionSystem.getLevel();
            }
        }

        // ADDED - Update multiplayer player count
        if (this.multiplayerServer) {
            try {
                const serverState = this.multiplayerServer.getServerState();
                // Could add player count to HUD if desired
            } catch (error) {
                console.warn('Error updating multiplayer state:', error);
            }
        }

        // Update FPS
        const fps = Math.round(1 / this.clock.getDelta());
        document.getElementById('fps-value').textContent = fps;

        // ADDED - Update cash display
        if (this.cashSystem) {
            this.cashSystem.updateUI();
        }

        // ADDED - Display GPU info in console (can add to HUD)
        if (this.advancedGraphics && fps % 60 === 0) {
            const gpuInfo = this.advancedGraphics.gpuInfo;
            if (gpuInfo.isRTX) {
                // GPU detected, could show in HUD
            }
        }

        // Check game over
        if (this.player.getHealth() <= 0 && this.isRunning) {
            this.isRunning = false;
            this.player.disableControls();
            document.getElementById('final-score').textContent = this.game.getScore();
            document.getElementById('game-over-screen').style.display = 'block';
            // ADDED - Play game over sound
            if (this.soundManager) {
                this.soundManager.playError();
            }
            // ADDED - Log game end to Discord
            if (this.discordWebhooks) {
                this.discordWebhooks.logGameEnd(this.playerUsername, this.game.getScore());
            }
        }

        // ADDED - Check for high score and log to Discord
        if (this.game && this.discordWebhooks && this.isRunning) {
            const currentScore = this.game.getScore();
            const highScore = parseInt(localStorage.getItem('grid_high_score') || '0');
            if (currentScore > highScore && currentScore > 1000) { // Only log significant scores
                localStorage.setItem('grid_high_score', currentScore.toString());
                this.discordWebhooks.logHighScore(this.playerUsername, currentScore);
            }
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBarFill = document.getElementById('loading-bar-fill');
    const loadingText = document.getElementById('loading-text-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        
        // Simulate loading progress
        let progress = 0;
        const loadingMessages = [
            'Loading GRiD...',
            'Initializing 3D Engine...',
            'Loading Assets...',
            'Preparing World...',
            'Almost Ready...'
        ];
        
        const updateLoading = () => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (loadingBarFill) {
                loadingBarFill.style.width = progress + '%';
            }
            
            // Update loading message
            const messageIndex = Math.floor((progress / 100) * loadingMessages.length);
            if (messageIndex < loadingMessages.length && loadingText) {
                loadingText.textContent = loadingMessages[messageIndex];
            }
            
            if (progress < 100) {
                setTimeout(updateLoading, 200);
            } else {
                // Loading complete - hide loading screen and start game
                setTimeout(() => {
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                    // Signal Electron that loading is complete
                    if (window.electronAPI && window.electronAPI.loadingComplete) {
                        window.electronAPI.loadingComplete();
                    }
                    // Initialize game
                    new GameApp();
                }, 500);
            }
        };
        
        // Start loading animation after a brief delay
        setTimeout(updateLoading, 500);
    } else {
        // No loading screen, start game immediately
        new GameApp();
    }
});

