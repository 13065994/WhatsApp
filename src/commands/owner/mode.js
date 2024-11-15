const config = require('../../config');

module.exports = {
    name: 'mode',
    description: 'Switch bot between public and private mode',
    usage: '!mode <public/private>',
    category: 'owner',
    aliases: ['botmode'],
    cooldown: 5,
    ownerOnly: true,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,

    async execute(sock, message, args, user) {
        try {
            const chatId = message.key.remoteJid;
            
            if (args.length < 1) {
                await sock.sendMessage(chatId, {
                    text: `Current mode: ${config.bot.publicMode ? 'Public' : 'Private'}\nUse: ${this.usage}`,
                    }, { quoted: message });
                return;
            }

            const mode = args[0].toLowerCase();

            if (mode !== 'public' && mode !== 'private') {
                await sock.sendMessage(chatId, {
                    text: `Invalid mode! Use 'public' or 'private'`,
                    }, { quoted: message });
                return;
            }

            config.bot.publicMode = mode === 'public';
            config.bot.privateMode = mode === 'private';

            const response = `✅ Bot mode updated:\n` +
                           `Mode: ${mode.toUpperCase()}\n` +
                           `Access: ${mode === 'public' ? 'All Users' : 'Owner Only'}`;

            await sock.sendMessage(chatId, {
                text: response,
                }, { quoted: message });

        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ An error occurred while changing bot mode.',
                }, { quoted: message });
        }
    }
}
