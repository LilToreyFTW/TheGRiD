// ADDED - In-Game Mod Manager UI
import { ModManager } from './modManager.js';

export class ModManagerUI {
    constructor(modManager) {
        this.modManager = modManager;
        this.uiElement = null;
        this.createUI();
    }

    createUI() {
        const ui = document.createElement('div');
        ui.id = 'mod-manager-ui';
        ui.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #4CAF50;
            display: none;
            z-index: 2000;
            color: white;
            font-family: Arial, sans-serif;
            min-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        ui.innerHTML = `
            <h2 style="margin-top: 0; color: #4CAF50;">Mod Manager</h2>
            <div id="mod-list-container"></div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="mod-refresh-btn" style="flex: 1; padding: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
                <button id="mod-close-btn" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;

        document.body.appendChild(ui);
        this.uiElement = ui;

        this.setupEventListeners();
        this.loadMods();
    }

    setupEventListeners() {
        document.getElementById('mod-refresh-btn').addEventListener('click', () => {
            this.loadMods();
        });

        document.getElementById('mod-close-btn').addEventListener('click', () => {
            this.hide();
        });
    }

    loadMods() {
        const mods = this.modManager.getInstalledMods();
        const container = document.getElementById('mod-list-container');
        
        if (mods.length === 0) {
            container.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px;">No mods installed. Visit the website to download mods!</p>';
            return;
        }

        container.innerHTML = '';
        mods.forEach(mod => {
            const modItem = document.createElement('div');
            modItem.style.cssText = `
                background: #2a2a2a;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                border: 2px solid #333;
            `;

            modItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="color: #4CAF50; margin: 0 0 5px 0;">${mod.name}</h3>
                        <p style="color: #aaa; font-size: 12px; margin: 0 0 10px 0;">${mod.description || 'No description'}</p>
                        <div style="color: #888; font-size: 11px;">
                            Version: ${mod.version} | Status: <span style="color: ${mod.enabled ? '#4CAF50' : '#f44336'}">${mod.enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="mod-toggle-btn" data-mod-id="${mod.id}" style="padding: 8px 15px; background: ${mod.enabled ? '#f44336' : '#4CAF50'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            ${mod.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button class="mod-uninstall-btn" data-mod-id="${mod.id}" style="padding: 8px 15px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Uninstall
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(modItem);
        });

        // Add event listeners
        container.querySelectorAll('.mod-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modId = parseInt(e.target.getAttribute('data-mod-id'));
                this.toggleMod(modId);
            });
        });

        container.querySelectorAll('.mod-uninstall-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modId = parseInt(e.target.getAttribute('data-mod-id'));
                this.uninstallMod(modId);
            });
        });
    }

    toggleMod(modId) {
        const result = this.modManager.toggleMod(modId);
        if (result.success) {
            alert(`Mod ${result.enabled ? 'enabled' : 'disabled'}. Restart game to apply changes.`);
            this.loadMods();
        }
    }

    uninstallMod(modId) {
        if (confirm('Are you sure you want to uninstall this mod?')) {
            const result = this.modManager.uninstallMod(modId);
            if (result.success) {
                alert('Mod uninstalled successfully!');
                this.loadMods();
            }
        }
    }

    show() {
        if (this.uiElement) {
            this.uiElement.style.display = 'block';
            this.loadMods();
        }
    }

    hide() {
        if (this.uiElement) {
            this.uiElement.style.display = 'none';
        }
    }
}

