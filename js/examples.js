// ADDED - Example usage of all integrated folders
// This file demonstrates how to use all the utilities from different folders

import { GRiDConfig, GRiDBranding } from '../gametitle/GRiD/config.js';
import { GRiDAssets } from '../gametitle/GRiD/assets.js';
import { ThreeJSDevTools, PerformanceProfiler, GeometryUtils } from '../threeJS_Development/devTools.js';
import { VideoGameUtils, GameStateManager } from '../videogame/utils.js';
import * as THREE from 'three';

// Example: Using GRiD Configuration
export function useGRiDConfig() {
    console.log(`Game: ${GRiDConfig.gameName}`);
    console.log(`Version: ${GRiDConfig.version}`);
    console.log(`Bike Count: ${GRiDConfig.settings.bikeCount}`);
    
    const logo = GRiDBranding.createLogo();
    console.log('Logo:', logo);
    
    const splash = GRiDBranding.getSplashScreen();
    console.log('Splash:', splash);
}

// Example: Using GRiD Assets
export function useGRiDAssets() {
    const assets = new GRiDAssets();
    assets.loadAssets().then(() => {
        const gridTexture = assets.createProceduralTexture('grid');
        console.log('Grid texture created:', gridTexture);
    });
}

// Example: Using Three.js Dev Tools
export function useDevTools(scene, camera, renderer) {
    const devTools = new ThreeJSDevTools(scene, camera, renderer);
    
    // Add helpers
    devTools.addGridHelper(500, 50);
    devTools.addAxesHelper(10);
    devTools.addLightHelpers();
    
    // Performance monitoring
    const { stats, updateStats } = devTools.createStats();
    setInterval(() => {
        updateStats();
        console.log('FPS:', stats.fps);
        console.log('Objects:', stats.objects);
        console.log('Vertices:', stats.vertices);
    }, 1000);
    
    // Scene inspection
    const sceneData = devTools.exportScene();
    console.log('Scene data:', sceneData);
}

// Example: Using Performance Profiler
export function useProfiler() {
    const profiler = new PerformanceProfiler();
    
    profiler.mark('start');
    // ... do some work ...
    profiler.mark('end');
    
    const duration = profiler.measure('work', 'start', 'end');
    console.log('Work took:', duration, 'ms');
    
    const report = profiler.getReport();
    console.log('Performance report:', report);
}

// Example: Using Video Game Utils
export function useVideoGameUtils(scene, camera) {
    // Screen shake
    VideoGameUtils.createScreenShake(camera, 0.1, 0.5);
    
    // Particle system
    const position = new THREE.Vector3(0, 5, 0);
    const particles = VideoGameUtils.createParticleSystem(100, position, 0xff0000);
    scene.add(particles);
    
    // Input manager
    const input = VideoGameUtils.createInputManager();
    if (input.isKeyPressed('KeyW')) {
        console.log('W key pressed');
    }
    
    // Save/Load system
    const saveSystem = VideoGameUtils.createSaveSystem();
    saveSystem.save('playerData', { score: 100, level: 1 });
    const data = saveSystem.load('playerData');
    console.log('Loaded data:', data);
}

// Example: Using Game State Manager
export function useGameStateManager() {
    const stateManager = new GameStateManager();
    
    stateManager.registerState('menu', {
        enter: () => console.log('Entered menu'),
        update: (deltaTime) => {},
        exit: () => console.log('Exited menu')
    });
    
    stateManager.registerState('playing', {
        enter: () => console.log('Entered playing'),
        update: (deltaTime) => {},
        exit: () => console.log('Exited playing')
    });
    
    stateManager.setState('menu');
    // Later...
    stateManager.setState('playing');
}

// Example: Using Geometry Utils
export function useGeometryUtils(scene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Get bounding box
    const bbox = GeometryUtils.computeBoundingBox(mesh);
    console.log('Bounding box:', bbox);
    
    // Get bounding sphere
    const bsphere = GeometryUtils.computeBoundingSphere(mesh);
    console.log('Bounding sphere:', bsphere);
    
    // Create wireframe
    const wireframe = GeometryUtils.createWireframe(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
    scene.add(wireframeMesh);
}

