// ADDED - Bike grid manager for 10K unique moped bikes
import * as THREE from 'three';
import { BikeModel } from './bikeModel.js';

export class BikeGridManager {
    constructor(scene) {
        this.scene = scene;
        this.bikes = [];
        this.bikeGroups = [];
        this.gridSize = 100; // 100x100 grid = 10,000 bikes
        this.spacing = 2.0; // Distance between bikes
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        console.log('Creating 10,000 unique moped bikes...');
        
        const startTime = performance.now();
        let bikeIndex = 0;

        // Create grid of bikes
        for (let x = 0; x < this.gridSize; x++) {
            for (let z = 0; z < this.gridSize; z++) {
                // Unique seed for each bike
                const seed = x * this.gridSize + z + 1;
                
                // Create unique bike model
                const bike = new BikeModel(seed);
                const bikeGroup = bike.getGroup();

                // Position in grid
                const gridX = (x - this.gridSize / 2) * this.spacing;
                const gridZ = (z - this.gridSize / 2) * this.spacing;
                
                bikeGroup.position.set(gridX, 0.5, gridZ);
                
                // Random rotation for variety
                bikeGroup.rotation.y = Math.random() * Math.PI * 2;

                // Store bike data
                this.bikes.push({
                    model: bike,
                    group: bikeGroup,
                    position: new THREE.Vector3(gridX, 0.5, gridZ),
                    speed: bike.getSpeed(),
                    seed: seed
                });

                this.scene.add(bikeGroup);
                bikeIndex++;

                // Progress indicator
                if (bikeIndex % 1000 === 0) {
                    console.log(`Created ${bikeIndex} bikes...`);
                }
            }
        }

        const endTime = performance.now();
        console.log(`Created ${this.bikes.length} bikes in ${(endTime - startTime).toFixed(2)}ms`);

        this.initialized = true;
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Update all bikes with hypersonic speed animations
        this.bikes.forEach(bike => {
            bike.model.update(deltaTime, bike.position);
            
            // Hypersonic array movement effect
            const speedFactor = bike.speed * 0.0001;
            bike.group.rotation.y += speedFactor * deltaTime;
            
            // Floating/hovering effect
            bike.group.position.y = 0.5 + Math.sin(Date.now() * 0.001 + bike.seed) * 0.1;
        });
    }

    getBikeCount() {
        return this.bikes.length;
    }

    getBikesInRange(position, range) {
        return this.bikes.filter(bike => {
            return bike.position.distanceTo(position) < range;
        });
    }

    reset() {
        // Remove all bikes from scene
        this.bikes.forEach(bike => {
            this.scene.remove(bike.group);
        });
        
        this.bikes = [];
        this.initialized = false;
        
        // Reinitialize
        this.initialize();
    }

    // Optimize rendering for distant bikes
    updateLOD(cameraPosition) {
        if (!this.initialized) return;

        const lodDistance = 50;
        this.bikes.forEach(bike => {
            const distance = bike.position.distanceTo(cameraPosition);
            
            // Hide bikes that are too far
            if (distance > lodDistance * 2) {
                bike.group.visible = false;
            } else {
                bike.group.visible = true;
                
                // Reduce detail for distant bikes
                if (distance > lodDistance) {
                    bike.group.children.forEach(child => {
                        if (child.geometry) {
                            child.material.opacity = 0.5;
                        }
                    });
                } else {
                    bike.group.children.forEach(child => {
                        if (child.geometry) {
                            child.material.opacity = 1.0;
                        }
                    });
                }
            }
        });
    }
}

