const { Events } = require('discord.js');

// Sunucuya Çıkanları dinleyen bir event örneği

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
   }
}