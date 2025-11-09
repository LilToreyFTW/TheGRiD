// ADDED - Infinite Open World System with Procedural Generation
import * as THREE from 'three';

export class OpenWorldSystem {
    constructor(scene) {
        this.scene = scene;
        this.chunkSize = 100; // Size of each chunk
        this.loadedChunks = new Map(); // chunkKey -> chunk data
        this.activeChunks = new Set();
        this.viewDistance = 200; // How far to load chunks
        this.groundChunks = new Map();
        this.proceduralObjects = new Map();
        this.lastPlayerPosition = new THREE.Vector3(0, 0, 0);
    }

    // Get chunk key from world position
    getChunkKey(x, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        return `${chunkX},${chunkZ}`;
    }

    // Get chunk center position
    getChunkCenter(chunkKey) {
        const [x, z] = chunkKey.split(',').map(Number);
        return new THREE.Vector3(
            x * this.chunkSize + this.chunkSize / 2,
            0,
            z * this.chunkSize + this.chunkSize / 2
        );
    }

    // Generate ground chunk
    generateGroundChunk(chunkKey) {
        if (this.groundChunks.has(chunkKey)) return;

        const center = this.getChunkCenter(chunkKey);
        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, 10, 10);
        
        // Add some terrain variation
        const vertices = geometry.attributes.position;
        const seed = this.hashCode(chunkKey);
        const random = this.seededRandom(seed);
        
