const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'changegroupdp',
    aliases: ['setgroupicon', 'groupdp'],
    category: 'admin',
    description: 'Change group display picture',
    usage: 'Reply to an image with .changegroupdp',
    
    cooldown: 10,
    ownerOnly: false,
    groupOnly: true,
    privateOnly: false,
    adminOnly: true,
    botAdminRequired: false,
    
    maintainState: false,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const botId = sock.user.id.replace(/:.+@/, '@');
            const isBotAdmin = groupMetadata.participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Bot must be an admin to change group icon!',
                }, { quoted: message });
                return;
            }

            if (!quotedMsg || !quotedMsg.imageMessage) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please reply to an image!',
                }, { quoted: message });
                return;
            }

            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await sock.updateProfilePicture(chatId, buffer);

            await sock.sendMessage(chatId, {
                text: '✅ Group icon updated successfully!',
            }, { quoted: message });

            await user.updateOne({
                $inc: { 'statistics.commandUsage': 1 }
            });

        } catch (error) {
            logger.error(`Error in changegroupdp command:`, error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to update group icon.',
            }, { quoted: message });
        }
    }
};