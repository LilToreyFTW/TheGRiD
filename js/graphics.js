// ADDED - Advanced Graphics System with Ray Tracing, DLSS, FSR, XeSS
import * as THREE from 'three';

export class AdvancedGraphics {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.gpuInfo = this.detectGPU();
        this.graphicsSettings = {
            rayTracing: false,
            dlss: false,
            fsr: false,
            xess: false,
            quality: 'High', // Low, Medium, High, VeryHigh, Ultra, VeryHighRT
            resolution: 'Native', // Native, 4K, 1440p, 1080p
            targetFPS: 60
        };
        
        this.init();
    }

    detectGPU() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
            return { vendor: 'Unknown', renderer: 'Unknown', isRTX: false };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

        // Detect NVIDIA RTX GPUs
        const rtxPatterns = [
            /RTX\s*(20|30|40|50)\d{2}/i,
            /GeForce\s*RTX\s*(20|30|40|50)\d{2}/i
        ];

        let isRTX = false;
        let rtxModel = null;

        for (const pattern of rtxPatterns) {
            const match = renderer.match(pattern);
            if (match) {
                isRTX = true;
                rtxModel = match[0];
                break;
            }
        }

        // Specific RTX model detection
        const rtxModels = {
            // RTX 20 Series
            '2060': 'RTX 2060', '2060 Super': 'RTX 2060 Super',
            '2070': 'RTX 2070', '2070 Super': 'RTX 2070 Super',
            '2080': 'RTX 2080', '2080 Super': 'RTX 2080 Super', '2080 Ti': 'RTX 2080 Ti',
            // RTX 30 Series
            '3050': 'RTX 3050', '3060': 'RTX 3060', '3060 Ti': 'RTX 3060 Ti',
            '3070': 'RTX 3070', '3070 Ti': 'RTX 3070 Ti',
            '3080': 'RTX 3080', '3080 Ti': 'RTX 3080 Ti',
            '3090': 'RTX 3090', '3090 Ti': 'RTX 3090 Ti',
            // RTX 40 Series
            '4050': 'RTX 4050', '4060': 'RTX 4060', '4060 Ti': 'RTX 4060 Ti',
            '4070': 'RTX 4070', '4070 Super': 'RTX 4070 Super',
            '4070 Ti': 'RTX 4070 Ti', '4070 Ti Super': 'RTX 4070 Ti Super',
            '4080': 'RTX 4080', '4080 Super': 'RTX 4080 Super', '4090': 'RTX 4090',
            // RTX 50 Series
            '5050': 'RTX 5050', '5060': 'RTX 5060',
            '5060 Ti (8 GB)': 'RTX 5060 Ti (8 GB)', '5060 Ti (16 GB)': 'RTX 5060 Ti (16 GB)',
            '5070': 'RTX 5070', '5070 Ti': 'RTX 5070 Ti',
            '5080': 'RTX 5080', '5090': 'RTX 5090'
        };

        let detectedModel = null;
        for (const [key, value] of Object.entries(rtxModels)) {
            if (renderer.includes(key)) {
                detectedModel = value;
                break;
            }
        }

        return {
            vendor,
            renderer,
            isRTX,
            model: detectedModel || rtxModel || 'Unknown',
            supportsRayTracing: isRTX,
            supportsDLSS: isRTX && (renderer.includes('30') || renderer.includes('40') || renderer.includes('50'))
        };
    }

    init() {
        console.log('GPU Detection:', this.gpuInfo);
        
        // Auto-configure based on GPU
        this.autoConfigure();
        
        // Apply graphics settings
        this.applySettings();
    }

    autoConfigure() {
        if (this.gpuInfo.isRTX) {
            console.log(`Detected ${this.gpuInfo.model} - Enabling advanced features`);
            
            // Enable ray tracing for RTX cards
            if (this.gpuInfo.supportsRayTracing) {
                this.graphicsSettings.rayTracing = true;
            }
            
            // Enable DLSS for RTX 30/40/50 series
            if (this.gpuInfo.supportsDLSS) {
                this.graphicsSettings.dlss = true;
            }
            
            // Set quality based on RTX model
            if (this.gpuInfo.model.includes('4090') || this.gpuInfo.model.includes('5090')) {
                this.graphicsSettings.quality = 'VeryHighRT';
            } else if (this.gpuInfo.model.includes('4080') || this.gpuInfo.model.includes('5080')) {
                this.graphicsSettings.quality = 'Ultra';
            } else if (this.gpuInfo.model.includes('4070') || this.gpuInfo.model.includes('5070')) {
                this.graphicsSettings.quality = 'VeryHigh';
            } else {
                this.graphicsSettings.quality = 'High';
            }
        }
    }

    applySettings() {
        // Enhanced shadow quality
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadows
        
        if (this.graphicsSettings.rayTracing) {
            // Use better shadow map for ray-traced shadows
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.autoUpdate = true;
        }

        // Enhanced renderer settings
        this.renderer.antialias = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Set pixel ratio based on quality
        const pixelRatio = this.getPixelRatio();
        this.renderer.setPixelRatio(pixelRatio);
    }

    getPixelRatio() {
        const baseRatio = Math.min(window.devicePixelRatio, 2);
        
        switch (this.graphicsSettings.quality) {
            case 'VeryHighRT':
            case 'Ultra':
                return baseRatio;
            case 'VeryHigh':
                return Math.min(baseRatio, 1.5);
            case 'High':
                return Math.min(baseRatio, 1.25);
            default:
                return 1;
        }
    }

    // Enhanced lighting for ray tracing simulation
    setupRayTracedLighting() {
        if (!this.graphicsSettings.rayTracing) return;

        // Enhanced ambient occlusion simulation
        const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight);
        if (ambientLight) {
            ambientLight.intensity = 0.4; // Reduced for better contrast
        }

        // Enhanced directional light for better shadows
        const dirLight = this.scene.children.find(child => child instanceof THREE.DirectionalLight);
        if (dirLight) {
            dirLight.shadow.mapSize.width = 4096; // Higher resolution shadows
            dirLight.shadow.mapSize.height = 4096;
            dirLight.shadow.radius = 8; // Softer shadows
            dirLight.shadow.bias = -0.0001;
        }

        // Add additional lights for global illumination simulation
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);

        // Add point lights for reflections
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }

    // Enhanced materials for ray tracing
    enhanceMaterials() {
        this.scene.traverse((object) => {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => this.enhanceMaterial(mat));
                } else {
                    this.enhanceMaterial(object.material);
                }
            }
        });
    }

    enhanceMaterial(material) {
        if (material instanceof THREE.MeshStandardMaterial) {
            // Enhanced reflections
            material.metalness = Math.max(material.metalness, 0.1);
            material.roughness = Math.max(material.roughness, 0.1);
            
            // Better environment mapping simulation
            material.envMapIntensity = 1.0;
        }
    }

    // DLSS/FSR/XeSS upscaling simulation
    applyUpscaling() {
        const canvas = this.renderer.domElement;
        const width = canvas.width;
        const height = canvas.height;

        // Simulate upscaling by adjusting render resolution
        let renderWidth = width;
        let renderHeight = height;

        if (this.graphicsSettings.dlss || this.graphicsSettings.fsr || this.graphicsSettings.xess) {
            // Render at lower resolution, upscale
            const scale = 0.75; // 75% resolution
            renderWidth = Math.floor(width * scale);
            renderHeight = Math.floor(height * scale);
        }

        // In a real implementation, this would use actual DLSS/FSR/XeSS APIs
        // For now, we just adjust the renderer size
        this.renderer.setSize(renderWidth, renderHeight, false);
    }

    // Update graphics settings
    updateSettings(settings) {
        Object.assign(this.graphicsSettings, settings);
        this.applySettings();
        
        if (this.graphicsSettings.rayTracing) {
            this.setupRayTracedLighting();
            this.enhanceMaterials();
        }
    }

    // Get current settings
    getSettings() {
        return {
            ...this.graphicsSettings,
            gpu: this.gpuInfo
        };
    }

    // Performance monitoring
    getPerformanceMetrics() {
        const info = this.renderer.info;
        return {
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            programs: info.programs.length,
            calls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines
        };
    }
}