        for (let i = 0; i < vertices.count; i++) {
            const x = vertices.getX(i);
            const z = vertices.getZ(i);
            const height = Math.sin(x * 0.1 + random()) * 2 + Math.cos(z * 0.1 + random()) * 2;
            vertices.setY(i, height * 0.1);
        }
        vertices.needsUpdate = true;
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x001122,
            emissiveIntensity: 0.3,
            roughness: 0.1,
            metalness: 0.9
        });
        
        // ADDED - Create grid texture for arcade ground
        const gridTexture = this.createGridTexture(this.chunkSize, this.chunkSize, 0x00ffff);
        material.map = gridTexture;
        
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(center.x, 0, center.z);
        ground.receiveShadow = true;
        ground.userData.isGround = true;
        ground.userData.chunkKey = chunkKey;
        
        this.scene.add(ground);
        this.groundChunks.set(chunkKey, ground);
    }

    // ADDED - Create grid texture for arcade ground
    createGridTexture(width, height, color) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = `rgba(${color >> 16}, ${(color >> 8) & 0xff}, ${color & 0xff}, 0.3)`;
        ctx.lineWidth = 1;
        
        const gridSize = 10;
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return texture;
    }

    // Generate procedural objects for chunk
    generateChunkObjects(chunkKey) {
        if (this.proceduralObjects.has(chunkKey)) return;

        const center = this.getChunkCenter(chunkKey);
        const seed = this.hashCode(chunkKey);
        const random = this.seededRandom(seed);
        const objects = [];

        // ADDED - Generate digital decorations instead of trees
        const decorationCount = Math.floor(random() * 5 + 3);
        const neonColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffaa00];
        for (let i = 0; i < decorationCount; i++) {
            const decoration = this.createDigitalDecoration(neonColors[Math.floor(random() * neonColors.length)]);
            const offsetX = (random() - 0.5) * this.chunkSize * 0.8;
            const offsetZ = (random() - 0.5) * this.chunkSize * 0.8;
            decoration.position.set(
                center.x + offsetX,
                0,
                center.z + offsetZ
            );
            this.scene.add(decoration);
            objects.push(decoration);
        }

        // ADDED - Generate neon obstacles instead of rocks
        const obstacleCount = Math.floor(random() * 3 + 2);
        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = this.createNeonObstacle(neonColors[Math.floor(random() * neonColors.length)]);
            const offsetX = (random() - 0.5) * this.chunkSize * 0.8;
            const offsetZ = (random() - 0.5) * this.chunkSize * 0.8;
            obstacle.position.set(
                center.x + offsetX,
                0.5,
                center.z + offsetZ
            );
            this.scene.add(obstacle);
            objects.push(obstacle);
        }

        // Generate collectibles
        const collectibleCount = Math.floor(random() * 3 + 1);
        for (let i = 0; i < collectibleCount; i++) {
            const collectible = this.createCollectible();
            const offsetX = (random() - 0.5) * this.chunkSize * 0.8;
            const offsetZ = (random() - 0.5) * this.chunkSize * 0.8;
            collectible.position.set(
                center.x + offsetX,
                Math.random() * 3 + 1,
                center.z + offsetZ
            );
            this.scene.add(collectible);
            objects.push(collectible);
        }

        this.proceduralObjects.set(chunkKey, objects);
    }

    createCollectible() {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        // ADDED - Neon glowing material for arcade aesthetic
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9
        });
        const collectible = new THREE.Mesh(geometry, material);
        collectible.castShadow = true;
        collectible.userData.isCollectible = true;
        collectible.userData.rotationSpeed = Math.random() * 2 + 1;
        return collectible;
    }

    // ADDED - Create digital decoration
    createDigitalDecoration(color) {
        const group = new THREE.Group();
        
        const pillarGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            roughness: 0.1,
            metalness: 0.9
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.y = 1;
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        group.add(pillar);
        
        const topGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 2.5;
        top.castShadow = true;
        group.add(top);
        
        return group;
    }

    // ADDED - Create neon obstacle
    createNeonObstacle(color) {
        const size = Math.random() * 0.5 + 0.3;
        const geometry = new THREE.DodecahedronGeometry(size);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            roughness: 0.1,
            metalness: 0.9
        });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        return obstacle;
    }

    // Update chunks based on player position
    updateChunks(playerPosition) {
        const currentChunk = this.getChunkKey(playerPosition.x, playerPosition.z);
        const chunksToLoad = new Set();
        
        // Calculate which chunks should be loaded
        const viewRadius = Math.ceil(this.viewDistance / this.chunkSize);
        const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

        for (let x = -viewRadius; x <= viewRadius; x++) {
            for (let z = -viewRadius; z <= viewRadius; z++) {
                const chunkX = playerChunkX + x;
                const chunkZ = playerChunkZ + z;
                const chunkKey = `${chunkX},${chunkZ}`;
                
                const distance = Math.sqrt(x * x + z * z) * this.chunkSize;
                if (distance <= this.viewDistance) {
                    chunksToLoad.add(chunkKey);
                }
            }
        }

        // Load new chunks
        chunksToLoad.forEach(chunkKey => {
            if (!this.loadedChunks.has(chunkKey)) {
                this.loadChunk(chunkKey);
            }
        });

        // Unload distant chunks
        const chunksToUnload = [];
        this.loadedChunks.forEach((data, chunkKey) => {
            if (!chunksToLoad.has(chunkKey)) {
                chunksToUnload.push(chunkKey);
            }
        });

        chunksToUnload.forEach(chunkKey => {
            this.unloadChunk(chunkKey);
        });

        this.lastPlayerPosition.copy(playerPosition);
    }

    // Load a chunk
    loadChunk(chunkKey) {
        this.generateGroundChunk(chunkKey);
        this.generateChunkObjects(chunkKey);
        this.loadedChunks.set(chunkKey, {
            ground: this.groundChunks.get(chunkKey),
            objects: this.proceduralObjects.get(chunkKey) || []
        });
        this.activeChunks.add(chunkKey);
    }

    // Unload a chunk
    unloadChunk(chunkKey) {
        const data = this.loadedChunks.get(chunkKey);
        if (data) {
            // Remove ground
            if (data.ground) {
                this.scene.remove(data.ground);
                this.groundChunks.delete(chunkKey);
            }

            // Remove objects
            if (data.objects) {
                data.objects.forEach(obj => {
                    this.scene.remove(obj);
                });
                this.proceduralObjects.delete(chunkKey);
            }

            this.loadedChunks.delete(chunkKey);
            this.activeChunks.delete(chunkKey);
        }
    }

    // Utility functions
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    seededRandom(seed) {
        let value = seed;
        return () => {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    // Get all collectibles in loaded chunks
    getAllCollectibles() {
        const collectibles = [];
        this.proceduralObjects.forEach(objects => {
            objects.forEach(obj => {
                if (obj.userData.isCollectible) {
                    collectibles.push(obj);
                }
            });
        });
        return collectibles;
    }

    update(deltaTime, playerPosition) {
        // Update chunks based on player position
        this.updateChunks(playerPosition);

        // Animate collectibles
        const collectibles = this.getAllCollectibles();
        collectibles.forEach(collectible => {
            collectible.rotation.y += collectible.userData.rotationSpeed * deltaTime;
            collectible.position.y += Math.sin(Date.now() * 0.003 + collectible.position.x) * 0.01;
        });
    }
}

