
const axios = require("axios");
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'youtube',
    description: 'Download videos or audio from YouTube',
    usage: '!youtube -v/a <link/keyword>',
    category: 'media',
    aliases: ['yt', 'v'],
    cooldown: 5,

    async execute(sock, message, args) {
        const action = args[0]?.toLowerCase();
        const remoteJid = message.key.remoteJid;

        if (!action || !args[1]) {
            return await sock.sendMessage(remoteJid, {
                text: "❌ Please provide both action (-v or -a) and video link/keyword",
                }, { quoted: message });
        }

        if (action !== '-v' && action !== '-a') {
            return await sock.sendMessage(remoteJid, {
                text: "❌ Invalid action. Use -v for video or -a for audio",
                }, { quoted: message });
        }

        const processingMsg = await sock.sendMessage(remoteJid, {
            text: "🔄 Processing your request...",
            }, { quoted: message });

        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

        try {
            const baseApi = await getBaseApi();
            let videoID, searchQuery;

            if (checkurl.test(args[1])) {
                const match = args[1].match(checkurl);
                videoID = match[1];
            } else {
                args.shift();
                searchQuery = args.join(" ");
                const searchResult = (await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(searchQuery)}`)).data[0];
                
                if (!searchResult) {
                    await sock.sendMessage(remoteJid, {
                        text: "⭕ No results found for: " + searchQuery,
                        quoted: message
                    });
                    return;
                }
                videoID = searchResult.id;
            }

            const format = action === '-v' ? 'mp4' : 'mp3';
            const cacheDir = path.join(__dirname, '..', '..', 'temp');
            
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }

            const filePath = path.join(cacheDir, `ytb_${format}_${videoID}.${format}`);
            const { data: { title, downloadLink, quality } } = await axios.get(`${baseApi}/ytDl3?link=${videoID}&format=${format}&quality=3`);
            
            await downloadFile(downloadLink, filePath);

            await sock.sendMessage(remoteJid, {
                caption: `🎵 Title: ${title}\n📊 Quality: ${quality}`,
                [format === 'mp4' ? 'video' : 'audio']: fs.readFileSync(filePath),
                mimetype: format === 'mp4' ? 'video/mp4' : 'audio/mpeg',
                }, { quoted: message });

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            await sock.sendMessage(remoteJid, {
                text: `❌ Error: ${error.message}`,
                }, { quoted: message });
        }
    }
};

async function getBaseApi() {
    const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
    return base.data.api;
}

async function downloadFile(url, path) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });
    fs.writeFileSync(path, Buffer.from(response.data));
                  
