const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('handler')
        .setDescription('Tüm handlerları listeler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    guildOnly: false,
    async execute(interaction) {
        const client = interaction.client;
        
        if (!client.interactions) {
            return interaction.reply({
                content: 'interactions sistemi yüklenemedi!',
                ephemeral: true
            });
        }
        
        const interactions = client.interactions;
        const slashCommands = interactions.slashHandler.commands.size || 0;
        const slashSubcommands = interactions.slashHandler.subcommands.size || 0;
        const prefixCommands = interactions.prefixHandler.commands.size || 0;
        const prefixAliases = interactions.prefixHandler.aliases.size || 0;
        const buttonHandlers = interactions.buttonHandler.handlers.size || 0;
        const menuHandlers = interactions.menuHandler.handlers.size || 0;
        const modalHandlers = interactions.modalHandler.handlers.size || 0;
        const modalPrefixHandlers = interactions.modalHandler.prefixHandlers.size || 0;
        
        const embed = {
            color: 0x2B2D31,
            title: '📋 Handler Yönetim Paneli',
            description: 'Sunucu içindeki tüm handler bilgileri burada listelenmektedir.',
            fields: [
                {
                    name: '⚙️ Slash Komutları',
                    value: `Ana Komutlar: **${slashCommands}**\nAlt Komutlar: **${slashSubcommands}**`,
                    inline: true
                },
                {
                    name: '📝 Prefix Komutları',
                    value: `Ana Komutlar: **${prefixCommands}**\nAlt İsimler: **${prefixAliases}**`,
                    inline: true
                },
                {
                    name: '🔘 Buton İşleyicileri',
                    value: `Toplam: **${buttonHandlers}**`,
                    inline: true
                },
                {
                    name: '📋 Menü İşleyicileri',
                    value: `Toplam: **${menuHandlers}**`,
                    inline: true
                },
                {
                    name: '📝 Modal İşleyicileri',
                    value: `Tam Eşleşen: **${modalHandlers}**\nÖnek Eşleşen: **${modalPrefixHandlers}**`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: interaction.guild.name,
                icon_url: interaction.guild.iconURL() || ''
            }
        };
        
        const reloadButton = {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 4,
                    label: 'Yeniden Yükle',
                    custom_id: 'reload_handlers'
                }
            ]
        };
        
        await interaction.reply({
            embeds: [embed],
            components: [reloadButton],
            ephemeral: true
        });
    }
};