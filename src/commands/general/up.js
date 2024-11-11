module.exports = {

  name: 'up',

  description: 'Displays bot uptime',

  usage: '!uptime',

  category: 'info',

  cooldown: 5,

  aliases: ["uptime", "u"],

  async execute(sock, message, args) {

    const uptime = process.uptime();

    const hours = Math.floor(uptime / 3600);

    const minutes = Math.floor((uptime % 3600) / 60);

    const seconds = Math.floor(uptime % 60);

    const uptimeMessage = `┃🕛Bot uptime: ${hours} hours\n ┃🕰️${minutes} minutes\n ┃⏰${seconds} seconds`;

    await sock.sendMessage(message.key.remoteJid, {
        text: `╭━━━━━━━━━━━━╮\n ${uptimeMessage} \n╰━━━━━━━━━━━━╯`,

}, { quoted: message });

  }

}
