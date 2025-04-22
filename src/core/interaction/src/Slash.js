const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('../../../config/genaral/main.json');
class Slash {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.subcommands = new Map();
    }
    async initialize() {
        if (!config.MainBotToken) {
            console.error("MainBotToken bulunmuyor!");
            process.exit(1);
        }
        await this.loadSlashCommands();
    }
    async loadSlashCommands() {
        const globalCommands = [];
        const guildCommands = new Map();
        const commandNames = new Set();
        const commandsPath = path.join(__dirname, '../../../commands/Slash');
        try {
            if (!fs.existsSync(commandsPath)) {
                fs.mkdirSync(commandsPath, { recursive: true });
            }
            const rest = new REST({ version: '10' }).setToken(config.MainBotToken);
            const guilds = await this.client.guilds.fetch();
            const commandFiles = this.getFiles(commandsPath);
            for (const file of commandFiles) {
                try {
                    if (file.includes('subcommands')) continue;
                    delete require.cache[require.resolve(file)];
                    const command = require(file);
                    if ('data' in command && 'execute' in command) {
                        const commandData = command.data.toJSON();
                        if (commandNames.has(commandData.name)) {
                            console.error(`Mükerrer komut: ${commandData.name}`);
                            continue;
                        }
                        commandNames.add(commandData.name);
                        if (command.guildOnly) {
                            const guildId = config.GuildID || config.MainBotID;
                            if (!guildCommands.has(guildId)) {
                                guildCommands.set(guildId, []);
                            }
                            guildCommands.get(guildId).push(commandData);
                        } else {
                            globalCommands.push(commandData);
                        }
                        this.commands.set(commandData.name, command);
                    } else {
                        console.error(`Hatalı komut dosyası: ${file}`);
                    }
                } catch (commandError) {
                    console.error(`Slash komut yüklemesi sırasında hata: ${file} - ${commandError.message}`);
                }
            }
            await this.loadSubcommands(commandsPath);
            if (globalCommands.length > 0) {
                await this.updateCommands(rest, Routes.applicationCommands(config.MainBotID), globalCommands, 'Global'); 
            }
            for (const [guildId] of guilds) {
                if (guildCommands.has(guildId)) {
                    await this.updateGuildCommands(rest, config.MainBotID, guildId, guildCommands.get(guildId) || []); 
                }
            }
        } catch (fsError) {
            console.error(`Slash komut yükleme hatası: ${fsError.message}`);
        }
    }
    async loadSubcommands(commandsPath) {
        const subdirs = fs.readdirSync(commandsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(commandsPath, dirent.name));
        for (const dir of subdirs) {
            const dirName = path.basename(dir);
            const subcommandsPath = path.join(dir, 'subcommands');
            if (fs.existsSync(subcommandsPath)) {
                const subcommandFiles = this.getFiles(subcommandsPath);
                for (const file of subcommandFiles) {
                    try {
                        delete require.cache[require.resolve(file)];
                        const subcommand = require(file);
                        if ('execute' in subcommand) {
                            const subcommandName = path.basename(file, '.js');
                            const key = `${dirName}:${subcommandName}`;
                            this.subcommands.set(key, subcommand);
                        } else {
                            console.error(`Hatalı alt komut dosyası: ${file}`);
                        }
                    } catch (subcommandError) {
                        console.error(`Alt komut yüklemesi sırasında hata: ${file} - ${subcommandError.message}`);
                    }
                }
            }
        }
    }
    async updateCommands(rest, route, commands, type) {
        try {
            const data = await rest.put(route, { body: commands });
            return data;
        } catch (apiError) {
            console.error(`${type} komut güncelleme hatası: ${apiError.message}`);
            return null;
        }
    }
    async updateGuildCommands(rest, MainBotID, guildId, commands) {
        try {
            const existingCommands = await rest.get(
                Routes.applicationGuildCommands(MainBotID, guildId)
            );
            const commandsToDelete = existingCommands.filter(cmd =>
                !commands.some(newCmd => newCmd.name === cmd.name)
            );
            for (const cmdToDelete of commandsToDelete) {
                await rest.delete(
                    Routes.applicationGuildCommand(MainBotID, guildId, cmdToDelete.id)
                );
            }
            if (commands.length > 0) {
                await this.updateCommands(
                    rest,
                    Routes.applicationGuildCommands(MainBotID, guildId),
                    commands,
                    `Guild ${guildId}`
                );
            }
        } catch (apiError) {
            console.error(`Sunucu ${guildId} komut güncelleme hatası: ${apiError.message}`);
        }
    }
    async handleInteraction(interaction) {
        if (!interaction.isCommand()) return;
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({
                content: 'Bu komut için işlem tanımlanmamış.',
                ephemeral: true
            });
        }
        try {
            if (interaction.options.getSubcommand(false)) {
                const subcommandName = interaction.options.getSubcommand();
                const subcommandKey = `${interaction.commandName}:${subcommandName}`;
                if (this.subcommands.has(subcommandKey)) {
                    const subcommand = this.subcommands.get(subcommandKey);
                    await subcommand.execute(interaction);
                    return;
                }
            }
            await command.execute(interaction);
        } catch (error) {
            console.error(`Komut çalıştırma hatası ${interaction.commandName}: ${error.message}`);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                console.error(`Hata yanıtı gönderilemedi: ${replyError.message}`);
            }
        }
    }
    async reload() {
        this.commands.clear();
        this.subcommands.clear();
        await this.loadSlashCommands();
    }
    getFiles(dir) {
        let files = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files = files.concat(this.getFiles(fullPath));
            } else if (item.isFile() && item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        return files;
    }
}
module.exports = Slash;