# Video Game Utilities

This folder contains general-purpose game utilities and systems.

## Files

- `utils.js` - Game utilities including effects, input, save/load, and state management

## Features

- Screen shake effects
- Fade effects
- Particle systems
- Sound manager
- Input manager
- Save/Load system
- Game state manager

## Usage

```javascript
import { VideoGameUtils, GameStateManager } from './videogame/utils.js';

// Screen shake
VideoGameUtils.createScreenShake(camera, 0.1, 0.5);

// Particle system
const particles = VideoGameUtils.createParticleSystem(100, position, 0xff0000);
scene.add(particles);

// Input manager
const input = VideoGameUtils.createInputManager();
if (input.isKeyPressed('KeyW')) {
    // Handle input
}

// Save/Load
const saveSystem = VideoGameUtils.createSaveSystem();
saveSystem.save('data', { score: 100 });
const data = saveSystem.load('data');

// Game states
const stateManager = new GameStateManager();
stateManager.registerState('menu', { enter, update, exit });
stateManager.setState('menu');
```

