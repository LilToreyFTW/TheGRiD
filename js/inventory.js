// ADDED - Complete Inventory System
export class InventorySystem {
    constructor() {
        this.items = new Map();
        this.maxSlots = 50;
        this.loadInventory();
    }

    addItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        this.items.set(itemId, current + quantity);
        this.saveInventory();
        return true;
    }

    removeItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        if (current < quantity) return false;
        
        const newQuantity = current - quantity;
        if (newQuantity <= 0) {
            this.items.delete(itemId);
        } else {
            this.items.set(itemId, newQuantity);
        }
        this.saveInventory();
        return true;
    }

    hasItem(itemId, quantity = 1) {
        return (this.items.get(itemId) || 0) >= quantity;
    }

    getItemCount(itemId) {
        return this.items.get(itemId) || 0;
    }

    getAllItems() {
        return Array.from(this.items.entries()).map(([id, quantity]) => ({
            id,
            quantity,
            name: this.getItemName(id)
        }));
    }

    getItemName(itemId) {
        const names = {
            'collectible': 'Energy Crystal',
            'health_pack': 'Health Pack',
            'speed_boost': 'Speed Boost',
            'weapon_basic': 'Basic Weapon',
            'planet_key': 'Planet Access Key'
        };
        return names[itemId] || itemId;
    }

    getTotalItems() {
        return Array.from(this.items.values()).reduce((sum, qty) => sum + qty, 0);
    }

    isFull() {
        return this.getTotalItems() >= this.maxSlots;
    }

    clear() {
        this.items.clear();
        this.saveInventory();
    }

    saveInventory() {
        try {
            const data = Array.from(this.items.entries());
            localStorage.setItem('grid_inventory', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save inventory:', error);
        }
    }

    loadInventory() {
        try {
            const data = localStorage.getItem('grid_inventory');
            if (data) {
                const items = JSON.parse(data);
                this.items = new Map(items);
            }
        } catch (error) {
            console.warn('Failed to load inventory:', error);
        }
    }
}

