// ADDED - Discord Webhook Integration for Game Chat and Logs
export class DiscordWebhooks {
    constructor() {
        // ADDED - Discord webhook URLs
        this.gameChatWebhook = 'https://discord.com/api/webhooks/1436948279114862643/xIMi1mRyp86e0cjYMkQuWSFWZ51BXxWVxL3POADwSwKYycsyPLNikXp7XyBbamXK1iA2';
        this.gameLogsWebhook = 'https://discord.com/api/webhooks/1436948466143334401/dqx3vm12WvbV9UzyUYqASeJmFUvlLeayJtW6wGaRKhTptBDEku96k4cbr-UR7Zom4NFw';
        this.enabled = true;
    }

    /**
     * Send a message to the game-chat Discord channel
     * @param {string} username - Player username
     * @param {string} message - Chat message
     * @param {string} avatarUrl - Optional avatar URL
     */
    async sendChatMessage(username, message, avatarUrl = null) {
        if (!this.enabled) return;

        try {
            const payload = {
                username: username || 'GRiD Player',
                content: message,
                avatar_url: avatarUrl
            };

            await fetch(this.gameChatWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn('Failed to send chat message to Discord:', error);
        }
    }

    /**
     * Send a game log event to the game-logs Discord channel
     * @param {string} event - Event name (e.g., "Player Joined", "Achievement Unlocked")
     * @param {string} description - Event description
     * @param {object} fields - Optional additional fields
     * @param {string} color - Optional embed color (hex)
     */
    async sendGameLog(event, description, fields = {}, color = 0x00ffff) {
        if (!this.enabled) return;

        try {
            const embed = {
                title: event,
                description: description,
                color: color,
                timestamp: new Date().toISOString(),
                fields: []
            };

            // Add custom fields
            for (const [key, value] of Object.entries(fields)) {
                embed.fields.push({
                    name: key,
                    value: String(value),
                    inline: true
                });
            }

            const payload = {
                username: 'GRiD Game Logs',
                embeds: [embed]
            };

            await fetch(this.gameLogsWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn('Failed to send game log to Discord:', error);
        }
    }

    /**
     * Log player join event
     */
    async logPlayerJoin(username) {
        await this.sendGameLog(
            '🎮 Player Joined',
            `${username} has joined the game`,
            { Username: username },
            0x4CAF50
        );
    }

    /**
     * Log achievement unlock
     */
    async logAchievement(username, achievementName, achievementDescription) {
        await this.sendGameLog(
            '🏆 Achievement Unlocked',
            `${username} unlocked an achievement!`,
            {
                Achievement: achievementName,
                Description: achievementDescription
            },
            0xffaa00
        );
    }

    /**
     * Log high score
     */
    async logHighScore(username, score) {
        await this.sendGameLog(
            '⭐ High Score',
            `${username} achieved a new high score!`,
            { Score: score.toLocaleString() },
            0xff00ff
        );
    }

    /**
     * Log level up
     */
    async logLevelUp(username, level) {
        await this.sendGameLog(
            '⬆️ Level Up',
            `${username} reached level ${level}!`,
            { Level: level },
            0x00ff00
        );
    }

    /**
     * Log planet teleportation
     */
    async logTeleportation(username, planetName) {
        await this.sendGameLog(
            '🌍 Planet Teleportation',
            `${username} teleported to ${planetName}`,
            { Planet: planetName },
            0x5865F2
        );
    }

    /**
     * Log combat event
     */
    async logCombat(username, action, details = {}) {
        await this.sendGameLog(
            '⚔️ Combat Event',
            `${username} ${action}`,
            details,
            0xff0080
        );
    }

    /**
     * Log game start
     */
    async logGameStart(username) {
        await this.sendGameLog(
            '▶️ Game Started',
            `${username} started a new game session`,
            { Username: username },
            0x00ffff
        );
    }

    /**
     * Log game end
     */
    async logGameEnd(username, finalScore) {
        await this.sendGameLog(
            '⏹️ Game Ended',
            `${username} finished their game session`,
            { Final Score: finalScore.toLocaleString() },
            0x666666
        );
    }

    /**
     * Log mission completion
     */
    async logMissionComplete(username, missionName, reward) {
        await this.sendGameLog(
            '🎯 Mission Complete',
            `${username} completed a mission!`,
            {
                Mission: missionName,
                Reward: `${reward} XP`
            },
            0x4CAF50
        );
    }

    /**
     * Log mod installation
     */
    async logModInstall(username, modName) {
        await this.sendGameLog(
            '📦 Mod Installed',
            `${username} installed a mod`,
            { Mod: modName },
            0x2196F3
        );
    }

    /**
     * Enable/disable webhooks
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

