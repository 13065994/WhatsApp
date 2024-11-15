const os = require('os');

module.exports = {
    name: 'info',
    description: 'Show bot information',
    usage: '!info',
    category: 'general',
    
    async execute(sock, msg) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const formatBytes = (bytes) => {
            const sizes = ['B', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 B';
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };

        const info = `╔═══ *BOT INFO* ═══╗
║ 
║ Name: NexusCoders Bot
║ Version: 1.0.0
║ Language: JavaScript
║ Runtime: Node.js
║ Library: Baileys
║ 
╠═══ *SYSTEM INFO* ═══╣
║ 
║ Platform: ${os.platform()}
║ Arch: ${os.arch()}
║ CPU: ${os.cpus()[0].model}
║ RAM: ${formatBytes(os.totalmem())}
║ Free RAM: ${formatBytes(os.freemem())}
║ Uptime: ${hours}h ${minutes}m ${seconds}s
║ 
╠═══ *STATISTICS* ═══╣
║ 
║ Commands: ${sock.commands?.size || 0}
║ Groups: ${Object.keys(await sock.groupFetchAllParticipating()).length}
║ 
╚══════════════════╝`;

        await sock.sendMessage(msg.key.remoteJid, { 
   text: info 
 }, { quoted: message });
    }
};
