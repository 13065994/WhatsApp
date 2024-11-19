const { MessageType } = require('@whiskeysockets/baileys');
const config = require('../../config');
const logger = require('../../utils/logger');
const { exec: execCallback } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const exec = util.promisify(execCallback);

module.exports = {
    name: 'exec',
    aliases: ['run', 'evaluate', 'eval'],
    category: 'owner',
    description: 'Execute code in multiple languages',
    usage: 'exec <language> <code>',
    cooldown: 5,
    ownerOnly: true,
    groupOnly: false,
    privateOnly: false,
    adminOnly: false,
    botAdminRequired: false,
    
    async execute(sock, message, args, user) {
        const chatId = message.key.remoteJid;
        
        try {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Usage: exec <language> <code>\nSupported: js, python, bash',
                }, { quoted: message });
                return;
            }

            const language = args[0].toLowerCase();
            const code = args.slice(1).join(' ');
            let result;

            switch (language) {
                case 'js':
                case 'javascript': {
                    const tempFile = path.join(process.cwd(), 'temp', `exec_${Date.now()}.js`);
                    await fs.mkdir(path.dirname(tempFile), { recursive: true });
                    await fs.writeFile(tempFile, code);
                    result = await exec(`node ${tempFile}`);
                    await fs.unlink(tempFile);
                    break;
                }
                
                case 'py':
                case 'python': {
                    const tempFile = path.join(process.cwd(), 'temp', `exec_${Date.now()}.py`);
                    await fs.mkdir(path.dirname(tempFile), { recursive: true });
                    await fs.writeFile(tempFile, code);
                    result = await exec(`python ${tempFile}`);
                    await fs.unlink(tempFile);
                    break;
                }
                
                case 'bash':
                case 'sh': {
                    result = await exec(code);
                    break;
                }
                
                case 'eval': {
                    let evalResult;
                    try {
                        evalResult = eval(code);
                        result = { stdout: util.inspect(evalResult, { depth: 1 }) };
                    } catch (e) {
                        result = { stderr: e.toString() };
                    }
                    break;
                }

                default:
                    await sock.sendMessage(chatId, {
                        text: '❌ Unsupported language! Use js, python, or bash',
                    }, { quoted: message });
                    return;
            }

            const output = result.stdout || result.stderr;
            await sock.sendMessage(chatId, {
                text: `📋 ${language.toUpperCase()} Output:\n\n${output || 'No output'}`,
            }, { quoted: message });

        } catch (error) {
            logger.error(`Error in exec command:`, error);
            await sock.sendMessage(chatId, {
                text: `❌ Execution failed:\n${error.message}`,
            }, { quoted: message });
        }
    }
};