// ADDED - Orbit Controls for Voxel Exploration
import * as THREE from 'three';

export class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        this.target = new THREE.Vector3(0, 0, 0);
        this.minDistance = 5;
        this.maxDistance = 200;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0;
        
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 1.0;
        
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        
        this.enabled = true;
        this.enableRotate = true;
        this.enableZoom = true;
        this.enablePan = true;
        
        this.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        this.state = -1; // -1 = none, 0 = rotate, 1 = dolly, 2 = pan
        this.scale = 1;
        this.panOffset = new THREE.Vector3();
        this.screenSpacePanning = false;
        
        this.panLeft = this.panLeft.bind(this);
        this.panUp = this.panUp.bind(this);
        this.pan = this.pan.bind(this);
        this.dollyIn = this.dollyIn.bind(this);
        this.dollyOut = this.dollyOut.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.update = this.update.bind(this);
        
        this.setupEventListeners();
        // Initialize camera position
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        this.spherical.setFromVector3(offset);
    }

    setupEventListeners() {
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
        this.domElement.addEventListener('mousedown', this.handleMouseDown);
        this.domElement.addEventListener('wheel', this.handleWheel);
        this.domElement.addEventListener('touchstart', this.handleTouchStart);
    }

    handleMouseDown(event) {
        if (!this.enabled) return;

        event.preventDefault();

        switch (event.button) {
            case 0: // Left
                if (this.enableRotate) {
                    this.state = 0;
                    this.mouseX = event.clientX;
                    this.mouseY = event.clientY;
                }
                break;
            case 1: // Middle
                if (this.enableZoom) {
                    this.state = 1;
                    this.mouseX = event.clientX;
                    this.mouseY = event.clientY;
                }
                break;
            case 2: // Right
                if (this.enablePan) {
                    this.state = 2;
                    this.mouseX = event.clientX;
                    this.mouseY = event.clientY;
                }
                break;
        }

        if (this.state !== -1) {
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        }
    }

    handleMouseMove(event) {
        if (!this.enabled) return;

        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;

        switch (this.state) {
            case 0: // Rotate
                if (this.enableRotate) {
                    this.rotate(deltaX, deltaY);
                }
                break;
            case 1: // Dolly
                if (this.enableZoom) {
                    this.dolly(deltaY);
                }
                break;
            case 2: // Pan
                if (this.enablePan) {
                    this.pan(deltaX, deltaY);
                }
                break;
        }

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    handleMouseUp() {
        if (!this.enabled) return;
        this.state = -1;
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleWheel(event) {
        if (!this.enabled || !this.enableZoom) return;

        event.preventDefault();
        const delta = event.deltaY;
        if (delta > 0) {
            this.dollyOut(this.getZoomScale());
        } else {
            this.dollyIn(this.getZoomScale());
        }
    }

    handleTouchStart(event) {
        if (!this.enabled) return;
        event.preventDefault();
        if (event.touches.length === 1) {
            this.state = 0;
            this.touchX = event.touches[0].pageX;
            this.touchY = event.touches[0].pageY;
        } else if (event.touches.length === 2) {
            this.state = 1;
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            this.touchDistance = Math.sqrt(dx * dx + dy * dy);
        }

        document.addEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('touchend', this.handleTouchEnd);
    }

    handleTouchMove(event) {
        if (!this.enabled) return;
        event.preventDefault();

        if (event.touches.length === 1 && this.state === 0) {
            const deltaX = event.touches[0].pageX - this.touchX;
            const deltaY = event.touches[0].pageY - this.touchY;
            this.rotate(deltaX, deltaY);
            this.touchX = event.touches[0].pageX;
            this.touchY = event.touches[0].pageY;
        } else if (event.touches.length === 2 && this.state === 1) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const delta = this.touchDistance - distance;
            this.dolly(delta * 0.1);
            this.touchDistance = distance;
        }
    }

    handleTouchEnd() {
        if (!this.enabled) return;
        this.state = -1;
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    rotate(deltaX, deltaY) {
        const element = this.domElement;
        const rotateLeft = 2 * Math.PI * deltaX / element.clientWidth * this.rotateSpeed;
        const rotateUp = 2 * Math.PI * deltaY / element.clientHeight * this.rotateSpeed;

        this.sphericalDelta.theta -= rotateLeft;
        this.sphericalDelta.phi -= rotateUp;
    }

    dolly(delta) {
        this.scale *= Math.pow(0.95, delta * this.zoomSpeed);
    }

    dollyIn(dollyScale) {
        this.scale /= dollyScale;
    }

    dollyOut(dollyScale) {
        this.scale *= dollyScale;
    }

    panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }

    panUp(distance, objectMatrix) {
        const v = new THREE.Vector3();
        if (this.screenSpacePanning) {
            v.setFromMatrixColumn(objectMatrix, 1);
        } else {
            v.setFromMatrixColumn(objectMatrix, 0);
            v.crossVectors(this.camera.up, v);
        }
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }

    pan(deltaX, deltaY) {
        const element = this.domElement;
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();

        const panLeft = new THREE.Vector3();
        const panUp = new THREE.Vector3();

        panLeft.setFromMatrixColumn(this.camera.matrix, 0);
        panLeft.applyQuaternion(quatInverse);

        panUp.setFromMatrixColumn(this.camera.matrix, 1);
        panUp.applyQuaternion(quatInverse);

        panLeft.multiplyScalar(deltaX * this.panSpeed);
        panUp.multiplyScalar(-deltaY * this.panSpeed);

        offset.copy(panLeft).add(panUp);
        this.panOffset.add(offset);
    }

    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    update() {
        if (!this.enabled) return;

        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();

        const position = this.camera.position;
        offset.copy(position).sub(this.target);
        offset.applyQuaternion(quatInverse);
        this.spherical.setFromVector3(offset);

        if (this.autoRotate) {
            this.sphericalDelta.theta -= (2 * Math.PI / 60 / 60) * this.autoRotateSpeed;
        }

        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
        this.spherical.makeSafe();

        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        this.target.add(this.panOffset);

        offset.setFromSpherical(this.spherical);
        offset.applyQuaternion(quat);
        position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);

        if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);
        }

        this.scale = 1;
    }
}

