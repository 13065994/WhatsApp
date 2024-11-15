const User = require('../../models/user');

module.exports = {
    name: 'ban',
    description: 'Ban a user from using the bot',
    usage: '!ban @user [reason]',
    category: 'admin',
    adminOnly: true,
    async execute(sock, message, args) {
        const mentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentions.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please mention a user to ban'
            }, { quoted: message });
            return;
        }

        const targetId = mentions[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        const user = await User.findOne({ jid: targetId });
        if (!user) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ User not found in database'
            }, { quoted: message });
            return;
        }

        if (user.isAdmin) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Cannot ban an admin'
            }, { quoted: message });
            return;
        }

        await user.ban();
        
        await sock.sendMessage(message.key.remoteJid, {
            text: `✅ Banned user @${targetId.split('@')[0]}\nReason: ${reason}`,
            mentions: [targetId]
        }, { quoted: message });

        try {
            await sock.sendMessage(targetId, {
                text: `You have been banned from using the bot.\nReason: ${reason}`
            }, { quoted: message });
        } catch (error) {}
    }
};
