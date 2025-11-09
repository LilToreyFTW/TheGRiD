// ADDED - Complete Planet System with 50 Planets
import * as THREE from 'three';

export class PlanetSystem {
    constructor(scene) {
        this.scene = scene;
        this.planets = new Map();
        this.unlockedPlanets = new Set();
        this.currentPlanet = 'Tower'; // Starting planet
        this.landingMarkers = new Map();
        this.initializePlanets();
        this.loadUnlockedPlanets();
    }

    initializePlanets() {
        const planetData = [
            // First 10 planets (unlocked by default)
            { id: 'Tower', name: 'Tower', description: 'The Hub - Central Command', color: 0x00ffff, position: { x: 0, y: 0, z: 0 }, unlocked: true },
            { id: 'Nexus', name: 'Nexus', description: 'Trading Outpost', color: 0xff00ff, position: { x: 500, y: 0, z: 0 }, unlocked: true },
            { id: 'Aurora', name: 'Aurora', description: 'Crystalline Fields', color: 0x00ff00, position: { x: -500, y: 0, z: 0 }, unlocked: true },
            { id: 'Vortex', name: 'Vortex', description: 'Energy Storm Zone', color: 0xffaa00, position: { x: 0, y: 0, z: 500 }, unlocked: true },
            { id: 'Nebula', name: 'Nebula', description: 'Cosmic Cloud Realm', color: 0xff0080, position: { x: 0, y: 0, z: -500 }, unlocked: true },
            { id: 'Stellar', name: 'Stellar', description: 'Star Forge', color: 0xffff00, position: { x: 500, y: 0, z: 500 }, unlocked: true },
            { id: 'Quantum', name: 'Quantum', description: 'Reality Distortion', color: 0x00ffff, position: { x: -500, y: 0, z: 500 }, unlocked: true },
            { id: 'Void', name: 'Void', description: 'Dark Matter Depths', color: 0x0000ff, position: { x: 500, y: 0, z: -500 }, unlocked: true },
            { id: 'Prism', name: 'Prism', description: 'Light Refraction World', color: 0xff00ff, position: { x: -500, y: 0, z: -500 }, unlocked: true },
            { id: 'Fusion', name: 'Fusion', description: 'Nuclear Core', color: 0xff0000, position: { x: 750, y: 0, z: 0 }, unlocked: true },
            
            // Planets 11-50 (locked by default)
            { id: 'Eclipse', name: 'Eclipse', description: 'Shadow Realm', color: 0x330033, position: { x: -750, y: 0, z: 0 }, unlocked: false },
            { id: 'Genesis', name: 'Genesis', description: 'Origin Point', color: 0xffffff, position: { x: 0, y: 0, z: 750 }, unlocked: false },
            { id: 'Catalyst', name: 'Catalyst', description: 'Transformation Zone', color: 0x00ff88, position: { x: 0, y: 0, z: -750 }, unlocked: false },
            { id: 'Spectrum', name: 'Spectrum', description: 'Color Dimension', color: 0xff0088, position: { x: 1000, y: 0, z: 0 }, unlocked: false },
            { id: 'Pulse', name: 'Pulse', description: 'Rhythmic Energy', color: 0x0088ff, position: { x: -1000, y: 0, z: 0 }, unlocked: false },
            { id: 'Matrix', name: 'Matrix', description: 'Digital Grid', color: 0x00ff00, position: { x: 0, y: 0, z: 1000 }, unlocked: false },
            { id: 'Phantom', name: 'Phantom', description: 'Ghostly Presence', color: 0x888888, position: { x: 0, y: 0, z: -1000 }, unlocked: false },
            { id: 'Titan', name: 'Titan', description: 'Giant World', color: 0x884400, position: { x: 1250, y: 0, z: 0 }, unlocked: false },
            { id: 'Nova', name: 'Nova', description: 'Exploding Star', color: 0xff8844, position: { x: -1250, y: 0, z: 0 }, unlocked: false },
            { id: 'Zenith', name: 'Zenith', description: 'Peak Point', color: 0x4488ff, position: { x: 0, y: 0, z: 1250 }, unlocked: false },
            { id: 'Apex', name: 'Apex', description: 'Highest Point', color: 0xff4488, position: { x: 0, y: 0, z: -1250 }, unlocked: false },
            { id: 'Cascade', name: 'Cascade', description: 'Flowing Energy', color: 0x00ffff, position: { x: 1500, y: 0, z: 0 }, unlocked: false },
            { id: 'Echo', name: 'Echo', description: 'Resonant Frequency', color: 0xff00ff, position: { x: -1500, y: 0, z: 0 }, unlocked: false },
            { id: 'Flux', name: 'Flux', description: 'Constant Change', color: 0xffff00, position: { x: 0, y: 0, z: 1500 }, unlocked: false },
            { id: 'Glitch', name: 'Glitch', description: 'Reality Error', color: 0xff0000, position: { x: 0, y: 0, z: -1500 }, unlocked: false },
            { id: 'Halo', name: 'Halo', description: 'Divine Light', color: 0xffffff, position: { x: 1750, y: 0, z: 0 }, unlocked: false },
            { id: 'Ion', name: 'Ion', description: 'Charged Particles', color: 0x00ff00, position: { x: -1750, y: 0, z: 0 }, unlocked: false },
            { id: 'Jade', name: 'Jade', description: 'Crystalline Structure', color: 0x00ff88, position: { x: 0, y: 0, z: 1750 }, unlocked: false },
            { id: 'Karma', name: 'Karma', description: 'Balance Point', color: 0xff0088, position: { x: 0, y: 0, z: -1750 }, unlocked: false },
            { id: 'Lunar', name: 'Lunar', description: 'Moon Phase', color: 0x8888ff, position: { x: 2000, y: 0, z: 0 }, unlocked: false },
            { id: 'Mirage', name: 'Mirage', description: 'Illusion Realm', color: 0xff8888, position: { x: -2000, y: 0, z: 0 }, unlocked: false },
            { id: 'Neon', name: 'Neon', description: 'Bright Lights', color: 0x00ffff, position: { x: 0, y: 0, z: 2000 }, unlocked: false },
            { id: 'Orbit', name: 'Orbit', description: 'Circular Path', color: 0xff00ff, position: { x: 0, y: 0, z: -2000 }, unlocked: false },
            { id: 'Photon', name: 'Photon', description: 'Light Particle', color: 0xffff00, position: { x: 2250, y: 0, z: 0 }, unlocked: false },
            { id: 'Quasar', name: 'Quasar', description: 'Distant Energy', color: 0xff0000, position: { x: -2250, y: 0, z: 0 }, unlocked: false },
            { id: 'Radiance', name: 'Radiance', description: 'Brilliant Light', color: 0xffffff, position: { x: 0, y: 0, z: 2250 }, unlocked: false },
            { id: 'Solar', name: 'Solar', description: 'Sun Energy', color: 0xffaa00, position: { x: 0, y: 0, z: -2250 }, unlocked: false },
            { id: 'Terra', name: 'Terra', description: 'Earth-like', color: 0x00ff00, position: { x: 2500, y: 0, z: 0 }, unlocked: false },
            { id: 'Ultra', name: 'Ultra', description: 'Beyond Limits', color: 0xff00ff, position: { x: -2500, y: 0, z: 0 }, unlocked: false },
            { id: 'Vapor', name: 'Vapor', description: 'Mist World', color: 0x88ffff, position: { x: 0, y: 0, z: 2500 }, unlocked: false },
            { id: 'Warp', name: 'Warp', description: 'Space Distortion', color: 0xff88ff, position: { x: 0, y: 0, z: -2500 }, unlocked: false },
            { id: 'Xenon', name: 'Xenon', description: 'Rare Element', color: 0x00ff88, position: { x: 2750, y: 0, z: 0 }, unlocked: false },
            { id: 'Yonder', name: 'Yonder', description: 'Distant Place', color: 0xff0088, position: { x: -2750, y: 0, z: 0 }, unlocked: false },
            { id: 'Zero', name: 'Zero', description: 'Null Point', color: 0x000000, position: { x: 0, y: 0, z: 2750 }, unlocked: false },
            { id: 'Alpha', name: 'Alpha', description: 'First Origin', color: 0xff0000, position: { x: 0, y: 0, z: -2750 }, unlocked: false },
            { id: 'Beta', name: 'Beta', description: 'Second Phase', color: 0x00ff00, position: { x: 3000, y: 0, z: 0 }, unlocked: false },
            { id: 'Gamma', name: 'Gamma', description: 'Third Wave', color: 0x0000ff, position: { x: -3000, y: 0, z: 0 }, unlocked: false },
            { id: 'Delta', name: 'Delta', description: 'Change Point', color: 0xffff00, position: { x: 0, y: 0, z: 3000 }, unlocked: false },
            { id: 'Omega', name: 'Omega', description: 'Final End', color: 0xff00ff, position: { x: 0, y: 0, z: -3000 }, unlocked: false },
            { id: 'EDZ', name: 'EDZ', description: 'European Dead Zone', color: 0x8B4513, position: { x: 3250, y: 0, z: 0 }, unlocked: false }
        ];

        planetData.forEach(planet => {
            this.planets.set(planet.id, planet);
            if (planet.unlocked) {
                this.unlockedPlanets.add(planet.id);
            }
            this.createPlanetMarker(planet);
        });
    }

