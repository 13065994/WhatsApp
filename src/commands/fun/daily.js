const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');
const { fancy } = require('../../utils/fancytext');

module.exports = {
    name: 'daily',
    aliases: ['claim'],
    category: 'economy',
    description: 'Claim daily rewards',
    usage: 'daily',
    cooldown: 86400,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const now = Date.now();
        
        try {
            if (user.lastDaily && now - user.lastDaily < 86400000) {
                const timeLeft = 86400000 - (now - user.lastDaily);
                const hours = Math.floor(timeLeft / 3600000);
                const minutes = Math.floor((timeLeft % 3600000) / 60000);
                
                await sock.sendMessage(chatId, {
                    text: fancy(`⏰ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙬𝙖𝙞𝙩 ${hours}h ${minutes}m 𝙛𝙤𝙧 𝙣𝙚𝙭𝙩 𝙧𝙚𝙬𝙖𝙧𝙙!`),
                }, { quoted: message });
                return;
            }

            const coins = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
            const streakBonus = (user.dailyStreak || 0) * 50;
            const totalCoins = coins + streakBonus;

            await user.updateOne({
                $inc: {
                    coins: totalCoins,
                    dailyStreak: 1,
                    'statistics.dailyClaims': 1
                },
                lastDaily: now
            });

            const responseText = `
🎁 𝐃𝐚𝐢𝐥𝐲 𝐑𝐞𝐰𝐚𝐫𝐝𝐬!
━━━━━━━━━━━━━
⭐ 𝙍𝙚𝙬𝙖𝙧𝙙: ${coins} 𝙘𝙤𝙞𝙣𝙨
📈 𝙎𝙩𝙧𝙚𝙖𝙠: ${user.dailyStreak + 1} 𝙙𝙖𝙮𝙨
🎯 𝘽𝙤𝙣𝙪𝙨: ${streakBonus} 𝙘𝙤𝙞𝙣𝙨
💰 𝙏𝙤𝙩𝙖𝙡: ${totalCoins} 𝙘𝙤𝙞𝙣𝙨
━━━━━━━━━━━━━
🏦 𝘽𝙖𝙡𝙖𝙣𝙘𝙚: ${user.coins + totalCoins} 𝙘𝙤𝙞𝙣𝙨`;

            await sock.sendMessage(chatId, {
                text: fancy(responseText),
            }, { quoted: message });

        } catch (error) {
            logger.error(`Error in daily command:`, error);
            await sock.sendMessage(chatId, {
                text: fancy('❌ 𝘼𝙣 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙!'),
            }, { quoted: message });
        }
    }
};