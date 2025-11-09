// ADDED - Complete Game Objectives and Progression System
export class GameProgression {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.totalPlayTime = 0;
        this.objectives = [];
        this.loadProgress();
    }

    addExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
        
        this.saveProgress();
    }

    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
        
        // Show level up notification
        if (this.gameApp.achievementNotification) {
            this.gameApp.achievementNotification.show({
                name: `Level Up!`,
                description: `You reached level ${this.level}!`,
                icon: '⭐',
                reward: 0
            });
        }
        
        // Play success sound
        if (this.gameApp.soundManager) {
            this.gameApp.soundManager.playSuccess();
        }
        
        // ADDED - Log level up to Discord
        if (this.gameApp.discordWebhooks && this.gameApp.playerUsername) {
            this.gameApp.discordWebhooks.logLevelUp(this.gameApp.playerUsername, this.level);
        }
    }

    updatePlayTime(deltaTime) {
        this.totalPlayTime += deltaTime;
    }

    getLevel() {
        return this.level;
    }

    getExperience() {
        return this.experience;
    }

    getExperienceProgress() {
        return this.experience / this.experienceToNext;
    }

    saveProgress() {
        try {
            const data = {
                level: this.level,
                experience: this.experience,
                experienceToNext: this.experienceToNext,
                totalPlayTime: this.totalPlayTime
            };
            localStorage.setItem('grid_progression', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save progression:', error);
        }
    }

    loadProgress() {
        try {
            const data = localStorage.getItem('grid_progression');
            if (data) {
                const parsed = JSON.parse(data);
                this.level = parsed.level || 1;
                this.experience = parsed.experience || 0;
                this.experienceToNext = parsed.experienceToNext || 100;
                this.totalPlayTime = parsed.totalPlayTime || 0;
            }
        } catch (error) {
            console.warn('Failed to load progression:', error);
        }
    }
}

