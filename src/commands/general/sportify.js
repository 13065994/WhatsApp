

module.exports = {
    name: 'spotify',
    description: 'Search and download tracks from Spotify',
    usage: '!spotify <song name>',
    category: 'media',
    aliases: ['spotifydl', 'spdl'],
    cooldown: 5,

    async execute(sock, message, args) {
        if (args.length === 0) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: "Please provide a song name to search for.",
                }, { quoted: message });
        }

        const query = args.join(" ");
        await sock.sendMessage(message.key.remoteJid, {
            text: `🔎 Searching for "${query}"... Please wait.`,
            quoted: message
        });

        try {
            const tracks = await searchSpotify(query);

            if (tracks.length === 0) {
                return await sock.sendMessage(message.key.remoteJid, {
                    text: "No tracks found. Please try a different search query.",
                    }, { quoted: message });
            }

            const track = tracks[0];
            const { title, artists, album, releaseDate, durationMs, previewUrl, spotifyUrl } = track;

            if (!previewUrl) {
                return await sock.sendMessage(message.key.remoteJid, {
                    text: "Sorry, preview not available for this track.",
                    }, { quoted: message });
            }

            const audioResponse = await axios.get(previewUrl, {
                responseType: 'arraybuffer'
            });

            await sock.sendMessage(message.key.remoteJid, {
                audio: Buffer.from(audioResponse.data),
                mimetype: 'audio/mpeg',
                caption: `🎵 Found: "${title}"\n` +
                        `🎤 Artist(s): ${artists.join(", ")}\n` +
                        `💽 Album: ${album}\n` +
                        `📅 Release Date: ${releaseDate}\n` +
                        `⏱ Duration: ${formatDuration(durationMs)}\n` +
                        `🔗 Spotify URL: ${spotifyUrl}\n\n` +
                        `📨 30-second preview`,
                }, { quoted: message });
        } catch (error) {
            console.error(error);
            await sock.sendMessage(message.key.remoteJid, {
                text: "An error occurred while processing your request. Please try again later.",
                }, { quoted: message });
        }
    }
};

async function searchSpotify(query) {
    try {
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
            params: {
                q: query,
                type: 'track',
                limit: 1
            },
            headers: {
                'Authorization': `Bearer ${await getSpotifyToken()}`
            }
        });

        return response.data.tracks.items.map(track => ({
            title: track.name,
            artists: track.artists.map(artist => artist.name),
            album: track.album.name,
            releaseDate: track.album.release_date,
            durationMs: track.duration_ms,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify
        }));
    } catch (error) {
        console.error('Error searching Spotify:', error);
        throw error;
    }
}

async function getSpotifyToken() {
    const clientId = '138ff8d23e264edba4d5838c811056ce';
    const clientSecret = 'e3578c75d5e04cf59f21af566ef877cd';

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', 
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify token:', error);
        throw error;
    }
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
              
