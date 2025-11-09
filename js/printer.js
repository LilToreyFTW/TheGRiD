// ADDED - 3D Model Printer System with BORTtheBOT Integration
import * as THREE from 'three';

export class ModelPrinter {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.isPrinting = false;
        this.printQueue = [];
        this.currentPrint = null;
        this.printerModel = null;
        this.printArea = null;
        this.laserArms = [];
        this.ownerLoggedIn = false;
        
        this.createPrinter();
    }

    createPrinter() {
        const printerGroup = new THREE.Group();
        
        // Main printer base
        const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        printerGroup.add(base);

        // Printer chamber
        const chamberGeometry = new THREE.BoxGeometry(2.5, 2, 2.5);
        const chamberMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
        chamber.position.y = 1.5;
        printerGroup.add(chamber);

        // Laser arms (4 arms for distributed printing)
        for (let i = 0; i < 4; i++) {
            const arm = this.createLaserArm(i);
            arm.position.set(
                Math.cos((i / 4) * Math.PI * 2) * 1.2,
                1.5,
                Math.sin((i / 4) * Math.PI * 2) * 1.2
            );
            printerGroup.add(arm);
            this.laserArms.push(arm);
        }

        // Print bed
        const bedGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
        const bedMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.9,
            roughness: 0.1
        });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.y = 0.6;
        printerGroup.add(bed);
        this.printArea = bed;

        // Control panel
        const panelGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(1.3, 1.2, 0);
        printerGroup.add(panel);

        // Status lights
        const lightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const idleLight = new THREE.Mesh(
            lightGeometry,
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        idleLight.position.set(1.3, 1.4, 0.1);
        printerGroup.add(idleLight);
        this.statusLight = idleLight;

        printerGroup.position.copy(this.position);
        this.scene.add(printerGroup);
        this.printerModel = printerGroup;
    }

    createLaserArm(index) {
        const armGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        armGroup.add(base);

        // Joint
        const jointGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const joint = new THREE.Mesh(jointGeometry, jointMaterial);
        joint.position.y = 0.2;
        armGroup.add(joint);

        // Arm segment
        const armGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.08);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.y = 0.6;
        armGroup.add(arm);

        // Laser head
        const headGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.0;
        head.rotation.x = Math.PI;
        armGroup.add(head);

        // Laser beam (hidden initially)
        const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.6
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = 0.5;
        beam.visible = false;
        armGroup.add(beam);
        armGroup.userData.laserBeam = beam;

        return armGroup;
    }

    login(username, password) {
        // Owner credentials
        if (username === 'Torey5721' && password === 'Torey991200@##') {
            this.ownerLoggedIn = true;
            this.statusLight.material.color.setHex(0x00ff00);
            return { success: true, message: 'Owner access granted' };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        this.ownerLoggedIn = false;
        this.statusLight.material.color.setHex(0xff0000);
    }

    queuePrint(modelType, modelData) {
        if (!this.ownerLoggedIn) {
            return { success: false, message: 'Owner access required' };
        }

        this.printQueue.push({
            type: modelType, // 'bike' or 'weapon'
            data: modelData,
            id: Date.now()
        });

        if (!this.isPrinting) {
            this.startNextPrint();
        }

        return { success: true, message: 'Print queued', queueLength: this.printQueue.length };
    }

    startNextPrint() {
        if (this.printQueue.length === 0) return;

        this.isPrinting = true;
        this.currentPrint = this.printQueue.shift();
        this.statusLight.material.color.setHex(0xffff00); // Yellow = printing

        // Animate laser arms
        this.animatePrinting();

        // Simulate print time (3-5 seconds)
        const printTime = 3000 + Math.random() * 2000;
        setTimeout(() => {
            this.completePrint();
        }, printTime);
    }

    animatePrinting() {
        // Animate laser arms moving
        this.laserArms.forEach((arm, index) => {
            const beam = arm.userData.laserBeam;
            if (beam) {
                beam.visible = true;
            }

            // Animate arm movement
            const animate = () => {
                if (!this.isPrinting) return;
                
                const time = Date.now() * 0.001;
                arm.rotation.y = Math.sin(time + index) * 0.3;
                arm.rotation.x = Math.sin(time * 2 + index) * 0.2;
                
                if (beam) {
                    beam.scale.y = 0.5 + Math.sin(time * 5) * 0.3;
                }
                
                requestAnimationFrame(animate);
            };
            animate();
        });
    }

    completePrint() {
        this.isPrinting = false;
        this.statusLight.material.color.setHex(0x00ff00); // Green = idle

        // Hide laser beams
        this.laserArms.forEach(arm => {
            if (arm.userData.laserBeam) {
                arm.userData.laserBeam.visible = false;
            }
        });

        // Spawn the printed model
        const model = this.createPrintedModel(this.currentPrint.type, this.currentPrint.data);
        if (model) {
            model.position.copy(this.printArea.position);
            model.position.y += 0.2;
            this.scene.add(model);
            
            // Animate model rising from printer
            this.animateModelRise(model);
        }

        this.currentPrint = null;

        // Start next print if queue has items
        if (this.printQueue.length > 0) {
            setTimeout(() => this.startNextPrint(), 1000);
        }
    }

    createPrintedModel(type, data) {
        const modelGroup = new THREE.Group();

        if (type === 'bike') {
            // Create bike model (simplified version)
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.3, 0.5),
                new THREE.MeshStandardMaterial({ color: data.color || 0x4CAF50 })
            );
            modelGroup.add(frame);

            const wheel1 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            wheel1.rotation.z = Math.PI / 2;
            wheel1.position.set(0, 0, 0.3);
            modelGroup.add(wheel1);

            const wheel2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            wheel2.rotation.z = Math.PI / 2;
            wheel2.position.set(0, 0, -0.3);
            modelGroup.add(wheel2);
        } else if (type === 'weapon') {
            // Create weapon model
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.3, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x8B4513 })
            );
            modelGroup.add(handle);

            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16),
                new THREE.MeshStandardMaterial({ color: 0x444444 })
            );
            barrel.rotation.z = Math.PI / 2;
            barrel.position.set(0.25, 0, 0);
            modelGroup.add(barrel);
        }

        modelGroup.userData.isPrintedModel = true;
        modelGroup.userData.modelType = type;
        return modelGroup;
    }

    animateModelRise(model) {
        const startY = model.position.y;
        const targetY = startY + 1;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            model.position.y = startY + (targetY - startY) * progress;
            model.rotation.y += 0.02;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    update(deltaTime) {
        // Update printer animations
        if (this.isPrinting && this.laserArms) {
            // Additional update logic if needed
        }
    }

    getStatus() {
        return {
            isPrinting: this.isPrinting,
            queueLength: this.printQueue.length,
            ownerLoggedIn: this.ownerLoggedIn,
            currentPrint: this.currentPrint ? this.currentPrint.type : null
        };
    }
}

