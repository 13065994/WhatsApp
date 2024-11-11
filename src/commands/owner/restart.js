const config = require('../../config');

module.exports = {
  name: 'restart',
  description: 'Restart the bot',
  usage: '!restart',
  category: 'owner',
  cooldown: 3,

  ownerOnly: true,

  adminOnly: false,

  groupOnly: false,

  privateOnly: false,

  botAdminRequired: false,
  async execute(sock, message, args) {
    
    await sock.sendMessage(message.key.remoteJid, {
      text: '♻️Restarting bot... check after 10mins',
      }, { quoted: message });
      
    const fs = require("fs-extra");
    const pathFile = `${__dirname}/tmp/restart.txt`;

    // Create tmp/restart.txt if it doesn't exist
    if (!fs.existsSync(pathFile)) {
      fs.writeFileSync(pathFile, '');
    }

    fs.writeFileSync(pathFile, `${message.key.remoteJid} ${Date.now()}`);

    setTimeout(() => {
      process.kill(process.pid, 'SIGTERM');
    }, 5000);
  },
}
