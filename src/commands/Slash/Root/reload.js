const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'restart',
    description: 'Tüm komutları yeniden başlatır',
    aliases: ['reload', 'reboot'],
    async run(client, message, args, config) {
        if (message.author.id !== config.ownerId && !config.adminIds?.includes(message.author.id)) {
            return message.reply('❌ Bu komutu kullanma yetkiniz yok!').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }
        const loadingEmbed = new EmbedBuilder()
            .setColor('#FFCC00')
            .setTitle('⚙️ Komutlar Yeniden Başlatılıyor...')
            .setDescription('Tüm komut işleyicileri yeniden yükleniyor, lütfen bekleyin.')
            .setTimestamp();
        const loadingMessage = await message.channel.send({ embeds: [loadingEmbed] });
        try {
            const reloadStatus = await client.core.reload();
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Komutlar Yeniden Başlatıldı')
                .setDescription('Tüm komut işleyicileri başarıyla yeniden yüklendi.')
                .addFields(
                    { name: 'Slash Komutları', value: `${reloadStatus.commands} adet`, inline: true },
                    { name: 'Prefix Komutları', value: `${reloadStatus.prefixCommands} adet`, inline: true },
                    { name: 'Buton İşleyicileri', value: `${reloadStatus.buttonHandlers} adet`, inline: true },
                    { name: 'Menü İşleyicileri', value: `${reloadStatus.menuHandlers} adet`, inline: true },
                    { name: 'Modal İşleyicileri', value: `${reloadStatus.modalHandlers} adet`, inline: true }
                )
                .setFooter({ text: `${message.author.tag} tarafından talep edildi` })
                .setTimestamp();
            await loadingMessage.edit({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Yeniden başlatma hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Yeniden Başlatma Başarısız')
                .setDescription('Komutları yeniden yüklerken bir hata oluştu.')
                .addFields(
                    { name: 'Hata Mesajı', value: `\`\`\`${error.message}\`\`\`` }
                )
                .setFooter({ text: `${message.author.tag} tarafından talep edildi` })
                .setTimestamp();
            await loadingMessage.edit({ embeds: [errorEmbed] });
        }
    }
};