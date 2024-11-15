module.exports = {
    name: 'profile',
    description: 'View user profile and stats',
    usage: '!profile [@user]',
    category: 'general',
    cooldown: 5,
    async execute(sock, message, args) {
        const User = require('../../models/user');
        
        let targetJid = args[0] ? args[0].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                               : message.key.participant || message.key.remoteJid;
        
        try {
            let user = await User.findOne({ jid: targetJid });
            
            if (!user) {
                user = await User.create({
                    jid: targetJid,
                    commands_used: 0,
                    last_seen: new Date(),
                    join_date: new Date()
                });
            }

            const profileText = `╭━━━━━━━━━━━━━━━━╮
┃    👤 *User Profile* 
┃━━━━━━━━━━━━━━━━
┃ 📋 *Name:* @${targetJid.split('@')[0]}
┃ 🔢 *Commands Used:* ${user.commands_used}
┃ 📅 *Joined:* ${user.join_date.toDateString()}
┃ ⌚ *Last Seen:* ${user.last_seen.toDateString()}
╰━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(message.key.remoteJid, {
                text: profileText,
                mentions: [targetJid]
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to fetch profile!'
            }, { quoted: message });
        }
    }
};
