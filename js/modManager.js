// ADDED - Mod System for GRiD Game
export class ModManager {
    constructor() {
        this.mods = new Map();
        this.loadedMods = new Set();
        this.modDirectory = 'mods/';
    }

    // Load installed mods from storage
    loadInstalledMods() {
        const installedMods = JSON.parse(localStorage.getItem('installedMods') || '[]');
        installedMods.forEach(mod => {
            this.mods.set(mod.id, mod);
        });
        return installedMods;
    }

    // Install a mod
    async installMod(modData, modFile) {
        try {
            // Extract mod file (in production, unzip)
            const modInfo = {
                id: modData.id,
                name: modData.name,
                version: modData.version,
                description: modData.description,
                enabled: true,
                files: []
            };

            // Store mod data
            this.mods.set(modInfo.id, modInfo);
            
            // Save to localStorage
            const installedMods = Array.from(this.mods.values());
            localStorage.setItem('installedMods', JSON.stringify(installedMods));

            // ADDED - Log mod installation to Discord (if gameApp is available)
            if (this.gameApp && this.gameApp.discordWebhooks && this.gameApp.playerUsername) {
                this.gameApp.discordWebhooks.logModInstall(this.gameApp.playerUsername, modInfo.name);
            }

            return { success: true, message: 'Mod installed successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Uninstall a mod
    uninstallMod(modId) {
        if (this.mods.has(modId)) {
            this.mods.delete(modId);
            this.loadedMods.delete(modId);
            
            const installedMods = Array.from(this.mods.values());
            localStorage.setItem('installedMods', JSON.stringify(installedMods));
            
            return { success: true, message: 'Mod uninstalled' };
        }
        return { success: false, message: 'Mod not found' };
    }

    // Enable/disable mod
    toggleMod(modId) {
        const mod = this.mods.get(modId);
        if (mod) {
            mod.enabled = !mod.enabled;
            const installedMods = Array.from(this.mods.values());
            localStorage.setItem('installedMods', JSON.stringify(installedMods));
            return { success: true, enabled: mod.enabled };
        }
        return { success: false };
    }

    // Load mod into game
    async loadMod(modId) {
        const mod = this.mods.get(modId);
        if (!mod || !mod.enabled) return { success: false };

        try {
            // Load mod files
            const modPath = `${this.modDirectory}${modId}/`;
            
            // In production, load actual mod files
            // For now, simulate mod loading
            this.loadedMods.add(modId);
            
            return { success: true, mod };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Load all enabled mods
    async loadAllMods() {
        const results = [];
        for (const [id, mod] of this.mods.entries()) {
            if (mod.enabled) {
                const result = await this.loadMod(id);
                results.push({ id, ...result });
            }
        }
        return results;
    }

    // Get all installed mods
    getInstalledMods() {
        return Array.from(this.mods.values());
    }

    // Get enabled mods
    getEnabledMods() {
        return Array.from(this.mods.values()).filter(m => m.enabled);
    }
}

// ADDED - Mod Loader for game assets
export class ModLoader {
    constructor(scene) {
        this.scene = scene;
        this.modManager = new ModManager();
    }

    // Load mod assets
    async loadModAssets(modId) {
        const mod = this.modManager.mods.get(modId);
        if (!mod) return;

        // Load custom models, textures, etc.
        // This would integrate with Three.js asset loading
        console.log(`Loading assets for mod: ${mod.name}`);
    }

    // Apply mod to game
    applyMod(modId, gameInstance) {
        const mod = this.modManager.mods.get(modId);
        if (!mod) return;

        // Apply mod changes to game
        // Examples: new bikes, weapons, textures, etc.
        switch(mod.type) {
            case 'bike':
                this.applyBikeMod(mod, gameInstance);
                break;
            case 'weapon':
                this.applyWeaponMod(mod, gameInstance);
                break;
            case 'texture':
                this.applyTextureMod(mod, gameInstance);
                break;
        }
    }

    applyBikeMod(mod, gameInstance) {
        // Add custom bikes to bike grid
        if (gameInstance.bikeGrid) {
            // Load custom bike models
            console.log(`Applying bike mod: ${mod.name}`);
        }
    }

    applyWeaponMod(mod, gameInstance) {
        // Add custom weapons to printer
        if (gameInstance.printer) {
            console.log(`Applying weapon mod: ${mod.name}`);
        }
    }

    applyTextureMod(mod, gameInstance) {
        // Replace textures
        console.log(`Applying texture mod: ${mod.name}`);
    }
}

