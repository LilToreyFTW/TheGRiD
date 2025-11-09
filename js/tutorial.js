// ADDED - Complete Tutorial/Help System
export class TutorialSystem {
    constructor() {
        this.tutorials = new Map();
        this.completedTutorials = new Set();
        this.currentTutorial = null;
        this.initializeTutorials();
        this.loadProgress();
    }

    initializeTutorials() {
        this.registerTutorial('movement', {
            title: 'Movement Basics',
            steps: [
                { text: 'Use WASD keys to move around', key: 'KeyW' },
                { text: 'Hold Shift to run faster', key: 'ShiftLeft' },
                { text: 'Press Space to jump', key: 'Space' },
                { text: 'Move your mouse to look around', action: 'mousemove' }
            ],
            completed: false
        });

        this.registerTutorial('collectibles', {
            title: 'Collecting Items',
            steps: [
                { text: 'Walk near glowing cyan spheres to collect them', action: 'collect' },
                { text: 'Each collectible gives you 10 points', action: 'collect' },
                { text: 'Collectibles also restore a bit of health', action: 'collect' }
            ],
            completed: false
        });

        this.registerTutorial('printer', {
            title: '3D Printer',
            steps: [
                { text: 'Find the HUB Tower in the world', action: 'location' },
                { text: 'Press P near the printer to access it', key: 'KeyP' },
                { text: 'Only the owner can use the printer', action: 'info' }
            ],
            completed: false
        });
    }

    registerTutorial(id, tutorial) {
        this.tutorials.set(id, {
            ...tutorial,
            id,
            currentStep: 0
        });
    }

    startTutorial(id) {
        const tutorial = this.tutorials.get(id);
        if (!tutorial || this.completedTutorials.has(id)) return;

        this.currentTutorial = tutorial;
        tutorial.currentStep = 0;
        this.showStep(tutorial);
    }

    showStep(tutorial) {
        if (tutorial.currentStep >= tutorial.steps.length) {
            this.completeTutorial(tutorial.id);
            return;
        }

        const step = tutorial.steps[tutorial.currentStep];
        this.showTutorialMessage(step.text);
    }

    nextStep() {
        if (!this.currentTutorial) return;

        this.currentTutorial.currentStep++;
        this.showStep(this.currentTutorial);
    }

    completeTutorial(id) {
        this.completedTutorials.add(id);
        this.currentTutorial = null;
        this.hideTutorialMessage();
        this.saveProgress();
    }

    showTutorialMessage(text) {
        let messageEl = document.getElementById('tutorial-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'tutorial-message';
            messageEl.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                border: 3px solid #00ffff;
                padding: 20px 40px;
                color: #00ffff;
                font-family: 'Orbitron', monospace;
                font-size: 18px;
                z-index: 10004;
                text-align: center;
                box-shadow: 0 0 30px #00ffff;
                max-width: 600px;
            `;
            document.body.appendChild(messageEl);
        }
        messageEl.textContent = text;
        messageEl.style.display = 'block';
    }

    hideTutorialMessage() {
        const messageEl = document.getElementById('tutorial-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('grid_tutorials', JSON.stringify(Array.from(this.completedTutorials)));
        } catch (error) {
            console.warn('Failed to save tutorial progress:', error);
        }
    }

    loadProgress() {
        try {
            const data = localStorage.getItem('grid_tutorials');
            if (data) {
                this.completedTutorials = new Set(JSON.parse(data));
            }
        } catch (error) {
            console.warn('Failed to load tutorial progress:', error);
        }
    }
}

