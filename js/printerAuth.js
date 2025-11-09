// ADDED - Owner Authentication System
export class OwnerAuth {
    constructor() {
        this.OWNER_USERNAME = 'Torey5721';
        this.OWNER_PASSWORD = 'Torey991200@##';
        this.isAuthenticated = false;
        this.sessionToken = null;
    }

    login(username, password) {
        if (username === this.OWNER_USERNAME && password === this.OWNER_PASSWORD) {
            this.isAuthenticated = true;
            this.sessionToken = this.generateSessionToken();
            return {
                success: true,
                message: 'Owner access granted',
                token: this.sessionToken
            };
        }
        return {
            success: false,
            message: 'Invalid credentials'
        };
    }

    logout() {
        this.isAuthenticated = false;
        this.sessionToken = null;
    }

    isOwner() {
        return this.isAuthenticated;
    }

    validateSession(token) {
        return this.isAuthenticated && this.sessionToken === token;
    }

    generateSessionToken() {
        return 'owner_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// ADDED - Printer UI Component
export class PrinterUI {
    constructor(printer, auth) {
        this.printer = printer;
        this.auth = auth;
        this.uiElement = null;
        this.createUI();
    }

    createUI() {
        const ui = document.createElement('div');
        ui.id = 'printer-ui';
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
            z-index: 1000;
            color: white;
            font-family: Arial, sans-serif;
            min-width: 400px;
        `;

        ui.innerHTML = `
            <h2 style="margin-top: 0; color: #4CAF50;">BORTtheBOT 3D Printer</h2>
            <div id="printer-login-section">
                <h3>Owner Login</h3>
                <input type="text" id="printer-username" placeholder="Username" style="width: 100%; padding: 10px; margin: 10px 0; background: #333; color: white; border: 1px solid #555; border-radius: 5px;">
                <input type="password" id="printer-password" placeholder="Password" style="width: 100%; padding: 10px; margin: 10px 0; background: #333; color: white; border: 1px solid #555; border-radius: 5px;">
                <button id="printer-login-btn" style="width: 100%; padding: 10px; margin: 10px 0; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button>
                <div id="printer-login-message" style="margin-top: 10px; color: #ff4444;"></div>
            </div>
            <div id="printer-control-section" style="display: none;">
                <h3>Printer Controls</h3>
                <div style="margin: 10px 0;">
                    <strong>Status:</strong> <span id="printer-status">Idle</span>
                </div>
                <div style="margin: 10px 0;">
                    <strong>Queue:</strong> <span id="printer-queue">0</span>
                </div>
                <div style="margin: 20px 0;">
                    <label>Print Type:</label>
                    <select id="printer-type" style="width: 100%; padding: 10px; margin: 10px 0; background: #333; color: white; border: 1px solid #555; border-radius: 5px;">
                        <option value="bike">Moped Bike</option>
                        <option value="weapon">Weapon</option>
                    </select>
                </div>
                <button id="printer-queue-btn" style="width: 100%; padding: 10px; margin: 10px 0; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Queue Print</button>
                <button id="printer-logout-btn" style="width: 100%; padding: 10px; margin: 10px 0; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Logout</button>
            </div>
            <button id="printer-close-btn" style="position: absolute; top: 10px; right: 10px; background: #f44336; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
        `;

        document.body.appendChild(ui);
        this.uiElement = ui;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('printer-login-btn');
        const logoutBtn = document.getElementById('printer-logout-btn');
        const queueBtn = document.getElementById('printer-queue-btn');
        const closeBtn = document.getElementById('printer-close-btn');

        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('printer-username').value;
            const password = document.getElementById('printer-password').value;
            const result = this.auth.login(username, password);
            
            const messageEl = document.getElementById('printer-login-message');
            if (result.success) {
                messageEl.textContent = 'Login successful!';
                messageEl.style.color = '#4CAF50';
                document.getElementById('printer-login-section').style.display = 'none';
                document.getElementById('printer-control-section').style.display = 'block';
                this.printer.login(username, password);
                this.updateStatus();
            } else {
                messageEl.textContent = result.message;
                messageEl.style.color = '#ff4444';
            }
        });

        logoutBtn.addEventListener('click', () => {
            this.auth.logout();
            this.printer.logout();
            document.getElementById('printer-login-section').style.display = 'block';
            document.getElementById('printer-control-section').style.display = 'none';
            document.getElementById('printer-username').value = '';
            document.getElementById('printer-password').value = '';
        });

        queueBtn.addEventListener('click', () => {
            const type = document.getElementById('printer-type').value;
            const result = this.printer.queuePrint(type, { color: 0x4CAF50 });
            if (result.success) {
                this.updateStatus();
            }
        });

        closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }

    show() {
        if (this.uiElement) {
            this.uiElement.style.display = 'block';
        }
    }

    hide() {
        if (this.uiElement) {
            this.uiElement.style.display = 'none';
        }
    }

    updateStatus() {
        const status = this.printer.getStatus();
        document.getElementById('printer-status').textContent = 
            status.isPrinting ? 'Printing...' : 'Idle';
        document.getElementById('printer-queue').textContent = status.queueLength;
    }
}

