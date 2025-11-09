// ADDED - GRiD Game Assets Manager
import { GRiDConfig } from './config.js';

export class GRiDAssets {
    constructor() {
        this.loadedAssets = new Map();
        this.assetQueue = [];
    }

    // Load game assets
    async loadAssets() {
        console.log(`Loading ${GRiDConfig.gameName} assets...`);
        
        // Asset loading queue
        const assets = [
            { type: 'texture', name: 'ground', url: null }, // Can add real textures later
            { type: 'model', name: 'bike', url: null },
            { type: 'sound', name: 'engine', url: null }
        ];

        for (const asset of assets) {
            this.assetQueue.push(asset);
        }

        return Promise.resolve();
    }

    getAsset(name) {
        return this.loadedAssets.get(name);
    }

    // Create procedural assets
    createProceduralTexture(name, width = 512, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create procedural pattern based on name
        switch(name) {
            case 'grid':
                this.createGridPattern(ctx, width, height);
                break;
            case 'noise':
                this.createNoisePattern(ctx, width, height);
                break;
            default:
                ctx.fillStyle = '#4a5d23';
                ctx.fillRect(0, 0, width, height);
        }
        
        return canvas;
    }

    createGridPattern(ctx, width, height) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        
        const gridSize = 20;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    createNoisePattern(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }
}

