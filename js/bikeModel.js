// ADDED - Moped bike model generator with unique body kits and malformations
import * as THREE from 'three';

export class BikeModel {
    constructor(seed) {
        this.seed = seed;
        this.random = this.seededRandom(seed);
        this.group = new THREE.Group();
        this.bodyKit = this.generateBodyKit();
        this.malformation = this.generateMalformation();
        this.speed = this.generateSpeed();
        this.color = this.generateColor();
        
        this.buildBike();
    }

    seededRandom(seed) {
        let value = seed;
        return () => {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    generateBodyKit() {
        const r = this.random();
        // Different body kit styles
        const styles = ['sport', 'cruiser', 'scooter', 'racing', 'chopper', 'futuristic', 'retro', 'hybrid'];
        return styles[Math.floor(r * styles.length)];
    }

    generateMalformation() {
        return {
            scaleX: 0.8 + this.random() * 0.4, // 0.8 to 1.2
            scaleY: 0.7 + this.random() * 0.6, // 0.7 to 1.3
            scaleZ: 0.9 + this.random() * 0.2, // 0.9 to 1.1
            twist: (this.random() - 0.5) * 0.3, // -0.15 to 0.15
            bend: (this.random() - 0.5) * 0.2, // -0.1 to 0.1
            offset: (this.random() - 0.5) * 0.3, // -0.15 to 0.15
            asymmetry: this.random() * 0.4 // 0 to 0.4
        };
    }

    generateSpeed() {
        // Hypersonic speeds (mach 5+ = 1715+ m/s)
        return 1000 + this.random() * 2000; // 1000 to 3000 units
    }

    generateColor() {
        const hue = this.random();
        const saturation = 0.5 + this.random() * 0.5;
        const lightness = 0.3 + this.random() * 0.4;
        return new THREE.Color().setHSL(hue, saturation, lightness);
    }

    buildBike() {
        const mal = this.malformation;
        const kit = this.bodyKit;

        // Main frame (wider body kit)
        const frameWidth = 0.8 + this.random() * 0.6; // Wider frames
        const frameHeight = 0.4 + this.random() * 0.3;
        const frameLength = 1.5 + this.random() * 0.5;

        // Base frame
        const frameGeometry = new THREE.BoxGeometry(
            frameWidth * mal.scaleX,
            frameHeight * mal.scaleY,
            frameLength * mal.scaleZ
        );
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.7 + this.random() * 0.3,
            roughness: 0.2 + this.random() * 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = frameHeight / 2;
        frame.castShadow = true;
        frame.receiveShadow = true;
        this.group.add(frame);

        // Body kit variations based on style
        this.addBodyKitParts(kit, mal, frameWidth, frameHeight, frameLength);

        // Front wheel
        const frontWheel = this.createWheel(0.3 + this.random() * 0.1, mal);
        frontWheel.position.set(0, 0.3, frameLength * 0.4);
        this.group.add(frontWheel);

        // Rear wheel
        const rearWheel = this.createWheel(0.35 + this.random() * 0.1, mal);
        rearWheel.position.set(0, 0.3, -frameLength * 0.4);
        this.group.add(rearWheel);

        // Handlebar variations
        this.addHandlebar(kit, mal, frameWidth);

        // Seat variations
        this.addSeat(kit, mal, frameWidth, frameLength);

        // Exhaust variations
        this.addExhaust(kit, mal);

        // Apply malformations
        this.applyMalformations(mal);

        // Add speed trail effect
        this.addSpeedTrail();
    }

    addBodyKitParts(kit, mal, width, height, length) {
        const r = this.random();
        
        switch(kit) {
            case 'sport':
                // Aerodynamic fairings
                const fairing1 = new THREE.Mesh(
                    new THREE.ConeGeometry(width * 0.6, height * 0.8, 8),
                    new THREE.MeshStandardMaterial({ color: this.color, metalness: 0.8 })
                );
                fairing1.position.set(0, height * 0.7, length * 0.3);
                fairing1.rotation.x = Math.PI;
                this.group.add(fairing1);
                break;

            case 'cruiser':
                // Wide body panels
                for (let i = 0; i < 2; i++) {
                    const panel = new THREE.Mesh(
                        new THREE.BoxGeometry(width * 0.3, height * 0.6, length * 0.8),
                        new THREE.MeshStandardMaterial({ color: this.color })
                    );
                    panel.position.set((i - 0.5) * width * 0.8, height * 0.4, 0);
                    this.group.add(panel);
                }
                break;

            case 'scooter':
                // Floorboard
                const floorboard = new THREE.Mesh(
                    new THREE.BoxGeometry(width * 1.2, height * 0.2, length * 0.6),
                    new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.8 })
                );
                floorboard.position.set(0, height * 0.1, 0);
                this.group.add(floorboard);
                break;

            case 'racing':
                // Streamlined body
                const body = new THREE.Mesh(
                    new THREE.CylinderGeometry(width * 0.4, width * 0.6, length * 1.2, 16),
                    new THREE.MeshStandardMaterial({ color: this.color, metalness: 0.9 })
                );
                body.rotation.z = Math.PI / 2;
                body.position.set(0, height * 0.5, 0);
                this.group.add(body);
                break;

            case 'chopper':
                // Extended front
                const extension = new THREE.Mesh(
                    new THREE.BoxGeometry(width * 0.5, height * 0.3, length * 0.4),
                    new THREE.MeshStandardMaterial({ color: this.color })
                );
                extension.position.set(0, height * 0.6, length * 0.6);
                this.group.add(extension);
                break;

            case 'futuristic':
                // Angular panels
                for (let i = 0; i < 3; i++) {
                    const panel = new THREE.Mesh(
                        new THREE.OctahedronGeometry(width * 0.3),
                        new THREE.MeshStandardMaterial({ color: this.color, metalness: 0.95 })
                    );
                    panel.position.set(
                        (this.random() - 0.5) * width,
                        height * (0.3 + i * 0.3),
                        (this.random() - 0.5) * length * 0.5
                    );
                    this.group.add(panel);
                }
                break;

            case 'retro':
                // Classic rounded panels
                const retroPanel = new THREE.Mesh(
                    new THREE.SphereGeometry(width * 0.4, 8, 8),
                    new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.6 })
                );
                retroPanel.scale.set(1, 0.5, 1.5);
                retroPanel.position.set(0, height * 0.5, 0);
                this.group.add(retroPanel);
                break;

