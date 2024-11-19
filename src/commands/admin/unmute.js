module.exports = {
    name: 'unmute',
    description: 'Unmute the group',
    usage: '!unmute',
    category: 'admin',
    adminOnly: true,
    async execute(sock, message, args) {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ This command can only be used in groups!'
            });
            return;
        }

        await sock.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
        
        await sock.sendMessage(message.key.remoteJid, {
            text: '✅ Group has been unmuted. All participants can send messages now.'
        });
    }
};