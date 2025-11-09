// Game Server Client - Connects to WebSocket server
// Used by the game client

export class GameServerClient {
    constructor(serverUrl) {
        this.serverUrl = serverUrl || process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'ws://localhost:3001/game';
        this.ws = null;
        this.playerId = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.onMessageCallbacks = [];
        this.onConnectCallbacks = [];
        this.onDisconnectCallbacks = [];
    }

    connect() {
        try {
            console.log(`Connecting to game server: ${this.serverUrl}`);
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('Connected to game server');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.onConnectCallbacks.forEach(callback => callback());
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from game server');
                this.connected = false;
                this.onDisconnectCallbacks.forEach(callback => callback());
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Error connecting to game server:', error);
            this.attemptReconnect();
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'welcome':
                this.playerId = data.playerId;
                console.log('Received welcome, player ID:', this.playerId);
                break;

            case 'player_join':
            case 'player_leave':
            case 'player_update':
            case 'game_state':
            case 'chat':
            case 'player_action':
                // Forward to callbacks
                this.onMessageCallbacks.forEach(callback => callback(data));
                break;

            case 'pong':
                // Handle ping/pong for latency measurement
                break;
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }

    updatePosition(position, rotation) {
        this.send({
            type: 'update_position',
            position: position,
            rotation: rotation
        });
    }

    sendChat(message) {
        this.send({
            type: 'chat_message',
            message: message
        });
    }

    sendAction(action, data) {
        this.send({
            type: 'player_action',
            action: action,
            data: data
        });
    }

    onMessage(callback) {
        this.onMessageCallbacks.push(callback);
    }

    onConnect(callback) {
        this.onConnectCallbacks.push(callback);
    }

    onDisconnect(callback) {
        this.onDisconnectCallbacks.push(callback);
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
}

export default GameServerClient;

