const { performance } = require("perf_hooks");
const { zokou } = require(__dirname + "/../framework/zokou");

zokou({ nomCom: "ping", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const start = performance.now();
  const { ms, repondre } = commandeOptions;

  const ping = performance.now() - start;

  let message = `
『 𝗔𝗡𝗬𝗪𝗔𝗬-𝗫𝗠𝗗 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘 』

*Ping* : ${ping.toFixed(4)} ms ⚡
*Speed* : ${ping.toFixed(2)} ms 🚀
*Status* : Online ✅

🛠 Powered by: *Anyway-XMD*
`;

  await repondre(message);
});
