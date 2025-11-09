// ADDED - Game mechanics and game loop
import * as THREE from 'three';

export class Game {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.score = 0;
        this.isRunning = false;
        this.raycaster = new THREE.Raycaster();
        this.checkInterval = 0.1; // Check collisions every 0.1 seconds
        this.timeSinceLastCheck = 0;
        // ADDED - Reference to open world for collectibles
        this.openWorld = null;
        this.scene = world.scene; // Store scene reference for removing collectibles
        // ADDED - External systems
        this.soundManager = null;
        this.achievementsSystem = null;
        this.progressionSystem = null;
        this.inventorySystem = null;
    }
    
    setOpenWorld(openWorld) {
        this.openWorld = openWorld;
    }

    setSoundManager(soundManager) {
        this.soundManager = soundManager;
    }

    setAchievementsSystem(achievementsSystem) {
        this.achievementsSystem = achievementsSystem;
    }

    setProgressionSystem(progressionSystem) {
        this.progressionSystem = progressionSystem;
    }

    setInventorySystem(inventorySystem) {
        this.inventorySystem = inventorySystem;
    }

    start() {
        this.isRunning = true;
        this.score = 0;
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        // Update world
        this.world.update(deltaTime);

        // Check collisions with collectibles
        this.timeSinceLastCheck += deltaTime;
        if (this.timeSinceLastCheck >= this.checkInterval) {
            this.checkCollectibleCollisions();
            this.timeSinceLastCheck = 0;
        }
    }

    checkCollectibleCollisions() {
        const playerPosition = this.player.yawObject.position;
        
        // Check world collectibles
        const worldCollectibles = this.world.getCollectibles();
        worldCollectibles.forEach(collectible => {
            const distance = playerPosition.distanceTo(collectible.position);
            if (distance < 1.0) {
                this.collectCollectible(collectible);
            }
        });
        
        // ADDED - Check open world collectibles if available
        if (this.openWorld) {
            const openWorldCollectibles = this.openWorld.getAllCollectibles();
            openWorldCollectibles.forEach(collectible => {
                const distance = playerPosition.distanceTo(collectible.position);
                if (distance < 1.0 && collectible.parent) {
                    this.collectCollectible(collectible);
                }
            });
        }
    }

    collectCollectible(collectible) {
        // Remove collectible from world or open world
        if (this.world.getCollectibles().includes(collectible)) {
            this.world.removeCollectible(collectible);
        } else if (this.openWorld && collectible.parent) {
            // Remove from open world
            this.scene.remove(collectible);
            const chunkKey = this.openWorld.getChunkKey(collectible.position.x, collectible.position.z);
            const objects = this.openWorld.proceduralObjects.get(chunkKey);
            if (objects) {
                const index = objects.indexOf(collectible);
                if (index > -1) objects.splice(index, 1);
            }
        }
        
        // Increase score
        this.score += 10;
        
        // ADDED - Add experience
        if (this.progressionSystem) {
            this.progressionSystem.addExperience(5);
        }
        
        // ADDED - Add to inventory
        if (this.inventorySystem) {
            this.inventorySystem.addItem('collectible', 1);
        }
        
        // Heal player slightly
        this.player.heal(2);
        
        // ADDED - Play collection sound
        if (this.soundManager) {
            this.soundManager.playCollect();
        }
        
        // ADDED - Update achievements
        if (this.achievementsSystem) {
            this.achievementsSystem.updateStat('collectiblesCollected', 1);
        }
        
        // Create particle effect (simple visual feedback)
        this.createCollectionEffect(collectible.position);
        
        // Check win condition (only for world collectibles, open world is infinite)
        if (this.world.getCollectibles().length === 0 && (!this.openWorld || this.openWorld.getAllCollectibles().length === 0)) {
            this.onAllCollected();
        }
    }

    createCollectionEffect(position) {
        // ADDED - Enhanced neon particle effect for arcade aesthetic
        const particleCount = 8;
        const particles = [];
        const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffaa00];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.15, 8, 8);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            const angle = (Math.PI * 2 * i) / particleCount;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * 3,
                Math.random() * 3 + 2,
                Math.sin(angle) * 3
            );
            particle.userData.lifetime = 0.8;
            particle.userData.age = 0;
            particle.userData.color = color;
            
            this.world.scene.add(particle);
            particles.push(particle);
        }
        
        // Animate particles
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.userData.age += 0.016;
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                particle.userData.velocity.y -= 9.8 * 0.016; // Gravity
                particle.material.opacity = 1 - (particle.userData.age / particle.userData.lifetime);
                particle.scale.setScalar(1 + particle.userData.age * 0.5);
                
                if (particle.userData.age >= particle.userData.lifetime) {
                    this.world.scene.remove(particle);
                    const index = particles.indexOf(particle);
                    if (index > -1) particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    onAllCollected() {
        // All collectibles collected - bonus points
        this.score += 100;
        // Could trigger a level complete or next level here
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
        this.isRunning = false;
        this.timeSinceLastCheck = 0;
    }
}


