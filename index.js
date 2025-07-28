const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const dotenv = require('dotenv');
dotenv.config();

const { state, saveState } = useSingleFileAuthState('./auth_info.json');
const chalk = require('chalk');

const connect = async () => {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;

    // Auto Read
    if (process.env.AUTO_READ === 'true') {
      await sock.readMessages([msg.key]);
    }

    // Auto React
    if (process.env.AUTO_REACT === 'true') {
      await sock.sendMessage(from, { react: { text: process.env.LIKE_EMOJI || '💚', key: msg.key }});
    }
  });

  // Simulated Auto View & Like Status
  if (process.env.AUTO_VIEW_STATUS === 'true') {
    console.log(chalk.green('[AUTO VIEW STATUS]'), 'Enabled');
    // Add your view status logic here if needed
  }

  if (process.env.AUTO_LIKE_STATUS === 'true') {
    console.log(chalk.green('[AUTO LIKE STATUS]'), `Using emoji: ${process.env.LIKE_EMOJI}`);
    // Add your like status logic here if needed
  }

  // Anti Delete
  if (process.env.ANTI_DELETE === 'true') {
    sock.ev.on('messages.delete', async (del) => {
      console.log(chalk.red('[ANTI DELETE]'), 'A message was deleted:', del);
    });
  }

  console.log(chalk.cyanBright(`🤖 ${process.env.BOT_NAME} by ${process.env.OWNER_NAME} is running...`));
};

connect();
