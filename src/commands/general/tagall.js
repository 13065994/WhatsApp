module.exports = {
    name: 'tagall',
    description: 'Tag all members in the group chat.',
    usage: '!tagall <message>',
    category: 'utility',
    aliases: ['everyone'],
    cooldown: 10,
    adminOnly: true, 
    ownerOnly: false,
    async execute(sock, message, args) {
        if (!message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ This command can only be used in group chats.',
                contextInfo: {
                    mentionedJid: [],
                    externalAdReply: {
                        title: 'NexusCoders Bot',
                        body: 'Group Tagging System',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://tiny.one/yc7hskys'
                    }
                }
            });
            return;
        }

        let groupMetadata;
        try {
            groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        } catch (err) {
            await sock.sendMessage(message.key.remoteJid, { 
                text: '⚠️ Unable to fetch group participants. Please try again later.',
                contextInfo: {
                    mentionedJid: [],
                    externalAdReply: {
                        title: 'NexusCoders Bot',
                        body: 'Error in Group Tagging',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://i.imgur.com/your-nexus-logo.png'
                    }
                }
            });
            return;
        }

        const participants = groupMetadata.participants;
        const messageText = args.length > 0 ? args.join(' ') : '📢 Hello everyone! 🌟';
        
        const formattedParticipants = participants.map((p, index) => 
            `${index + 1}. @${p.id.split('@')[0]}`
        );

        const mentions = participants.map(p => p.id);

        await sock.sendMessage(message.key.remoteJid, {
            text: `${messageText}\n\n*Group Members:*\n${formattedParticipants.join('\n')}`,
            mentions: mentions,
            contextInfo: {
                mentionedJid: mentions,
                externalAdReply: {
                    title: 'NexusCoders Bot',
                    body: 'Group Tagging Complete',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: 'https://tiny.one/yc7hskys'
                }
            }
        });
    }
};
