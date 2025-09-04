// ANYWAY-XMD WHATSAPP BOT
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const figlet = require('figlet');
const chalk = require('chalk');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

const SESSION_FILE = process.env.SESSION_FILE || 'auth_info';
const EMOJI_REACT = process.env.STATUS_LIKE_EMOJI || '💚';

// Display Bot Title
console.clear();
console.log(chalk.green(figlet.textSync(process.env.BOT_NAME || 'ANYWAY-XMD')));
console.log(chalk.yellow(`🤖 Powered by ${process.env.OWNER_NAME || 'MR ANYWAY TECH'}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE);
    const { version } = await fetchLatestBaileysVersion();

    // Load SESSION_ID if provided
    if (process.env.SESSION_ID) {
        try {
            const creds = JSON.parse(Buffer.from(process.env.SESSION_ID, 'base64').toString());
            fs.writeFileSync(`${SESSION_FILE}/creds.json`, JSON.stringify(creds, null, 2));
            console.log(chalk.cyan('✅ SESSION_ID loaded from ENV.'));
        } catch (err) {
            console.log(chalk.red('❌ Invalid SESSION_ID in ENV. Using QR login...'));
        }
    }

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !process.env.SESSION_ID,
        markOnlineOnConnect: true,
        logger: require('pino')({ level: 'info' }),
        browser: ['ANYWAY-XMD', 'Safari', '1.0.0'],
    });

    // Convert yes/no env vars to boolean
    const autoRead = process.env.AUTO_READ?.toLowerCase() === 'yes';
    const antiDelete = process.env.ANTI_DELETE_MESSAGE?.toLowerCase() === 'yes';
    const autoViewStatus = process.env.AUTO_REACT_STATUS?.toLowerCase() === 'yes';
    const autoReact = process.env.AUTO_REACT?.toLowerCase() === 'yes';

    // ===== Features Inline Yes/No =====

    // Auto Read Messages
    if (autoRead) sock.ev.on('messages.upsert', async ({ messages }) => {
        for (let msg of messages) if (!msg.key.fromMe) await sock.readMessages([msg.key]);
    });

    // Anti Delete
    if (antiDelete) sock.ev.on('message-revoke-everyone', async (item) => {
        if (item.message) console.log(chalk.red('⚠️ Message deleted:'), item.message);
    });

    // Auto View Status
    if (autoViewStatus) sock.ev.on('new-status', async ({ id }) => {
        try {
            await sock.chatRead(id, 1);
            console.log(chalk.cyan(`👀 Viewed status from ${id}`));
        } catch (err) { console.error('Error viewing status:', err); }
    });

    // Auto React to Messages
    if (autoReact) sock.ev.on('messages.upsert', async ({ messages }) => {
        for (let msg of messages) {
            if (!msg.key.fromMe && msg.message) {
                try { await sock.sendMessage(msg.key.remoteJid, { react: { text: EMOJI_REACT, key: msg.key } }); }
                catch (err) { console.log('Reaction error:', err.message); }
            }
        }
    });

    // ===== Connection Updates =====
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) console.log(chalk.red('❌ Session logged out. Scan again.'));
            else { console.log(chalk.red('🔁 Reconnecting...')); startBot(); }
        } else if (connection === 'open') console.log(chalk.green('✅ Bot is connected and running!'));
    });

    sock.ev.on('creds.update', saveCreds);
}

startBot();
