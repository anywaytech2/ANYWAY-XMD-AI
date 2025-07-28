require('dotenv').config()
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } = require("@adiwajshing/baileys")
const P = require('pino')
const qrcode = require('qrcode-terminal')

const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      )
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message,
          },
        }
      }
      return message
    }
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      qrcode.generate(qr, { small: true })
      console.log('Scan QR code above to login')
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed. Reconnecting:', shouldReconnect)
      if (shouldReconnect) startBot()
    }
    if (connection === 'open') {
      console.log('Connected to WhatsApp!')
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages) return
    const msg = m.messages[0]
    if (!msg.message) return
    if (msg.key && msg.key.remoteJid === 'status@broadcast') {
      if (process.env.AUTO_READ_STATUS === 'yes') {
        await sock.readMessages([msg.key])
      }
      if (process.env.AUTO_LIKE_STATUS === 'yes') {
        try {
          const emoji = process.env.EMOJI_LIKE || '💚'
          await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } })
        } catch (e) {
          console.log('Failed to like status:', e)
        }
      }
      return
    }

    // Auto read messages
    if (process.env.AUTO_READ_MESSAGES === 'yes') {
      try {
        await sock.readMessages([msg.key])
      } catch {}
    }

    // Auto react message in private chats
    if (process.env.AUTO_REACT_MESSAGE === 'yes' && msg.key.fromMe === false && msg.key.remoteJid.endsWith('@s.whatsapp.net')) {
      try {
        const emoji = process.env.EMOJI_LIKE || '💚'
        await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } })
      } catch {}
    }

    // Anti delete message
    if (process.env.ANTI_DELETE_MESSAGE === 'yes') {
      sock.ev.on('messages.delete', async (deletedMessages) => {
        for (const deleted of deletedMessages) {
          if (!deleted.key.fromMe) {
            const chatId = deleted.key.remoteJid
            const msgId = deleted.key.id
            try {
              await sock.sendMessage(chatId, {
                text: `Message deleted detected! Original message:\n\n${deleted.message ? JSON.stringify(deleted.message) : '[unknown]'}`,
                contextInfo: { mentionedJid: [deleted.key.participant || deleted.key.remoteJid] }
              })
            } catch {}
          }
        }
      })
    }

    // TODO: Add more features here like chatbot, anti-call, etc.
  })

  sock.ev.on('call', async (call) => {
    if (process.env.ANTICALL === 'yes') {
      try {
        await sock.rejectCall(call.callId)
      } catch {}
    }
  })

  // Save auth state on changes
  sock.ev.on('creds.update', saveState)
}

startBot()
