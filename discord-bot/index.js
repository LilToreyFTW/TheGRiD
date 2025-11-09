const GridDiscordBot = require('./bot.js');
require('dotenv').config();

// Start the bot
const bot = new GridDiscordBot();
bot.start().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.client.destroy();
    process.exit(0);
});

