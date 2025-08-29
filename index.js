require("dotenv").config();
const { Client, Collection, Partials, GatewayIntentBits, Events } = require("discord.js");
const path = require("path");
const config = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.commands = new Collection();
client.slashCommands = new Collection();

const handlersPath = path.join(__dirname, "handlers");
const commandsPath = path.join(__dirname, "commands");
const eventsPath   = path.join(__dirname, "events");

require(path.join(eventsPath, "ready.js"))(client, config);

const prefixHandler = require(path.join(handlersPath, "prefixHandler.js"));
const slashHandler  = require(path.join(handlersPath, "slashHandler.js"));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.slashCommands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.runSlash(client, interaction, config);
  } catch {
    const payload = { content: "Bir hata oluştu.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

(async () => {
  try {
    await prefixHandler(client, commandsPath, config);

    console.log("[boot] Slash komutlari deploy ediliyor...");
    await slashHandler(client, commandsPath, config);
    console.log("[boot] Slash komutlari deploy edildi.");

    await client.login(config.token || process.env.TOKEN);
  } catch (err) {
    console.error("[boot] Hata:", err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
process.on("uncaughtException",  (e) => console.error("uncaughtException:", e));
