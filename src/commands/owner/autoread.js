const config = require('../../config');

module.exports = {
    name: 'autoread',
    description: 'Toggle automatic message read status',
    usage: '!autoread <on/off>',
    category: 'owner',
    aliases: ['read'],
    cooldown: 3,
    ownerOnly: true,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,

    async execute(sock, message, args, user) {
        try {
            const chatId = message.key.remoteJid;
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (args.length < 1) {
                const statusMsg = {
                    text: `╭━━━❰ 𝗔𝗨𝗧𝗢𝗥𝗘𝗔𝗗 𝗦𝗧𝗔𝗧𝗨𝗦 ❱━━━╮\n┃ Current: ${config.features.autoRead ? 'ON' : 'OFF'}\n┃ Usage: ${this.usage}\n╰━━━━━━━━━━━━━━━━━━━╯`,
                    quoted: message
                };

                if (quotedMsg) {
                    statusMsg.quoted = message;
                }

                await sock.sendMessage(chatId, statusMsg);
                return;
            }

            const mode = args[0].toLowerCase();

            if (mode !== 'on' && mode !== 'off') {
                await sock.sendMessage(chatId, {
                    text: `❌ Invalid option! Use 'on' or 'off'`,
                    quoted: message
                });
                return;
            }

            config.features.autoRead = mode === 'on';

            const response = {
                text: `╭━━━❰ 𝗔𝗨𝗧𝗢𝗥𝗘𝗔𝗗 𝗨𝗣𝗗𝗔𝗧𝗘𝗗 ❱━━━╮\n┃ Status: ${mode.toUpperCase()}\n┃ Action: ${mode === 'on' ? 'Messages will be marked as read' : 'Messages will stay unread'}\n╰━━━━━━━━━━━━━━━━━━━╯`
            };

            if (quotedMsg) {
                response.quoted = message;
            }

            await sock.sendMessage(chatId, response);

        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ An error occurred while updating autoread settings.',
                quoted: message
            });
        }
    }
};