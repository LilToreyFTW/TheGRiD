# GRiD Game - Quick Start Guide

## Running the Game

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm start
```

3. **Open in Browser**
- Navigate to `http://localhost:3000`
- Click "Start Game"

## Game Features

### Core Gameplay
- **10,000 Unique Bikes**: Explore a massive grid of moped bikes
- **Player Movement**: WASD controls with mouse look
- **Collectibles**: Gather golden spheres for points
- **Health System**: Monitor your health in the HUD

### Advanced Features
- **HUB Tower**: Multi-floor tower with elevator
- **3D Printer**: Owner-only access printer system
- **Multiplayer**: Single server, everyone sees everyone
- **Mod Support**: Install and manage mods
- **Advanced Graphics**: Ray tracing, DLSS, FSR, XeSS support

## Controls

- **WASD** - Move player
- **Mouse** - Look around / Rotate camera
- **Space** - Jump
- **Shift** - Run / Sprint
- **P** - Open Printer UI (when near HUB tower)
- **M** - Open Mod Manager
- **ESC** - Close UI windows

## Game Locations

- **Spawn Point**: Center of the map (0, 2, 0)
- **HUB Tower**: Center of map, tallest structure
- **Printer Location**: Top floor of HUB tower
- **Bike Grid**: Spread across the entire map

## Printer Access

1. Navigate to HUB Tower (center of map)
2. Go to top floor (HUB room)
3. Stand near the printer
4. Press **P** to open printer UI
5. Login with owner credentials:
   - Username: `Torey5721`
   - Password: `Torey991200@##`

## Mod System

1. Press **M** to open Mod Manager
2. View installed mods
3. Enable/disable mods
4. Uninstall mods
5. Restart game to apply changes

## Performance Tips

- The game auto-detects your GPU
- RTX cards get enhanced graphics automatically
- LOD system optimizes distant bikes
- Press ESC to close UI if performance drops

## Troubleshooting

### Game Won't Start
- Check browser console for errors
- Ensure WebGL is enabled
- Try a different browser

### Low FPS
- Reduce quality in graphics settings
- Close other browser tabs
- Check GPU drivers are updated

### Mods Not Loading
- Check browser console
- Ensure mods are enabled
- Restart game after installing mods

## Development

### Enable Dev Tools
In `js/main.js`, uncomment:
```javascript
this.devTools.addGridHelper(500, 50);
this.devTools.addAxesHelper(10);
```

### Build for Production
```bash
npm run build:win  # Windows EXE
```

## File Structure

```
js/
├── main.js          # Main game entry
├── player.js         # Player controls
├── world.js          # Game world
├── game.js           # Game mechanics
├── bikeModel.js      # Bike generation
├── bikeGrid.js       # 10K bike grid
├── printer.js        # 3D printer system
├── printerAuth.js    # Printer authentication
├── hubTower.js       # HUB tower
├── multiplayer.js    # Multiplayer system
├── graphics.js       # Advanced graphics
├── modManager.js     # Mod system
└── modManagerUI.js   # Mod UI
```

## Next Steps

- Add more game mechanics
- Expand multiplayer features
- Create more mod types
- Add sound effects
- Improve UI/UX