    createPlanetMarker(planet) {
        const markerGroup = new THREE.Group();
        
        // Landing platform (circular platform)
        const platformGeometry = new THREE.CylinderGeometry(5, 5, 0.2, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: planet.color,
            emissive: planet.color,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0.9
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.rotation.x = -Math.PI / 2;
        platform.position.y = 0.1;
        platform.userData.isLandingPlatform = true;
        platform.userData.planetId = planet.id;
        markerGroup.add(platform);

        // Landing beacon (tall pillar with light)
        const beaconGeometry = new THREE.CylinderGeometry(0.3, 0.5, 8, 16);
        const beaconMaterial = new THREE.MeshStandardMaterial({
            color: planet.color,
            emissive: planet.color,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9
        });
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
        beacon.position.y = 4;
        markerGroup.add(beacon);

        // Planet name hologram (floating text representation)
        const nameRing = new THREE.RingGeometry(2, 2.5, 32);
        const nameMaterial = new THREE.MeshStandardMaterial({
            color: planet.color,
            emissive: planet.color,
            emissiveIntensity: 0.8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const nameRingMesh = new THREE.Mesh(nameRing, nameMaterial);
        nameRingMesh.rotation.x = -Math.PI / 2;
        nameRingMesh.position.y = 0.2;
        markerGroup.add(nameRingMesh);

        // Energy particles around marker
        for (let i = 0; i < 8; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: planet.color,
                emissive: planet.color,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 8) * Math.PI * 2;
            particle.position.set(
                Math.cos(angle) * 3,
                2 + Math.sin(Date.now() * 0.001 + i) * 0.5,
                Math.sin(angle) * 3
            );
            particle.userData.angle = angle;
            particle.userData.offset = i;
            markerGroup.add(particle);
        }

        markerGroup.position.set(planet.position.x, planet.position.y, planet.position.z);
        markerGroup.userData.planetId = planet.id;
        markerGroup.userData.planet = planet;
        markerGroup.userData.isPlanetMarker = true;
        
        this.scene.add(markerGroup);
        this.landingMarkers.set(planet.id, markerGroup);
    }

    updateMarkers(deltaTime) {
        this.landingMarkers.forEach((marker, planetId) => {
            const planet = this.planets.get(planetId);
            if (!planet) return;

            // Animate particles
            marker.children.forEach((child, index) => {
                if (child.userData.offset !== undefined) {
                    const angle = child.userData.angle;
                    const offset = child.userData.offset;
                    child.position.set(
                        Math.cos(angle) * 3,
                        2 + Math.sin(Date.now() * 0.001 + offset) * 0.5,
                        Math.sin(angle) * 3
                    );
                    child.rotation.y += deltaTime * 2;
                }
            });

            // Pulse beacon
            const beacon = marker.children.find(c => c.position.y === 4);
            if (beacon) {
                beacon.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.5;
            }

            // Rotate name ring
            const nameRing = marker.children.find(c => c.rotation.x === -Math.PI / 2 && c.geometry.type === 'RingGeometry');
            if (nameRing) {
                nameRing.rotation.z += deltaTime * 0.5;
            }
        });
    }

    unlockPlanet(planetId) {
        if (this.planets.has(planetId)) {
            this.unlockedPlanets.add(planetId);
            this.saveUnlockedPlanets();
            return true;
        }
        return false;
    }

    isPlanetUnlocked(planetId) {
        return this.unlockedPlanets.has(planetId);
    }

    getPlanet(planetId) {
        return this.planets.get(planetId);
    }

    getAllPlanets() {
        return Array.from(this.planets.values());
    }

    getUnlockedPlanets() {
        return Array.from(this.planets.values()).filter(p => this.unlockedPlanets.has(p.id));
    }

    getCurrentPlanet() {
        return this.currentPlanet;
    }

    setCurrentPlanet(planetId) {
        if (this.planets.has(planetId)) {
            this.currentPlanet = planetId;
        }
    }

    getLandingMarker(planetId) {
        return this.landingMarkers.get(planetId);
    }

    saveUnlockedPlanets() {
        try {
            localStorage.setItem('grid_unlocked_planets', JSON.stringify(Array.from(this.unlockedPlanets)));
        } catch (error) {
            console.warn('Failed to save unlocked planets:', error);
        }
    }

    loadUnlockedPlanets() {
        try {
            const data = localStorage.getItem('grid_unlocked_planets');
            if (data) {
                const unlocked = JSON.parse(data);
                unlocked.forEach(id => {
                    if (this.planets.has(id)) {
                        this.unlockedPlanets.add(id);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load unlocked planets:', error);
        }
    }
}

