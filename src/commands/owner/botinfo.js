const { MessageType } = require('@whiskeysockets/baileys');
const os = require('os');
const si = require('systeminformation');
const config = require('../../config');
const logger = require('../../utils/logger');
const User = require('../../models/user');

const ownerNumber = Array.isArray(config.bot.ownerNumber) ? config.bot.ownerNumber : [config.bot.ownerNumber];

module.exports = {
  name: 'botinfo',
  aliases: ['bstats', 'binfo'],
  category: 'general',
  description: 'Display bot status information',
  usage: 'status',
  cooldown: 5,

  async execute(sock, message, args, user) {
    const chatId = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const start = Date.now();

    try {
      const uptime = formatUptime(process.uptime());
      const osInfo = getOSInfo();
      const cpuInfo = await getCPUInfo();
      const ramInfo = await getRAMInfo();
      const ping = Date.now() - start;

      const totalUsers = await User.countDocuments();

      const responseText = `\n━━━━━━━━━━━━━\n🕡Uptime: ${uptime}\n━━━━━━━━━━━━━\n💿OS: ${osInfo}🖥️\nCores: ${cpuInfo.cores}\n💾RAM Usage: ${ramInfo.used} MB💽\nTotal RAM: ${ramInfo.total} MB\nCurrent RAM: ${ramInfo.active} MB\n📍Ping: ${ping} ms\n👥Total Users: ${totalUsers}\n━━━━━━━━━━━━━🪩\nADMIN CONTACT: ${ownerNumber.join(', ')}`;

      await sock.sendMessage(chatId, { text: responseText }, { quoted: message });
    } catch (error) {
      logger.error(`Error in status command:`, error);
      await sock.sendMessage(chatId, { text: 'An error occurred while processing your command.' }, { quoted: message });
    }
  },
};

function formatUptime(uptime) {
  const seconds = Math.floor(uptime);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, and ${seconds % 60} seconds`;
}

function getOSInfo() {
  return `${os.type()} ${os.release()} ${os.arch()}`;
}

async function getCPUInfo() {
  const data = await si.cpu();
  
  return {
    cores: os.cpus().length,
    usage: data.percent?.toFixed(2) || 'unknown'
  };
}

async function getRAMInfo() {
  const data = await si.mem();
  
  return {
    used: Math.floor(data.used / 1024 / 1024),
    total: Math.floor(data.total / 1024 / 1024),
    active: Math.floor(data.active / 1024 / 1024),
  };
}