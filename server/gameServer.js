// Game Server - WebSocket Server for Real-time Multiplayer
// This can be deployed separately or integrated with Next.js

import { WebSocketServer } from 'ws';
import http from 'http';

export class GameServer {
    constructor(port = 3001) {
        this.port = port;
        this.server = null;
        this.wss = null;
        this.players = new Map(); // playerId -> playerData
        this.gameState = {
            online: true,
            playerCount: 0,
            startTime: Date.now(),
            uptime: 0
        };
        this.broadcastInterval = null;
    }

    start() {
        // Create HTTP server
        this.server = http.createServer();
        
        // Create WebSocket server
        this.wss = new WebSocketServer({ 
            server: this.server,
            path: '/game'
        });

        // Handle WebSocket connections
        this.wss.on('connection', (ws, req) => {
            const playerId = this.generatePlayerId();
            console.log(`Player ${playerId} connected from ${req.socket.remoteAddress}`);

            // Initialize player
            this.players.set(playerId, {
                id: playerId,
                ws: ws,
                position: { x: 0, y: 2, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                username: `Player${playerId.slice(0, 6)}`,
                connectedAt: Date.now(),
                lastUpdate: Date.now()
            });

            this.gameState.playerCount = this.players.size;

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'welcome',
                playerId: playerId,
                gameState: this.gameState,
                players: Array.from(this.players.values()).map(p => ({
                    id: p.id,
                    username: p.username,
                    position: p.position,
                    rotation: p.rotation
                }))
            }));

            // Broadcast player join to all other players
            this.broadcast({
                type: 'player_join',
                player: {
                    id: playerId,
                    username: this.players.get(playerId).username,
                    position: this.players.get(playerId).position
                }
            }, playerId);

            // Handle messages from client
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleMessage(playerId, data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                console.log(`Player ${playerId} disconnected`);
                this.removePlayer(playerId);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error(`WebSocket error for player ${playerId}:`, error);
                this.removePlayer(playerId);
            });
        });

        // Start HTTP server
        this.server.listen(this.port, () => {
            console.log(`🎮 Game Server started on port ${this.port}`);
            console.log(`WebSocket endpoint: ws://localhost:${this.port}/game`);
        });

        // Start broadcast loop (send updates every 60ms ~ 16 FPS)
        this.broadcastInterval = setInterval(() => {
            this.broadcastGameState();
        }, 60);

        // Update uptime
        setInterval(() => {
            this.gameState.uptime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
        }, 1000);
    }

    handleMessage(playerId, data) {
        const player = this.players.get(playerId);
        if (!player) return;

        switch (data.type) {
            case 'update_position':
                player.position = data.position;
                player.rotation = data.rotation || player.rotation;
                player.lastUpdate = Date.now();
                // Broadcast to all other players
                this.broadcast({
                    type: 'player_update',
                    playerId: playerId,
                    position: player.position,
                    rotation: player.rotation
                }, playerId);
                break;

            case 'chat_message':
                this.broadcast({
                    type: 'chat',
                    playerId: playerId,
                    username: player.username,
                    message: data.message,
                    timestamp: Date.now()
                });
                break;

            case 'player_action':
                // Handle player actions (shoot, interact, etc.)
                this.broadcast({
                    type: 'player_action',
                    playerId: playerId,
                    action: data.action,
                    data: data.data
                }, playerId);
                break;

            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;
        }
    }

    broadcast(message, excludePlayerId = null) {
        const messageStr = JSON.stringify(message);
        this.players.forEach((player, playerId) => {
            if (playerId !== excludePlayerId && player.ws.readyState === 1) { // 1 = OPEN
                try {
                    player.ws.send(messageStr);
                } catch (error) {
                    console.error(`Error sending message to player ${playerId}:`, error);
                }
            }
        });
    }

    broadcastGameState() {
        const playersData = Array.from(this.players.values()).map(p => ({
            id: p.id,
            username: p.username,
            position: p.position,
            rotation: p.rotation
        }));

        this.broadcast({
            type: 'game_state',
            gameState: {
                ...this.gameState,
                playerCount: this.players.size
            },
            players: playersData,
            timestamp: Date.now()
        });
    }

    removePlayer(playerId) {
        if (this.players.has(playerId)) {
            this.players.delete(playerId);
            this.gameState.playerCount = this.players.size;
            
            // Broadcast player leave
            this.broadcast({
                type: 'player_leave',
                playerId: playerId
            });
        }
    }

    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getServerInfo() {
        return {
            ...this.gameState,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                username: p.username,
                connectedAt: p.connectedAt
            }))
        };
    }

    stop() {
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
        }
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
        console.log('Game server stopped');
    }
}

// Export for use in serverless functions or standalone server
export default GameServer;

// If running as standalone server
if (require.main === module) {
    const server = new GameServer(process.env.PORT || 3001);
    server.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.stop();
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully...');
        server.stop();
        process.exit(0);
    });
}

