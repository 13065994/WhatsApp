module.exports = {
    name: 'quote',
    description: 'Get a random quote from a specific category',
    usage: '!quote <category>',
    category: 'general',
    cooldown: 5,
    async execute(sock, message, args) {
        const axios = require('axios');

        if (!args[0]) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: "Please provide a category. Here are the available categories: age, alone, amazing, anger, architecture, art, attitude, beauty, best, birthday, business, car, change, communications, computers, cool, courage, dad, dating, death, design, dreams, education, environmental, equality, experience, failure, faith, family, famous, fear, fitness"
            });
        }

        try {
            const category = args[0].toLowerCase();
            const response = await axios.get(`https://api.api-ninjas.com/v1/quotes?category=${category}`, {
                headers: {
                    'X-Api-Key': 'A4drPDSMtprpmTnd1bEJ0w==5NZP88tykb5fXsVL'
                }
            });

            if (response.data.length === 0) {
                return await sock.sendMessage(message.key.remoteJid, {
                    text: "No quotes found for this category. Please choose another one."
                });
            }

            const quote = response.data[0].quote;
            const author = response.data[0].author;
            const messageText = `${quote} - ${author}`;

            await sock.sendMessage(message.key.remoteJid, {
                text: messageText
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "An error occurred while fetching the quote."
            }, { quoted: message });
        }
    }
};
