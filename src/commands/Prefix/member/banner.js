const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'banner',
    subname: ['afis', 'afiş', 'kapak'],
    description: 'Kullanıcının bannerını gösterir',
    
    /**
     * @param {import('discord.js').Client} client
     * @param {import('discord.js').Message} message
     * @param {string[]} args
     * @param {object} config
     */
    run: async (client, message, args, config) => {
        // Get target user (mentioned user or message author)
        const user = message.mentions.users.first() || message.author;
        
        try {
            // Get user's banner URL using Discord API
            const response = await axios.get(`https://discord.com/api/v10/users/${user.id}`, {
                headers: {
                    Authorization: `Bot ${client.token}`,
                },
            });
            
            const banner = response.data.banner;
            
            // Check if user has a banner
            if (banner) {
                // Format banner URL based on whether it's animated or not
                let bannerURL;
                if (banner.startsWith('a_')) {
                    bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}.gif?size=512`;
                } else {
                    bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}.png?size=512`;
                }
                
                // Create embed
                const embed = new EmbedBuilder()
                    .setTitle(`${user.username}'in Bannerı`)
                    .setImage(bannerURL)
                    .setColor('#0099ff')
                    .setTimestamp();
                
                // Send embed
                await message.channel.send({ embeds: [embed] });
            } else {
                // User doesn't have a banner
                const errorEmbed = new EmbedBuilder()
                    .setDescription(`${user.username} kullanıcısının bir bannerı yok.`)
                    .setColor('#ff0000');
                
                await message.channel.send({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('Banner alınırken hata:', error);
            
            // Error embed
            const errorEmbed = new EmbedBuilder()
                .setDescription('Banner alınırken bir hata oluştu.')
                .setColor('#ff0000');
            
            await message.channel.send({ embeds: [errorEmbed] });
        }
    },
};