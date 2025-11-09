# GRiD Game Release & Website Documentation

## Building the Game EXE

### Prerequisites
- Node.js 18+
- npm or yarn

### Build Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Build Windows EXE**
```bash
npm run build:win
```

3. **Build Mac DMG**
```bash
npm run build:mac
```

4. **Build Linux AppImage**
```bash
npm run build:linux
```

The built executable will be in the `dist/` folder.

## Website Structure

```
website/
├── index.html          # Main website page
├── css/
│   └── style.css     # Website styles
└── js/
    └── main.js       # Website JavaScript
```

## Mod System

### For Users

1. **Download Mods**
   - Visit the website
   - Go to "Mods" tab
   - Browse available mods
   - Click "Install Mod"

2. **Manage Mods In-Game**
   - Press **M** key to open Mod Manager
   - Enable/disable mods
   - Uninstall mods
   - Restart game to apply changes

### For Mod Creators

1. **Create Mod Package**
   - Create a folder with your mod files
   - Include a `mod.json` file:
   ```json
   {
     "id": 123,
     "name": "My Mod",
     "version": "1.0.0",
     "description": "Mod description",
     "type": "bike"
   }
   ```
   - Zip the folder

2. **Upload Mod**
   - Visit website
   - Go to "Mods" tab
   - Click "Upload Mod"
   - Fill in mod details
   - Upload zip file

## Mod Types

- **bike**: Custom bike models
- **weapon**: Custom weapon models
- **texture**: Texture replacements
- **script**: Gameplay modifications

## Deployment

### Website Deployment
1. Upload `website/` folder to web server
2. Configure server to serve `index.html` as default
3. Set up mod storage (database or file system)

### Game Distribution
1. Build EXE using `npm run build:win`
2. Upload installer to website
3. Update download links on website

## File Structure

```
grid-videogame/
├── index.html              # Game HTML
├── js/                     # Game code
│   ├── main.js            # Main game
│   ├── modManager.js      # Mod system
│   └── modManagerUI.js   # Mod UI
├── website/               # Website files
│   ├── index.html
│   ├── css/
│   └── js/
├── electron/              # Electron files
│   ├── main.js
│   └── preload.js
├── package.json           # Build config
└── dist/                  # Built executables
```

## Features

✅ Full game EXE build system
✅ Website with tabs (Home, Download, Mods, Forums, About)
✅ Mod upload/download system
✅ In-game mod manager (Press M)
✅ Mod installation system
✅ Forum system
✅ Download system

## Controls

- **M** - Open Mod Manager
- **P** - Open Printer UI (when near printer)

## Notes

- Mods are stored in `%APPDATA%/GRiD/mods/` (Windows)
- Website mods are stored in localStorage (can be upgraded to database)
- EXE includes all game files and dependencies

