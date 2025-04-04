const { Events } = require('discord.js');

// Sunuuyaa Girenleri  dinleyen bir event örneği

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
   
  }
}