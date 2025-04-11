const { Events } = require('discord.js');
const { loadAfkData, getAfkReason, removeAfk } = require('../utils/afk/AfkSystem');


module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || message.system) return;

    const afkData = loadAfkData();
    if (message.mentions.users.size > 0) {
      const mentionedUser = message.mentions.users.first();
      const afkReason = getAfkReason(mentionedUser, afkData);

      if (afkReason) {
        message.reply(`${mentionedUser.username} şu anda **${afkReason.reason}** sebebiyle AFK. (${afkReason.duration})`);
      }
    }
    if (afkData[message.author.id]) {
      const afkMessage = await removeAfk(message.author, afkData, message.guild);
      if (afkMessage) {
        message.reply(`AFK modundan çıktınız. ${afkMessage}`);
      }
    }

  }

}