            case 'hybrid':
                // Mix of elements
                const hybrid1 = new THREE.Mesh(
                    new THREE.BoxGeometry(width * 0.7, height * 0.5, length * 0.7),
                    new THREE.MeshStandardMaterial({ color: this.color })
                );
                hybrid1.position.set(0, height * 0.4, 0);
                this.group.add(hybrid1);
                
                const hybrid2 = new THREE.Mesh(
                    new THREE.ConeGeometry(width * 0.3, height * 0.4, 6),
                    new THREE.MeshStandardMaterial({ color: this.color })
                );
                hybrid2.position.set(0, height * 0.7, length * 0.2);
                hybrid2.rotation.x = Math.PI;
                this.group.add(hybrid2);
                break;
        }
    }

    createWheel(radius, mal) {
        const wheelGroup = new THREE.Group();
        
        // Rim
        const rimGeometry = new THREE.CylinderGeometry(radius, radius, 0.1, 16);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.1
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        // Tire
        const tireGeometry = new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, 0.15, 16);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);

        // Spokes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, radius * 0.8, 0.02),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            );
            spoke.position.set(Math.sin(angle) * radius * 0.4, Math.cos(angle) * radius * 0.4, 0);
            wheelGroup.add(spoke);
        }

        return wheelGroup;
    }

    addHandlebar(kit, mal, width) {
        const handlebarGeometry = new THREE.BoxGeometry(width * 1.5, 0.05, 0.05);
        const handlebarMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
        handlebar.position.set(0, 0.8, 0.5);
        this.group.add(handlebar);

        // Handles
        const handle1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        handle1.position.set(width * 0.75, 0.8, 0.5);
        this.group.add(handle1);

        const handle2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        handle2.position.set(-width * 0.75, 0.8, 0.5);
        this.group.add(handle2);
    }

    addSeat(kit, mal, width, length) {
        const seatGeometry = new THREE.BoxGeometry(width * 0.9, 0.1, length * 0.4);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 0.5, -length * 0.2);
        this.group.add(seat);
    }

    addExhaust(kit, mal) {
        const exhaustCount = Math.floor(this.random() * 3) + 1;
        for (let i = 0; i < exhaustCount; i++) {
            const exhaust = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
            );
            exhaust.rotation.z = Math.PI / 2;
            exhaust.position.set(
                (i - (exhaustCount - 1) / 2) * 0.15,
                0.3,
                -0.6
            );
            this.group.add(exhaust);
        }
    }

    applyMalformations(mal) {
        // Apply twist
        this.group.rotation.z = mal.twist;
        
        // Apply bend
        this.group.rotation.x = mal.bend;
        
        // Apply offset
        this.group.position.x += mal.offset;
        
        // Apply asymmetry to individual parts
        this.group.children.forEach((child, index) => {
            if (index > 0) { // Skip main group transformations
                child.position.x += (this.random() - 0.5) * mal.asymmetry;
                child.scale.x *= 1 + (this.random() - 0.5) * mal.asymmetry * 0.5;
            }
        });
    }

    addSpeedTrail() {
        // Hypersonic speed trail effect
        const trailGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.set(0, 0.3, -0.8);
        trail.rotation.x = Math.PI;
        trail.userData.isTrail = true;
        this.group.add(trail);
    }

    getGroup() {
        return this.group;
    }

    getSpeed() {
        return this.speed;
    }

    update(deltaTime, position) {
        // Rotate wheels (find wheels by checking for groups with wheels)
        this.group.children.forEach(child => {
            if (child.type === 'Group' && child.children.length > 0) {
                // Check if it's a wheel group (has rim/tire)
                const hasWheel = child.children.some(c => 
                    c.geometry && (c.geometry.type === 'CylinderGeometry' || c.geometry.type === 'BoxGeometry')
                );
                if (hasWheel) {
                    child.rotation.x += this.speed * deltaTime * 0.01;
                }
            }
        });

        // Animate speed trail
        const trail = this.group.children.find(c => c.userData.isTrail);
        if (trail) {
            trail.scale.y = 1 + Math.sin(Date.now() * 0.01 + position.x + position.z) * 0.3;
            trail.material.opacity = 0.2 + Math.sin(Date.now() * 0.015) * 0.1;
        }
    }
}

