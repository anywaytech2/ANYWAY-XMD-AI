const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou({ nomCom: "menu2", categorie: "Menu" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    
    var coms = {};
    var mode = s.MODE.toLowerCase() !== "yes" ? "PRIVATE" : "PUBLIC";

    cm.map(async (com) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ);

    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Info Header
    let infoMsg = `
╔════════════════════════════╗
║        🌟 𝗔𝗡𝗬𝗪𝗔𝗬 𝗫𝗠𝗗 🌟        ║
╠════════════════════════════╣
║ 🔖 MODE   : ${mode}
║ 👤 OWNER  : ${s.OWNER_NAME.toUpperCase()}
╚════════════════════════════╝\n\n`;

    // Menu Main
    let menuMsg = `
╔═━━━━「 🤖 𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨 」━━━━═╗
║ 📅 DATE : ${date}
║ 🕒 TIME : ${temps}
║ 💡 BOT  : ANYWAY XMD
║ 🧠 TECH : ANYWAY TECH
╚════════════════════════════╝\n`;

    // List Commands
    for (const cat in coms) {
        menuMsg += `\n📂 *${cat.toUpperCase()}*\n`;
        for (const cmd of coms[cat]) {
            menuMsg += `├─ 📌 ${prefixe}${cmd}\n`;
        }
    }

    // Footer
    menuMsg += `
╔═━━━━「 🔧 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 」━━━━═╗
║ 🤴 BOT BY   : ANYWAY KING
║ 🛠️ DEVELOPER: ANYWAY TECH
╚════════════════════════════╝\n`;

    const lien = mybotpic();

    try {
        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, {
                video: { url: lien },
                caption: infoMsg + menuMsg,
                footer: "I am *ANYWAY XMD*, developed by Anyway Tech",
                gifPlayback: true
            }, { quoted: ms });
        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, {
                image: { url: lien },
                caption: infoMsg + menuMsg,
                footer: "I am *ANYWAY XMD*, developed by Anyway Tech"
            }, { quoted: ms });
        } else {
            repondre(infoMsg + menuMsg);
        }
    } catch (e) {
        console.log("🥵🥵 Menu error " + e);
        repondre("🥵🥵 Menu error " + e);
    }
});
