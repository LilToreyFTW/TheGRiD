// ADDED - Achievement Notification UI
export class AchievementNotification {
    constructor() {
        this.container = null;
        this.queue = [];
        this.isShowing = false;
        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.id = 'achievement-notification';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: -400px;
            width: 350px;
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #00ffff;
            padding: 20px;
            z-index: 10003;
            transition: right 0.5s ease;
            font-family: 'Orbitron', monospace;
            box-shadow: 0 0 30px #00ffff;
        `;

        const icon = document.createElement('div');
        icon.id = 'achievement-icon';
        icon.style.cssText = `
            font-size: 48px;
            text-align: center;
            margin-bottom: 10px;
        `;

        const title = document.createElement('div');
        title.id = 'achievement-title';
        title.style.cssText = `
            color: #00ffff;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            text-shadow: 0 0 10px #00ffff;
        `;

        const desc = document.createElement('div');
        desc.id = 'achievement-desc';
        desc.style.cssText = `
            color: #fff;
            font-size: 14px;
            text-align: center;
            margin-bottom: 10px;
        `;

        const reward = document.createElement('div');
        reward.id = 'achievement-reward';
        reward.style.cssText = `
            color: #00ff00;
            font-size: 16px;
            text-align: center;
            font-weight: bold;
        `;

        container.appendChild(icon);
        container.appendChild(title);
        container.appendChild(desc);
        container.appendChild(reward);
        document.body.appendChild(container);
        this.container = container;
    }

    show(achievement) {
        if (this.isShowing) {
            this.queue.push(achievement);
            return;
        }

        this.isShowing = true;
        document.getElementById('achievement-icon').textContent = achievement.icon;
        document.getElementById('achievement-title').textContent = achievement.name;
        document.getElementById('achievement-desc').textContent = achievement.description;
        document.getElementById('achievement-reward').textContent = `+${achievement.reward} Points`;

        this.container.style.right = '20px';

        setTimeout(() => {
            this.hide();
        }, 4000);
    }

    hide() {
        this.container.style.right = '-400px';
        setTimeout(() => {
            this.isShowing = false;
            if (this.queue.length > 0) {
                this.show(this.queue.shift());
            }
        }, 500);
    }
}

