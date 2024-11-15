const logger = require('../../utils/logger');

module.exports = {
    name: 'unsend',
    aliases: ['uns', '😆'],
    category: 'utility',
    description: 'Unsend a message sent by the bot',
    usage: 'unsend <reply to bot message>',
    cooldown: 3,
    maintainState: false,

    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;

        if (!quotedMsg || !quotedMsg.participant) {
            await sock.sendMessage(chatId, {
                text: '❌ Please reply to a message you want me to unsend.',
                }, { quoted: message });
            return;
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        if (quotedMsg.participant !== botNumber) {
            await sock.sendMessage(chatId, {
                text: '❌ I can only unsend my own messages.',
                }, { quoted: message });
            return;
        }

        try {
            await sock.sendMessage(chatId, { 
                delete: {
                    remoteJid: chatId,
                    fromMe: true,
                    id: quotedMsg.stanzaId,
                    participant: quotedMsg.participant
                }
            });
            
            await sock.sendMessage(chatId, {
                text: '✅ Message deleted successfully.',
                }, { quoted: message }).then(async (sentMsg) => {
                setTimeout(async () => {
                    await sock.sendMessage(chatId, { 
                        delete: {
                            remoteJid: chatId,
                            fromMe: true,
                            id: sentMsg.key.id,
                            participant: botNumber
                        }
                    });
                }, 3000);
            });
        } catch (error) {
            logger.error('Error in unsend command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to delete the message. Make sure it\'s not too old.',
                }, { quoted: message });
        }
    },

    async onReply(sock, message, user) {
        await this.execute(sock, message, [], user);
    }
}
