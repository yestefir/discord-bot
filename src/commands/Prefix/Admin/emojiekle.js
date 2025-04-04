const { PermissionsBitField, EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'emojiekle',
    description: 'Belirtilen özel Discord emojilerini sunucuya ekler.',
    async run(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.reply('❌ Bu komutu kullanmak için **Emojileri Yönet** iznine sahip olmalısın.');
        }
        if (args.length < 1) {
            return message.reply('❌ Lütfen eklemek için en az 1 özel Discord emoji girin. Kullanım: `!emojiekle <:emoji1:1234567890> <:emoji2:1234567891> ...`');
        }
        const emojiMatches = message.content.match(/<a?:[^:]+:\d+>/g);
        if (!emojiMatches || emojiMatches.length === 0) {
            return message.reply('❌ Geçerli bir emoji bulunamadı. Lütfen özel Discord emojileri girin (örnek: `<:emojiAdı:1234567890>`).');
        }
        const guild = message.guild;
        let addedEmojis = [];
        let failedEmojis = [];
        const progressEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('Emoji Ekleme İşlemi Başlatıldı')
            .setDescription(`Toplam ${emojiMatches.length} emoji işlenecek...`)
            .addFields(
                { name: 'Eklenen Emojiler', value: 'Henüz yok', inline: true },
                { name: 'Başarısız Olanlar', value: 'Henüz yok', inline: true }
            )
            .setFooter({ text: `${message.author.tag} tarafından başlatıldı`, iconURL: message.author.displayAvatarURL() });
        const progressMessage = await message.reply({ embeds: [progressEmbed] });
        for (const [index, emojiInput] of emojiMatches.entries()) {
            try {
                const emojiMatch = emojiInput.match(/<a?:([^:]+):(\d+)>/);
                if (!emojiMatch) continue;
                const [, emojiName, emojiId] = emojiMatch;
                const isAnimated = emojiInput.startsWith('<a:');
                const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
                const createdEmoji = await guild.emojis.create({
                    attachment: emojiUrl,
                    name: emojiName,
                    reason: `${message.author.tag} tarafından eklendi`
                });
                addedEmojis.push({
                    name: emojiName,
                    id: createdEmoji.id,
                    animated: isAnimated
                });
                await updateProgress(progressMessage, {
                    current: index + 1,
                    total: emojiMatches.length,
                    added: addedEmojis.length,
                    failed: failedEmojis.length,
                    lastEmoji: `${isAnimated ? '<a:' : '<:'}${emojiName}:${createdEmoji.id}>`
                });
            } catch (error) {
                console.error('Emoji eklenirken hata:', error);
                const emojiName = emojiInput.match(/<a?:([^:]+):/)?.[1] || 'Bilinmeyen';
                failedEmojis.push({
                    name: emojiName,
                    reason: getErrorMessage(error)
                });
                await updateProgress(progressMessage, {
                    current: index + 1,
                    total: emojiMatches.length,
                    added: addedEmojis.length,
                    failed: failedEmojis.length,
                    lastEmoji: `${emojiInput} (Başarısız)`
                });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const resultEmbed = new EmbedBuilder()
            .setColor(addedEmojis.length > 0 ? '#00FF00' : '#FF0000')
            .setTitle('Emoji Ekleme Sonuçları')
            .setDescription(`İşlem tamamlandı! ${addedEmojis.length} emoji başarıyla eklendi.`)
            .addFields(
                {
                    name: `✅ Başarılı (${addedEmojis.length})`,
                    value: addedEmojis.length > 0 
                        ? addedEmojis.map(e => `${e.animated ? '<a:' : '<:'}${e.name}:${e.id}>`).join(' ') 
                        : 'Yok',
                    inline: false
                },
                {
                    name: `❌ Başarısız (${failedEmojis.length})`,
                    value: failedEmojis.length > 0 
                        ? failedEmojis.map(f => `\`${f.name}\`: ${f.reason}`).join('\n') 
                        : 'Yok',
                    inline: false
                }
            )
            .setFooter({ text: `${message.author.tag} tarafından tamamlandı`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        await progressMessage.edit({ embeds: [resultEmbed] });
        function getErrorMessage(error) {
            if (error.message.includes('Maximum number of emojis reached')) {
                return 'Sunucu emoji sınırı dolu';
            }
            if (error.message.includes('Invalid image data') || error.message.includes('Invalid Asset')) {
                return 'Geçersiz emoji verisi';
            }
            if (error.message.includes('size') || error.message.includes('too large')) {
                return 'Dosya boyutu çok büyük';
            }
            if (error.message.includes('ENOENT') || error.message.includes('404')) {
                return 'Emoji bulunamadı';
            }
            return 'Bilinmeyen hata';
        }
        async function updateProgress(message, { current, total, added, failed, lastEmoji }) {
            const progressEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('Emoji Ekleme İşlemi Devam Ediyor')
                .setDescription(`**Son işlenen emoji:** ${lastEmoji}\n\nİlerleme: **${current}/${total}** (${Math.round((current/total)*100)}%)`)
                .addFields(
                    { name: 'Eklenen Emojiler', value: added > 0 ? added.toString() : 'Henüz yok', inline: true },
                    { name: 'Başarısız Olanlar', value: failed > 0 ? failed.toString() : 'Henüz yok', inline: true }
                )
                .setFooter({ text: `${message.author.tag} tarafından başlatıldı`, iconURL: message.author.displayAvatarURL() });
            await message.edit({ embeds: [progressEmbed] });
        }
    }
};