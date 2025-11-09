// ADDED - Electron Main Process
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let splashWindow;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        transparent: false,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, '../build/icon.png')
    });

    // Load loading screen
    const loadingPath = path.join(__dirname, '../loading.html');
    splashWindow.loadFile(loadingPath);

    splashWindow.on('closed', () => {
        splashWindow = null;
    });

    return splashWindow;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../build/icon.png'),
        title: 'GRiD - 3D Video Game',
        frame: true,
        fullscreen: false,
        resizable: true,
        show: false // Don't show until ready
    });

    // Load the game
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile('index.html');
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC handlers for mod management
ipcMain.handle('get-mods-directory', async () => {
    const modsPath = path.join(app.getPath('userData'), 'mods');
    await fs.mkdir(modsPath, { recursive: true });
    return modsPath;
});

ipcMain.handle('list-mods', async () => {
    const modsPath = path.join(app.getPath('userData'), 'mods');
    try {
        const files = await fs.readdir(modsPath);
        return files.filter(f => f.endsWith('.json'));
    } catch {
        return [];
    }
});

ipcMain.handle('install-mod', async (event, modPath) => {
    try {
        // Extract and install mod
        const modsPath = path.join(app.getPath('userData'), 'mods');
        // Implementation for mod installation
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// IPC handler for loading complete
ipcMain.handle('loading-complete', () => {
    if (splashWindow) {
        splashWindow.close();
    }
    if (!mainWindow) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

app.whenReady().then(() => {
    // Show splash screen first
    createSplashWindow();
    
    // Create main window (hidden initially)
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createSplashWindow();
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

