const { ActivityType, Events } = require("discord.js")
module.exports = (client, config) => {
  client.once(Events.ClientReady, () => {
    const name = config.ready.activity?.name || "Streaming"
    const url = config.ready.activity?.url || "https://twitch.tv/"
    client.user.setPresence({
      status: "online",
      activities: [{ name, type: ActivityType.Streaming, url }]
    })
    console.log(`Online: ${client.user.tag}`)
  })
}
