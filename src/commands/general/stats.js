const os = require('os');

module.exports = {
    name: 'stats',
    description: 'Show bot statistics',
    async execute({ sock, msg, sender }) {
        const User = require('../../models/user');
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        const users = await User.countDocuments();
        const bannedUsers = await User.countDocuments({ banned: true });
        
        const stats = `🤖 *Bot Statistics*
Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB
CPU: ${os.loadavg()[0].toFixed(2)}%
Platform: ${os.platform()}
Users: ${users}
Banned: ${bannedUsers}`;

        await sock.sendMessage(sender, {
     text: stats
 }, { quoted: message });
    }
};
