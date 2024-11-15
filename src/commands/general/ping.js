module.exports = {
    name: 'ping',
    description: 'Check bot response time',
    usage: '!ping',
    category: 'general',
    async execute(sock, message, args) {
        const start = Date.now();
        
        const msg = await sock.sendMessage(message.key.remoteJid, {
            text: '🏓 Pinging...'
        }, { quoted: message });
        
        const latency = Date.now() - start;
        
        const deviceInfo = {
            os: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage()
        };

        const memoryUsage = Math.round(deviceInfo.memory.heapUsed / 1024 / 1024);
        const uptimeHours = Math.floor(deviceInfo.uptime / 3600);
        const uptimeMinutes = Math.floor((deviceInfo.uptime % 3600) / 60);

        await sock.sendMessage(message.key.remoteJid, {
            text: `🏓 Pong!\n\n` +
                  `📊 *Status Info*\n` +
                  `▢ Latency: ${latency}ms\n` +
                  `▢ Uptime: ${uptimeHours}h ${uptimeMinutes}m\n` +
                  `▢ Memory: ${memoryUsage}MB\n` +
                  `▢ OS: ${deviceInfo.os}\n` +
                  `▢ Node: ${deviceInfo.nodeVersion}`,
            edit: msg.key
        });
    }
};
