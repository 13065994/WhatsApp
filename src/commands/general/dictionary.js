
module.exports = {
    name: 'dictionary',
    description: 'Look up word definitions',
    usage: '!dictionary <word>',
    category: 'utility',
    aliases: ['define', 'dict'],
    cooldown: 5,
    async execute(sock, message, args) {
        const axios = require('axios');
        
        if (!args.length) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: "Please provide a word to look up."
            }, { quoted: message });
        }

        const word = args[0];

        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = response.data[0];

            let definition = `📚 *${word.toUpperCase()}*\n\n`;
            
            data.meanings.forEach((meaning, index) => {
                definition += `${index + 1}. (${meaning.partOfSpeech})\n`;
                meaning.definitions.slice(0, 2).forEach((def, i) => {
                    definition += `   ${i + 1}. ${def.definition}\n`;
                    if (def.example) {
                        definition += `      Example: "${def.example}"\n`;
                    }
                });
                definition += '\n';
            });

            await sock.sendMessage(message.key.remoteJid, {
                text: definition
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "Word not found or an error occurred."
            }, { quoted: message });
        }
    }
}
