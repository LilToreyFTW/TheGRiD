// ADDED - Job System
export class JobSystem {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.currentJob = null;
        this.jobsCompleted = [];
        this.jobsPerYear = 1;
        this.currentYear = new Date().getFullYear();
        this.jobsThisYear = 0;
        this.loadJobData();
    }

    loadJobData() {
        const saved = localStorage.getItem('grid_job_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.jobsCompleted = data.jobsCompleted || [];
            this.jobsThisYear = data.jobsThisYear || 0;
            this.currentYear = data.currentYear || new Date().getFullYear();
        }
    }

    saveJobData() {
        localStorage.setItem('grid_job_data', JSON.stringify({
            jobsCompleted: this.jobsCompleted,
            jobsThisYear: this.jobsThisYear,
            currentYear: this.currentYear
        }));
    }

    canTakeJob() {
        const currentYear = new Date().getFullYear();
        if (currentYear !== this.currentYear) {
            // New year, reset counter
            this.currentYear = currentYear;
            this.jobsThisYear = 0;
            this.saveJobData();
        }
        return this.jobsThisYear < this.jobsPerYear && !this.currentJob;
    }

    startJob(jobId, jobData) {
        if (!this.canTakeJob()) {
            return false;
        }

        this.currentJob = {
            id: jobId,
            ...jobData,
            startTime: Date.now()
        };
        this.saveJobData();
        return true;
    }

    completeJob() {
        if (!this.currentJob) {
            return false;
        }

        const reward = this.currentJob.reward || 0;
        if (this.gameApp.cashSystem) {
            this.gameApp.cashSystem.addCash(reward);
        }

        this.jobsCompleted.push(this.currentJob.id);
        this.jobsThisYear++;
        this.currentJob = null;
        this.saveJobData();

        return true;
    }

    getAvailableJobs() {
        // Return list of available jobs in the world
        return [
            { id: 'delivery', name: 'Package Delivery', reward: 5000, description: 'Deliver packages across the city' },
            { id: 'taxi', name: 'Taxi Driver', reward: 3000, description: 'Drive passengers to destinations' },
            { id: 'security', name: 'Security Guard', reward: 4000, description: 'Guard a building' },
            { id: 'mining', name: 'Mining', reward: 6000, description: 'Mine resources' },
            { id: 'farming', name: 'Farming', reward: 3500, description: 'Harvest crops' }
        ];
    }
}

