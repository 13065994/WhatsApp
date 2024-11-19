const { MessageType } = require('@whiskeysockets/baileys');
const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
    name: 'quiz',
    aliases: ['test'],
    category: 'fun',
    description: 'Interactive quiz game with multiple categories',
    usage: 'quiz <category>',
    
    cooldown: 3,
    ownerOnly: false,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,
    
    maintainState: true,
    
    categories: ['english', 'math', 'physics', 'filipino', 'biology', 'chemistry', 'history', 'philosophy', 'random', 'science', 'anime', 'country', 'torf', 'coding', 'sports', 'minecraft', 'space', 'food', 'animal', 'country', 'electronic', 'youtuber', 'javascript', 'python', 'music', 'hindi', 'css', 'french', 'html', 'spanish', 'freefire', 'pubg', 'roblox', 'gta-v', 'fortnite', 'demonslayer', 'doraemon', 'one-piece', 'naruto', 'deathnote', 'dragon-ball', 'attack-on-titan', 'java', 'ruby', 'c', 'c-plus', 'php', 'xml', 'typescript', 'nodejs', 'express', 'vietnamese', 'bengali', 'japanese'],

    reward: 10000,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        
        try {
            const category = args[0] ? args[0].toLowerCase() : this.categories[Math.floor(Math.random() * this.categories.length)];

            if (!this.categories.includes(category)) {
                const categoriesList = this.categories.join(', ');
                await sock.sendMessage(chatId, {
                    text: `╭─────────────────╮
│   ❌ INVALID CATEGORY   │
╰─────────────────╯

📚 Available categories:
${categoriesList}

╭───────────────╮
│ Usage: quiz <category> │
│ Or: quiz for random    │
╰───────────────╯`,
                }, { quoted: message });
                return;
            }

            if (category === 'torf') {
                const response = await axios.get('https://quizzzz-nhbt.onrender.com/api/quiz?category=torf');
                const data = response.data;

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'torf',
                        question: data.question,
                        answer: data.answer === "true",
                        startTime: Date.now()
                    }
                });

                await sock.sendMessage(chatId, {
                    text: `╭─────────────────╮
│    📚 TRUE OR FALSE    │
╰─────────────────╯

${data.question}

╭───────────────╮
│ Reply with True or False │
╰───────────────╯`
                }, { quoted: message });
            } else if (category === 'anime') {
                const response = await axios.get('https://quizzzz-nhbt.onrender.com/api/quiz?category=anime');
                const data = response.data;

                if (!data || !data.photoUrl || !data.animeName) {
                    throw new Error('Invalid anime quiz data');
                }

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'anime',
                        answer: data.animeName,
                        startTime: Date.now()
                    }
                });

                const imageBuffer = await axios.get(data.photoUrl, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, {
                    image: imageBuffer.data,
                    caption: `╭─────────────────╮
│    📚 ANIME QUIZ    │
╰─────────────────╯

🎭 Who is this character?

╭───────────────╮
│ Reply with the character's name │
╰───────────────╯`
                }, { quoted: message });
            } else {
                const response = await axios.get(`https://quizzzz-nhbt.onrender.com/api/quiz?category=${category}`);
                const data = response.data;

                if (!data || !data.answer) {
                    throw new Error('Invalid quiz data');
                }

                const options = this.shuffleArray([...data.options]);
                const formattedOptions = options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n');
                const correctAnswerIndex = options.findIndex(opt => opt.toLowerCase() === data.answer.toLowerCase());
                const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex);

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'mcq',
                        answer: correctAnswerLetter,
                        options: options,
                        startTime: Date.now()
                    }
                });

                await sock.sendMessage(chatId, {
                    text: `╭─────────────────╮
│    📚 QUIZ TIME    │
╰─────────────────╯

📌 Category: ${category.charAt(0).toUpperCase() + category.slice(1)}
⏳ Time: 30 seconds
💰 Reward: ${this.reward}$

${data.question}

${formattedOptions}

╭───────────────╮
│ Reply with A, B, C, or D │
╰───────────────╯`
                }, { quoted: message });
            }

            // Set timeout to clear the quiz
            setTimeout(async () => {
                const userData = await user.findOne();
                if (userData?.replyCommandName === this.name) {
                    const replyData = userData.replyData;
                    await user.updateOne({
                        replyCommandName: null,
                        replyData: null
                    });

                    let correctAnswer = replyData.answer;
                    if (replyData.type === 'mcq') {
                        correctAnswer = `${correctAnswer}. ${replyData.options[correctAnswer.charCodeAt(0) - 65]}`;
                    }

                    await sock.sendMessage(chatId, {
                        text: `╭─────────────────╮
│   ⏰ TIME'S UP!   │
╰─────────────────╯

⌛ The 30 seconds have passed.
✅ The correct answer was:
   ${correctAnswer}

╭───────────────╮
│    Try to be quicker!    │
╰───────────────╯`
                    });
                }
            }, 30000);

        } catch (error) {
            logger.error(`Error in quiz command:`, error);
            await sock.sendMessage(chatId, {
                text: `╭─────────────────╮
│    ❌ ERROR    │
╰─────────────────╯

😔 Sorry, there was an error fetching questions for the ${category} category.

╭───────────────╮
│    Please try again later    │
╰───────────────╯`
            }, { quoted: message });
        }
    },

    async onReply(sock, message, user) {
        const chatId = message.key.remoteJid;
        const replyData = user.replyData || {};
        const messageText = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || '';
        
        try {
            if (Date.now() - replyData.startTime > 30000) {
                await user.updateOne({
                    replyCommandName: null,
                    replyData: null
                });
                return;
            }

            let isCorrect = false;
            switch (replyData.type) {
                case 'torf':
                    isCorrect = (messageText.toLowerCase() === 'true' && replyData.answer) ||
                               (messageText.toLowerCase() === 'false' && !replyData.answer);
                    break;
                case 'anime':
                    isCorrect = messageText.toLowerCase() === replyData.answer.toLowerCase();
                    break;
                case 'mcq':
                    isCorrect = messageText.toUpperCase() === replyData.answer;
                    break;
            }

            if (isCorrect) {
                await user.updateOne({
                    $inc: { money: this.reward },
                    replyCommandName: null,
                    replyData: null
                });

                await sock.sendMessage(chatId, {
                    text: `╭─────────────────╮
│   🎉 CORRECT!   │
╰─────────────────╯

🏆 Congratulations!
💡 You're on fire 🔥
💰 You've won ${this.reward}$

╭───────────────╮
│    Keep it up, champ!    │
╰───────────────╯`
                }, { quoted: message });
            } else {
                let correctAnswer = replyData.answer;
                if (replyData.type === 'mcq') {
                    correctAnswer = `${correctAnswer}. ${replyData.options[correctAnswer.charCodeAt(0) - 65]}`;
                } else if (replyData.type === 'torf') {
                    correctAnswer = replyData.answer ? 'True' : 'False';
                }

                await sock.sendMessage(chatId, {
                    text: `╭─────────────────╮
│    😔 OOPS!    │
╰─────────────────╯

❌ Sorry, that's incorrect.
✅ The correct answer was:
   ${correctAnswer}

╭───────────────╮
│   Better luck next time!   │
╰───────────────╯`
                }, { quoted: message });
            }

            await user.updateOne({
                replyCommandName: null,
                replyData: null
            });

        } catch (error) {
            logger.error(`Error in quiz reply handler:`, error);
            await user.updateOne({
                replyCommandName: null,
                replyData: null
            });
        }
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};