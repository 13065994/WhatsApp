module.exports = {

  name: 'hi',

  description: 'Replies with "hi"',

  usage: ['!hi'],

  category: 'general',

  onChat: true, // Enable onChat feature

  async execute(sock, message, args) {

    await sock.sendMessage(message.key.remoteJid, {

      text: 'hi',

      quoted: message,

    });

  },

  async onReply(sock, message, args) {

    const repliedMessage = message.message.extendedTextMessage.text;

    if (repliedMessage.toLowerCase() === 'hey') {

      await sock.sendMessage(message.key.remoteJid, {

        text: 'How are you?',

        quoted: message,

      });

    }

  },

}
