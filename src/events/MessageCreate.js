const { Events } = require('discord.js');
const { loadAfkData, removeAfk, getAfkReason } = require('../utils/afk/AfkSystem');
const calculateSimilarity = require('../utils/message/core');
const { createEmbed } = require('../utils/message/embed');
const settings = require('../config/genaral/otomesaj.json');

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
    try {
      if (!settings.responses || !Array.isArray(settings.responses)) {
        console.error('Invalid settings.json format: responses array is missing or not an array');
        return;
      }   
      const messageContent = message.content.toLowerCase();
      const similarityThreshold = settings.similarityThreshold || 80; // Default to 80% if not specified
      
      for (const response of settings.responses) {
        if (!response.trigger || !response.reply) continue;
        
        const triggerLower = response.trigger.toLowerCase();
        
        // Calculate similarity
        const similarity = calculateSimilarity(messageContent, triggerLower);
        
        if (similarity >= similarityThreshold) {   
          const useEmbed = response.embed === true || response.embed === "true"; 
          if (useEmbed) {
            const embed = createEmbed({
              description: response.reply
            });
            
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: true } });
          } else {
            await message.reply({
              content: response.reply,
              allowedMentions: { repliedUser: true }
            });
          } 
          break;
        }
      }
    } catch (error) {
      console.error('Error in MessageCreate event:', error);
    }
  },
};