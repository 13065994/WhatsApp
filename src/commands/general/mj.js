module.exports = {
    name: 'mj',
    description: 'Generate images using Flux API',
    usage: '!mj <prompt> --model <number>',
    category: 'gen',
    aliases: ['generate'],
    cooldown: 10,
    async execute(sock, message, args) {
        const axios = require('axios');
        
        if (!args.length) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: "Please provide a prompt."
            }, { quoted: message });
        }

        const prompt = args.join(" ");
        const modelMatch = prompt.match(/--model (\d+)/);
        const model = modelMatch ? modelMatch[1] : '1';

        try {
            const response = await axios({
                method: "get",
                url: `https://milanbhandari.onrender.com/flux`,
                params: {
                    inputs: prompt,
                    model,
                },
                responseType: 'arraybuffer'
            });

            await sock.sendMessage(message.key.remoteJid, {
                image: Buffer.from(response.data),
                caption: `Generated image for: ${prompt}`
            });
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "Failed to generate image."
            }, { quoted: message });
        }
    }
}
