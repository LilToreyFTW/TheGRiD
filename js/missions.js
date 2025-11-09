// ADDED - Complete Mission/Quest System
export class MissionSystem {
    constructor() {
        this.missions = new Map();
        this.activeMissions = new Set();
        this.completedMissions = new Set();
        this.initializeMissions();
        this.loadProgress();
    }

    initializeMissions() {
        // Tutorial missions
        this.registerMission('tutorial_move', {
            name: 'Learn to Move',
            description: 'Use WASD keys to move around',
            objective: 'Move 10 meters',
            type: 'distance',
            target: 10,
            reward: 50,
            unlocked: true
        });

        this.registerMission('tutorial_collect', {
            name: 'First Collection',
            description: 'Collect your first item',
            objective: 'Collect 1 item',
            type: 'collect',
            target: 1,
            reward: 100,
            unlocked: true
        });

        // Exploration missions
        this.registerMission('explore_nexus', {
            name: 'Visit Nexus',
            description: 'Teleport to the Nexus planet',
            objective: 'Reach Nexus planet',
            type: 'planet',
            target: 'Nexus',
            reward: 200,
            unlocked: true
        });

        this.registerMission('explore_5_planets', {
            name: 'Planet Explorer',
            description: 'Visit 5 different planets',
            objective: 'Visit 5 planets',
            type: 'planets_visited',
            target: 5,
            reward: 500,
            unlocked: false
        });

        // Collection missions
        this.registerMission('collect_50', {
            name: 'Master Collector',
            description: 'Collect 50 items',
            objective: 'Collect 50 items',
            type: 'collect',
            target: 50,
            reward: 1000,
            unlocked: false
        });

        // Combat missions
        this.registerMission('defeat_enemies', {
            name: 'Combat Training',
            description: 'Defeat 10 enemies',
            objective: 'Defeat 10 enemies',
            type: 'enemies_killed',
            target: 10,
            reward: 1500,
            unlocked: false
        });

        // Score missions
        this.registerMission('score_1000', {
            name: 'High Scorer',
            description: 'Reach 1000 points',
            objective: 'Score 1000 points',
            type: 'score',
            target: 1000,
            reward: 800,
            unlocked: false
        });
    }

    registerMission(id, mission) {
        this.missions.set(id, {
            ...mission,
            id,
            progress: 0,
            completed: false,
            started: false
        });
    }

    startMission(id) {
        const mission = this.missions.get(id);
        if (!mission || mission.completed || !mission.unlocked) return false;

        mission.started = true;
        this.activeMissions.add(id);
        this.saveProgress();
        return true;
    }

    updateMission(id, progress) {
        const mission = this.missions.get(id);
        if (!mission || !mission.started || mission.completed) return false;

        mission.progress = progress;
        
        if (mission.progress >= mission.target) {
            this.completeMission(id);
            return true;
        }
        
        this.saveProgress();
        return false;
    }

    completeMission(id) {
        const mission = this.missions.get(id);
        if (!mission) return null;

        mission.completed = true;
        mission.progress = mission.target;
        this.activeMissions.delete(id);
        this.completedMissions.add(id);
        this.saveProgress();
        
        const result = {
            name: mission.name,
            reward: mission.reward
        };
        
        // ADDED - Trigger mission complete callback
        if (this.onMissionComplete) {
            this.onMissionComplete(result);
        }
        
        return result;
    }

    getActiveMissions() {
        return Array.from(this.activeMissions).map(id => this.missions.get(id));
    }

    getAvailableMissions() {
        return Array.from(this.missions.values()).filter(m => 
            !m.completed && m.unlocked && !m.started
        );
    }

    unlockMission(id) {
        const mission = this.missions.get(id);
        if (mission) {
            mission.unlocked = true;
            this.saveProgress();
        }
    }

    saveProgress() {
        try {
            const data = {
                missions: Array.from(this.missions.values()).map(m => ({
                    id: m.id,
                    progress: m.progress,
                    completed: m.completed,
                    started: m.started
                })),
                completed: Array.from(this.completedMissions),
                timestamp: Date.now()
            };
            localStorage.setItem('grid_missions', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save missions:', error);
        }
    }

    loadProgress() {
        try {
            const data = localStorage.getItem('grid_missions');
            if (data) {
                const parsed = JSON.parse(data);
                parsed.missions?.forEach(saved => {
                    const mission = this.missions.get(saved.id);
                    if (mission) {
                        mission.progress = saved.progress || 0;
                        mission.completed = saved.completed || false;
                        mission.started = saved.started || false;
                        
                        if (mission.started && !mission.completed) {
                            this.activeMissions.add(saved.id);
                        }
                        if (mission.completed) {
                            this.completedMissions.add(saved.id);
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load missions:', error);
        }
    }
}

