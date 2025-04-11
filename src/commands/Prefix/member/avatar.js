const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    subname: ['av', 'pp', 'pfp'],
    description: 'Kullanıcının avatarını gösterir',
    
    /**
     * @param {import('discord.js').Client} client
     * @param {import('discord.js').Message} message
     * @param {string[]} args
     * @param {object} config
     */
    run: async (client, message, args, config) => {
        // Get target user (mentioned user or message author)
        const user = message.mentions.users.first() || message.author;
        
        // Get avatar URL
        const avatarURL = user.displayAvatarURL({ format: 'png', size: 512 });
        
        // Create embed
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'in Avatarı`)
            .setImage(avatarURL)
            .setColor('#0099ff')
            .setTimestamp();
        
        // Send embed
        await message.channel.send({ embeds: [embed] });
    },
};