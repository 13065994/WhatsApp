const PastebinAPI = require('pastebin-js');

const fs = require('fs-extra');

const path = require('path');

const config = require('../../config');

module.exports = {

  name: 'pastebin',

  description: 'Upload files to pastebin and sends link',

  usage: [

    '!pastebin <filename.js>',

  ],

  category: 'utility',

  cooldown: 5,

  aliases: ['bin', 'paste'],

  ownerOnly: true,

  adminOnly: false,

  groupOnly: false,

  privateOnly: false,

  botAdminRequired: false,

  async execute(sock, message, args, user) {

    const pastebin = new PastebinAPI({

      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

      api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

    });

    if (args.length < 1) {

      return await sock.sendMessage(message.key.remoteJid, {

        text: 'Usage:\n' + this.usage.join('\n') + '\n🤔',

      }, { quoted: message });

    }

    const fileName = args[0];

    const folders = ['admin', 'fun', 'general', 'owner', 'utility'];

    // Validate filename

    if (!fileName.endsWith('.js')) {

      fileName += '.js';

    }

    const folderMessage = `Select folder:\n1. Admin\n2. Fun\n3. General\n4. Owner\n5. Utility`;

    await sock.sendMessage(message.key.remoteJid, {

      text: folderMessage,

    }, { quoted: message });

    // Store user's data and await reply

    user.replyCommandName = this.name;

    user.replyData = {

      step: 1,

      fileName: fileName,

      folders: folders,

    };

    await user.save();

  },

  async onReply(sock, message, user) {

    const chatId = message.key.remoteJid;

    const replyData = user.replyData;

    const replyText = message.message.conversation || message.message.extendedTextMessage?.text || '';

    const pastebin = new PastebinAPI({

      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

      api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

    });

    // Validate user's reply

    if (replyData.step === 1) {

      const folderSelection = parseInt(replyText);

      if (isNaN(folderSelection) || folderSelection < 1 || folderSelection > 5) {

        return await sock.sendMessage(chatId, {

          text: 'Invalid selection. Please reply with a number between 1 and 5.',

        }, { quoted: message });

      }

      // Map folder selection to folder name

      const selectedFolder = replyData.folders[folderSelection - 1];

      const fileName = replyData.fileName;

      const filePath = path.join(__dirname, `../../commands/${selectedFolder}`, fileName);

      // Check if file exists

      if (!fs.existsSync(filePath)) {

        return await sock.sendMessage(chatId, {

          text: `File not found: "${fileName}" 🔍`,

        }, { quoted: message });

      }

      // Upload file to Pastebin

      fs.readFile(filePath, 'utf8', async (err, data) => {

        if (err) throw err;

        const paste = await pastebin

          .createPaste({

            text: data,

            title: fileName,

            format: null,

            privacy: 1,

          })

          .catch((error) => {

            console.error(error);

          });

        const rawPaste = paste.replace('pastebin.com', 'pastebin.com/raw');

        await sock.sendMessage(chatId, {

          text: `File uploaded to Pastebin: ${rawPaste} ✅`,

        }, { quoted: message });

      });

      // Reset user's data

      user.replyCommandName = null;

      user.replyData = null;

      await user.save();

    }

  },

};