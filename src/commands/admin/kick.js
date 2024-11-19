const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    name: 'kick',
    aliases: ['remove'],
    category: 'admin',
    description: 'Kick a user from the group',
    usage: 'kick @user or reply to message',
    cooldown: 5,
    ownerOnly: false,
    groupOnly: true,
    privateOnly: false,
    adminOnly: true,
    botAdminRequired: false,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        try {
            const metadata = await sock.groupMetadata(chatId).catch(e => {});
            if (!metadata) {
                await sock.sendMessage(chatId, { text: '❌ Failed to fetch group metadata!' }, { quoted: message });
                return;
            }

            const participants = metadata.participants || [];
            const superAdmin = participants.find(p => p.admin === 'superadmin')?.id;
            const botParticipant = participants.find(p => p.id === botNumber);
            const senderParticipant = participants.find(p => p.id === sender);

            if (!botParticipant || botParticipant.admin !== 'admin') {
                await sock.sendMessage(chatId, { text: '❌ Bot must be admin to kick users!' }, { quoted: message });
                return;
            }

            if (!senderParticipant || (senderParticipant.admin !== 'admin' && sender !== superAdmin && !config.ownerNumber.includes(sender.split('@')[0]))) {
                await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' }, { quoted: message });
                return;
            }

            let targetUser;
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (quoted?.participant) {
                targetUser = quoted.participant;
            } else if (mentioned?.length > 0) {
                targetUser = mentioned[0];
            } else {
                await sock.sendMessage(chatId, { text: '⚠️ Reply to user message or mention @user to kick' }, { quoted: message });
                return;
            }

            const targetParticipant = participants.find(p => p.id === targetUser);
            
            if (!targetParticipant) {
                await sock.sendMessage(chatId, { text: '❌ User is not in this group!' }, { quoted: message });
                return;
            }

            if (targetParticipant.admin === 'superadmin') {
                await sock.sendMessage(chatId, { text: '❌ Cannot kick the super admin!' }, { quoted: message });
                return;
            }

            if (targetParticipant.admin === 'admin' && sender !== superAdmin) {
                await sock.sendMessage(chatId, { text: '❌ Only super admin can kick other admins!' }, { quoted: message });
                return;
            }

            await sock.groupParticipantsUpdate(chatId, [targetUser], 'remove');
            
            const kickMsg = `✅ @${targetUser.split('@')[0]} has been kicked from the group.`;
            await sock.sendMessage(chatId, { 
                text: kickMsg,
                mentions: [targetUser]
            }, { quoted: message });

        } catch (error) {
            logger.error(`Error in kick command:`, error);
            await sock.sendMessage(chatId, { text: '❌ Failed to kick user!' }, { quoted: message });
        }
    }
};