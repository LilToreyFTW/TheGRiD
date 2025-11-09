// ADDED - Three.js Development Utilities and Helpers
import * as THREE from 'three';

export class ThreeJSDevTools {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.helpers = [];
        this.stats = null;
    }

    // Add grid helper
    addGridHelper(size = 100, divisions = 100, colorCenterLine = 0x444444, colorGrid = 0x888888) {
        const gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
        this.scene.add(gridHelper);
        this.helpers.push(gridHelper);
        return gridHelper;
    }

    // Add axes helper
    addAxesHelper(size = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
        this.helpers.push(axesHelper);
        return axesHelper;
    }

    // Add camera helper
    addCameraHelper() {
        if (this.camera instanceof THREE.PerspectiveCamera) {
            const cameraHelper = new THREE.CameraHelper(this.camera);
            this.scene.add(cameraHelper);
            this.helpers.push(cameraHelper);
            return cameraHelper;
        }
    }

    // Add light helpers
    addLightHelpers() {
        const lightHelpers = [];
        this.scene.traverse((object) => {
            if (object instanceof THREE.DirectionalLight) {
                const helper = new THREE.DirectionalLightHelper(object, 5);
                this.scene.add(helper);
                lightHelpers.push(helper);
            } else if (object instanceof THREE.PointLight) {
                const helper = new THREE.PointLightHelper(object, 1);
                this.scene.add(helper);
                lightHelpers.push(helper);
            } else if (object instanceof THREE.SpotLight) {
                const helper = new THREE.SpotLightHelper(object);
                this.scene.add(helper);
                lightHelpers.push(helper);
            }
        });
        this.helpers.push(...lightHelpers);
        return lightHelpers;
    }

    // Performance monitor
    createStats() {
        const stats = {
            fps: 0,
            frameCount: 0,
            lastTime: performance.now(),
            objects: 0,
            vertices: 0,
            faces: 0
        };

        const updateStats = () => {
            const now = performance.now();
            const delta = now - stats.lastTime;
            stats.frameCount++;
            
            if (delta >= 1000) {
                stats.fps = Math.round((stats.frameCount * 1000) / delta);
                stats.frameCount = 0;
                stats.lastTime = now;
                
                // Count objects
                stats.objects = this.scene.children.length;
                
                // Count geometry info
                let vertices = 0;
                let faces = 0;
                this.scene.traverse((object) => {
                    if (object.geometry) {
                        if (object.geometry.attributes.position) {
                            vertices += object.geometry.attributes.position.count;
                        }
                        if (object.geometry.index) {
                            faces += object.geometry.index.count / 3;
                        } else if (object.geometry.attributes.position) {
                            faces += object.geometry.attributes.position.count / 3;
                        }
                    }
                });
                stats.vertices = vertices;
                stats.faces = faces;
            }
        };

        return { stats, updateStats };
    }

    // Object inspector
    inspectObject(object) {
        return {
            type: object.type,
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone(),
            visible: object.visible,
            children: object.children.length,
            userData: object.userData
        };
    }

    // Scene exporter
    exportScene() {
        const exporter = {
            objects: [],
            lights: [],
            cameras: []
        };

        this.scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                exporter.lights.push(this.inspectObject(object));
            } else if (object instanceof THREE.Camera) {
                exporter.cameras.push(this.inspectObject(object));
            } else if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
                exporter.objects.push(this.inspectObject(object));
            }
        });

        return exporter;
    }

    // Cleanup helpers
    removeHelpers() {
        this.helpers.forEach(helper => {
            this.scene.remove(helper);
            if (helper.dispose) helper.dispose();
        });
        this.helpers = [];
    }
}

// Performance profiler
export class PerformanceProfiler {
    constructor() {
        this.marks = new Map();
        this.measures = [];
    }

    mark(name) {
        this.marks.set(name, performance.now());
    }

    measure(name, startMark, endMark) {
        const start = this.marks.get(startMark);
        const end = this.marks.get(endMark);
        if (start && end) {
            this.measures.push({
                name,
                duration: end - start,
                timestamp: performance.now()
            });
            return end - start;
        }
        return 0;
    }

    getReport() {
        return {
            measures: this.measures,
            average: this.measures.reduce((sum, m) => sum + m.duration, 0) / this.measures.length
        };
    }

    clear() {
        this.marks.clear();
        this.measures = [];
    }
}

// Geometry utilities
export class GeometryUtils {
    static createWireframe(geometry) {
        return new THREE.WireframeGeometry(geometry);
    }

    static createEdges(geometry, thresholdAngle = 1) {
        return new THREE.EdgesGeometry(geometry, thresholdAngle);
    }

    static mergeGeometries(geometries) {
        return THREE.BufferGeometryUtils.mergeGeometries(geometries);
    }

    static computeBoundingBox(object) {
        const box = new THREE.Box3();
        box.setFromObject(object);
        return box;
    }

    static computeBoundingSphere(object) {
        const sphere = new THREE.Sphere();
        const box = new THREE.Box3();
        box.setFromObject(object);
        box.getBoundingSphere(sphere);
        return sphere;
    }
}

