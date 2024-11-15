module.exports = {
    name: 'artist',
    description: 'Search for artist information or get random artist',
    usage: '!artist <name> | !artist random',
    category: 'music',
    aliases: ['findartist', 'randomartist'],
    cooldown: 5,
    async execute(sock, message, args) {
        const axios = require('axios');
        
        if (!args.length) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide an artist name or use "random"!'
            }, { quoted: message });
        }

        const query = args.join(" ").toLowerCase();
        
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
                throw new Error('Failed to get Spotify token');
            }
        }

        async function getArtistInfo(searchQuery) {
            const token = await getSpotifyToken();
            const response = await axios.get(`https://api.spotify.com/v1/search`, {
                params: {
                    q: searchQuery,
                    type: 'artist',
                    limit: 1
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.artists.items[0];
        }

        async function getTopTracks(artistId) {
            const token = await getSpotifyToken();
            const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
                params: {
                    market: 'US'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data.tracks.slice(0, 5).map((track, index) => {
                const minutes = Math.floor(track.duration_ms / 60000);
                const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
                const duration = `${minutes}:${seconds.padStart(2, '0')}`;
                return `${index + 1}. ${track.name} (${duration})`;
            }).join('\n');
        }

        async function searchArtist(searchQuery) {
            try {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `🔎 Searching for artist "${searchQuery}"...`
                }, { quoted: message });

                const artist = await getArtistInfo(searchQuery);
                
                if (!artist) {
                    throw new Error('Artist not found');
                }

                const topTracks = await getTopTracks(artist.id);

                const response = `╭━━━━━━━━━━━━━━━━╮
┃    🎵 *Artist Info* 
┃━━━━━━━━━━━━━━━━
┃ 🎤 *Name:* ${artist.name}
┃ 🎸 *Genres:* ${artist.genres.join(", ") || "N/A"}
┃ 👥 *Followers:* ${artist.followers.total.toLocaleString()}
┃ 🔥 *Popularity:* ${artist.popularity}%
┃ 
┃ 🎼 *Top Tracks:*
┃ ${topTracks}
┃ 
┃ 🔗 *Spotify:* ${artist.external_urls.spotify}
╰━━━━━━━━━━━━━━━━╯`;

                if (artist.images && artist.images.length > 0) {
                    const imageResponse = await axios.get(artist.images[0].url, {
                        responseType: 'arraybuffer'
                    });
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        image: Buffer.from(imageResponse.data),
                        caption: response
                    });
                } else {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: response
                    });
                }
            } catch (error) {
                throw error;
            }
        }

        async function getRandomArtist() {
            try {
                await sock.sendMessage(message.key.remoteJid, {
                    text: "🎲 Finding a random artist..."
                }, { quoted: message });

                const token = await getSpotifyToken();
                const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                const randomOffset = Math.floor(Math.random() * 1000);
                
                const response = await axios.get(`https://api.spotify.com/v1/search`, {
                    params: {
                        q: randomChar,
                        type: 'artist',
                        limit: 1,
                        offset: randomOffset
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.data.artists.items.length) {
                    throw new Error('No random artist found');
                }

                await searchArtist(response.data.artists.items[0].name);
            } catch (error) {
                throw error;
            }
        }

        try {
            if (query === 'random') {
                await getRandomArtist();
            } else {
                await searchArtist(query);
            }
        } catch (error) {
            await sock.sendMessage(message.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
};
