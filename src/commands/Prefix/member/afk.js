const { loadAfkData, setAfk, removeAfk } = require('../../../utils/afk/AfkSystem');

module.exports = {
  name: 'afk',
  subname: ["uzakta"],
  description: 'AFK durumunuzu ayarlayın',
  usage: '[sebep]',
  async run(client, message, args, config) {
    const afkData = loadAfkData();
    const user = message.author;
    const reason = args.join(' ') || 'Sebep belirtilmedi';
    const guild = message.guild;

    if (afkData[user.id]) {
      const afkDuration = await removeAfk(user, afkData, guild);

      await message.reply({
        embeds: [{
          title: '🌟 AFK Modundan Çıkıldı',
          description: `${user.username}, artık AFK değilsin!\n${afkDuration}`,
          color: 0x2ecc71,
          footer: {
            text: `${message.guild.name}`,
            icon_url: message.guild.iconURL()
          },
          timestamp: new Date()
        }]
      });
      return;
    }

    await setAfk(user, reason, afkData, guild);

    await message.reply({
      embeds: [{
        title: '🌙 AFK Moduna Geçildi',
        description: `${user.username}, artık AFK modundasın!\n**Sebep:** ${reason}`,
        color: 0x3498db,
        footer: {
          text: `${message.guild.name}`,
          icon_url: message.guild.iconURL()
        },
        timestamp: new Date()
      }]
    });
  }
};