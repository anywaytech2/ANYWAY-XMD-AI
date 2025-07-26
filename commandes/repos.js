// ANYWAY-XMD BOT REPO COMMAND

const { command } = require('../../utils') const fetch = require('node-fetch')

command({ pattern: 'repo', desc: 'Sends repo and support info', type: 'info', async handler(m) { const image = 'https://files.catbox.moe/b2ymep.jpeg' const githubRepo = 'https://api.github.com/repos/anywaytech2/ANYWAY-XMD-AI-'

try {
  const response = await fetch(githubRepo)
  const data = await response.json()

  if (!data || data.message === 'Not Found') {
    await m.bot.sendMessage(m.chat, { text: '⚠️ Repository info not found.' })
    return
  }

  const stars = data.stargazers_count || 0
  const forks = data.forks_count || 0
  const releaseDate = new Date(data.created_at).toLocaleDateString('en-GB')
  const updateDate = new Date(data.updated_at).toLocaleDateString('en-GB')

  const caption = `🌐 *ANYWAY-XMD SYSTEM - REPO INFO*

📦 Repository: https://github.com/anywaytech2/ANYWAY-XMD-AI- ⭐ Stars: ${stars} 🍴 Forks: ${forks}

🗓️ Created: ${releaseDate} 🔄 Updated: ${updateDate} 👨‍💻 Developed by: ANYWAY TECH

━━━━━━━━━━━━━━━━━━━━━━━ 📢 Follow our official channel for tutorials and updates:
https://whatsapp.com/channel/0029VagWQ255q08VTCRQKP09

👥 Join our WhatsApp Support Group:
https://chat.whatsapp.com/L9rLWs5VUg0Jx0qAynE2Tj?mode=ac_t`

await m.bot.sendMessage(m.chat, {
    image: { url: image },
    caption,
  })

} catch (error) {
  console.error('Error fetching repo:', error)
  await m.bot.sendMessage(m.chat, { text: '❌ Error retrieving repo info.' })
}

} })

