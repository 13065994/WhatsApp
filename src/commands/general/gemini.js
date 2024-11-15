const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const User = require('../../models/user');
const fs = require('fs');
const { ImageAnnotatorClient } = require('@google-cloud/vision').v1;
const timeout = require('timeout');

const genAI = new GoogleGenerativeAI('AIzaSyAkq3h7r2VN_LKJxc01jK9jslW8zzhlkuM');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const visionClient = new ImageAnnotatorClient();
const BOT_NUMBER = ${config.bot.botNumber};

module.exports = {
  name: 'gemini',
  aliases: ['gog'],
  category: 'ai',
  description: 'Chat with Gemini AI',
  usage: 'gemini <query>',
  cooldown: 3,

  async execute(sock, message, args = [], user) {
    console.log('Gemini command executed');
    
    const jid = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (user.replyCommandName === this.name) {
      console.log('Cancelling previous conversation');
      user.replyCommandName = null;
      user.replyData = null;
      await user.save();
    }

    const query = (args.join(' ') || '').trim() || (quoted?.conversation || quoted?.extendedTextMessage?.text || '');

    if (!query) {
      console.log('No query provided');
      await sock.sendMessage(jid, { text: `Please provide a query` }, { quoted: message });
      user.replyCommandName = this.name;
      user.replyData = { step: 1, timestamp: Date.now() };
      await user.save();
      return;
    }

    try {
      if (quoted?.message?.imageMessage && query.toLowerCase() === 'what is in this image') {
        console.log('Analyzing image');
        const imageUrl = quoted.message.imageMessage.url;
        const imageName = imageUrl.split('/').pop();
        const imageBuffer = await fetchImage(imageUrl);
        const [result] = await visionClient.annotateImage({
          request: {
            image: { content: imageBuffer.toString('base64') },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10,
                model: 'builtin/latest',
              },
              {
                type: 'WEB_DETECTION',
                includeGeoResults: true,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                model: 'builtin/latest',
              },
            ],
          },
        });

        const labels = result.labelAnnotations.map((label) => label.description);
        const webDetection = result.webDetection;
        const response = `Image Analysis: Name: ${imageName} Labels: ${labels.join(', ')} Web Detection: ${webDetection.webEntities.map((entity) => entity.description).join(', ')} ${webDetection.visuallySimilarImages.map((image) => image.url).join(', ')}`;

        await sock.sendMessage(jid, { text: response }, { quoted: message });
      } else {
        console.log('Generating AI response');
        const result = await model.generateContent(query);
        const response = result.response.text();
        await sock.sendMessage(jid, { text: response }, { quoted: message });
        user.replyCommandName = this.name;
        user.replyData = { step: 2, timestamp: Date.now() };
        await user.save();
      }
    } catch (error) {
      console.error('Error:', error.message);
      await sock.sendMessage(jid, { text: `Error: ${error.message}` }, { quoted: message });
    }
  },

  async onReply(sock, message, user) {
    console.log('onReply triggered');
    
    const chatId = message.key.remoteJid;
    const replyText = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const quoted = message.message?.extendedTextMessage?.contextInfo;
    const quotedSender = quoted?.participant;
    const isImage = message.message?.imageMessage;
    
    console.log('Reply Text:', replyText);
    console.log('User Initiating Reply:', message.key.participant || message.key.remoteJid);
    console.log('Quoted Message Sender:', quotedSender);
    console.log('Expected Bot Number:', BOT_NUMBER);
    console.log('Is Image:', isImage);
    
    if (quotedSender === BOT_NUMBER) {
      try {
        const result = await model.generateContent(replyText);
        const response = result.response.text();
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
      } catch (error) {
        console.error('Error:', error.message);
        await sock.sendMessage(chatId, { text: `Error: ${error.message}` }, { quoted: message });
      }
      } else if (isImage && replyText.toLowerCase() === 'what is in this image') {
      try {
        const imageUrl = message.message.imageMessage.url;
        const imageBuffer = await fetchImage(imageUrl);
        const [result] = await visionClient.annotateImage({
          request: {
            image: { content: imageBuffer.toString('base64') },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10,
                model: 'builtin/latest',
              },
              {
                type: 'WEB_DETECTION',
                includeGeoResults: true,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                model: 'builtin/latest',
              },
            ],
          },
        });

        const labels = result.labelAnnotations.map((label) => label.description);
        const webDetection = result.webDetection;
        const response = `Image Analysis: Labels: ${labels.join(', ')} Web Detection: ${webDetection.webEntities.map((entity) => entity.description).join(', ')} ${webDetection.visuallySimilarImages.map((image) => image.url).join(', ')}`;

        await sock.sendMessage(chatId, { text: response }, { quoted: message });
      } catch (error) {
        console.error('Error:', error.message);
        await sock.sendMessage(chatId, { text: `Error: ${error.message}` }, { quoted: message });
      }
    }
  },
};

async function fetchImage(url) {
  console.log('Fetching image:', url);
  const response = await fetch(url);
  return await response.buffer();
}