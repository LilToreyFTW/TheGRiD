// ADDED - Cash System
export class CashSystem {
    constructor(gameApp) {
        this.gameApp = gameApp;
        this.cash = 0;
        this.loadCash();
    }

    loadCash() {
        const saved = localStorage.getItem('grid_cash');
        this.cash = saved ? parseInt(saved) : 0;
    }

    saveCash() {
        localStorage.setItem('grid_cash', this.cash.toString());
    }

    getCash() {
        return this.cash;
    }

    addCash(amount) {
        this.cash += amount;
        this.saveCash();
        this.updateUI();
    }

    removeCash(amount) {
        if (this.cash >= amount) {
            this.cash -= amount;
            this.saveCash();
            this.updateUI();
            return true;
        }
        return false;
    }

    setCash(amount) {
        this.cash = amount;
        this.saveCash();
        this.updateUI();
    }

    updateUI() {
        const cashElement = document.getElementById('cash-value');
        if (cashElement) {
            cashElement.textContent = this.cash.toLocaleString();
        }
    }
}

