const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Botun gecikmesini ve API hızını ölçer."),

  async runSlash(client, interaction) {
    const start = Date.now();
    await interaction.deferReply();

    const end = Date.now();
    const latency = end - start;
    const apiPing = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🏓 Pong!")
      .setDescription("İşte gecikme değerleri:")
      .addFields(
        { name: "Mesaj Gecikmesi", value: `\`${latency}ms\``, inline: true },
        { name: "API Gecikmesi", value: `\`${apiPing}ms\``, inline: true }
      )
      .setFooter({ text: `İsteyen: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("pingAgain")
      .setLabel("🔄 Tekrar Ölç")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);
    await interaction.editReply({ embeds: [embed], components: [row] });

    const filter = (i) => i.customId === "pingAgain" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (i) => {
      const newLatency = Date.now() - start;
      const newApiPing = client.ws.ping;

      const newEmbed = EmbedBuilder.from(embed)
        .setTitle("🏓 Yeniden Ölçüm")
        .spliceFields(0, 2, 
          { name: "Mesaj Gecikmesi", value: `\`${newLatency}ms\``, inline: true },
          { name: "API Gecikmesi", value: `\`${newApiPing}ms\``, inline: true }
        );

      await i.update({ embeds: [newEmbed], components: [row] });
    });

    collector.on("end", async () => {
      const disabledButton = ButtonBuilder.from(button).setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(disabledButton);
      await interaction.editReply({ components: [disabledRow] });
    });
  }
};
