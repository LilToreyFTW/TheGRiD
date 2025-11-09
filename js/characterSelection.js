// ADDED - Character Selection System
export class CharacterSelectionSystem {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.container = null;
        this.selectedCharacter = null;
        this.characters = [];
        this.maxCharacters = 3;
        this.createUI();
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'character-selection';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Courier New', monospace;
            color: #00ffff;
        `;

        const title = document.createElement('h1');
        title.textContent = 'SELECT YOUR CHARACTER';
        title.style.cssText = `
            font-size: 48px;
            text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff;
            margin-bottom: 40px;
            letter-spacing: 4px;
        `;

        const charactersGrid = document.createElement('div');
        charactersGrid.id = 'characters-grid';
        charactersGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            max-width: 1200px;
            margin: 20px;
        `;

        const startingCharacters = [
            {
                name: 'Hunter Cowboy',
                description: 'Out in the wilderness mid hunting a deer. Uses an ATV to get around.',
                spawnLocation: { x: 0, y: 2, z: 0 },
                vehicle: 'atv',
                startingItems: ['hunting_rifle', 'atv_key'],
                icon: '🏹'
            },
            {
                name: 'Astronaught Cowboy',
                description: 'Mid west desert field. A flock of horses roam and circle. Must tame the black horse.',
                spawnLocation: { x: 100, y: 2, z: 100 },
                vehicle: 'horse',
                startingItems: ['lasso', 'saddle'],
                icon: '🤠'
            },
            {
                name: 'Space Astronaught Cowboy',
                description: 'Starts out living abandoned in a pod in space, lost.',
                spawnLocation: { x: -100, y: 50, z: -100 },
                vehicle: 'space_pod',
                startingItems: ['space_suit', 'pod_key'],
                icon: '🚀'
            }
        ];

        startingCharacters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.style.cssText = `
                background: rgba(0, 255, 255, 0.1);
                border: 2px solid #00ffff;
                border-radius: 10px;
                padding: 30px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            `;

            card.innerHTML = `
                <div style="font-size: 64px; margin-bottom: 20px;">${char.icon}</div>
                <h2 style="font-size: 24px; margin-bottom: 15px; text-shadow: 0 0 10px #00ffff;">${char.name}</h2>
                <p style="font-size: 14px; color: #88ffff; margin-bottom: 20px; line-height: 1.6;">${char.description}</p>
                <div style="font-size: 12px; color: #00ff00;">
                    <div>Vehicle: ${char.vehicle}</div>
                    <div>Items: ${char.startingItems.join(', ')}</div>
                </div>
            `;

            card.addEventListener('mouseenter', () => {
                card.style.background = 'rgba(0, 255, 255, 0.2)';
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 0 30px #00ffff';
            });

            card.addEventListener('mouseleave', () => {
                card.style.background = 'rgba(0, 255, 255, 0.1)';
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'none';
            });

            card.addEventListener('click', () => {
                this.selectCharacter(char);
            });

            charactersGrid.appendChild(card);
        });

        this.container.appendChild(title);
        this.container.appendChild(charactersGrid);
        document.body.appendChild(this.container);
    }

    async selectCharacter(character) {
        this.selectedCharacter = character;
        
        // Save character selection
        const userId = localStorage.getItem('grid_discord_user_id') || this.gameApp.playerId;
        const characterData = {
            ...character,
            userId,
            cash: 0,
            level: 1,
            jobs: [],
            createdAt: Date.now()
        };

        // Save to localStorage
        const savedCharacters = JSON.parse(localStorage.getItem('grid_characters') || '[]');
        savedCharacters.push(characterData);
        localStorage.setItem('grid_characters', JSON.stringify(savedCharacters));
        localStorage.setItem('grid_selected_character', JSON.stringify(characterData));

        // Hide selection UI
        this.container.style.display = 'none';

        // Spawn player at character location
        if (this.gameApp.player && this.gameApp.player.yawObject) {
            this.gameApp.player.yawObject.position.set(
                character.spawnLocation.x,
                character.spawnLocation.y,
                character.spawnLocation.z
            );
        }

        // Initialize character-specific items
        this.initializeCharacterItems(character);

        // Now start the game automatically after character selection
        if (this.gameApp) {
            // Make sure game is initialized before starting
            if (!this.gameApp.game) {
                console.warn('Game not initialized yet, waiting...');
                // Wait a bit for game to initialize
                setTimeout(() => {
                    this.startGameAfterSelection();
                }, 100);
                return;
            }
            this.startGameAfterSelection();
        }
    }

    startGameAfterSelection() {
        if (!this.gameApp) {
            console.error('Cannot start game: gameApp not available');
            return;
        }

        // Use the gameApp's startGame method if available
        if (this.gameApp.startGame) {
            this.gameApp.startGame();
        } else {
            // Fallback to manual start
            const startScreen = document.getElementById('start-screen');
            if (startScreen) {
                startScreen.style.display = 'none';
            }
            
            this.gameApp.isRunning = true;
            if (this.gameApp.game) {
                this.gameApp.game.start();
            }
            if (this.gameApp.player) {
                this.gameApp.player.enableControls();
            }
            
            // Play UI sound
            if (this.gameApp.soundManager) {
                this.gameApp.soundManager.playUI();
            }
            
            // Update Discord presence
            if (this.gameApp.discordIntegration) {
                this.gameApp.discordIntegration.updateGameState('playing');
            }
            
            // Log game start
            if (this.gameApp.discordWebhooks) {
                this.gameApp.discordWebhooks.logGameStart(this.gameApp.playerUsername);
            }
            
            // Report player join
            if (this.gameApp.reportPlayerJoin) {
                this.gameApp.reportPlayerJoin();
            }
        }
    }

    initializeCharacterItems(character) {
        // Add starting items to inventory
        if (this.gameApp.inventorySystem) {
            character.startingItems.forEach(item => {
                this.gameApp.inventorySystem.addItem(item, 1);
            });
        }
    }

    show() {
        this.container.style.display = 'flex';
        // Don't pause game here - let the start button handle it
        // The character selection should be shown before game starts
    }

    hide() {
        this.container.style.display = 'none';
    }

    hasSelectedCharacter() {
        return localStorage.getItem('grid_selected_character') !== null;
    }

    getSelectedCharacter() {
        const saved = localStorage.getItem('grid_selected_character');
        return saved ? JSON.parse(saved) : null;
    }
}

