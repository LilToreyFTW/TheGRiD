// ADDED - HUB Tower Room with Printer Visibility
import * as THREE from 'three';

export class HUBTower {
    constructor(scene) {
        this.scene = scene;
        this.tower = null;
        this.printerRoom = null;
        this.createTower();
    }

    createTower() {
        const towerGroup = new THREE.Group();

        // Tower base
        const baseGeometry = new THREE.CylinderGeometry(15, 15, 2, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        towerGroup.add(base);

        // Tower structure (multiple floors)
        for (let floor = 0; floor < 5; floor++) {
            const floorGeometry = new THREE.CylinderGeometry(12, 12, 3, 32);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.8,
                roughness: 0.2
            });
            const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
            floorMesh.position.y = 2 + (floor * 3);
            towerGroup.add(floorMesh);

            // Windows
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const windowGeometry = new THREE.PlaneGeometry(2, 1.5);
                const windowMaterial = new THREE.MeshStandardMaterial({
                    color: 0x87CEEB,
                    emissive: 0x4444ff,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.7
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    Math.cos(angle) * 12,
                    2 + (floor * 3),
                    Math.sin(angle) * 12
                );
                window.lookAt(0, window.position.y, 0);
                towerGroup.add(window);
            }
        }

        // Top platform (HUB room)
        const hubGeometry = new THREE.CylinderGeometry(15, 12, 1, 32);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 0.9,
            roughness: 0.1
        });
        const hubPlatform = new THREE.Mesh(hubGeometry, hubMaterial);
        hubPlatform.position.y = 17;
        towerGroup.add(hubPlatform);

        // HUB room walls (transparent for visibility)
        const wallHeight = 4;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const wallGeometry = new THREE.PlaneGeometry(10, wallHeight);
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(
                Math.cos(angle) * 7.5,
                17 + wallHeight / 2,
                Math.sin(angle) * 7.5
            );
            wall.lookAt(0, wall.position.y, 0);
            towerGroup.add(wall);
        }

        // HUB room floor
        const hubFloorGeometry = new THREE.CircleGeometry(12, 32);
        const hubFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.2
        });
        const hubFloor = new THREE.Mesh(hubFloorGeometry, hubFloorMaterial);
        hubFloor.rotation.x = -Math.PI / 2;
        hubFloor.position.y = 17;
        hubFloor.receiveShadow = true;
        towerGroup.add(hubFloor);

        // Elevator shaft
        const elevatorGeometry = new THREE.BoxGeometry(2, 20, 2);
        const elevatorMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.1
        });
        const elevatorShaft = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
        elevatorShaft.position.y = 10;
        towerGroup.add(elevatorShaft);

        // Elevator car
        const elevatorCarGeometry = new THREE.BoxGeometry(1.8, 2, 1.8);
        const elevatorCarMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });
        const elevatorCar = new THREE.Mesh(elevatorCarGeometry, elevatorCarMaterial);
        elevatorCar.position.y = 2;
        elevatorCar.userData.isElevator = true;
        towerGroup.add(elevatorCar);

        // Entrance door
        const doorGeometry = new THREE.BoxGeometry(3, 4, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            metalness: 0.5,
            roughness: 0.5
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 2, 15);
        towerGroup.add(door);

        towerGroup.position.set(0, 0, 0);
        this.scene.add(towerGroup);
        this.tower = towerGroup;
        this.printerRoom = hubPlatform; // HUB room is where printer will be placed
    }

    getPrinterPosition() {
        // Return position in HUB room
        return new THREE.Vector3(0, 18, 0);
    }

    getElevatorPosition() {
        return new THREE.Vector3(0, 2, 0);
    }
}

