const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Kullanıcının avatarını gösterir')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Başka bir kullanıcının avatarını görmek için seçin')
        .setRequired(false)
    ),
  async execute(interaction) {
    let user = interaction.user;

    if (interaction.options.getUser('user')) {
      user = interaction.options.getUser('user');
    }
    const avatarURL = user.displayAvatarURL({ format: 'png', size: 512 });
    await interaction.reply({
      content: `${user.username}'in avatarı:`,
      embeds: [{
        image: { url: avatarURL },
        title: `${user.username}'in Avatarı`
      }]
    });
  },
};
