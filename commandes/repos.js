"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

zokou({ nomCom: "repo", catégorie: "Général", reaction: "🚀", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const repoApiUrl = 'https://api.github.com/repos/anywaytech2/ANYWAY-XMD-AI-';
  const bannerImage = 'https://files.catbox.moe/b2ymep.jpeg';

  try {
    const response = await fetch(repoApiUrl);
    const repoData = await response.json();

    if (repoData) {
      const starsCount = repoData.stargazers_count;
      const forksCount = repoData.forks_count;
      const lastUpdated = new Date(repoData.updated_at).toLocaleDateString('en-GB');
      const createdOn = new Date(repoData.created_at).toLocaleDateString('en-GB');
      const repositoryLink = repoData.html_url;

      const message = `🚀 *ANYWAY XMD - PROJECT INSIGHTS* 🚀

🔹 GitHub Repository:  
${repositoryLink}

⭐ Stargazers: ${starsCount}  
🍴 Forks: ${forksCount}

📅 Project Started: ${createdOn}  
🛠 Last Updated: ${lastUpdated}

👤 Managed by: *ANYWAY TECH*

📣 Follow our update channel:  
https://whatsapp.com/channel/0029VagWQ255q08VTCRQKP09

💬 Join the developer group for help/discussion:  
https://chat.whatsapp.com/L9rLWs5VUg0Jx0qAynE2Tj?mode=ac_t

🔧 Built with precision by ANYWAY TECH  
─────────────────────────────`;

      await zk.sendMessage(dest, { image: { url: bannerImage }, caption: message });
    } else {
      console.error("Unable to retrieve repository information.");
    }
  } catch (err) {
    console.error("Failed to fetch repository details:", err);
  }
});
