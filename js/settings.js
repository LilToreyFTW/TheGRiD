// ADDED - Complete Settings and Pause Menu System
export class SettingsManager {
    constructor() {
        this.settings = {
            graphics: {
                quality: 'high',
                shadows: true,
                antialiasing: true,
                renderDistance: 200
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.5,
                sfxVolume: 0.7,
                enabled: true
            },
            controls: {
                mouseSensitivity: 1.0,
                invertY: false
            },
            gameplay: {
                showHUD: true,
                showFPS: true,
                showTips: true
            }
        };
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('grid_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('grid_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    getSetting(path) {
        const keys = path.split('.');
        let value = this.settings;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) return null;
        }
        return value;
    }

    setSetting(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let obj = this.settings;
        for (const key of keys) {
            if (!obj[key]) obj[key] = {};
            obj = obj[key];
        }
        obj[lastKey] = value;
        this.saveSettings();
    }
}

export class PauseMenu {
    constructor(gameApp, settingsManager) {
        this.gameApp = gameApp;
        this.settingsManager = settingsManager;
        this.isVisible = false;
        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.id = 'pause-menu';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10002;
            display: none;
            justify-content: center;
            align-items: center;
            font-family: 'Orbitron', monospace;
        `;

        const menu = document.createElement('div');
        menu.style.cssText = `
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            padding: 40px;
            min-width: 400px;
            box-shadow: 0 0 50px #00ffff;
        `;

        const title = document.createElement('h2');
        title.textContent = 'PAUSED';
        title.style.cssText = `
            color: #00ffff;
            text-align: center;
            font-size: 48px;
            margin-bottom: 30px;
            text-shadow: 0 0 20px #00ffff;
        `;
        menu.appendChild(title);

        // Resume button
        const resumeBtn = this.createButton('RESUME', () => this.hide());
        menu.appendChild(resumeBtn);

        // Settings button
        const settingsBtn = this.createButton('SETTINGS', () => this.showSettings());
        menu.appendChild(settingsBtn);

        // Achievements button
        const achievementsBtn = this.createButton('ACHIEVEMENTS', () => this.showAchievements());
        menu.appendChild(achievementsBtn);

        // Save Game button
        const saveBtn = this.createButton('SAVE GAME', () => {
            if (this.gameApp.saveLoadSystem) {
                this.gameApp.saveLoadSystem.save(this.gameApp);
                if (this.gameApp.soundManager) {
                    this.gameApp.soundManager.playSuccess();
                }
                this.showMessage('Game Saved!');
            }
        });
        menu.appendChild(saveBtn);

        // Load Game button
        const loadBtn = this.createButton('LOAD GAME', () => {
            if (this.gameApp.saveLoadSystem && this.gameApp.saveLoadSystem.hasSave()) {
                this.gameApp.saveLoadSystem.load(this.gameApp);
                if (this.gameApp.soundManager) {
                    this.gameApp.soundManager.playSuccess();
                }
                this.hide();
                this.showMessage('Game Loaded!');
            } else {
                if (this.gameApp.soundManager) {
                    this.gameApp.soundManager.playError();
                }
                this.showMessage('No save file found!');
            }
        });
        menu.appendChild(loadBtn);

        // Main Menu button
        const mainMenuBtn = this.createButton('MAIN MENU', () => {
            this.hide();
            this.gameApp.returnToMenu();
        });
        menu.appendChild(mainMenuBtn);

        // ADDED - Discord button
        const discordBtn = this.createButton('💬 JOIN DISCORD', () => {
            if (this.gameApp.discordIntegration) {
                this.gameApp.discordIntegration.openDiscord();
            } else {
                window.open('https://discord.gg/vxt64amrgt', '_blank');
            }
        });
        discordBtn.style.borderColor = '#5865F2';
        discordBtn.style.color = '#5865F2';
        menu.appendChild(discordBtn);

        // Quit button
        const quitBtn = this.createButton('QUIT', () => {
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        });
        quitBtn.style.borderColor = '#ff0080';
        quitBtn.style.color = '#ff0080';
        menu.appendChild(quitBtn);

        container.appendChild(menu);
        document.body.appendChild(container);
        this.container = container;
        this.menu = menu;
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            display: block;
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: transparent;
            border: 2px solid #00ffff;
            color: #00ffff;
            font-family: 'Orbitron', monospace;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
        `;
        button.onmouseover = () => {
            button.style.background = 'rgba(0, 255, 255, 0.1)';
            button.style.boxShadow = '0 0 20px #00ffff';
        };
        button.onmouseout = () => {
            button.style.background = 'transparent';
            button.style.boxShadow = 'none';
        };
        button.onclick = () => {
            if (this.gameApp.soundManager) {
                this.gameApp.soundManager.playUI();
            }
            onClick();
        };
        return button;
    }

