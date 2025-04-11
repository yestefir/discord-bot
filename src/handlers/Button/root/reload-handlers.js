module.exports = {
    customId: 'reload_handlers',
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: 'Bu işlemi gerçekleştirmek için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }
        const client = interaction.client;
        if (!client.Core) {
            return interaction.reply({
                content: 'Core sistemi yüklenemedi!',
                ephemeral: true
            });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            await client.Core.reload();
            const embed = {
                color: 0x2B2D31,
                title: '✅ Handler Yönetimi',
                description: 'Tüm handlerlar başarıyla yeniden yüklendi!',
                timestamp: new Date().toISOString(),
                footer: {
                    text: interaction.guild.name,
                    icon_url: interaction.guild.iconURL() || ''
                }
            };
            await interaction.editReply({
                embeds: [embed]
            });
        } catch (error) {
            const embed = {
                color: 0xFF0000,
                title: '❌ Handler Yönetimi',
                description: 'Handlerlar yeniden yüklenirken bir hata oluştu!',
                fields: [
                    {
                        name: 'Hata',
                        value: `\`\`\`${error.message}\`\`\``
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: interaction.guild.name,
                    icon_url: interaction.guild.iconURL() || ''
                }
            };
            await interaction.editReply({
                embeds: [embed]
            });
        }
    }
};