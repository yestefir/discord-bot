const fs = require('fs');
const path = require('path');

class Prefix {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commands = new Map();
    }

    async initialize() {
        await this.loadPrefixCommands();
    }

    async loadPrefixCommands() {
        const commandsPath = path.join(__dirname, '../../../commands/Prefix');

        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
            console.log(`Created directory: ${commandsPath}`);
        }

        const commandFiles = this.getFiles(commandsPath);
        console.log(`Found ${commandFiles.length} prefix command files`);

        for (const file of commandFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const command = require(file);

                if (command.name && typeof command.run === 'function') {
                    this.commands.set(command.name.toLowerCase(), command);
                    console.log(`[Prefix] command: ${command.name}`);
                } else {
                    console.warn(`!!!!!!!!! ERROR: ${file}`);
                }
            } catch (error) {
                console.error(`Failed to load prefix command ${file}: ${error.message}`);
            }
        }
    }

    async handleMessage(message, prefix) {
        if (!message.guild || message.author.bot) return;

        const prefixes = Array.isArray(prefix) ? prefix : [prefix];
        let usedPrefix = null;

        for (const p of prefixes) {
            if (message.content.startsWith(p)) {
                usedPrefix = p;
                break;
            }
        }

        if (!usedPrefix) return;

        const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = this.commands.get(commandName);

        if (!command) {
            console.warn(`Unknown prefix command: ${commandName}`);
            return;
        }

        try {
            await command.run(this.client, message, args, this.config);
        } catch (error) {
            console.error(`Prefix command error ${commandName}: ${error.message}`);
            if (message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
                message.reply('❌ Bir hata oluştu, lütfen daha sonra tekrar deneyin.')
                    .then((msg) => setTimeout(() => msg.delete().catch(() => { }), 1500));
            }
        }
    }

    async reload() {
        this.commands.clear();
        await this.loadPrefixCommands();
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

module.exports = Prefix;