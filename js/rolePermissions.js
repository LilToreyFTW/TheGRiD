// ADDED - Role-Based Permissions System
export class RolePermissionsSystem {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.discordBotAPI = 'http://localhost:3001';
        this.userRoles = [];
        this.permissions = {
            inGame: [],
            discord: []
        };
        this.userId = null;
        this.checkInterval = null;
    }

    async initialize() {
        // Get Discord user ID from localStorage or generate
        this.userId = localStorage.getItem('grid_discord_user_id');
        if (!this.userId) {
            // Try to get from Discord OAuth or use player ID
            this.userId = this.gameApp.playerId;
        }

        // Fetch initial roles
        await this.fetchRoles();

        // Check for role updates periodically
        this.checkInterval = setInterval(() => {
            this.fetchRoles();
            this.checkPendingCommands();
        }, 5000); // Check every 5 seconds
    }

    async fetchRoles() {
        try {
            const response = await fetch(`${this.discordBotAPI}/api/player/roles?userId=${this.userId}`);
            const data = await response.json();
            if (data.success) {
                this.userRoles = data.roles || [];
                this.permissions = data.permissions || { inGame: [], discord: [] };
                this.applyPermissions();
            }
        } catch (error) {
            // Bot might not be running
        }
    }

    applyPermissions() {
        // Apply in-game permissions based on roles
        const perms = this.permissions.inGame || [];

        // Store permissions for other systems to check
        this.gameApp.playerPermissions = {
            allDoors: perms.includes('all_doors'),
            allChests: perms.includes('all_chests'),
            weaponChests: perms.includes('weapon_chests'),
            freeXP: perms.includes('free_xp'),
            adminMenu: perms.includes('admin_menu'),
            ownerMenu: perms.includes('owner_menu'),
            vehicleSpawner: perms.includes('vehicle_spawner'),
            unlimitedCash: perms.includes('unlimited_cash'),
            explore: perms.includes('explore'),
            jobs: perms.includes('jobs'),
            cashRewards: perms.includes('cash_rewards'),
            civilian150k: perms.includes('150k_every_6h')
        };

        // Apply civilian cash rewards
        if (this.gameApp.playerPermissions.civilian150k) {
            this.checkCivilianCashReward();
        }
    }

    async checkPendingCommands() {
        try {
            const response = await fetch(`${this.discordBotAPI}/api/player/commands?userId=${this.userId}`);
            const data = await response.json();
            if (data.success && data.commands && data.commands.length > 0) {
                data.commands.forEach(cmd => {
                    this.executeCommand(cmd);
                });
            }
        } catch (error) {
            // Bot might not be running
        }
    }

    executeCommand(cmd) {
        if (cmd.type === 'spawn') {
            this.spawnItem(cmd.data.type, cmd.data.item);
        } else if (cmd.type === 'cash') {
            this.addCash(cmd.data.amount);
        }
    }

    spawnItem(type, item) {
        // Spawn item/vehicle in game
        if (type === 'vehicle' && this.gameApp.vehicleSpawner) {
            this.gameApp.vehicleSpawner.spawnVehicle(item);
        } else if (type === 'weapon' && this.gameApp.inventorySystem) {
            this.gameApp.inventorySystem.addItem(item, 1);
        } else if (type === 'cash') {
            this.addCash(parseInt(item) || 1000);
        }
    }

    addCash(amount) {
        if (this.gameApp.cashSystem) {
            this.gameApp.cashSystem.addCash(amount);
        } else {
            // Fallback: store in localStorage
            const currentCash = parseInt(localStorage.getItem('grid_cash') || '0');
            localStorage.setItem('grid_cash', (currentCash + amount).toString());
        }
    }

    checkCivilianCashReward() {
        const lastReward = parseInt(localStorage.getItem('grid_civilian_last_reward') || '0');
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;

        if (now - lastReward >= sixHours) {
            this.addCash(150000);
            localStorage.setItem('grid_civilian_last_reward', now.toString());
            
            // Show notification
            if (this.gameApp.notificationSystem) {
                this.gameApp.notificationSystem.show('Civilian Reward', 'You received 150,000 cash!', 'success');
            }
        }
    }

    hasPermission(permission) {
        return this.permissions.inGame.includes(permission);
    }

    canAccessDoor(doorId) {
        return this.gameApp.playerPermissions.allDoors || this.hasPermission('all_doors');
    }

    canAccessChest(chestId) {
        return this.gameApp.playerPermissions.allChests || this.hasPermission('all_chests');
    }

    canSpawnVehicles() {
        return this.gameApp.playerPermissions.vehicleSpawner || this.hasPermission('vehicle_spawner');
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

