// ADDED - GRiD Game Branding and Configuration
export const GRiDConfig = {
    gameName: "GRiD",
    version: "1.0.0",
    description: "A 3D Video Game featuring 10,000 unique moped bikes",
    
    // Game settings
    settings: {
        bikeCount: 10000,
        gridSize: 100,
        bikeSpacing: 2.0,
        maxSpeed: 3000,
        minSpeed: 1000
    },
    
    // Branding colors
    colors: {
        primary: "#4CAF50",
        secondary: "#2196F3",
        accent: "#FF9800",
        danger: "#f44336",
        background: "#000000"
    },
    
    // Game modes
    modes: {
        EXPLORATION: "exploration",
        RACE: "race",
        COLLECTION: "collection"
    },
    
    // Achievements
    achievements: {
        FIRST_BIKE: "First Bike Spotted",
        BIKE_COLLECTOR: "Bike Collector",
        SPEED_DEMON: "Speed Demon",
        GRID_EXPLORER: "Grid Explorer"
    }
};

// GRiD Logo Generator (for UI)
export class GRiDBranding {
    static createLogo() {
        return {
            text: "GRiD",
            style: {
                fontFamily: "Arial Black, sans-serif",
                fontSize: "64px",
                background: "linear-gradient(45deg, #4CAF50, #2196F3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(76, 175, 80, 0.5)"
            }
        };
    }
    
    static getSplashScreen() {
        return {
            title: "GRiD",
            subtitle: "10,000 Unique Moped Bikes",
            tagline: "Explore the Grid"
        };
    }
}

