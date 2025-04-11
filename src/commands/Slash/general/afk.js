const { SlashCommandBuilder } = require('discord.js');
const { loadAfkData, setAfk, removeAfk } = require('../../../utils/afk/AfkSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('AFK durumunuzu ayarlayın')
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('AFK olma sebebinizi belirtin')
        .setRequired(false)
    ),

  async execute(interaction) {
    const afkData = loadAfkData();
    const user = interaction.user;
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const guild = interaction.guild;

    if (afkData[user.id]) {
      const afkDuration = await removeAfk(user, afkData, guild);

      await interaction.reply({
        embeds: [{
          title: '🌟 AFK Modundan Çıkıldı',
          description: `${user.username}, artık AFK değilsin!\n${afkDuration}`,
          color: 0x2ecc71,
          footer: {
            text: `${interaction.guild.name}`,
            icon_url: interaction.guild.iconURL()
          },
          timestamp: new Date()
        }]
      });
      return;
    }

    await setAfk(user, reason, afkData, guild);

    await interaction.reply({
      embeds: [{
        title: '🌙 AFK Moduna Geçildi',
        description: `${user.username}, artık AFK modundasın!\n**Sebep:** ${reason}`,
        color: 0x3498db,
        footer: {
          text: `${interaction.guild.name}`,
          icon_url: interaction.guild.iconURL()
        },
        timestamp: new Date()
      }]
    });
  },
};
