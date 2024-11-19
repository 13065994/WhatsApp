const frank = require('@whiskeysockets/baileys')
const frankConfig = require('../../config')
const frankLogger = require('../../utils/logger')

module.exports = {
    name: 'bank',
    aliases: ['nexus'],
    category: 'economy',
    desc: 'Nexus Bank System - Use .bank help for commands',
    use: '.bank <action>',
    cooldown: 5,
    
    async execute(sock, m, args, user) {
        const chat = m.key.remoteJid
        
        try {
            if (!args.length || args[0] === 'help') {
                return await sock.sendMessage(chat, {
                    text: `╭━━━ NEXUS BANK SERVICES ━━━╮
┃                           ┃
┃ 🏦 .bank balance         ┃
┃ 💰 .bank loan <amount>   ┃
┃ 💸 .bank pay <amount>    ┃
┃ 📈 .bank invest <amount> ┃
┃ 🎰 .bank gamble <amount> ┃
┃ 🎁 .bank deposit         ┃
┃ 💳 .bank withdraw        ┃
┃ 🤝 .bank rob            ┃
┃ 📊 .bank stats          ┃
┃                           ┃
╰───────────────────────────╯
`
                }, { quoted: m })
            }

            switch (args[0].toLowerCase()) {
                case 'balance': return await this.showBalance(sock, m, user)
                case 'loan': return await this.getLoan(sock, m, args, user)
                case 'pay': return await this.payLoan(sock, m, args, user)
                case 'invest': return await this.invest(sock, m, args, user)
                case 'gamble': return await this.gamble(sock, m, args, user)
                case 'rob': return await this.rob(sock, m, user)
                case 'stats': return await this.showStats(sock, m, user)
            }

        } catch (e) {
            frankLogger.error(`Error in bank command:`, e)
            await sock.sendMessage(chat, {
                text: '❌ Nexus Bank services temporarily unavailable!',
            }, { quoted: m })
        }
    },

    async showBalance(sock, m, user) {
        const chat = m.key.remoteJid
        const balance = user.coins || 0
        const loan = user.loan || 0
        const investments = user.investments || 0

        const bankCard = `╭━━━━ NEXUS BANK CARD ━━━━╮
┃                         ┃
┃  💰 Balance: ${balance} ₪    ┃
┃  💳 Loan: ${loan} ₪         ┃
┃  📈 Investments: ${investments} ₪  ┃
┃  🏦 Net Worth: ${balance + investments - loan} ₪ ┃
┃                         ┃
┃  Tier: ${frankTier(balance)}     ┃
┃  Interest Rate: ${frankRate(user)}%  ┃
┃                         ┃
╰─────────────────────────╯`

        await sock.sendMessage(chat, { text: bankCard }, { quoted: m })
    },

    async getLoan(sock, m, args, user) {
        const chat = m.key.remoteJid
        const amount = parseInt(args[1])
        
        if (!amount || amount < 1000) {
            return await sock.sendMessage(chat, {
                text: '❌ Minimum loan amount: 1000 ₪',
            }, { quoted: m })
        }

        const maxLoan = frankMaxLoan(user)
        if ((user.loan || 0) + amount > maxLoan) {
            return await sock.sendMessage(chat, {
                text: `❌ Maximum loan limit: ${maxLoan} ₪`,
            }, { quoted: m })
        }

        await user.updateOne({
            $inc: {
                coins: amount,
                loan: amount,
                'statistics.totalLoans': 1
            }
        })

        await sock.sendMessage(chat, {
            text: `🏦 Loan Approved!\n\n💰 Amount: ${amount} ₪\n📈 Interest: ${frankRate(user)}%\n⏰ Pay within 24h to avoid penalties`,
        }, { quoted: m })
    },

    async payLoan(sock, m, args, user) {
        const chat = m.key.remoteJid
        const amount = parseInt(args[1])
        const currentLoan = user.loan || 0

        if (!currentLoan) {
            return await sock.sendMessage(chat, {
                text: '✅ You have no pending loans!',
            }, { quoted: m })
        }

        if (!amount || amount > user.coins || amount > currentLoan) {
            return await sock.sendMessage(chat, {
                text: '❌ Invalid payment amount!',
            }, { quoted: m })
        }

        await user.updateOne({
            $inc: {
                coins: -amount,
                loan: -amount,
                'statistics.loansPaid': amount
            }
        })

        await sock.sendMessage(chat, {
            text: `💸 Loan Payment Successful!\n\n💰 Paid: ${amount} ₪\n📊 Remaining: ${currentLoan - amount} ₪`,
        }, { quoted: m })
    },

    async invest(sock, m, args, user) {
        const chat = m.key.remoteJid
        const amount = parseInt(args[1])

        if (!amount || amount > user.coins || amount < 100) {
            return await sock.sendMessage(chat, {
                text: '❌ Invalid investment amount! (Min: 100 ₪)',
            }, { quoted: m })
        }

        const chance = Math.random()
        const multiplier = chance > 0.7 ? (Math.random() * 2 + 1) : (Math.random() * 0.5 + 0.1)
        const profit = Math.floor(amount * multiplier) - amount

        await user.updateOne({
            $inc: {
                coins: -amount + profit,
                'statistics.investmentProfit': profit,
                investments: profit > 0 ? profit : 0
            }
        })

        const result = profit > 0 ? `📈 Profit: ${profit} ₪` : `📉 Loss: ${-profit} ₪`
        await sock.sendMessage(chat, {
            text: `🏦 Investment Result!\n\n${result}\n💰 New Balance: ${user.coins - amount + profit} ₪`,
        }, { quoted: m })
    },

    async gamble(sock, m, args, user) {
        const chat = m.key.remoteJid
        const amount = parseInt(args[1])

        if (!amount || amount > user.coins || amount < 50) {
            return await sock.sendMessage(chat, {
                text: '❌ Invalid gamble amount! (Min: 50 ₪)',
            }, { quoted: m })
        }

        const chance = Math.random()
        const won = chance > 0.6
        const multiplier = won ? (Math.random() * 2 + 1) : 0
        const profit = Math.floor(amount * multiplier) - amount

        await user.updateOne({
            $inc: {
                coins: profit,
                'statistics.gamblingProfit': profit
            }
        })

        const result = won ? `🎯 You Won: ${profit} ₪` : `📉 You Lost: ${amount} ₪`
        await sock.sendMessage(chat, {
            text: `🎰 Gambling Result!\n\n${result}\n💰 New Balance: ${user.coins + profit} ₪`,
        }, { quoted: m })
    },

    async rob(sock, m, user) {
        const chat = m.key.remoteJid
        const lastRob = user.lastRob || 0
        const cooldown = 3600000

        if (Date.now() - lastRob < cooldown) {
            const timeLeft = Math.ceil((cooldown - (Date.now() - lastRob)) / 60000)
            return await sock.sendMessage(chat, {
                text: `🚔 Lay low for ${timeLeft} minutes!`,
            }, { quoted: m })
        }

        const chance = Math.random()
        const success = chance > 0.7
        const amount = success ? Math.floor(Math.random() * 1000 + 500) : 0
        const fine = !success ? Math.floor(Math.random() * 500 + 200) : 0

        await user.updateOne({
            $inc: {
                coins: success ? amount : -fine,
                'statistics.robberiesSuccess': success ? 1 : 0,
                'statistics.robberiesFailed': !success ? 1 : 0
            },
            lastRob: Date.now()
        })

        const result = success ? 
            `🎭 Heist Successful!\n💰 Stolen: ${amount} ₪` :
            `🚔 Busted!\n💸 Fine: ${fine} ₪`

        await sock.sendMessage(chat, {
            text: result,
        }, { quoted: m })
    },

    async showStats(sock, m, user) {
        const chat = m.key.remoteJid
        const stats = user.statistics || {}

        const statsCard = `╭━━━ NEXUS BANK STATS ━━━╮
┃                         ┃
┃  💰 Total Loans: ${stats.totalLoans || 0}     ┃
┃  💸 Loans Paid: ${stats.loansPaid || 0} ₪    ┃
┃  📈 Investment Profit: ${stats.investmentProfit || 0} ₪ ┃
┃  🎰 Gambling Profit: ${stats.gamblingProfit || 0} ₪  ┃
┃  🎭 Successful Heists: ${stats.robberiesSuccess || 0}  ┃
┃  🚔 Failed Heists: ${stats.robberiesFailed || 0}    ┃
┃                         ┃
╰─────────────────────────╯`

        await sock.sendMessage(chat, { text: statsCard }, { quoted: m })
    }
}

function frankTier(balance) {
    if (balance >= 100000) return '💎 Diamond'
    if (balance >= 50000) return '🥇 Platinum'
    if (balance >= 25000) return '🥈 Gold'
    if (balance >= 10000) return '🥉 Silver'
    return '🌟 Bronze'
}

function frankRate(user) {
    const baseRate = 5
    const tier = frankTier(user.coins || 0)
    const rates = {
        '💎 Diamond': 2,
        '🥇 Platinum': 3,
        '🥈 Gold': 4,
        '🥉 Silver': 4.5,
        '🌟 Bronze': 5
    }
    return rates[tier] || baseRate
}

function frankMaxLoan(user) {
    const base = 10000
    const multipliers = {
        '💎 Diamond': 10,
        '🥇 Platinum': 7,
        '🥈 Gold': 5,
        '🥉 Silver': 3,
        '🌟 Bronze': 1
    }
    const tier = frankTier(user.coins || 0)
    return base * (multipliers[tier] || 1)
}