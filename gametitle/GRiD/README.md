# GRiD Game Branding

This folder contains all GRiD game branding, configuration, and asset management.

## Files

- `config.js` - Game configuration, settings, colors, and branding constants
- `assets.js` - Asset loading and management system

## Usage

```javascript
import { GRiDConfig, GRiDBranding } from './gametitle/GRiD/config.js';
import { GRiDAssets } from './gametitle/GRiD/assets.js';

// Use configuration
console.log(GRiDConfig.gameName);
console.log(GRiDConfig.settings.bikeCount);

// Use branding
const logo = GRiDBranding.createLogo();
const splash = GRiDBranding.getSplashScreen();

// Use assets
const assets = new GRiDAssets();
await assets.loadAssets();
const texture = assets.createProceduralTexture('grid');
```

