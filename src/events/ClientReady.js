const { Events, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const main = require('../config/genaral/main.json');


function setupActivityCycle(client) {

  const activities = main.Activity || ["Main.js Eksik"]; 
  let currentIndex = 0;
  
  client.user.setPresence({
    activities: [{ 
      name: activities[currentIndex], 
      type: 0 // 0 = Playing, 2 = Listening, 3 = Watching, 5 = Competing || Belki bunuda main.js eklerim W-W
    }],
    status: 'online'
  });
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % activities.length;
    const activity = activities[currentIndex];
    
    client.user.setActivity(activity, { type: 0 });
    
  }, 30000); 
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    console.log('@yestefir güvencesi ile');
    console.log("Hazırlanıyor...");
    try {
      setupActivityCycle(client);
      
      try {
        const guild = client.guilds.cache.get(main.ServerID);
        if (!guild) return console.error('Sunucu bulunamadı!');
        const voiceChannel = guild.channels.cache.get(main.VoiceChannelID);
        if (!voiceChannel) return console.error('Ses kanalı bulunamadı!');
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
        });
      } catch (error) {
        console.error('Ses kanalına bağlanırken hata oluştu:', error);
      }

      console.log("Bot Hazır!");
    } catch (error) {
      console.error("Bot başlatılırken hata oluştu:", error);
    }
  }
};