const fetch = require('node-fetch'); // Ensure node-fetch is installed

module.exports = {
    name: 'pickup',
    description: 'Get a random pickup line.',
    usage: '!pickup',
    category: 'fun',
    aliases: ['pickupline'],
    cooldown: 5,
    ownerOnly: false,
    adminOnly: false,
    groupOnly: false,
    privateOnly: false,

    async execute(sock, message, args) {
        try {
            const response = await fetch('https://api-toxxictechinc.onrender.com/api/line?apikey=riasadmin');
            const data = await response.json();

            if (data && data.pickupline) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `*𝑯𝒆𝒓𝒆'𝒔 𝒂 𝑷𝒊𝒄𝒌𝒖𝒑 𝑳𝒊𝒏𝒆 𝒇𝒐𝒓 𝒚𝒐𝒖*\n${data.pickupline}\n\n> ❣️💟🌟❣️*`,
                    }, { quoted: message });
            } else {
                // Handle if no pickup line is returned
                await sock.sendMessage(message.key.remoteJid, {
                    text: 'Sorry, I couldn’t fetch a pickup line right now.',
                    }, { quoted: message });
            }
        } catch (error) {
            console.error(error);
            await sock.sendMessage(message.key.remoteJid, {
                text: 'An error occurred while fetching a pickup line.',
                }, { quoted: message });
        }
    }
}
