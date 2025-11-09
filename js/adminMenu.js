// ADDED - Admin/Owner Menu System
export class AdminMenuSystem {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.container = null;
        this.isVisible = false;
        this.createUI();
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'admin-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ff00;
            border-radius: 15px;
            padding: 30px;
            z-index: 10001;
            display: none;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            color: #00ff00;
            box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
        `;

        const title = document.createElement('h2');
        title.textContent = 'ADMIN MENU';
        title.style.cssText = `
            font-size: 32px;
            text-shadow: 0 0 20px #00ff00;
            margin-bottom: 20px;
            text-align: center;
        `;

        const buttons = [
            { id: 'spawn-vehicle', text: 'Spawn Vehicle', action: () => this.showVehicleSpawner() },
            { id: 'spawn-weapon', text: 'Spawn Weapon', action: () => this.showWeaponSpawner() },
            { id: 'give-cash', text: 'Give Cash', action: () => this.showCashInput() },
            { id: 'give-xp', text: 'Give XP', action: () => this.showXPInput() },
            { id: 'teleport', text: 'Teleport', action: () => this.showTeleportMenu() },
            { id: 'close', text: 'Close', action: () => this.hide() }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = `
                width: 100%;
                padding: 15px;
                margin: 10px 0;
                background: rgba(0, 255, 0, 0.2);
                border: 2px solid #00ff00;
                border-radius: 5px;
                color: #00ff00;
                font-size: 18px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                transition: all 0.3s;
            `;
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(0, 255, 0, 0.4)';
                button.style.boxShadow = '0 0 20px #00ff00';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(0, 255, 0, 0.2)';
                button.style.boxShadow = 'none';
            });
            button.addEventListener('click', btn.action);
            this.container.appendChild(button);
        });

        this.container.insertBefore(title, this.container.firstChild);
        document.body.appendChild(this.container);
    }

    showVehicleSpawner() {
        const vehicles = ['atv', 'car', 'truck', 'motorcycle', 'helicopter', 'plane'];
        const vehicle = prompt(`Enter vehicle name:\n${vehicles.join(', ')}`);
        if (vehicle && this.gameApp.vehicleSpawner) {
            this.gameApp.vehicleSpawner.spawnVehicle(vehicle);
        }
    }

    showWeaponSpawner() {
        const weapons = ['rifle', 'pistol', 'shotgun', 'sniper', 'knife'];
        const weapon = prompt(`Enter weapon name:\n${weapons.join(', ')}`);
        if (weapon && this.gameApp.inventorySystem) {
            this.gameApp.inventorySystem.addItem(weapon, 1);
        }
    }

    showCashInput() {
        const amount = prompt('Enter cash amount:');
        if (amount && this.gameApp.cashSystem) {
            this.gameApp.cashSystem.addCash(parseInt(amount) || 0);
        }
    }

    showXPInput() {
        const amount = prompt('Enter XP amount:');
        if (amount && this.gameApp.progressionSystem) {
            this.gameApp.progressionSystem.addExperience(parseInt(amount) || 0);
        }
    }

    showTeleportMenu() {
        if (this.gameApp.teleportationSystem) {
            this.hide();
            this.gameApp.teleportationSystem.toggle();
        }
    }

    show() {
        if (this.gameApp.playerPermissions && 
            (this.gameApp.playerPermissions.adminMenu || this.gameApp.playerPermissions.ownerMenu)) {
            this.container.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

