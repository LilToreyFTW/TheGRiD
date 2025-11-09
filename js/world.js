// ADDED - Game world and environment
import * as THREE from 'three';

export class GameWorld {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.collectibles = [];
        
        this.createWorld();
    }

    createWorld() {
        // ADDED - Digital arcade ground with grid pattern
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        
        // Create grid texture for arcade look
        const gridTexture = this.createGridTexture(50, 50, 0x00ffff);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: gridTexture,
            color: 0x000000,
            emissive: 0x001122,
            emissiveIntensity: 0.3,
            roughness: 0.1,
            metalness: 0.9
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        ground.userData.isGround = true;
        this.scene.add(ground);
        this.objects.push(ground);

        // ADDED - Neon ambient light (cyan/magenta)
        const ambientLight = new THREE.AmbientLight(0x001122, 0.4);
        this.scene.add(ambientLight);

        // ADDED - Colored directional lights for arcade feel
        const cyanLight = new THREE.DirectionalLight(0x00ffff, 0.6);
        cyanLight.position.set(20, 30, 10);
        cyanLight.castShadow = true;
        cyanLight.shadow.mapSize.width = 2048;
        cyanLight.shadow.mapSize.height = 2048;
        cyanLight.shadow.camera.near = 0.5;
        cyanLight.shadow.camera.far = 2000;
        cyanLight.shadow.camera.left = -1000;
        cyanLight.shadow.camera.right = 1000;
        cyanLight.shadow.camera.top = 1000;
        cyanLight.shadow.camera.bottom = -1000;
        this.scene.add(cyanLight);

        const magentaLight = new THREE.DirectionalLight(0xff00ff, 0.4);
        magentaLight.position.set(-20, 20, -10);
        this.scene.add(magentaLight);

        // ADDED - Point lights for neon glow
        const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
        pointLight1.position.set(10, 5, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 1, 50);
        pointLight2.position.set(-10, 5, -10);
        this.scene.add(pointLight2);

        // Create platforms and obstacles
        this.createPlatforms();
        
        // Create collectibles
        this.createCollectibles();
        
        // Create decorative objects
        this.createDecorations();
    }

    // ADDED - Create grid texture for arcade ground
    createGridTexture(width, height, color) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Dark background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Grid lines
        ctx.strokeStyle = `rgba(${color >> 16}, ${(color >> 8) & 0xff}, ${color & 0xff}, 0.3)`;
        ctx.lineWidth = 1;
        
        const gridSize = 5;
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
        texture.repeat.set(10, 10);
        return texture;
    }

    createPlatforms() {
        // ADDED - Neon colored platforms for arcade aesthetic
        const platform1 = this.createPlatform(10, 1, 10, 0x00ffff, 2, 0, 0);
        this.scene.add(platform1);
        this.objects.push(platform1);

        const platform2 = this.createPlatform(8, 1, 8, 0xff00ff, 4, 0, -15);
        this.scene.add(platform2);
        this.objects.push(platform2);

        const platform3 = this.createPlatform(6, 1, 6, 0x00ff00, 6, 0, 15);
        this.scene.add(platform3);
        this.objects.push(platform3);

        const platform4 = this.createPlatform(5, 1, 5, 0xffaa00, 8, 10, 0);
        this.scene.add(platform4);
        this.objects.push(platform4);
    }

    createPlatform(width, height, depth, color, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0.9
        });
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        platform.userData.isGround = true;
        return platform;
    }

    createCollectibles() {
        const count = 20;
        for (let i = 0; i < count; i++) {
            const collectible = this.createCollectible();
            this.scene.add(collectible);
            this.collectibles.push(collectible);
        }
    }

    createCollectible() {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        // ADDED - Neon glowing material
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9
        });
        const collectible = new THREE.Mesh(geometry, material);
        
        // Random position
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const y = Math.random() * 5 + 1;
        
        collectible.position.set(x, y, z);
        collectible.castShadow = true;
        collectible.userData.isCollectible = true;
        collectible.userData.rotationSpeed = Math.random() * 2 + 1;
        
        return collectible;
    }

    createDecorations() {
        // ADDED - Digital/geometric decorations instead of trees
        const neonColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffaa00];
        
        for (let i = 0; i < 15; i++) {
            const decoration = this.createDigitalDecoration(neonColors[Math.floor(Math.random() * neonColors.length)]);
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            decoration.position.set(x, 0, z);
            this.scene.add(decoration);
            this.objects.push(decoration);
        }

        // ADDED - Neon boxes
        for (let i = 0; i < 10; i++) {
            const size = Math.random() * 1 + 0.5;
            const geometry = new THREE.BoxGeometry(size, size * 2, size);
            const color = neonColors[Math.floor(Math.random() * neonColors.length)];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.8,
                roughness: 0.1,
                metalness: 0.9
            });
            const box = new THREE.Mesh(geometry, material);
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            box.position.set(x, size, z);
            box.castShadow = true;
            box.receiveShadow = true;
            this.scene.add(box);
            this.objects.push(box);
        }
    }

    // ADDED - Create digital/geometric decoration
    createDigitalDecoration(color) {
        const group = new THREE.Group();
        
        // Base pillar
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
        
        // Top geometric shape
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

    update(deltaTime) {
        // Animate collectibles
        this.collectibles.forEach(collectible => {
            collectible.rotation.y += collectible.userData.rotationSpeed * deltaTime;
            collectible.position.y += Math.sin(Date.now() * 0.003 + collectible.position.x) * 0.01;
        });
    }

    getCollectibles() {
        return this.collectibles;
    }

    removeCollectible(collectible) {
        const index = this.collectibles.indexOf(collectible);
        if (index > -1) {
            this.collectibles.splice(index, 1);
            this.scene.remove(collectible);
        }
    }

    reset() {
        // Remove all collectibles
        this.collectibles.forEach(collectible => {
            this.scene.remove(collectible);
        });
        this.collectibles = [];
        
        // Recreate collectibles
        this.createCollectibles();
    }
}

