const axios = require('axios');

module.exports = {

  name: 'nexusai',

  description: 'Chat with AI using Gemini',

  usage: '!nexusai <message>',

  category: 'ai',

  cooldown: 5,

  aliases: ['nexusbot'],

  async execute(sock, message, args, user) {

    const quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

    const chatId = message.key.remoteJid;

    if (!args.length && !quotedMsg) {

      await sock.sendMessage(chatId, {

        text: 'Please provide a question or message for the AI',

        }, { quoted: message });

      return;

    }

    user.conversationStarted = true;

    await user.save();

    await this.processMessage(sock, message, args, user, quotedMsg);

  },

  async onReply(sock, message, user) {

    const quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

    const chatId = message.key.remoteJid;

    if (!user.conversationStarted || !quotedMsg) return;

    await this.processMessage(sock, message, [message.message.conversation], user, quotedMsg);

  },

  async processMessage(sock, message, args, user, quotedMsg) {

    const chatId = message.key.remoteJid;

    const systemPrompt = 'Your name is Nexus, you are created by a group of cool developers named Nexus coders';

    let userMessage;

    if (quotedMsg) {

      userMessage = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || args.join(' ');

    } else {

      userMessage = args.join(' ');

    }

    const thinking = await sock.sendMessage(chatId, {

      text: 'Thinking...',

      }, { quoted: message });

    try {

      const prompt = `${systemPrompt} ${userMessage}`;

      const encodedPrompt = encodeURIComponent(prompt);

      const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);

      if (response.data && response.data.answer) {

        const aiResponse = `꧁༺𝐍𝐞𝐱𝐮𝐬༻꧂\n${response.data.answer}`;

        await sock.sendMessage(chatId, {

          text: aiResponse,

          edit: thinking.key,

        });

      } else {

        throw new Error('Invalid response from AI');

      }

    } catch (error) {

      await sock.sendMessage(chatId, {

        text: 'An error occurred while processing your request. Please try again later.',

        edit: thinking.key,

      });

    }

  },

}
