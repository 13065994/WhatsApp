const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');
const axios = require('axios');

module.exports = {
    name: 'truecaller',
    aliases: ['trace', 'findnumber', 'number'],
    category: 'utilities',
    description: 'Get information about a phone number using Truecaller API',
    usage: 'truecaller <phone_number>',
    
    cooldown: 10,
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,
    
    maintainState: false,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        try {
            let phoneNumber;
            
            if (args.length < 1 && !quotedMsg) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please provide a phone number or quote a message containing a phone number!',
                    quoted: message
                });
                return;
            }

            if (args.length >= 1) {
                phoneNumber = args[0].replace(/[+\s-]/g, '');
            } else if (quotedMsg) {
                const quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
                const numberMatch = quotedText.match(/\d+/);
                if (numberMatch) {
                    phoneNumber = numberMatch[0];
                }
            }

            if (!phoneNumber || phoneNumber.length < 10) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Invalid phone number format!',
                    quoted: message
                });
                return;
            }

            const response = await axios.get(`${config.truecallerApiUrl}/search`, {
                params: {
                    number: phoneNumber,
                    countryCode: 'IN'
                },
                headers: {
                    'Authorization': `Bearer ${config.truecallerApiKey}`
                }
            });

            const data = response.data;
            const numberInfo = `📱 *Number Details*\n\n` +
                             `📞 Number: ${data.phoneNumber}\n` +
                             `👤 Name: ${data.name || 'Not found'}\n` +
                             `🏢 Carrier: ${data.carrier || 'Unknown'}\n` +
                             `📍 Location: ${data.location || 'Unknown'}\n` +
                             `📝 Email: ${data.email || 'Not available'}\n` +
                             `🏷️ Tags: ${data.tags?.join(', ') || 'None'}\n` +
                             `⚠️ Spam: ${data.spamScore ? `${data.spamScore}%` : 'No data'}\n\n` +
                             `🔍 Last updated: ${new Date().toLocaleString()}`;

            await sock.sendMessage(chatId, {
                text: numberInfo,
                quoted: message
            });

            await user.updateOne({
                $inc: { 'statistics.commandUsage': 1 }
            });

        } catch (error) {
            logger.error('Error in truecaller command:', error);
            
            const errorMessage = error.response?.status === 404 
                ? '❌ No information found for this number.'
                : '❌ An error occurred while fetching number information.';
                
            await sock.sendMessage(chatId, {
                text: errorMessage,
                quoted: message
            });
        }
    }
}
