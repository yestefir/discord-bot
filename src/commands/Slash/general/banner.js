const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Kullanıcının bannerını gösterir')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Başka bir kullanıcının bannerını görmek için seçin')
        .setRequired(false)
    ),
  async execute(interaction) {
    let user = interaction.user;

    if (interaction.options.getUser('user')) {
      user = interaction.options.getUser('user');
    }

    try {
      const response = await axios.get(`https://discord.com/api/v10/users/${user.id}`, {
        headers: {
          Authorization: `Bot ${interaction.client.token}`,
        },
      });

      const banner = response.data.banner;
      if (banner) {
        let bannerURL;
        if (banner.startsWith('a_')) {
          bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}.gif?size=512`;
        } else {
          bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}.png?size=512`;
        }

        await interaction.reply({
          content: `${user.username}'in bannerı:`,
          embeds: [{
            image: { url: bannerURL },
            title: `${user.username}'in Bannerı`
          }]
        });
      } else {
        await interaction.reply({
          content: `${user.username} kullanıcısının bir bannerı yok.`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Banner alınırken bir hata oluştu.',
        ephemeral: true
      });
    }
  },
};
