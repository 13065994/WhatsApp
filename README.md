<div align="center">
  
# 🤖 NexusCoders Bot

*A powerful, feature-rich WhatsApp bot created by Nexus Team*

[<img src="https://img.shields.io/badge/DEPLOY-HEROKU-red.svg?style=for-the-badge&logo=heroku" width="200" height="35.45"/>](https://heroku.com/deploy)
[<img src="https://img.shields.io/badge/DEPLOY-RENDER-blue.svg?style=for-the-badge&logo=render" width="200" height="35.45"/>](https://render.com)
[<img src="https://img.shields.io/badge/DEPLOY-KOYEB-black.svg?style=for-the-badge&logo=koyeb" width="200" height="35.45"/>](https://koyeb.com)

[Demo • Support • Discussion](https://whatsapp.com/channel/0029VarItlZ8fewz4nyakm1u)

<img src="https://tiny.one/y6a7bdpk" alt="NexusCoders Bot Banner" width="800"/>

</div>

## 🌟 Features

- 🚀 **High Performance**: Built with modern JavaScript
- 💾 **Multi-Session**: Handle multiple WhatsApp sessions
- 🔒 **Secure**: Built-in security features
- 🎮 **Fun Commands**: Games, stickers, and more
- ⚡ **Quick Responses**: Lightning-fast command execution
- 🛠️ **Customizable**: Easy to add new features

## 📥 Installation

1. **Clone the repository**
```bash
git clone https://github.com/NexusCoders-cyber/NexusCoders-Bot.git
cd NexusCoders-Bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Quick Deploy

### Deploy to Heroku
1. Click the Heroku deploy button above
2. Fill in the required environment variables
3. Deploy and start your bot

### Deploy to Render
1. Fork this repository
2. Connect your Render account
3. Create a new Web Service
4. Use the following build command:
```bash
npm install && npm run build
```

### Deploy to Koyeb
1. Create a Koyeb account
2. Import this repository
3. Configure your deployment
4. Launch your instance

## 🎯 Get Session

Visit our session generator to get your WhatsApp session:
[Session Generator](https://nexuscoderssessionid-zni8.onrender.com)

## 📚 Command Examples

To create a new command, create a `.js` file in the appropriate command directory (`./src/commands/general/`). Here's an example:

```javascript
// ./src/commands/general/commandname.js

// Basic Command Structure
module.exports = {
    name: 'commandname',           // Command name (required)
    description: 'description',    // Command description (required)
    usage: '!commandname <args>',  // How to use the command (required)
    category: 'category',         // Command category (required)
    aliases: ['cmd', 'cm'],       // Alternative command names (optional)
    cooldown: 5,                  // Cooldown in seconds (optional)
    ownerOnly: true,              // Restrict to bot owner (optional)
    adminOnly: true,              // Restrict to group admins (optional)
    groupOnly: true,              // Restrict to groups only (optional)
    privateOnly: true,            // Restrict to private chats (optional)
    
    // Main function that executes when command is called
    async execute(sock, message, args) {
        // sock: WhatsApp connection object
        // message: Message object containing info about the message
        // args: Array of arguments passed to the command
        
        // Your command logic here
        
        // Send a reply
        await sock.sendMessage(message.key.remoteJid, {
            text: 'Your message here',
            quoted: message  // Makes the message a reply
        });
    }
};
```

## 📂 Project Structure
```
📦 NexusCoders-WhatsApp-Bot
 ┣ 📂 src
 ┃ ┣ 📂 commands
 ┃ ┃ ┣ 📂 admin      # Admin commands
 ┃ ┃ ┣ 📂 general    # General commands
 ┃ ┃ ┗ 📂 owner      # Owner-only commands
 ┃ ┣ 📂 handlers     # Message & command handlers
 ┃ ┣ 📂 models       # Database models
 ┃ ┣ 📂 utils        # Utility functions
 ┃ ┗ 📜 config.js    # Configuration file
 ┣ 📜 .env           # Environment variables
 ┣ 📜 index.js       # Entry point
 ┗ 📜 package.json   # Project metadata
```

## 🛠️ Configuration

Create a `.env` file with the following variables:
```env
BOT_NAME=NexusCoders
OWNER_NUMBER=1234567890
PREFIX=!
DATABASE_URL=your_mongodb_url
```

## 📚 Available Commands

| Category | Command | Description |
|----------|---------|-------------|
| General | !help | Show command list |
| General | !ping | Check bot latency |
| Admin | !ban | Ban a user |
| Admin | !unban | Unban a user |
| Owner | !broadcast | Send message to all users |

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Nexus Teams** - *Initial work & development*
- All contributors who helped with the project

## 💬 Support

Join our WhatsApp group for support and updates:
[Join Support Group](https://chat.whatsapp.com/GND0jkJc2eaEmvwwwvTEZ2)

---

<div align="center">

Made with ❤️ by [Nexus Teams](https://github.com/NexusCoders-cyber)

</div>
