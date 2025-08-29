const { readdirSync } = require("fs")
const path = require("path")
module.exports = (client, commandsPath, config) => {
  const files = readdirSync(commandsPath).filter(f => f.endsWith(".js"))
  for (const file of files) {
    const cmd = require(path.join(commandsPath, file))
    if (cmd.name) client.commands.set(cmd.name, cmd)
  }
  client.on("messageCreate", async message => {
    if (!message.guild || message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return
    const args = message.content.slice(config.prefix.length).trim().split(/\s+/)
    const name = args.shift()?.toLowerCase()
    const cmd = client.commands.get(name)
    if (!cmd || !cmd.runPrefix) return
    try {
      await cmd.runPrefix(client, message, args, config)
    } catch {
      await message.reply("Bir hata oluştu.")
    }
  })
}
