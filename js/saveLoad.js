// ADDED - Complete Save/Load System Integration
export class SaveLoadSystem {
    constructor() {
        this.saveData = {
            player: {
                position: { x: 0, y: 2, z: 0 },
                health: 100,
                score: 0
            },
            game: {
                score: 0,
                collectiblesCollected: 0,
                playTime: 0
            },
            achievements: {},
            settings: {},
            timestamp: Date.now()
        };
        this.autoSaveInterval = 30000; // Auto-save every 30 seconds
        this.lastAutoSave = 0;
    }

    save(gameApp) {
        try {
            // Save player data
            if (gameApp.player && gameApp.player.yawObject) {
                const pos = gameApp.player.yawObject.position;
                this.saveData.player.position = { x: pos.x, y: pos.y, z: pos.z };
                this.saveData.player.health = gameApp.player.getHealth();
            }

            // Save game data
            if (gameApp.game) {
                this.saveData.game.score = gameApp.game.getScore();
            }

            // Save achievements
            if (gameApp.achievementsSystem) {
                this.saveData.achievements = {
                    stats: gameApp.achievementsSystem.stats,
                    unlocked: Array.from(gameApp.achievementsSystem.unlockedAchievements)
                };
            }

            // Save settings
            if (gameApp.settingsManager) {
                this.saveData.settings = gameApp.settingsManager.settings;
            }

            this.saveData.timestamp = Date.now();
            localStorage.setItem('grid_save', JSON.stringify(this.saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    load(gameApp) {
        try {
            const data = localStorage.getItem('grid_save');
            if (!data) return false;

            const loaded = JSON.parse(data);
            this.saveData = loaded;

            // Load player data
            if (gameApp.player && loaded.player) {
                const pos = loaded.player.position;
                gameApp.player.yawObject.position.set(pos.x, pos.y, pos.z);
                gameApp.player.health = loaded.player.health || 100;
            }

            // Load game data
            if (gameApp.game && loaded.game) {
                gameApp.game.score = loaded.game.score || 0;
            }

            // Load achievements
            if (gameApp.achievementsSystem && loaded.achievements) {
                gameApp.achievementsSystem.stats = loaded.achievements.stats || gameApp.achievementsSystem.stats;
                loaded.achievements.unlocked?.forEach(id => {
                    gameApp.achievementsSystem.unlockAchievement(id);
                });
            }

            // Load settings
            if (gameApp.settingsManager && loaded.settings) {
                gameApp.settingsManager.settings = { ...gameApp.settingsManager.settings, ...loaded.settings };
            }

            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    autoSave(gameApp, currentTime) {
        if (currentTime - this.lastAutoSave >= this.autoSaveInterval) {
            this.save(gameApp);
            this.lastAutoSave = currentTime;
        }
    }

    hasSave() {
        return localStorage.getItem('grid_save') !== null;
    }

    deleteSave() {
        try {
            localStorage.removeItem('grid_save');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
}

