// ANYWAY-XMD WHATSAPP BOT
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const figlet = require('figlet');
const chalk = require('chalk');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

const SESSION_FILE = process.env.SESSION_FILE || 'auth_info.json';
const EMOJI_REACT = process.env.EMOJI_REACT || '💚';

// Display Bot Title
console.clear();
console.log(chalk.green(figlet.textSync(process.env.BOT_NAME || 'ANYWAY-XMD')));
console.log(chalk.yellow(`🤖 Powered by MR ANYWAY TECH | Owner: ${process.env.OWNER_NAME}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        logger: require('pino')({ level: 'silent' }),
        browser: ['ANYWAY-XMD', 'Safari', '1.0.0'],
    });

    // Auto Read
    if (process.env.AUTO_READ === 'true') {
        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (let msg of messages) {
                if (!msg.key.fromMe) {
                    await sock.readMessages([msg.key]);
                }
            }
        });
    }

    // Anti Delete
    if (process.env.ANTI_DELETE === 'true') {
        sock.ev.on('message-revoke-everyone', async (item) => {
            const msg = item.message;
            if (msg) {
                console.log(chalk.red(`⚠️ Message deleted:`), msg);
            }
        });
    }

    // Auto View Status
    if (process.env.AUTO_VIEW_STATUS === 'true') {
        sock.ev.on('new-status', async ({ id }) => {
            try {
                await sock.chatRead(id, 1);
                console.log(chalk.cyan(`👀 Viewed status from ${id}`));
            } catch (err) {
                console.error('Error viewing status:', err);
            }
        });
    }

    // React to all messages with emoji
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (let msg of messages) {
            if (!msg.key.fromMe && msg.message) {
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: EMOJI_REACT,
                            key: msg.key
                        }
                    });
                } catch (err) {
                    console.log('Reaction error:', err.message);
                }
            }
        }
    });

    // Handle connection events
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('❌ Session logged out. Scan again.'));
            } else {
                console.log(chalk.red('🔁 Reconnecting...'));
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Bot is connected and running!'));
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startBot();
