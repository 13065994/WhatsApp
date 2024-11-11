const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');
const axios = require('axios');

module.exports = {
    name: 'ip',
    aliases: ['iplookup', 'ipinfo'],
    category: 'utility',
    description: 'Get detailed information about an IP address',
    usage: 'ip <ip_address>',
    
    cooldown: 10,
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,
    
    maintainState: false,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        
        try {
            // Input validation
            if (args.length < 1) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ 𝙥𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙩𝙝𝙚 𝙄𝙥 𝙖𝙙𝙙𝙧𝙚𝙨𝙨!\nUsage: !ip <ip_address>',
                    quoted: message
                });
                return;
            }

            const ipAddress = args[0];
            
           
            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (!ipRegex.test(ipAddress)) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ 𝙏𝙝𝙚 𝙞𝙥 𝙖𝙙𝙙𝙧𝙚𝙨𝙨 𝙮𝙤𝙪 𝙝𝙖𝙫𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚𝙙 𝙨𝙚𝙚𝙢𝙨 𝙞𝙣𝙫𝙖𝙡𝙞𝙙 .',
                    quoted: message
                });
                return;
            }

            // Fetch IP information using ip-api.com (free API)
            const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
            const ipInfo = response.data;

            if (ipInfo.status === 'fail') {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to fetch IP information. Please try again with a valid IP.',
                    quoted: message
                });
                return;
            }

            // Format the response
            const infoMessage = ` *IP Information*\n\n` +
                `*IP Address:* ${ipAddress}\n` +
                `*Location:* ${ipInfo.city}, ${ipInfo.regionName}, ${ipInfo.country}\n` +
                `*Country Code:* ${ipInfo.countryCode}\n` +
                `*Timezone:* ${ipInfo.timezone}\n` +
                `*ISP:* ${ipInfo.isp}\n` +
                `*Organization:* ${ipInfo.org || 'N/A'}\n` +
                `*ASN:* ${ipInfo.as || 'N/A'}\n` +
                `*Coordinates:* ${ipInfo.lat}, ${ipInfo.lon}\n` +
                `*Is Proxy/VPN:* ${ipInfo.proxy ? 'Yes' : 'No'}\n` +
                `*Is Mobile:* ${ipInfo.mobile ? 'Yes' : 'No'}\n` +
                `*Is Hosting/Datacenter:* ${ipInfo.hosting ? 'Yes' : 'No'}\n\n` +
                `🌐 *Google Maps:* https://www.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}`;

            // Send response
            await sock.sendMessage(chatId, {
                text: infoMessage,
                quoted: message
            });

            // Update user statistics
            await user.updateOne({
                $inc: { 'statistics.commandUsage': 1 }
            });

        } catch (error) {
            logger.error(`Error in IP lookup command:`, error);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while fetching IP information. Please try again later.',
                quoted: message
            });
        }
    }
}
