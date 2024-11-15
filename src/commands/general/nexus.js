module.exports = {
    name: 'nexus',
    description: 'Get information about NexusCoders',
    usage: '!nexus',
    category: 'general',
    async execute(sock, message, args) {
        const nexusInfo = `╭━━━❰ *NEXUSCODERS INFO* ❱━━━┈ ⊷
┃ 
┃ *🌟 About Us*
┃ NexusCoders is a team of dedicated
┃ developers creating innovative
┃ solutions for WhatsApp automation.
┃ 
┃ *🤖 Our Services*
┃ • Custom WhatsApp Bots
┃ • Automation Solutions
┃ • Technical Support
┃ • Development Training
┃ 
┃ *🔗 Connect With Us*
┃ • WhatsApp Channel
┃ • Support Group
┃ • GitHub Projects
┃ 
┃ *🚀 Join Our Community*
┃ Be part of our growing developer
┃ community and stay updated with
┃ latest features and updates!
╰━━━━━━━━━━━━━━┈ ⊷`;

        const buttons = [
            {
                buttonId: 'join_channel',
                buttonText: { displayText: '🌟 Join Channel' },
                type: 1
            }
        ];

        await sock.sendMessage(message.key.remoteJid, {
            image: { url: 'https://tiny.one/32ycxnt3' },
            caption: nexusInfo,
            footer: '© NexusCoders Team',
            buttons: buttons,
        }, { quoted: message });
    }
};
