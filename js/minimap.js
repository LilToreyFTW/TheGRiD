// ADDED - Complete Minimap System
import * as THREE from 'three';

export class MinimapSystem {
    constructor(scene, camera, player) {
        this.scene = scene;
        this.camera = camera;
        this.player = player;
        this.minimapCanvas = null;
        this.minimapContext = null;
        this.isVisible = true;
        this.createMinimap();
    }

    createMinimap() {
        const container = document.createElement('div');
        container.id = 'minimap-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 200px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 0 20px #00ffff;
        `;

        const canvas = document.createElement('canvas');
        canvas.id = 'minimap-canvas';
        canvas.width = 200;
        canvas.height = 200;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 8px;
        `;
        container.appendChild(canvas);

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'M';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            width: 25px;
            height: 25px;
            background: rgba(0, 255, 255, 0.3);
            border: 1px solid #00ffff;
            color: #00ffff;
            cursor: pointer;
            font-size: 12px;
            border-radius: 3px;
        `;
        toggleBtn.onclick = () => this.toggle();
        container.appendChild(toggleBtn);

        document.body.appendChild(container);
        this.container = container;
        this.minimapCanvas = canvas;
        this.minimapContext = canvas.getContext('2d');
    }

    update() {
        if (!this.isVisible || !this.player || !this.player.yawObject) return;

        const ctx = this.minimapContext;
        const canvas = this.minimapCanvas;
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = (i / 10) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke();
        }

        const playerPos = this.player.yawObject.position;
        const scale = 0.1; // Scale factor for world to minimap
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw planets
        if (this.gameApp && this.gameApp.planetSystem) {
            const planets = this.gameApp.planetSystem.getAllPlanets();
            planets.forEach(planet => {
                const x = centerX + (planet.position.x - playerPos.x) * scale;
                const y = centerY + (planet.position.z - playerPos.z) * scale;
                
                if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                    ctx.fillStyle = this.gameApp.planetSystem.isPlanetUnlocked(planet.id) 
                        ? `#${planet.color.toString(16).padStart(6, '0')}` 
                        : '#666666';
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Draw player
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        const angle = this.player.yawObject.rotation.y;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.sin(angle) * 10,
            centerY + Math.cos(angle) * 10
        );
        ctx.stroke();
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
    }

    setGameApp(gameApp) {
        this.gameApp = gameApp;
    }
}

