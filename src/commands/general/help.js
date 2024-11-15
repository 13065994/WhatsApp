module.exports = {
    name: 'help',
    description: 'Display all available commands',
    usage: '!help [command]',
    category: 'general',
    async execute(sock, message, args) {
        try {
            const { getCommands } = require('../../handlers/commandHandler');
            const config = require('../../config');
            
            const commands = getCommands();
            const categories = {};
            
            commands.forEach(cmd => {
                if (!categories[cmd.category]) {
                    categories[cmd.category] = [];
                }
                categories[cmd.category].push(cmd);
            });

            const botImage = {
                url: 'https://tiny.one/32ycxnt3'
            };

            if (args.length === 0) {
                const sections = [];
                let cmdCount = 0;

                const categoryEmojis = {
                    general: '🔰',
                    admin: '👑',
                    owner: '💎',
                    fun: '🎮',
                    utility: '🛠️',
                    game: '🎲',
                    music: '🎵',
                    economy: '💰',
                    moderation: '🛡️'
                };

                for (const [category, cmds] of Object.entries(categories)) {
                    const rows = cmds.map(cmd => ({
                        title: `${config.prefix}${cmd.name}`,
                        description: cmd.description,
                        rowId: `${config.prefix}help ${cmd.name}`
                    }));
                    cmdCount += cmds.length;

                    sections.push({
                        title: `${categoryEmojis[category.toLowerCase()] || '📁'} ${category.toUpperCase()}`,
                        rows: rows
                    });
                }

                const listMessage = {
                    image: botImage,
                    caption: `╭━━━━━━━━━━━━━━━━╮
┃    🤖 *${config.botName}* 
┃━━━━━━━━━━━━━━━━
┃ 👋 *Welcome,* @${message.key.participant?.split('@')[0] || message.key.remoteJid?.split('@')[0]}!
┃━━━━━━━━━━━━━━━━
┃ 📚 Total Commands: ${cmdCount}
┃ 🔧 Prefix: ${config.bot.prefix}
┃ 👑 Owner: ${config.bot.ownerName}
┃ ⌚ Time: ${new Date().toLocaleTimeString()}
┃━━━━━━━━━━━━━━━━
┃ Select a category below
┃ to view available commands
╰━━━━━━━━━━━━━━━━╯`,
                    footer: `© ${new Date().getFullYear()} ${config.bot.ownerName} | Powered by NexusCoders`,
                    mentions: [message.key.participant || message.key.remoteJid],
                    buttonText: "📖 Command List",
                    sections,
                    listType: 1
                };

                await sock.sendMessage(message.key.remoteJid, listMessage);
            } else {
                const commandName = args[0].toLowerCase();
                const command = commands.find(cmd => cmd.name === commandName);
                
                if (!command) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: `❌ Command "${commandName}" not found.`
                    });
                    return;
                }

                const helpText = `╭━━━━━━━━━━━━━━━━╮
┃    📖 *Command Info* 
┃━━━━━━━━━━━━━━━━
┃ 🔧 *Command:* ${command.name}
┃ 📝 *Description:* 
┃    ${command.description}
┃ 💡 *Usage:* 
┃    ${command.usage}
┃ 📁 *Category:* ${command.category}
${command.aliases ? `┃ 🔄 *Aliases:* ${command.aliases.join(', ')}\n` : ''}${command.cooldown ? `┃ ⏰ *Cooldown:* ${command.cooldown}s\n` : ''}${command.adminOnly ? '┃ 👑 *Admin Only:* Yes\n' : ''}${command.ownerOnly ? '┃ 💎 *Owner Only:* Yes\n' : ''}╰━━━━━━━━━━━━━━━━╯`;

                await sock.sendMessage(message.key.remoteJid, {
                    image: botImage,
                    caption: helpText
                }, { quoted: message });
            }
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, { 
                text: "Error loading menu\n" + error
            }, { quoted: message });
        }
    }
};
