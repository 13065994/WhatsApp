module.exports = {
    bot: {
        name: "NexusCoders Bot",
        version: "2.0.0",
        prefix: "!",
        sessionName: "nexus-session",
        ownerNumber: ["2348180146181@s.whatsapp.net"],//at your phone number with your country code at thw first 
        ownerName: "NexusCoders",
        language: "en",
        timezone: "Asia/Kolkata",
        homePage: "https://nexuscoders.com",
        autoRead: true,
        selfBot: false,
        maxFileSize: 100,
        supportGroups: ["SUPPORT_GROUP_ID@g.us"],
        logLevel: "silent"
    },

    database: {
        uri: process.env.MONGODB_URI || "mongodb+srv://arisonbeckham:arisonbeckham@nexuscoders.yxxbj.mongodb.net/?retryWrites=true&w=majority&appName=NexusCoders",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    limits: {
        maxWarn: 3,
        rateLimit: 2,
        cooldown: 3000,
        maxCommandsPerMinute: 10,
        maxMessagesPerMinute: 15
    },

    features: {
        antiLink: {
            enabled: true,
            whitelist: [],
            action: "kick",
            warningMessage: true
        },
        antiSpam: {
            enabled: true,
            maxMessages: 7,
            interval: 10000,
            action: "warn"
        },
        autoResponse: {
            enabled: true,
            messages: {
                welcome: "Welcome to the group! 👋",
                goodbye: "Goodbye! 👋",
                banned: "You have been banned from using this bot!",
                error: "An error occurred while processing your request."
            }
        },
        presence: {
            autoTyping: true,
            autoRecord: true,
            autoOnline: true
        },
        leveling: {
            enabled: true,
            multiplier: 1,
            messageXP: 1,
            commandXP: 5,
            imageXP: 2,
            videoXP: 3,
            voiceXP: 2,
            groupBonus: 1.5,
            maxLevel: 100
        }
    },

    appearance: {
        colors: {
            primary: "#2196f3",
            secondary: "#ff9800",
            success: "#4caf50",
            error: "#f44336",
            warning: "#ff9800",
            info: "#2196f3"
        },
        emojis: {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️",
            loading: "⌛",
            ping: "🏓",
            level: "🎮",
            coin: "🪙",
            crown: "👑",
            heart: "❤️",
            fire: "🔥"
        }
    },

    group: {
        minMembers: 3,
        maxMembers: 257,
        autoAddCreator: true,
        defaultPermissions: {
            adminOnly: false,
            botAdminRequired: true,
            maintenanceMode: false
        }
    },

    messages: {
        commands: {
            notFound: "Command not found. Type !help for command list.",
            adminOnly: "This command is for admins only!",
            ownerOnly: "This command is for bot owner only!",
            groupOnly: "This command can only be used in groups!",
            privateOnly: "This command can only be used in private chat!",
            botAdminRequired: "Bot needs to be admin to use this command!",
            cooldown: "Please wait {time} seconds before using this command again.",
            error: "An error occurred while executing the command."
        },
        errors: {
            unknownError: "An unknown error occurred.",
            invalidArgs: "Invalid arguments provided.",
            notEnoughArgs: "Not enough arguments provided.",
            tooManyArgs: "Too many arguments provided.",
            invalidNumber: "Invalid number provided.",
            invalidUser: "Invalid user provided.",
            invalidGroup: "Invalid group provided.",
            invalidUrl: "Invalid URL provided.",
            userNotFound: "User not found.",
            groupNotFound: "Group not found."
        }
    },

    apis: {
        removeBg: process.env.REMOVE_BG_KEY || "",
        openai: process.env.OPENAI_API_KEY || "",
        googleCloud: process.env.GOOGLE_CLOUD_API_KEY || "",
        deepai: process.env.DEEPAI_API_KEY || "",
        rapidApi: process.env.RAPID_API_KEY || "",
        weatherApi: process.env.WEATHER_API_KEY || ""
    },

    paths: {
        commands: "./src/commands",
        database: "./src/database",
        temp: "./temp",
        assets: "./assets",
        logs: "./logs",
        sessions: "./sessions"
    },

    security: {
        maxWarns: 3,
        antiSpamIgnore: ["120363025246779146@g.us"],
        blockedNumbers: [],
        allowedNumbers: [],
        bannedCommands: [],
        restrictedCommands: [],
        maintenanceMode: false
    }
};
