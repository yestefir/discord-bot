const { EmbedBuilder } = require('discord.js');
const main = require('../../../config/genaral/main.json');
module.exports = {
    value: 'help',
    async execute(interaction) {
        try {
            const client = interaction.client;
            if (!client.interactions) {
                return interaction.reply({
                    content: 'interactions sistemi yüklenemedi!',
                    ephemeral: true
                });
            }
            const core = client.interactions;
            const selectedValue = interaction.values[0];
            const prefix = main.prefix || '!';
            if (selectedValue === 'slash_commands') {
                const slashCommands = [...core.slashHandler.commands.values()];
                const slashEmbed = new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle('⚙️ Slash Komutları')
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
                await interaction.update({ embeds: [slashEmbed] }).catch(err => {
                    console.error(`Menü güncelleme hatası: ${err.message}`);
                });
            }
            if (selectedValue === 'prefix_commands') {
                const prefixCommands = [...core.prefixHandler.commands.values()];
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
                await interaction.update({ embeds: [prefixEmbed] }).catch(err => {
                    console.error(`Menü güncelleme hatası: ${err.message}`);
                });
            }
        } catch (error) {
            console.error(`Menü handler hatası: ${error.message}`);
        }
    }
};