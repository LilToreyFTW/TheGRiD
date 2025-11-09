// ADDED - Video Game Utilities and Managers
import * as THREE from 'three';

export class VideoGameUtils {
    // Screen shake effect
    static createScreenShake(camera, intensity = 0.1, duration = 0.5) {
        const originalPosition = camera.position.clone();
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed < duration) {
                const decay = 1 - (elapsed / duration);
                camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity * decay;
                camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity * decay;
                camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity * decay;
                requestAnimationFrame(shake);
            } else {
                camera.position.copy(originalPosition);
            }
        };
        
        shake();
    }

    // Fade effect
    static createFade(element, targetOpacity, duration = 1000) {
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
            element.style.opacity = currentOpacity;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        fade();
    }

    // Particle system
    static createParticleSystem(count, position, color = 0xffffff) {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;

            const c = new THREE.Color(color);
            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;

            sizes[i] = Math.random() * 0.1 + 0.05;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        return new THREE.Points(particles, material);
    }

    // Sound manager (placeholder for Web Audio API)
    static createSoundManager() {
        const sounds = new Map();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        return {
            loadSound: async (name, url) => {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    sounds.set(name, audioBuffer);
                    return audioBuffer;
                } catch (error) {
                    console.warn(`Could not load sound ${name}:`, error);
                    return null;
                }
            },
            
            playSound: (name, volume = 1.0) => {
                const buffer = sounds.get(name);
                if (buffer) {
                    const source = audioContext.createBufferSource();
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = volume;
                    source.buffer = buffer;
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    source.start(0);
                    return source;
                }
            }
        };
    }

    // Input manager
    static createInputManager() {
        const keys = {};
        const mouse = { x: 0, y: 0, buttons: {} };

        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            mouse.buttons[e.button] = true;
        });

        document.addEventListener('mouseup', (e) => {
            mouse.buttons[e.button] = false;
        });

        return {
            isKeyPressed: (code) => keys[code] || false,
            getMouse: () => ({ ...mouse }),
            isMouseButtonPressed: (button) => mouse.buttons[button] || false
        };
    }

    // Save/Load system
    static createSaveSystem() {
        return {
            save: (key, data) => {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (error) {
                    console.error('Save failed:', error);
                    return false;
                }
            },
            
            load: (key) => {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                } catch (error) {
                    console.error('Load failed:', error);
                    return null;
                }
            },
            
            delete: (key) => {
                localStorage.removeItem(key);
            },
            
            clear: () => {
                localStorage.clear();
            }
        };
    }
}

// Game state manager
export class GameStateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
    }

    registerState(name, state) {
        this.states.set(name, state);
    }

    setState(name) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        
        const newState = this.states.get(name);
        if (newState) {
            this.currentState = newState;
            if (newState.enter) {
                newState.enter();
            }
        }
    }

    update(deltaTime) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(deltaTime);
        }
    }
}

