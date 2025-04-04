const { Events } = require('discord.js');

// Sunucuya yazılan yazıları dinleyen bir event  örneği

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
  }

}