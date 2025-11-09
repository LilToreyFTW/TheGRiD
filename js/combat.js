// ADDED - Complete Combat System
import * as THREE from 'three';

export class CombatSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        this.projectiles = [];
        this.combatEnabled = true;
    }

    createEnemy(position, type = 'basic') {
        const enemyGroup = new THREE.Group();
        
        // Enemy body (neon-colored geometric shape)
        const bodyGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0080,
            emissive: 0xff0080,
            emissiveIntensity: 0.8,
            roughness: 0.1,
            metalness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        enemyGroup.add(body);

        // Enemy health bar
        const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
        const healthBarMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        healthBar.position.y = 1.5;
        healthBar.userData.isHealthBar = true;
        enemyGroup.add(healthBar);

        enemyGroup.position.copy(position);
        enemyGroup.userData.isEnemy = true;
        enemyGroup.userData.health = 100;
        enemyGroup.userData.maxHealth = 100;
        enemyGroup.userData.type = type;
        enemyGroup.userData.speed = 2.0;
        enemyGroup.userData.lastAttack = 0;
        enemyGroup.userData.attackCooldown = 2.0;

        this.scene.add(enemyGroup);
        this.enemies.push(enemyGroup);
        return enemyGroup;
    }

    updateEnemies(deltaTime) {
        if (!this.combatEnabled || !this.player || !this.player.yawObject) return;

        const playerPos = this.player.yawObject.position;

        this.enemies.forEach(enemy => {
            if (!enemy.parent) {
                const index = this.enemies.indexOf(enemy);
                if (index > -1) this.enemies.splice(index, 1);
                return;
            }

            // Move towards player
            const direction = new THREE.Vector3()
                .subVectors(playerPos, enemy.position)
                .normalize();
            
            const distance = enemy.position.distanceTo(playerPos);
            
            if (distance > 0.5 && distance < 20) {
                enemy.position.add(direction.multiplyScalar(enemy.userData.speed * deltaTime));
                enemy.lookAt(playerPos);
            }

            // Attack player if close enough
            if (distance < 3 && Date.now() - enemy.userData.lastAttack > enemy.userData.attackCooldown * 1000) {
                this.attackPlayer(enemy);
                enemy.userData.lastAttack = Date.now();
            }

            // Update health bar
            const healthBar = enemy.children.find(c => c.userData.isHealthBar);
            if (healthBar) {
                const healthPercent = enemy.userData.health / enemy.userData.maxHealth;
                healthBar.scale.x = healthPercent;
                healthBar.material.color.setHex(healthPercent > 0.5 ? 0x00ff00 : 0xff0000);
            }

            // Remove if dead
            if (enemy.userData.health <= 0) {
                this.createDeathEffect(enemy.position);
                this.scene.remove(enemy);
                const index = this.enemies.indexOf(enemy);
                if (index > -1) this.enemies.splice(index, 1);
            }
        });
    }

    attackPlayer(enemy) {
        if (this.player && this.player.takeDamage) {
            this.player.takeDamage(10);
        }
    }

    damageEnemy(enemy, damage) {
        enemy.userData.health = Math.max(0, enemy.userData.health - damage);
    }

    createDeathEffect(position) {
        // Particle explosion
        for (let i = 0; i < 15; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0080,
                emissive: 0xff0080,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(position);
            
            const angle = (i / 15) * Math.PI * 2;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * 3,
                Math.random() * 2 + 1,
                Math.sin(angle) * 3
            );
            particle.userData.lifetime = 1.0;
            particle.userData.age = 0;
            this.scene.add(particle);

            const animateParticle = () => {
                particle.userData.age += 0.016;
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                particle.userData.velocity.multiplyScalar(0.9);
                particle.material.opacity = 1 - (particle.userData.age / particle.userData.lifetime);
                
                if (particle.userData.age < particle.userData.lifetime) {
                    requestAnimationFrame(animateParticle);
                } else {
                    this.scene.remove(particle);
                }
            };
            animateParticle();
        }
    }

    spawnEnemies(count, area) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * area;
            const z = (Math.random() - 0.5) * area;
            const y = 1;
            this.createEnemy(new THREE.Vector3(x, y, z));
        }
    }

    clearAllEnemies() {
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy);
        });
        this.enemies = [];
    }
}