    showMessage(text) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            padding: 20px 40px;
            color: #00ffff;
            font-family: 'Orbitron', monospace;
            font-size: 20px;
            z-index: 10006;
            box-shadow: 0 0 30px #00ffff;
        `;
        document.body.appendChild(message);
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'flex';
        if (this.gameApp.player) {
            this.gameApp.player.disableControls();
        }
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        if (this.gameApp.player && this.gameApp.isRunning) {
            this.gameApp.player.enableControls();
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    showSettings() {
        // Create settings UI
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settings-menu';
        settingsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10005;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Orbitron', monospace;
        `;

        const settingsMenu = document.createElement('div');
        settingsMenu.style.cssText = `
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            padding: 40px;
            min-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 50px #00ffff;
        `;

        const title = document.createElement('h2');
        title.textContent = 'SETTINGS';
        title.style.cssText = `
            color: #00ffff;
            text-align: center;
            font-size: 32px;
            margin-bottom: 30px;
            text-shadow: 0 0 20px #00ffff;
        `;
        settingsMenu.appendChild(title);

        // Graphics settings
        const graphicsSection = this.createSection('Graphics', [
            { label: 'Quality', type: 'select', options: ['Low', 'Medium', 'High', 'Very High', 'Ultra', 'Very High RT'], path: 'graphics.quality' },
            { label: 'Shadows', type: 'checkbox', path: 'graphics.shadows' },
            { label: 'Antialiasing', type: 'checkbox', path: 'graphics.antialiasing' }
        ]);
        settingsMenu.appendChild(graphicsSection);

        // Audio settings
        const audioSection = this.createSection('Audio', [
            { label: 'Master Volume', type: 'range', min: 0, max: 100, path: 'audio.masterVolume' },
            { label: 'Music Volume', type: 'range', min: 0, max: 100, path: 'audio.musicVolume' },
            { label: 'SFX Volume', type: 'range', min: 0, max: 100, path: 'audio.sfxVolume' },
            { label: 'Enable Audio', type: 'checkbox', path: 'audio.enabled' }
        ]);
        settingsMenu.appendChild(audioSection);

        // Controls settings
        const controlsSection = this.createSection('Controls', [
            { label: 'Mouse Sensitivity', type: 'range', min: 0.1, max: 2, step: 0.1, path: 'controls.mouseSensitivity' },
            { label: 'Invert Y Axis', type: 'checkbox', path: 'controls.invertY' }
        ]);
        settingsMenu.appendChild(controlsSection);

        // Close button
        const closeBtn = this.createButton('CLOSE', () => {
            document.body.removeChild(settingsContainer);
        });
        settingsMenu.appendChild(closeBtn);

