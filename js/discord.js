// ADDED - Discord Rich Presence Integration
export class DiscordIntegration {
    constructor() {
        this.discordInviteUrl = 'https://discord.gg/vxt64amrgt';
        this.isEnabled = false;
        this.clientId = null; // Discord Application Client ID (if you have one)
        this.presence = {
            state: 'Playing GRiD',
            details: 'Exploring the Digital Realm',
            largeImageKey: 'grid_logo',
            largeImageText: 'GRiD - 3D Video Game',
            smallImageKey: 'playing',
            smallImageText: 'In Game',
            startTimestamp: Date.now(),
            buttons: [
                { label: 'Join Discord', url: this.discordInviteUrl }
            ]
        };
    }

    initialize() {
        // Check if Discord SDK is available
        if (typeof window !== 'undefined' && window.DiscordSDK) {
            this.isEnabled = true;
            this.updatePresence();
        } else {
            // Fallback: Try to load Discord SDK
            this.loadDiscordSDK();
        }
    }

    loadDiscordSDK() {
        // Discord Rich Presence requires a Discord application
        // For now, we'll create a simple integration that opens Discord
        console.log('Discord integration ready. Join our server:', this.discordInviteUrl);
        this.isEnabled = true;
    }

    updatePresence(details = null, state = null) {
        if (!this.isEnabled) return;

        if (details) this.presence.details = details;
        if (state) this.presence.state = state;

        // If Discord SDK is available, update presence
        if (window.DiscordSDK && window.DiscordSDK.updatePresence) {
            window.DiscordSDK.updatePresence(this.presence);
        }
    }

    updateGameState(gameState) {
        if (!this.isEnabled) return;

        switch (gameState) {
            case 'menu':
                this.updatePresence('In Main Menu', 'Ready to Play');
                break;
            case 'playing':
                this.updatePresence('Exploring Open World', 'Playing GRiD');
                break;
            case 'paused':
                this.updatePresence('Game Paused', 'Taking a Break');
                break;
            case 'teleporting':
                this.updatePresence('Teleporting Between Planets', 'Intergalactic Travel');
                break;
            case 'combat':
                this.updatePresence('In Combat', 'Fighting Enemies');
                break;
            default:
                this.updatePresence('Playing GRiD', 'Exploring the Digital Realm');
        }
    }

    openDiscord() {
        window.open(this.discordInviteUrl, '_blank');
    }

    getInviteUrl() {
        return this.discordInviteUrl;
    }
}

