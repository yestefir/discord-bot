const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('handler')
        .setDescription('Tüm handlerları listeler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    guildOnly: false,
    async execute(interaction) {
        const client = interaction.client;
        if (!client.Core) {
            return interaction.reply({
                content: 'Core sistemi yüklenemedi!',
                ephemeral: true
            });
        }
        const core = client.Core;
        const slashCommands = core.slashHandler.commands.size || 0;
        const slashSubcommands = core.slashHandler.subcommands.size || 0;
        const prefixCommands = core.prefixHandler.commands.size || 0;
        const prefixAliases = core.prefixHandler.aliases.size || 0;
        const buttonHandlers = core.buttonHandler.handlers.size || 0;
        const menuHandlers = core.menuHandler.handlers.size || 0;
        const modalHandlers = core.modalHandler.handlers.size || 0;
        const modalPrefixHandlers = core.modalHandler.prefixHandlers.size || 0;
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