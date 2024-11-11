const axios = require('axios');

module.exports = {
    name: 'quiz',
    description: 'Interactive quiz game with multiple categories',
    usage: '!quiz [category]',
    category: 'fun',
    cooldown: 5,
    maintainState: true,

    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        const categories = ['english', 'math', 'physics', 'filipino', 'biology', 'chemistry', 'history', 'philosophy', 'random', 'science', 'anime', 'country', 'torf', 'coding', 'sports'];
        const category = args[0] ? args[0].toLowerCase() : categories[Math.floor(Math.random() * categories.length)];

        if (!categories.includes(category)) {
            await sock.sendMessage(chatId, {
                text: `Available categories:\n${categories.join(', ')}\n\nUsage: !quiz [category]`,
                quoted: message
            });
            return;
        }

        try {
            let response;
            let quizMessage;

            if (category === 'torf') {
                response = await axios.get('https://quizzzz-nhbt.onrender.com/api/quiz?category=torf');
                const data = response.data;

                quizMessage = await sock.sendMessage(chatId, {
                    text: `📚 TRUE OR FALSE\n\n${data.question}\n\nReply with 'true' or 'false'`,
                    quoted: message
                });

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'torf',
                        question: data.question,
                        answer: data.answer === "true",
                        startTime: Date.now(),
                        messageId: quizMessage.key.id
                    }
                });

            } else if (category === 'anime') {
                response = await axios.get('https://quizzzz-nhbt.onrender.com/api/quiz?category=anime');
                const data = response.data;

                if (!data?.photoUrl || !data?.animeName) return;

                quizMessage = await sock.sendMessage(chatId, {
                    image: { url: data.photoUrl },
                    caption: `📚 ANIME QUIZ\n\nWho is this character?\n\nReply with the character's name`,
                    quoted: message
                });

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'anime',
                        answer: data.animeName,
                        startTime: Date.now(),
                        messageId: quizMessage.key.id
                    }
                });

            } else {
                response = await axios.get(`https://quizzzz-nhbt.onrender.com/api/quiz?category=${category}`);
                const data = response.data;

                if (!data?.answer) return;

                const options = shuffleArray([...data.options]);
                const formattedOptions = options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n');
                const correctAnswerIndex = options.findIndex(opt => opt.toLowerCase() === data.answer.toLowerCase());
                const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex);

                quizMessage = await sock.sendMessage(chatId, {
                    text: `📚 QUIZ TIME\n\nCategory: ${category}\nTime: 30 seconds\nReward: 10000 coins\n\n${data.question}\n\n${formattedOptions}\n\nReply with A, B, C, or D`,
                    quoted: message
                });

                await user.updateOne({
                    replyCommandName: this.name,
                    replyData: {
                        type: 'multiple',
                        answer: correctAnswerLetter,
                        options: options,
                        question: data.question,
                        startTime: Date.now(),
                        messageId: quizMessage.key.id
                    }
                });
            }

            setTimeout(async () => {
                const currentUser = await user.findOne({ _id: user._id });
                if (currentUser?.replyData?.messageId === quizMessage.key.id) {
                    const correctAnswer = currentUser.replyData.type === 'torf' 
                        ? currentUser.replyData.answer ? 'True' : 'False'
                        : currentUser.replyData.type === 'anime'
                            ? currentUser.replyData.answer
                            : `${currentUser.replyData.answer}. ${currentUser.replyData.options[currentUser.replyData.answer.charCodeAt(0) - 65]}`;

                    await sock.sendMessage(chatId, {
                        text: `⏰ Time's up!\n\nThe correct answer was: ${correctAnswer}`,
                        quoted: quizMessage
                    });

                    await user.updateOne({
                        replyCommandName: null,
                        replyData: null
                    });
                }
            }, 30000);

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `Error: Could not fetch quiz for category ${category}. Please try again.`,
                quoted: message
            });
        }
    },

    async onReply(sock, message, user) {
        const chatId = message.key.remoteJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) return;

        const replyData = user.replyData;
        if (!replyData || Date.now() - replyData.startTime > 30000) {
            await user.updateOne({
                replyCommandName: null,
                replyData: null
            });
            return;
        }

        const userReply = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        let isCorrect = false;
        if (replyData.type === 'torf') {
            isCorrect = (userReply.toLowerCase() === 'true' && replyData.answer) ||
                       (userReply.toLowerCase() === 'false' && !replyData.answer);
        } else if (replyData.type === 'anime') {
            isCorrect = userReply.toLowerCase() === replyData.answer.toLowerCase();
        } else {
            isCorrect = userReply.trim().toUpperCase() === replyData.answer;
        }

        const correctAnswer = replyData.type === 'torf' 
            ? replyData.answer ? 'True' : 'False'
            : replyData.type === 'anime'
                ? replyData.answer
                : `${replyData.answer}. ${replyData.options[replyData.answer.charCodeAt(0) - 65]}`;

        await sock.sendMessage(chatId, {
            text: isCorrect 
                ? "🎉 CORRECT!\n\nCongratulations! You've won 10000 coins!"
                : `❌ WRONG!\n\nThe correct answer was: ${correctAnswer}`,
            quoted: message
        });

        if (isCorrect) {
            await user.updateOne({
                $inc: { balance: 10000 }
            });
        }

        await user.updateOne({
            replyCommandName: null,
            replyData: null
        });
    }
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
                                                                                 
