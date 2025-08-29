const { REST, Routes, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async (client, commandsPath, config) => {
  const TOKEN    = config?.token    || process.env.TOKEN;
  const CLIENTID = config?.clientId || process.env.CLIENT_ID;
  const GUILDID  = config?.guildId  || process.env.GUILD_ID;

  if (!TOKEN || !CLIENTID || !GUILDID) {
    console.error("❌ TOKEN/CLIENTID/GUILDID eksik! (.env veya config.js)");
    return;
  }

  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory()
        ? walk(full)
        : (/\.(c|m)?js$/i.test(e.name) ? [full] : []);
    });

  const files = fs.existsSync(commandsPath) ? walk(commandsPath) : [];
  client.slashCommands ??= new Collection();

  const body = [];
  for (const file of files) {
    try {
      delete require.cache[require.resolve(file)];
      let mod = require(file);
      if (mod?.default) mod = mod.default;

      const name = mod?.data?.name;
      const builderOk = !!mod?.data?.toJSON;
      const run = mod?.execute || mod?.runSlash;

      if (!name || !builderOk || !run) {
        console.warn("⚠️ Atlandı (eksik export):", path.relative(process.cwd(), file));
        continue;
      }

      client.slashCommands.set(name, { ...mod, execute: run });
      body.push(mod.data.toJSON());
      console.log(`✅ /${name}`);
    } catch (e) {
      console.warn("⚠️ Yüklenemedi:", path.relative(process.cwd(), file), "-", e.message);
    }
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  if (process.env.CLEAR_GLOBAL === "true") {
    try {
      console.log("[deploy] GLOBAL komutlar temizleniyor...");
      await rest.put(Routes.applicationCommands(CLIENTID), { body: [] });
      console.log("[deploy] GLOBAL komutlar temizlendi.");
    } catch (e) {
      console.warn("[deploy] Global temizleme hatası:", e.message);
    }
  }

  try {
    console.log(`[deploy] ${body.length} komut guild'e yazılıyor...`);
    await rest.put(Routes.applicationGuildCommands(CLIENTID, GUILDID), { body });
    console.log("✅ Guild komutları yazıldı.");
  } catch (e) {
    console.error("❌ Guild deploy hatası:", e);
  }
};
