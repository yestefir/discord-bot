const { Events } = require('discord.js');

// Sunucudaki sese girme ve cıkış eventi

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState, newState) {

}

}