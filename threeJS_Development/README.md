# Three.js Development Tools

This folder contains development utilities and debugging tools for Three.js.

## Files

- `devTools.js` - Development tools including helpers, profilers, and inspectors

## Features

- Grid helpers
- Axes helpers
- Camera helpers
- Light helpers
- Performance monitoring
- Scene inspection
- Geometry utilities

## Usage

```javascript
import { ThreeJSDevTools, PerformanceProfiler, GeometryUtils } from './threeJS_Development/devTools.js';

// Initialize dev tools
const devTools = new ThreeJSDevTools(scene, camera, renderer);

// Add helpers
devTools.addGridHelper(500, 50);
devTools.addAxesHelper(10);
devTools.addLightHelpers();

// Performance monitoring
const { stats, updateStats } = devTools.createStats();
updateStats();
console.log('FPS:', stats.fps);

// Scene inspection
const sceneData = devTools.exportScene();

// Geometry utilities
const bbox = GeometryUtils.computeBoundingBox(object);
const wireframe = GeometryUtils.createWireframe(geometry);
```

