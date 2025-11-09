// ADDED - Complete Intergalactic Teleportation System
import * as THREE from 'three';

export class TeleportationSystem {
    constructor(scene, planetSystem, player) {
        this.scene = scene;
        this.planetSystem = planetSystem;
        this.player = player;
        this.isTeleporting = false;
        this.teleportationUI = null;
        this.missionSystem = null; // ADDED - Will be set by game app
        this.gameApp = null; // ADDED - Reference to game app for webhooks
        this.createTeleportationUI();
    }

    createTeleportationUI() {
        const container = document.createElement('div');
        container.id = 'teleportation-ui';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            border-radius: 0;
            padding: 30px;
            color: #fff;
            font-family: 'Orbitron', monospace;
            z-index: 10006;
            width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 50px #00ffff;
            display: none;
        `;

        const title = document.createElement('h2');
        title.textContent = 'INTERGALACTIC TELEPORTATION';
        title.style.cssText = `
            color: #00ffff;
            text-align: center;
            font-size: 28px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px #00ffff;
        `;
        container.appendChild(title);

        const subtitle = document.createElement('div');
        subtitle.textContent = 'Select a planet to teleport to:';
        subtitle.style.cssText = `
            color: #fff;
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
        `;
        container.appendChild(subtitle);

        const planetsList = document.createElement('div');
        planetsList.id = 'teleportation-planets-list';
        planetsList.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        `;
        container.appendChild(planetsList);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'CLOSE';
        closeBtn.style.cssText = `
            display: block;
            width: 100%;
            padding: 15px;
            background: transparent;
            border: 2px solid #00ffff;
            color: #00ffff;
            font-family: 'Orbitron', monospace;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(0, 255, 255, 0.1)';
            closeBtn.style.boxShadow = '0 0 20px #00ffff';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'transparent';
            closeBtn.style.boxShadow = 'none';
        };
        closeBtn.onclick = () => this.hide();
        container.appendChild(closeBtn);

        document.body.appendChild(container);
        this.container = container;
        this.planetsList = planetsList;
    }

    refreshPlanetsList() {
        this.planetsList.innerHTML = '';
        
        const planets = this.planetSystem.getAllPlanets();
        const currentPlanet = this.planetSystem.getCurrentPlanet();

        planets.forEach(planet => {
            const isUnlocked = this.planetSystem.isPlanetUnlocked(planet.id);
            const isCurrent = planet.id === currentPlanet;

            const planetCard = document.createElement('div');
            planetCard.style.cssText = `
                padding: 15px;
                background: ${isUnlocked ? (isCurrent ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.1)') : 'rgba(100, 100, 100, 0.1)'};
                border: 2px solid ${isUnlocked ? (isCurrent ? '#00ff00' : '#00ffff') : '#666'};
                cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
                transition: all 0.3s ease;
                opacity: ${isUnlocked ? '1' : '0.5'};
            `;

            const planetName = document.createElement('div');
            planetName.textContent = planet.name;
            planetName.style.cssText = `
                color: ${isUnlocked ? '#00ffff' : '#888'};
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 5px;
            `;
            planetCard.appendChild(planetName);

            const planetDesc = document.createElement('div');
            planetDesc.textContent = planet.description;
            planetDesc.style.cssText = `
                color: ${isUnlocked ? '#fff' : '#666'};
                font-size: 12px;
                margin-bottom: 5px;
            `;
            planetCard.appendChild(planetDesc);

            const planetStatus = document.createElement('div');
            if (isCurrent) {
                planetStatus.textContent = '📍 CURRENT LOCATION';
                planetStatus.style.color = '#00ff00';
            } else if (!isUnlocked) {
                planetStatus.textContent = '🔒 LOCKED';
                planetStatus.style.color = '#ff0080';
            } else {
                planetStatus.textContent = '✓ AVAILABLE';
                planetStatus.style.color = '#00ffff';
            }
            planetStatus.style.cssText += `
                font-size: 11px;
                margin-top: 5px;
                font-weight: bold;
            `;
            planetCard.appendChild(planetStatus);

            if (isUnlocked && !isCurrent) {
                planetCard.onmouseover = () => {
                    planetCard.style.background = 'rgba(0, 255, 255, 0.2)';
                    planetCard.style.boxShadow = '0 0 15px #00ffff';
                    planetCard.style.transform = 'scale(1.05)';
                };
                planetCard.onmouseout = () => {
                    planetCard.style.background = 'rgba(0, 255, 255, 0.1)';
                    planetCard.style.boxShadow = 'none';
                    planetCard.style.transform = 'scale(1)';
                };
                planetCard.onclick = () => this.teleportToPlanet(planet.id);
            }

            this.planetsList.appendChild(planetCard);
        });
    }

    teleportToPlanet(planetId) {
        if (this.isTeleporting) return;
        if (!this.planetSystem.isPlanetUnlocked(planetId)) return;

        const planet = this.planetSystem.getPlanet(planetId);
        if (!planet) return;

        this.isTeleporting = true;
        this.hide();

        // Create teleportation effect
        this.createTeleportationEffect(() => {
            // Teleport player
            const marker = this.planetSystem.getLandingMarker(planetId);
            if (marker && this.player && this.player.yawObject) {
                const landingPos = marker.position.clone();
                landingPos.y += 2; // Land on platform
                this.player.yawObject.position.copy(landingPos);
                this.planetSystem.setCurrentPlanet(planetId);
                
                // ADDED - Log teleportation to Discord
                if (this.gameApp && this.gameApp.discordWebhooks && this.gameApp.playerUsername) {
                    this.gameApp.discordWebhooks.logTeleportation(
                        this.gameApp.playerUsername,
                        planet.name
                    );
                }
                
                // ADDED - Update mission if exploring planets
                if (this.missionSystem) {
                    const activeMissions = this.missionSystem.getActiveMissions();
                    activeMissions.forEach(mission => {
                        if (mission.type === 'planet' && mission.target === planetId) {
                            this.missionSystem.updateMission(mission.id, 1);
                        } else if (mission.type === 'planets_visited') {
                            const visited = this.planetSystem.unlockedPlanets.size;
                            this.missionSystem.updateMission(mission.id, visited);
                        }
                    });
                }
            }

            // Create arrival effect
            this.createArrivalEffect(planet);
            this.isTeleporting = false;
        });
    }

    createTeleportationEffect(callback) {
        // Visual effect: particles and energy beam
        const playerPos = this.player.yawObject.position.clone();
        
        // Energy beam upward
        const beamGeometry = new THREE.CylinderGeometry(0.5, 2, 10, 16);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.8
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.copy(playerPos);
        beam.position.y += 5;
        this.scene.add(beam);

        // Particles
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(playerPos);
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 5
            );
            particle.userData.lifetime = 1.0;
            particle.userData.age = 0;
            this.scene.add(particle);
            particles.push(particle);
        }

        // Animate teleportation
        let elapsed = 0;
        const duration = 1.0;
        const animate = () => {
            elapsed += 0.016;
            const progress = elapsed / duration;

            // Fade beam
            beam.material.opacity = 0.8 * (1 - progress);
            beam.scale.y = 1 + progress * 2;

            // Animate particles
            particles.forEach(particle => {
                particle.userData.age += 0.016;
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                particle.userData.velocity.y += 2; // Gravity
                particle.material.opacity = 1 - (particle.userData.age / particle.userData.lifetime);
                
                if (particle.userData.age >= particle.userData.lifetime) {
                    this.scene.remove(particle);
                    const index = particles.indexOf(particle);
                    if (index > -1) particles.splice(index, 1);
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(beam);
                particles.forEach(p => this.scene.remove(p));
                if (callback) callback();
            }
        };
        animate();
    }

    createArrivalEffect(planet) {
        const playerPos = this.player.yawObject.position.clone();
        
        // Arrival burst
        for (let i = 0; i < 30; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: planet.color,
                emissive: planet.color,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(playerPos);
            
            const angle = (i / 30) * Math.PI * 2;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * 4,
                Math.random() * 3 + 1,
                Math.sin(angle) * 4
            );
            particle.userData.lifetime = 1.5;
            particle.userData.age = 0;
            this.scene.add(particle);

            // Animate arrival particles
            const animateParticle = () => {
                particle.userData.age += 0.016;
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                particle.userData.velocity.multiplyScalar(0.95); // Friction
                particle.material.opacity = 1 - (particle.userData.age / particle.userData.lifetime);
                
                if (particle.userData.age < particle.userData.lifetime) {
                    requestAnimationFrame(animateParticle);
                } else {
                    this.scene.remove(particle);
                }
            };
            animateParticle();
        }

        // Show planet name notification
        this.showPlanetNotification(planet);
    }

    showPlanetNotification(planet) {
        const notification = document.createElement('div');
        notification.textContent = `Arrived at ${planet.name}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid ${'#' + planet.color.toString(16).padStart(6, '0')};
            padding: 20px 40px;
            color: ${'#' + planet.color.toString(16).padStart(6, '0')};
            font-family: 'Orbitron', monospace;
            font-size: 24px;
            z-index: 10007;
            box-shadow: 0 0 30px ${'#' + planet.color.toString(16).padStart(6, '0')};
            animation: slideDown 0.5s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    show() {
        this.refreshPlanetsList();
        this.container.style.display = 'block';
        if (this.player) {
            this.player.disableControls();
        }
    }

    hide() {
        this.container.style.display = 'none';
        if (this.player && this.player.controlsEnabled) {
            this.player.enableControls();
        }
    }

    toggle() {
        if (this.container.style.display === 'none' || !this.container.style.display) {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

