const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');

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
                    text: `⏰ Please wait ${hours}h ${minutes}m for next reward!`,
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
🎁 DAILY REWARDS!
━━━━━━━━━━━━━
⭐ Reward: ${coins} coins
📈 Streak: ${user.dailyStreak + 1} days
🎯 Bonus: ${streakBonus} coins
💰 Total: ${totalCoins} coins
━━━━━━━━━━━━━
🏦 Balance: ${user.coins + totalCoins} coins`;

            await sock.sendMessage(chatId, {
                text: responseText,
            }, { quoted: message });

        } catch (error) {
            logger.error(`Error in daily command:`, error);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred!',
            }, { quoted: message });
        }
    }
};