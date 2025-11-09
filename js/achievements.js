// ADDED - Complete Achievements System
export class AchievementsSystem {
    constructor() {
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.stats = {
            collectiblesCollected: 0,
            distanceTraveled: 0,
            bikesSeen: 0,
            playTime: 0,
            jumps: 0,
            score: 0
        };
        this.initializeAchievements();
        this.loadProgress();
    }

    initializeAchievements() {
        // Collection achievements
        this.registerAchievement('first_collect', {
            name: 'First Collection',
            description: 'Collect your first item',
            icon: '⭐',
            condition: () => this.stats.collectiblesCollected >= 1,
            reward: 10
        });

        this.registerAchievement('collector_10', {
            name: 'Collector',
            description: 'Collect 10 items',
            icon: '🏆',
            condition: () => this.stats.collectiblesCollected >= 10,
            reward: 50
        });

        this.registerAchievement('collector_100', {
            name: 'Master Collector',
            description: 'Collect 100 items',
            icon: '👑',
            condition: () => this.stats.collectiblesCollected >= 100,
            reward: 500
        });

        // Exploration achievements
        this.registerAchievement('explorer_1km', {
            name: 'Explorer',
            description: 'Travel 1km',
            icon: '🗺️',
            condition: () => this.stats.distanceTraveled >= 1000,
            reward: 100
        });

        this.registerAchievement('explorer_10km', {
            name: 'World Traveler',
            description: 'Travel 10km',
            icon: '🌍',
            condition: () => this.stats.distanceTraveled >= 10000,
            reward: 1000
        });

        // Bike achievements
        this.registerAchievement('bike_spotter', {
            name: 'Bike Spotter',
            description: 'See 100 bikes',
            icon: '🏍️',
            condition: () => this.stats.bikesSeen >= 100,
            reward: 200
        });

        this.registerAchievement('bike_master', {
            name: 'Bike Master',
            description: 'See 1000 bikes',
            icon: '🏍️💨',
            condition: () => this.stats.bikesSeen >= 1000,
            reward: 2000
        });

        // Score achievements
        this.registerAchievement('scorer_100', {
            name: 'Scorer',
            description: 'Reach 100 points',
            icon: '💯',
            condition: () => this.stats.score >= 100,
            reward: 50
        });

        this.registerAchievement('scorer_1000', {
            name: 'High Scorer',
            description: 'Reach 1000 points',
            icon: '🔥',
            condition: () => this.stats.score >= 1000,
            reward: 500
        });

        this.registerAchievement('scorer_10000', {
            name: 'Legendary Scorer',
            description: 'Reach 10000 points',
            icon: '⚡',
            condition: () => this.stats.score >= 10000,
            reward: 5000
        });

        // Time achievements
        this.registerAchievement('player_1h', {
            name: 'Dedicated Player',
            description: 'Play for 1 hour',
            icon: '⏰',
            condition: () => this.stats.playTime >= 3600,
            reward: 300
        });

        // Special achievements
        this.registerAchievement('jumper', {
            name: 'Bouncy',
            description: 'Jump 100 times',
            icon: '🦘',
            condition: () => this.stats.jumps >= 100,
            reward: 150
        });

        this.registerAchievement('perfectionist', {
            name: 'Perfectionist',
            description: 'Collect 50 items without taking damage',
            icon: '✨',
            condition: () => this.stats.collectiblesCollected >= 50 && this.stats.damageTaken === 0,
            reward: 1000
        });
    }

    registerAchievement(id, achievement) {
        this.achievements.set(id, {
            ...achievement,
            id,
            unlocked: false,
            unlockedAt: null
        });
    }

    updateStat(statName, value) {
        if (this.stats.hasOwnProperty(statName)) {
            this.stats[statName] += value;
            this.checkAchievements();
            this.saveProgress();
        }
    }

    setStat(statName, value) {
        if (this.stats.hasOwnProperty(statName)) {
            this.stats[statName] = value;
            this.checkAchievements();
            this.saveProgress();
        }
    }

    checkAchievements() {
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(id);
            }
        });
    }

    unlockAchievement(id) {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        this.unlockedAchievements.add(id);

        // Trigger achievement notification
        if (this.onAchievementUnlocked) {
            this.onAchievementUnlocked(achievement);
        }

        this.saveProgress();
        return achievement;
    }

    getAchievements() {
        return Array.from(this.achievements.values());
    }

    getUnlockedAchievements() {
        return Array.from(this.achievements.values()).filter(a => a.unlocked);
    }

    getProgress() {
        const total = this.achievements.size;
        const unlocked = this.unlockedAchievements.size;
        return {
            total,
            unlocked,
            percentage: total > 0 ? (unlocked / total) * 100 : 0
        };
    }

    saveProgress() {
        try {
            const data = {
                achievements: Array.from(this.unlockedAchievements),
                stats: this.stats,
                timestamp: Date.now()
            };
            localStorage.setItem('grid_achievements', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save achievements:', error);
        }
    }

    loadProgress() {
        try {
            const data = localStorage.getItem('grid_achievements');
            if (data) {
                const parsed = JSON.parse(data);
                parsed.achievements?.forEach(id => {
                    const achievement = this.achievements.get(id);
                    if (achievement) {
                        achievement.unlocked = true;
                        this.unlockedAchievements.add(id);
                    }
                });
                if (parsed.stats) {
                    Object.assign(this.stats, parsed.stats);
                }
            }
        } catch (error) {
            console.warn('Failed to load achievements:', error);
        }
    }

    reset() {
        this.unlockedAchievements.clear();
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            achievement.unlockedAt = null;
        });
        this.stats = {
            collectiblesCollected: 0,
            distanceTraveled: 0,
            bikesSeen: 0,
            playTime: 0,
            jumps: 0,
            score: 0,
            damageTaken: 0
        };
        this.saveProgress();
    }
}