        settingsContainer.appendChild(settingsMenu);
        document.body.appendChild(settingsContainer);
    }

    createSection(title, options) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        `;

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
            color: #00ffff;
            font-size: 20px;
            margin-bottom: 15px;
        `;
        section.appendChild(sectionTitle);

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.style.cssText = `
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const label = document.createElement('label');
            label.textContent = option.label;
            label.style.cssText = `
                color: #fff;
                font-size: 14px;
            `;

            let input;
            if (option.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                const currentValue = this.settingsManager.getSetting(option.path);
                input.checked = currentValue !== null ? currentValue : false;
                input.onchange = () => {
                    this.settingsManager.setSetting(option.path, input.checked);
                    if (option.path === 'audio.enabled' && this.gameApp.soundManager) {
                        if (input.checked) {
                            this.gameApp.soundManager.enable();
                        } else {
                            this.gameApp.soundManager.disable();
                        }
                    }
                };
            } else if (option.type === 'range') {
                input = document.createElement('input');
                input.type = 'range';
                input.min = option.min || 0;
                input.max = option.max || 100;
                input.step = option.step || 1;
                const currentValue = this.settingsManager.getSetting(option.path);
                const displayValue = currentValue !== null ? currentValue * (option.max || 100) : (option.max || 100) / 2;
                input.value = displayValue;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = Math.round(displayValue);
                valueDisplay.style.cssText = 'color: #00ffff; margin-left: 10px; min-width: 40px;';
                
                input.oninput = () => {
                    const value = parseFloat(input.value) / (option.max || 100);
                    this.settingsManager.setSetting(option.path, value);
                    valueDisplay.textContent = Math.round(input.value);
                    
                    // Apply audio settings
                    if (this.gameApp.soundManager) {
                        if (option.path === 'audio.masterVolume') {
                            this.gameApp.soundManager.setMasterVolume(value);
                        } else if (option.path === 'audio.musicVolume') {
                            this.gameApp.soundManager.setMusicVolume(value);
                        } else if (option.path === 'audio.sfxVolume') {
                            this.gameApp.soundManager.setSFXVolume(value);
                        }
                    }
                };
                
                optionDiv.appendChild(label);
                optionDiv.appendChild(input);
                optionDiv.appendChild(valueDisplay);
                section.appendChild(optionDiv);
                return;
            } else if (option.type === 'select') {
                input = document.createElement('select');
                option.options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt;
                    optionEl.textContent = opt;
                    input.appendChild(optionEl);
                });
                const currentValue = this.settingsManager.getSetting(option.path);
                input.value = currentValue || option.options[0];
                input.onchange = () => {
                    this.settingsManager.setSetting(option.path, input.value);
                };
            }

            if (input) {
                input.style.cssText = `
                    padding: 5px 10px;
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid #00ffff;
                    color: #00ffff;
                    font-family: 'Orbitron', monospace;
                `;

                optionDiv.appendChild(label);
                optionDiv.appendChild(input);
                section.appendChild(optionDiv);
            }
        });

        return section;
    }

    showAchievements() {
        // Create achievements UI
        const achievementsContainer = document.createElement('div');
        achievementsContainer.id = 'achievements-menu';
        achievementsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10005;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Orbitron', monospace;
        `;

        const achievementsMenu = document.createElement('div');
        achievementsMenu.style.cssText = `
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            padding: 40px;
            min-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 50px #00ffff;
        `;

        const title = document.createElement('h2');
        title.textContent = 'ACHIEVEMENTS';
        title.style.cssText = `
            color: #00ffff;
            text-align: center;
            font-size: 32px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px #00ffff;
        `;
        achievementsMenu.appendChild(title);

        if (this.gameApp.achievementsSystem) {
            const progress = this.gameApp.achievementsSystem.getProgress();
            const progressText = document.createElement('div');
            progressText.textContent = `${progress.unlocked}/${progress.total} Unlocked (${progress.percentage.toFixed(1)}%)`;
            progressText.style.cssText = `
                color: #00ff00;
                text-align: center;
                font-size: 18px;
                margin-bottom: 30px;
            `;
            achievementsMenu.appendChild(progressText);

            const achievements = this.gameApp.achievementsSystem.getAchievements();
            achievements.forEach(achievement => {
                const achievementDiv = document.createElement('div');
                achievementDiv.style.cssText = `
                    padding: 15px;
                    margin-bottom: 10px;
                    background: ${achievement.unlocked ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                    border: 2px solid ${achievement.unlocked ? '#00ff00' : '#666'};
                    display: flex;
                    align-items: center;
                `;

                const icon = document.createElement('div');
                icon.textContent = achievement.unlocked ? achievement.icon : '🔒';
                icon.style.cssText = `
                    font-size: 32px;
                    margin-right: 15px;
                `;

                const info = document.createElement('div');
                info.style.cssText = 'flex: 1;';

                const name = document.createElement('div');
                name.textContent = achievement.name;
                name.style.cssText = `
                    color: ${achievement.unlocked ? '#00ff00' : '#888'};
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                `;

                const desc = document.createElement('div');
                desc.textContent = achievement.description;
                desc.style.cssText = `
                    color: ${achievement.unlocked ? '#fff' : '#666'};
                    font-size: 12px;
                `;

                const reward = document.createElement('div');
                reward.textContent = `Reward: ${achievement.reward} points`;
                reward.style.cssText = `
                    color: #ffaa00;
                    font-size: 11px;
                    margin-top: 5px;
                `;

                info.appendChild(name);
                info.appendChild(desc);
                info.appendChild(reward);
                achievementDiv.appendChild(icon);
                achievementDiv.appendChild(info);
                achievementsMenu.appendChild(achievementDiv);
            });
        }

        const closeBtn = this.createButton('CLOSE', () => {
            document.body.removeChild(achievementsContainer);
        });
        achievementsMenu.appendChild(closeBtn);

        achievementsContainer.appendChild(achievementsMenu);
        document.body.appendChild(achievementsContainer);
    }
}
