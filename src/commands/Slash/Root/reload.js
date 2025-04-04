const { SlashCommandBuilder ,PermissionsBitField} = require('discord.js');
const Emote = require('../../../config/emote.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Botu yeniden baslatır')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), 
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olma gerekli!', ephemeral: true });
        }
        await interaction.reply( `${Emote.LoadingEmote}`);
        process.exit(1);
    },
};
