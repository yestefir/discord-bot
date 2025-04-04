const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('../../../config/genaral/main.json'); // JSON dosyasını import edin

class Slash {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
    }

    async initialize() {
        // Token kontrolü
        if (!config.MainBotToken) {
            console.error("MainBotToken is missing in the configuration.");
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
                console.log(`Created directory: ${commandsPath}`);
            }

            const rest = new REST({ version: '10' }).setToken(config.MainBotToken); // JSON'dan token'ı al
            const guilds = await this.client.guilds.fetch();

            const commandFiles = this.getFiles(commandsPath);
            console.log(`Found ${commandFiles.length} slash command files`);

            for (const file of commandFiles) {
                try {
                    delete require.cache[require.resolve(file)];
                    const command = require(file);

                    if ('data' in command && 'execute' in command) {
                        const commandData = command.data.toJSON();

                        if (commandNames.has(commandData.name)) {
                            console.error(`Duplicate command: ${commandData.name}`);
                            continue;
                        }
                        commandNames.add(commandData.name);

                        if (command.guildOnly) {
                            const guildId = config.GuildID || config.ClientID;
                            if (!guildCommands.has(guildId)) {
                                guildCommands.set(guildId, []);
                            }
                            guildCommands.get(guildId).push(commandData);
                        } else {
                            globalCommands.push(commandData);
                        }

                        this.commands.set(commandData.name, command);
                        console.log(`[Slash] command: ${commandData.name}`);
                    } else {
                        console.warn(`!!!!!!!!! ERROR: ${file}`);
                    }
                } catch (commandError) {
                    console.error(`Failed to load slash command ${file}: ${commandError.message}`);
                }
            }

            console.log(`Total commands: ${globalCommands.length + Array.from(guildCommands.values()).flat().length}`);

            if (globalCommands.length > 0) {
                await this.updateCommands(rest, Routes.applicationCommands(config.ClientID), globalCommands, 'Global'); // JSON'dan ClientID'yi al
            }

            for (const [guildId] of guilds) {
                if (guildCommands.has(guildId)) {
                    await this.updateGuildCommands(rest, config.ClientID, guildId, guildCommands.get(guildId) || []); // JSON'dan ClientID'yi al
                }
            }

        } catch (fsError) {
            console.error(`Slash command loading error: ${fsError.message}`);
        }
    }

    async updateCommands(rest, route, commands, type) {
        try {
            const data = await rest.put(route, { body: commands });
            console.log(`${type} commands updated: ${data.length} total`);
            return data;
        } catch (apiError) {
            console.error(`${type} command update error: ${apiError.message}`);
            return null;
        }
    }

    async updateGuildCommands(rest, clientId, guildId, commands) {
        try {
            const existingCommands = await rest.get(
                Routes.applicationGuildCommands(clientId, guildId)
            );

            const commandsToDelete = existingCommands.filter(cmd =>
                !commands.some(newCmd => newCmd.name === cmd.name)
            );

            for (const cmdToDelete of commandsToDelete) {
                await rest.delete(
                    Routes.applicationGuildCommand(clientId, guildId, cmdToDelete.id)
                );
                console.log(`Deleted guild command: ${cmdToDelete.name} from guild ${guildId}`);
            }

            if (commands.length > 0) {
                await this.updateCommands(
                    rest,
                    Routes.applicationGuildCommands(clientId, guildId),
                    commands,
                    `Guild ${guildId}`
                );
            }
        } catch (apiError) {
            console.error(`Guild ${guildId} command update error: ${apiError.message}`);
        }
    }

    async handleInteraction(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({
                content: 'Bu komut için işlem tanımlanmamış.',
                ephemeral: true
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Command execution error ${interaction.commandName}: ${error.message}`);
            await interaction.reply({
                content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            }).catch(() => { });
        }
    }

    async reload() {
        this.commands.clear();
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