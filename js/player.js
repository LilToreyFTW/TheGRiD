// ADDED - Player controls and movement system
import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 5.0;
        this.runMultiplier = 1.5;
        this.jumpSpeed = 8.0;
        this.gravity = -20.0;
        this.canJump = false;
        this.health = 100;
        this.maxHealth = 100;
        this.lastPosition = new THREE.Vector3(0, 2, 0);
        
        // Controls state
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitchObject = new THREE.Object3D();
        this.yawObject = new THREE.Object3D();
        
        // ADDED - External systems
        this.soundManager = null;
        this.achievementsSystem = null;
        
        // Setup camera hierarchy
        this.yawObject.add(this.pitchObject);
        this.pitchObject.add(this.camera);
        this.scene.add(this.yawObject);
        
        // Initial camera position
        this.yawObject.position.set(0, 2, 0);
        this.lastPosition.copy(this.yawObject.position);
        
        // Setup controls
        this.setupControls();
        
        // Raycaster for ground detection
        this.raycaster = new THREE.Raycaster(
            new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(0, -1, 0),
            0,
            1.5
        );
    }

    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (!this.controlsEnabled) return;
            
            const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

            this.yawObject.rotation.y -= movementX * 0.002;
            this.pitchObject.rotation.x -= movementY * 0.002;
            
            // Limit pitch
            this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        });

        // Pointer lock
        document.addEventListener('click', () => {
            if (this.controlsEnabled) {
                document.body.requestPointerLock();
            }
        });
    }

    enableControls() {
        this.controlsEnabled = true;
        document.body.requestPointerLock();
    }

    disableControls() {
        this.controlsEnabled = false;
        document.exitPointerLock();
    }

    update(deltaTime) {
        if (!this.controlsEnabled) return;

        // Calculate movement direction
        this.direction.set(0, 0, 0);
        
        if (this.keys['KeyW']) this.direction.z -= 1;
        if (this.keys['KeyS']) this.direction.z += 1;
        if (this.keys['KeyA']) this.direction.x -= 1;
        if (this.keys['KeyD']) this.direction.x += 1;

        // Normalize direction
        if (this.direction.length() > 0) {
            this.direction.normalize();
        }

        // Apply rotation to movement direction
        const yaw = this.yawObject.rotation.y;
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        
        const forward = new THREE.Vector3(
            sinYaw * this.direction.z,
            0,
            cosYaw * this.direction.z
        );
        
        const right = new THREE.Vector3(
            cosYaw * this.direction.x,
            0,
            -sinYaw * this.direction.x
        );

        // Calculate speed
        let speed = this.moveSpeed;
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
            speed *= this.runMultiplier;
        }

        // Apply movement
        this.velocity.x = (forward.x + right.x) * speed;
        this.velocity.z = (forward.z + right.z) * speed;

        // Jump
        if (this.keys['Space'] && this.canJump) {
            this.velocity.y = this.jumpSpeed;
            this.canJump = false;
            // ADDED - Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
            // ADDED - Update achievements
            if (this.achievementsSystem) {
                this.achievementsSystem.updateStat('jumps', 1);
            }
        }

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Update position
        const newPosition = this.yawObject.position.clone();
        newPosition.x += this.velocity.x * deltaTime;
        newPosition.z += this.velocity.z * deltaTime;
        newPosition.y += this.velocity.y * deltaTime;

        // Ground collision
        this.raycaster.set(
            new THREE.Vector3(newPosition.x, newPosition.y + 0.5, newPosition.z),
            new THREE.Vector3(0, -1, 0)
        );

        const groundObjects = [];
        this.scene.traverse((object) => {
            if (object.userData.isGround) {
                groundObjects.push(object);
            }
        });

        const intersections = this.raycaster.intersectObjects(groundObjects);
        
        if (intersections.length > 0 && intersections[0].distance < 1.5) {
            newPosition.y = intersections[0].point.y + 1.5;
            this.velocity.y = 0;
            this.canJump = true;
        } else if (newPosition.y < 0) {
            // Fallback: prevent falling below ground
            newPosition.y = 1.5;
            this.velocity.y = 0;
            this.canJump = true;
        }

        this.yawObject.position.copy(newPosition);

        // ADDED - Track distance traveled for achievements
        const distance = this.yawObject.position.distanceTo(this.lastPosition);
        if (this.achievementsSystem && distance > 0) {
            this.achievementsSystem.updateStat('distanceTraveled', distance);
        }
        this.lastPosition.copy(this.yawObject.position);

        // ADDED - No boundaries - fully open world!
        // Player can explore infinitely in any direction
    }

    setSoundManager(soundManager) {
        this.soundManager = soundManager;
    }

    setAchievementsSystem(achievementsSystem) {
        this.achievementsSystem = achievementsSystem;
    }

    getHealth() {
        return this.health;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // ADDED - Play damage sound
        if (this.soundManager) {
            this.soundManager.playDamage();
        }
        // ADDED - Update achievements
        if (this.achievementsSystem) {
            if (!this.achievementsSystem.stats.damageTaken) {
                this.achievementsSystem.stats.damageTaken = 0;
            }
            this.achievementsSystem.stats.damageTaken += amount;
        }
    }

    heal(amount) {
        const wasDamaged = this.health < this.maxHealth;
        this.health = Math.min(this.maxHealth, this.health + amount);
        // ADDED - Play heal sound
        if (this.soundManager && wasDamaged) {
            this.soundManager.playHeal();
        }
    }

    reset() {
        this.yawObject.position.set(0, 2, 0);
        this.velocity.set(0, 0, 0);
        this.health = this.maxHealth;
        this.canJump = false;
    }
}

