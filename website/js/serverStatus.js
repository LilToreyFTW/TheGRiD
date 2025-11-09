// Add game server status widget to website
// This will be included in the website HTML

(function() {
    // Game Server Status Widget
    const serverStatusWidget = document.createElement('div');
    serverStatusWidget.id = 'server-status-widget';
    serverStatusWidget.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #00ffff;
        border-radius: 10px;
        padding: 15px;
        color: #00ffff;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 1000;
        min-width: 200px;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    `;

    const updateServerStatus = async () => {
        try {
            const response = await fetch('/api/game-server/status');
            const data = await response.json();
            
            if (data.success && data.server) {
                const server = data.server;
                const statusColor = server.online ? '#00ff00' : '#ff0000';
                const statusText = server.online ? '🟢 ONLINE' : '🔴 OFFLINE';
                
                serverStatusWidget.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">
                        🎮 Game Server Status
                    </div>
                    <div style="margin-bottom: 5px;">
                        Status: <span style="color: ${statusColor};">${statusText}</span>
                    </div>
                    <div style="margin-bottom: 5px;">
                        Players: <span style="color: #00ffff;">${server.playerCount}/${server.maxPlayers}</span>
                    </div>
                    <div style="margin-bottom: 5px;">
                        Uptime: <span style="color: #00ffff;">${formatUptime(server.uptime)}</span>
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 10px; text-align: center;">
                        Version ${server.version}
                    </div>
                `;
            } else {
                serverStatusWidget.innerHTML = `
                    <div style="color: #ff0000; text-align: center;">
                        ⚠️ Server Status Unknown
                    </div>
                `;
            }
        } catch (error) {
            serverStatusWidget.innerHTML = `
                <div style="color: #ff0000; text-align: center;">
                    ❌ Failed to fetch server status
                </div>
            `;
        }
    };

    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Initialize widget
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(serverStatusWidget);
        updateServerStatus();
        // Update every 10 seconds
        setInterval(updateServerStatus, 10000);
    });
})();

