const axios = require('axios');

module.exports = {
    name: 'ai',
    description: 'Chat with AI using Gemini',
    usage: '!ai <message>',
    category: 'AI',
    cooldown: 5,
    aliases: ['ask', 'bot'],
    async execute(sock, message, args) {
        if (!args.length) {
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ Please provide a question or message for the AI',
                }, { quoted: message });
            return;
        }

        const thinking = await sock.sendMessage(message.key.remoteJid, { 
            text: '🤖 Thinking...',
            }, { quoted: message });

        try {
            const prompt = args.join(' ');
            const encodedPrompt = encodeURIComponent(prompt);
            const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);

            if (response.data && response.data.answer) {
                const aiResponse = `🤖 *AI Response:*\n\n${response.data.answer}`;

                await sock.sendMessage(message.key.remoteJid, {
                    text: aiResponse,
                    edit: thinking.key
                });
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ An error occurred while processing your request. Please try again later.',
                edit: thinking.key
            });
        }
    }
};
