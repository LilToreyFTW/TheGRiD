// ADDED - Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for mod management
contextBridge.exposeInMainWorld('electronAPI', {
    // Mod installation
    installMod: async (modPath) => {
        try {
            const modData = await ipcRenderer.invoke('install-mod', modPath);
            return modData;
        } catch (error) {
            console.error('Mod installation error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get mods directory
    getModsDirectory: () => {
        return ipcRenderer.invoke('get-mods-directory');
    },

    // Read mod file
    readModFile: async (modId, filePath) => {
        return ipcRenderer.invoke('read-mod-file', modId, filePath);
    },

    // List installed mods
    listMods: async () => {
        return ipcRenderer.invoke('list-mods');
    },

    // Loading complete signal
    loadingComplete: () => {
        return ipcRenderer.invoke('loading-complete');
    }
});

