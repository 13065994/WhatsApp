module.exports = {
    name: 'pollinations',
    description: 'Generate images based on user prompts using Pollinations API',
    usage: '!pollinations <prompt>',
    category: 'media',
    aliases: ['poli'],
    cooldown: 0,
    async execute(sock, message, args) {
        const axios = require('axios');
        const fs = require('fs');
        
        try {
            const prompt = args.join(" ");
            if (!prompt) {
                return await sock.sendMessage(message.key.remoteJid, {
                    text: "Please add some prompts"
                }, { quoted: message });
            }

            const startTime = new Date().getTime();
            const baseURL = `https://c-v1.onrender.com/pollinations`;
            const params = {
                prompt: prompt,
                apikey: '$c-v1-7bejgsue6@iygv'
            };

            const response = await axios.get(baseURL, {
                params: params,
                responseType: 'stream'
            });

            const endTime = new Date().getTime();
            const timeTaken = (endTime - startTime) / 1000;

            const fileName = `emix_${Date.now()}.png`;
            const filePath = `/tmp/${fileName}`;
            
            const writerStream = fs.createWriteStream(filePath);
            response.data.pipe(writerStream);

            writerStream.on('finish', async function() {
                await sock.sendMessage(message.key.remoteJid, {
                    image: fs.readFileSync(filePath),
                    caption: `Here is your generated image\n\n📝 𝗽𝗿𝗼𝗺𝗽𝘁: ${prompt}\n👑 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken} seconds`
                }, { quoted: message });
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "An error occurred while generating the image."
            }, { quoted: message });
        }
    }
}
