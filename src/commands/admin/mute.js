module.exports = {
    name: 'mute',
    description: 'Mute the group',
    usage: '!mute',
    category: 'admin',
    adminOnly: true,
    async execute(sock, message, args) {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ This command can only be used in groups!'
            });
            return;
        }

        await sock.groupSettingUpdate(message.key.remoteJid, 'announcement');
        
        await sock.sendMessage(message.key.remoteJid, {
            text: '✅ Group has been muted. Only admins can send messages now.'
        });
    }
};