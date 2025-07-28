// index.js require("dotenv").config(); const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys"); const fs = require("fs-extra"); const P = require("pino"); const chalk = require("chalk"); const figlet = require("figlet"); const moment = require("moment");

// Load config const config = process.env;

// Setup terminal display console.clear(); console.log(chalk.green(figlet.textSync(config.BOT_NAME || "ANYWAY XMD"))); console.log(chalk.yellow(Bot Started at ${moment().format("HH:mm:ss")}));

// Load features const autoRead = config.AUTO_READ_MESSAGES === "yes"; const autoReact = config.AUTO_REACT_MESSAGE === "yes"; const autoLikeStatus = config.AUTO_LIKE_STATUS === "yes"; const emojiLike = config.EMOJI_LIKE || "💚"; const antiDelete = config.ANTI_DELETE_MESSAGE === "yes"; const autoBlock = config.AUTO_BLOCK === "yes"; const anticall = config.ANTICALL === "yes"; const presenceType = config.PRESENCE || "1";

// Bot startup const startBot = async () => { const { state, saveCreds } = await useMultiFileAuthState("session"); const sock = makeWASocket({ printQRInTerminal: true, auth: state, logger: P({ level: "silent" }), browser: ["ANYWAY XMD", "Chrome", "1.0"], });

// Presence setup const presenceMap = { "1": "available", "2": "composing", "3": "recording", }; sock.ev.on("connection.update", ({ connection, lastDisconnect }) => { if (connection === "close") { const reason = lastDisconnect?.error?.output?.statusCode; if (reason === DisconnectReason.loggedOut) { console.log("Logged out, please scan again."); } else { startBot(); } } else if (connection === "open") { console.log(chalk.green("Bot connected successfully.")); } });

sock.ev.on("creds.update", saveCreds);

sock.ev.on("messages.upsert", async ({ messages, type }) => { if (!messages || !messages[0]) return; const msg = messages[0]; if (!msg.message) return;

const from = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;

// Auto read messages
if (autoRead) await sock.readMessages([msg.key]);

// Presence
if (presenceType in presenceMap) {
  await sock.sendPresenceUpdate(presenceMap[presenceType], from);
}

// Auto react
if (autoReact) {
  await sock.sendMessage(from, {
    react: {
      text: "✅",
      key: msg.key,
    },
  });
}

});

// Anti-delete if (antiDelete) { sock.ev.on("messages.delete", async (del) => { console.log(chalk.red("A message was deleted!")); // You can add custom restore or logging here }); }

// Auto like status if (autoLikeStatus) { sock.ev.on("status.update", async ({ statuses }) => { for (const status of statuses) { if (status.status) { await sock.sendMessage(status.jid, { react: { text: emojiLike, key: { remoteJid: status.jid, id: status.id, fromMe: false, }, }, }); } } }); }

// Anti call if (anticall) { sock.ev.on("call", async ({ from }) => { await sock.rejectCall(from); if (autoBlock) { await sock.updateBlockStatus(from, "block"); } }); } };

startBot();

