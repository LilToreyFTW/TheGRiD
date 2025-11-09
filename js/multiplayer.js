// ADDED - Multiplayer Server System (Single Server, Everyone Sees Everyone)
import * as THREE from 'three';

export class MultiplayerServer {
    constructor() {
        this.players = new Map(); // playerId -> playerData
        this.serverState = {
            online: true,
            playerCount: 0,
            lastUpdate: Date.now()
        };
        this.updateInterval = null;
        this.wsConnection = null; // WebSocket connection placeholder
    }

    // Initialize server connection
    initialize() {
        console.log('Initializing multiplayer server...');
        
        // Simulate server connection (in real implementation, connect to WebSocket server)
        this.simulateServerConnection();
        
        // Start update loop
        this.startUpdateLoop();
    }

    simulateServerConnection() {
        // In production, this would connect to a real WebSocket server
        // For now, simulate local multiplayer
        console.log('Connected to game server (simulated)');
        this.serverState.online = true;
    }

    // Register player
    registerPlayer(playerId, playerData) {
        this.players.set(playerId, {
            ...playerData,
            id: playerId,
            position: playerData.position || { x: 0, y: 2, z: 0 },
            rotation: playerData.rotation || { x: 0, y: 0, z: 0 },
            lastUpdate: Date.now()
        });
        this.serverState.playerCount = this.players.size;
        this.broadcastPlayerJoin(playerId);
    }

    // Update player position/state
    updatePlayer(playerId, updates) {
        const player = this.players.get(playerId);
        if (player) {
            Object.assign(player, updates);
            player.lastUpdate = Date.now();
            this.broadcastPlayerUpdate(playerId, updates);
        }
    }

    // Remove player
    removePlayer(playerId) {
        if (this.players.has(playerId)) {
            this.players.delete(playerId);
            this.serverState.playerCount = this.players.size;
            this.broadcastPlayerLeave(playerId);
        }
    }

    // Broadcast to all players
    broadcastPlayerJoin(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            console.log(`Player ${playerId} joined. Total players: ${this.serverState.playerCount}`);
            // In production, send WebSocket message to all clients
        }
    }

    broadcastPlayerUpdate(playerId, updates) {
        // In production, send WebSocket message to all clients
        // For now, just log
    }

    broadcastPlayerLeave(playerId) {
        console.log(`Player ${playerId} left. Total players: ${this.serverState.playerCount}`);
        // In production, send WebSocket message to all clients
    }

    // Get all players
    getAllPlayers() {
        return Array.from(this.players.values());
    }

    // Get player by ID
    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    // Start update loop
    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.serverState.lastUpdate = Date.now();
            // Clean up stale players (not updated in 30 seconds)
            const now = Date.now();
            for (const [id, player] of this.players.entries()) {
                if (now - player.lastUpdate > 30000) {
                    this.removePlayer(id);
                }
            }
        }, 1000);
    }

    // Stop server
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.players.clear();
        this.serverState.online = false;
    }

    // Get server state
    getServerState() {
        return {
            ...this.serverState,
            players: this.getAllPlayers()
        };
    }
}

// ADDED - Player Synchronization
export class PlayerSync {
    constructor(scene, server) {
        this.scene = scene;
        this.server = server;
        this.remotePlayers = new Map(); // playerId -> THREE.Object3D
        this.localPlayerId = this.generatePlayerId();
    }

    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Register local player
    registerLocalPlayer(playerObject) {
        this.server.registerPlayer(this.localPlayerId, {
            position: {
                x: playerObject.position.x,
                y: playerObject.position.y,
                z: playerObject.position.z
            },
            rotation: {
                x: playerObject.rotation.x,
                y: playerObject.rotation.y,
                z: playerObject.rotation.z
            }
        });
    }

    // Update local player position
    updateLocalPlayer(playerObject) {
        this.server.updatePlayer(this.localPlayerId, {
            position: {
                x: playerObject.position.x,
                y: playerObject.position.y,
                z: playerObject.position.z
            },
            rotation: {
                x: playerObject.rotation.x,
                y: playerObject.rotation.y,
                z: playerObject.rotation.z
            }
        });
    }

    // Sync remote players
    syncRemotePlayers() {
        const allPlayers = this.server.getAllPlayers();
        
        allPlayers.forEach(playerData => {
            if (playerData.id === this.localPlayerId) return; // Skip local player
            
            let remotePlayer = this.remotePlayers.get(playerData.id);
            
            if (!remotePlayer) {
                // Create new remote player representation
                remotePlayer = this.createRemotePlayer(playerData.id);
                this.remotePlayers.set(playerData.id, remotePlayer);
                this.scene.add(remotePlayer);
            }
            
            // Update position
            remotePlayer.position.set(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            );
            
            // Update rotation
            remotePlayer.rotation.set(
                playerData.rotation.x,
                playerData.rotation.y,
                playerData.rotation.z
            );
        });
        
        // Remove players that left
        const currentPlayerIds = new Set(allPlayers.map(p => p.id));
        for (const [id, obj] of this.remotePlayers.entries()) {
            if (!currentPlayerIds.has(id)) {
                this.scene.remove(obj);
                this.remotePlayers.delete(id);
            }
        }
    }

    createRemotePlayer(playerId) {
        const group = new THREE.Group();
        
        // Simple player representation
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        group.add(body);
        
        group.userData.playerId = playerId;
        
        return group;
    }

    update(deltaTime) {
        this.syncRemotePlayers();
    }
}

