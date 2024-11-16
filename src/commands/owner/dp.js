const config = require('../../config');
const logger = require('../../utils/logger');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Readable } = require('stream');
const { Buffer } = require('buffer');

module.exports = {
  name: 'dp',
  description: 'Change bot\'s display picture by replying to an image',
  usage: 'Reply to an image with !dp',
  category: 'admin',
  aliases: ['displaypic', 'profilepic'],
  cooldown: 10,
  ownerOnly: true,
  groupOnly: false,
  privateOnly: false,
  adminOnly: false,
  botAdminRequired: false,

  async execute(sock, message, args, user) {
    try {
      const chatId = message.key.remoteJid;
      const quotedMessage = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quotedMessage) {
        await sock.sendMessage(chatId, { text: '❌ Please reply to an image with this command!' }, { quoted: message });
        return;
      }

      const imageMessage = quotedMessage.imageMessage;

      if (!imageMessage) {
        await sock.sendMessage(chatId, { text: '❌ Please reply to an image!'}, { quoted: message });
        return;
      }

      const stream = await downloadContentFromMessage(imageMessage, 'image');
      const buffer = await streamToBuffer(stream);

      await sock.updateProfilePicture(sock.user.id, buffer);
      await sock.sendMessage(chatId, { text: '✅ Successfully updated bot\'s display picture!'}, { quoted: message });
    } catch (error) {
      logger.error('Error in dp command:', error);
      await sock.sendMessage(message.key.remoteJid, { text: '❌ An error occurred while updating the display picture.' }, { quoted: message });
    }
  }
};

async function streamToBuffer(stream) {
  const chunks = [];
  const reader = Readable.from(stream);

  for await (const chunk of reader) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}