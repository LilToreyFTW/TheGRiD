// ADDED - Vehicle Spawner System
export class VehicleSpawnerSystem {
    constructor(scene, gameApp) {
        this.scene = scene;
        this.gameApp = gameApp;
        this.vehicles = new Map();
        this.vehicleModels = {};
        this.initializeVehicles();
    }

    initializeVehicles() {
        // Define vehicle types
        this.vehicleTypes = {
            atv: { model: 'atv', speed: 15, scale: 1 },
            car: { model: 'car', speed: 20, scale: 1 },
            truck: { model: 'truck', speed: 12, scale: 1.5 },
            motorcycle: { model: 'motorcycle', speed: 25, scale: 0.8 },
            helicopter: { model: 'helicopter', speed: 30, scale: 2 },
            plane: { model: 'plane', speed: 40, scale: 3 },
            horse: { model: 'horse', speed: 10, scale: 1 },
            space_pod: { model: 'space_pod', speed: 35, scale: 1.2 }
        };
    }

    spawnVehicle(vehicleType, position = null) {
        if (!this.vehicleTypes[vehicleType]) {
            console.warn(`Unknown vehicle type: ${vehicleType}`);
            return null;
        }

        const vehicleData = this.vehicleTypes[vehicleType];
        
        // Use provided position or player position
        let spawnPos = position;
        if (!spawnPos && this.gameApp.player && this.gameApp.player.yawObject) {
            spawnPos = this.gameApp.player.yawObject.position.clone();
            spawnPos.y += 2; // Spawn above ground
        } else {
            spawnPos = new THREE.Vector3(0, 2, 0);
        }

        // Create simple vehicle geometry (in production, load 3D models)
        const vehicle = this.createVehicleGeometry(vehicleType, vehicleData);
        vehicle.position.copy(spawnPos);
        vehicle.userData = {
            type: vehicleType,
            speed: vehicleData.speed,
            isVehicle: true
        };

        this.scene.add(vehicle);
        this.vehicles.set(vehicle.uuid, vehicle);

        return vehicle;
    }

    createVehicleGeometry(type, data) {
        const group = new THREE.Group();
        
        // Create basic shape based on vehicle type
        let geometry, material;
        
        if (type === 'helicopter' || type === 'plane') {
            geometry = new THREE.BoxGeometry(3 * data.scale, 1 * data.scale, 4 * data.scale);
        } else if (type === 'truck') {
            geometry = new THREE.BoxGeometry(2.5 * data.scale, 1.5 * data.scale, 4 * data.scale);
        } else if (type === 'horse') {
            geometry = new THREE.CylinderGeometry(0.5 * data.scale, 0.5 * data.scale, 1.5 * data.scale, 8);
        } else {
            geometry = new THREE.BoxGeometry(2 * data.scale, 1 * data.scale, 3 * data.scale);
        }

        material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x004400,
            metalness: 0.8,
            roughness: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Add wheels for ground vehicles
        if (type !== 'helicopter' && type !== 'plane' && type !== 'space_pod') {
            const wheelGeometry = new THREE.CylinderGeometry(0.3 * data.scale, 0.3 * data.scale, 0.2 * data.scale, 16);
            const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            
            const wheelPositions = [
                { x: -0.8 * data.scale, z: 1.2 * data.scale },
                { x: 0.8 * data.scale, z: 1.2 * data.scale },
                { x: -0.8 * data.scale, z: -1.2 * data.scale },
                { x: 0.8 * data.scale, z: -1.2 * data.scale }
            ];

            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.position.set(pos.x, -0.6 * data.scale, pos.z);
                wheel.rotation.z = Math.PI / 2;
                group.add(wheel);
            });
        }

        return group;
    }

    removeVehicle(vehicleId) {
        const vehicle = this.vehicles.get(vehicleId);
        if (vehicle) {
            this.scene.remove(vehicle);
            this.vehicles.delete(vehicleId);
        }
    }

    getVehicle(vehicleId) {
        return this.vehicles.get(vehicleId);
    }
}

