const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const main = require('../../../config/genaral/main.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Tüm komutları listeler'),
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
        const prefix = main.prefix || '!';
        const slashCommands = [...core.slashHandler.commands.values()];
        const prefixCommands = [...core.prefixHandler.commands.values()];
        const mainEmbed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle('📚 Komut Yardım Menüsü')
            .setDescription(`Aşağıdaki menüden komut tipini seçerek detaylı bilgi alabilirsiniz.\n\nPrefix: \`${prefix}\``)
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || ''
            });
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('Komut tipini seçin')
                    .addOptions([
                        {
                            label: 'Slash Komutları',
                            description: 'Tüm / ile başlayan komutları görüntüle',
                            value: 'slash_commands',
                            emoji: '⚙️'
                        },
                        {
                            label: 'Prefix Komutları',
                            description: `Tüm ${prefix} ile başlayan komutları görüntüle`,
                            value: 'prefix_commands',
                            emoji: '📝'
                        }
                    ])
            );
        const reply = await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });
        const collector = reply.createMessageComponentCollector({ 
            filter: i => i.customId === 'help_menu' && i.user.id === interaction.user.id,
            time: 60000 
        });
        collector.on('collect', async i => {
            try {
                if (i.values[0] === 'slash_commands') {
                    const slashEmbed = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle('⚙️ Slash Komutları')
                        .setDescription('Aşağıda tüm slash komutları listelenmiştir.')
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL() || ''
                        });
                    if (slashCommands.length > 0) {
                        const sortedCommands = slashCommands.sort((a, b) => a.data.name.localeCompare(b.data.name));
                        let commandsText = '';
                        sortedCommands.forEach(cmd => {
                            if (cmd.data && cmd.data.name && cmd.data.description) {
                                commandsText += `**/${cmd.data.name}** - ${cmd.data.description}\n`;
                            }
                        });
                        slashEmbed.setDescription(commandsText || 'Komut bulunamadı.');
                    } else {
                        slashEmbed.setDescription('Hiç slash komutu bulunamadı.');
                    }
                    await i.update({ embeds: [slashEmbed], components: [row] });
                }
                if (i.values[0] === 'prefix_commands') {
                    const prefixEmbed = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle('📝 Prefix Komutları')
                        .setDescription(`Aşağıda tüm \`${prefix}\` ile başlayan komutlar listelenmiştir.`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL() || ''
                        });
                    if (prefixCommands.length > 0) {
                        const sortedCommands = prefixCommands.sort((a, b) => a.name.localeCompare(b.name));
                        let commandsText = '';
                        sortedCommands.forEach(cmd => {
                            const aliases = cmd.subname && Array.isArray(cmd.subname) ? `(${cmd.subname.join(', ')})` : '';
                            commandsText += `**${prefix}${cmd.name}** ${aliases} - ${cmd.description || 'Açıklama yok'}\n`;
                        });
                        prefixEmbed.setDescription(commandsText || 'Komut bulunamadı.');
                    } else {
                        prefixEmbed.setDescription('Hiç prefix komutu bulunamadı.');
                    }
                    await i.update({ embeds: [prefixEmbed], components: [row] });
                }
            } catch (error) {
                console.error(`Menü işleme hatası: ${error.message}`);
            }
        });
        collector.on('end', () => {
            try {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        StringSelectMenuBuilder.from(row.components[0])
                            .setDisabled(true)
                    );
                interaction.editReply({
                    components: [disabledRow]
                }).catch(() => {
                });
            } catch (error) {
            }
        });
    }
};