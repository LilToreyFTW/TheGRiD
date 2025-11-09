// ADDED - Live Leaderboard System
import * as THREE from 'three';

export class Leaderboard {
    constructor() {
        this.players = [];
        this.maxEntries = 10;
        this.updateInterval = 5000; // Update every 5 seconds
        this.lastUpdate = 0;
        this.isVisible = false;
    }

    // Add or update player score
    addPlayer(playerId, playerName, score, kills = 0, deaths = 0) {
        const existingIndex = this.players.findIndex(p => p.id === playerId);
        
        const playerData = {
            id: playerId,
            name: playerName,
            score: score,
            kills: kills,
            deaths: deaths,
            kdr: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
            lastUpdate: Date.now()
        };

        if (existingIndex >= 0) {
            this.players[existingIndex] = playerData;
        } else {
            this.players.push(playerData);
        }

        this.sortPlayers();
        this.limitEntries();
    }

    // Sort players by score (descending)
    sortPlayers() {
        this.players.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Tie-breaker: higher KDR
            return parseFloat(b.kdr) - parseFloat(a.kdr);
        });
    }

    // Limit to max entries
    limitEntries() {
        if (this.players.length > this.maxEntries) {
            this.players = this.players.slice(0, this.maxEntries);
        }
    }

    // Get top players
    getTopPlayers(count = 10) {
        return this.players.slice(0, count);
    }

    // Get player rank
    getPlayerRank(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        return index >= 0 ? index + 1 : null;
    }

    // Get player data
    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }

    // Remove player
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }

    // Clear leaderboard
    clear() {
        this.players = [];
    }

    // Get leaderboard data for display
    getLeaderboardData() {
        return {
            players: this.players.map((player, index) => ({
                rank: index + 1,
                name: player.name,
                score: player.score,
                kills: player.kills,
                deaths: player.deaths,
                kdr: player.kdr
            })),
            totalPlayers: this.players.length,
            lastUpdate: this.lastUpdate
        };
    }

    // Update timestamp
    update() {
        this.lastUpdate = Date.now();
    }
}

export class LeaderboardUI {
    constructor(leaderboard, multiplayerServer = null) {
        this.leaderboard = leaderboard;
        this.multiplayerServer = multiplayerServer;
        this.isVisible = false;
        this.createUI();
    }

    createUI() {
        // Create leaderboard container
        const container = document.createElement('div');
        container.id = 'leaderboard-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid rgba(76, 175, 80, 0.8);
            border-radius: 15px;
            padding: 20px;
            z-index: 10001;
            display: none;
            box-shadow: 0 0 50px rgba(76, 175, 80, 0.5);
            overflow-y: auto;
        `;

        // Leaderboard header with image
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid rgba(76, 175, 80, 0.5);
            padding-bottom: 15px;
        `;

        const image = document.createElement('img');
        image.src = 'videogame/game_images/leaderboard/LiveLeaderboard_image.png';
        image.alt = 'Live Leaderboard';
        image.style.cssText = `
            max-width: 100%;
            height: auto;
            margin-bottom: 10px;
        `;
        image.onerror = () => {
            // Fallback if image doesn't load
            const title = document.createElement('h2');
            title.textContent = 'LIVE LEADERBOARD';
            title.style.cssText = `
                color: #4CAF50;
                font-size: 32px;
                margin: 0;
                text-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
            `;
            header.appendChild(title);
        };

        header.appendChild(image);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(244, 67, 54, 0.8);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(244, 67, 54, 1)';
            closeBtn.style.transform = 'scale(1.1)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'rgba(244, 67, 54, 0.8)';
            closeBtn.style.transform = 'scale(1)';
        };
        closeBtn.onclick = () => this.hide();

        container.appendChild(closeBtn);
        container.appendChild(header);

        // Leaderboard table
        const table = document.createElement('table');
        table.id = 'leaderboard-table';
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            color: #fff;
        `;

        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.cssText = `
            background: rgba(76, 175, 80, 0.3);
            border-bottom: 2px solid rgba(76, 175, 80, 0.5);
        `;

        const headers = ['Rank', 'Player', 'Score', 'Kills', 'Deaths', 'K/D'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.cssText = `
                padding: 12px;
                text-align: left;
                color: #4CAF50;
                font-weight: bold;
            `;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        tbody.id = 'leaderboard-body';
        table.appendChild(tbody);

        container.appendChild(table);

        // Update timestamp
        const timestamp = document.createElement('div');
        timestamp.id = 'leaderboard-timestamp';
        timestamp.style.cssText = `
            text-align: center;
            color: #888;
            font-size: 12px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        `;
        container.appendChild(timestamp);

        document.body.appendChild(container);
        this.container = container;
        this.tbody = tbody;
        this.timestamp = timestamp;
    }

    update() {
        if (!this.isVisible) return;

        const data = this.leaderboard.getLeaderboardData();
        
        // Clear existing rows
        this.tbody.innerHTML = '';

        if (data.players.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No players yet. Be the first!';
            cell.style.cssText = `
                text-align: center;
                padding: 30px;
                color: #888;
            `;
            row.appendChild(cell);
            this.tbody.appendChild(row);
        } else {
            // Add player rows
            data.players.forEach((player, index) => {
                const row = document.createElement('tr');
                row.style.cssText = `
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    transition: background 0.2s ease;
                `;
                row.onmouseover = () => {
                    row.style.background = 'rgba(76, 175, 80, 0.2)';
                };
                row.onmouseout = () => {
                    row.style.background = 'transparent';
                };

                // Rank with medal emoji for top 3
                const rankCell = document.createElement('td');
                let rankText = player.rank;
                if (player.rank === 1) rankText = '🥇 ' + rankText;
                else if (player.rank === 2) rankText = '🥈 ' + rankText;
                else if (player.rank === 3) rankText = '🥉 ' + rankText;
                rankCell.textContent = rankText;
                rankCell.style.cssText = `
                    padding: 10px 12px;
                    font-weight: ${player.rank <= 3 ? 'bold' : 'normal'};
                    color: ${player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : player.rank === 3 ? '#CD7F32' : '#fff'};
                `;

                // Player name
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                nameCell.style.cssText = 'padding: 10px 12px;';

                // Score
                const scoreCell = document.createElement('td');
                scoreCell.textContent = player.score.toLocaleString();
                scoreCell.style.cssText = `
                    padding: 10px 12px;
                    color: #4CAF50;
                    font-weight: bold;
                `;

                // Kills
                const killsCell = document.createElement('td');
                killsCell.textContent = player.kills;
                killsCell.style.cssText = 'padding: 10px 12px;';

                // Deaths
                const deathsCell = document.createElement('td');
                deathsCell.textContent = player.deaths;
                deathsCell.style.cssText = 'padding: 10px 12px;';

                // K/D Ratio
                const kdrCell = document.createElement('td');
                kdrCell.textContent = player.kdr;
                kdrCell.style.cssText = `
                    padding: 10px 12px;
                    color: ${parseFloat(player.kdr) >= 1 ? '#4CAF50' : '#f44336'};
                    font-weight: bold;
                `;

                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                row.appendChild(killsCell);
                row.appendChild(deathsCell);
                row.appendChild(kdrCell);
                this.tbody.appendChild(row);
            });
        }

        // Update timestamp
        const now = new Date();
        this.timestamp.textContent = `Last updated: ${now.toLocaleTimeString()} | Total players: ${data.totalPlayers}`;
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.update();
        
        // Auto-update every 5 seconds
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.updateTimer = setInterval(() => {
            if (this.isVisible) {
                this.update();
            }
        }, 5000);
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

