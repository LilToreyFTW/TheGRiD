# Build Windows EXE for GRiD Game

## Quick Build Commands

### Build Windows EXE Installer
```bash
npm run build:exe
```

### Build Windows Portable Version
```bash
npm run build:exe:dir
```

### Build All Platforms
```bash
npm run build:all
```

## Output Location

After building, the EXE files will be in:
- **Installer:** `dist/GRiD-Setup-1.0.0-x64.exe`
- **Portable:** `dist/GRiD-Portable-1.0.0-x64.exe`
- **Directory:** `dist/win-unpacked/` (for portable)

## Upload to Website

After building:

1. Copy the EXE file to `website/downloads/` directory:
   ```bash
   mkdir -p website/downloads
   cp dist/GRiD-Setup-1.0.0-x64.exe website/downloads/GRiD-Setup.exe
   ```

2. The website download button will automatically serve the file from `/downloads/GRiD-Setup.exe`

## Build Requirements

- Node.js 18+
- Windows SDK (for Windows builds)
- All dependencies installed (`npm install`)

## Notes

- The EXE includes all game files
- Electron runtime is bundled
- Game runs standalone without Node.js
- First build may take 5-10 minutes

