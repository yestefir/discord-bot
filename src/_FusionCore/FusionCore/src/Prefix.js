const fs = require('fs');
const path = require('path');

class Prefix {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commands = new Map();
        this.aliases = new Map();
    }

    async initialize() {
        await this.loadPrefixCommands();
    }

    async loadPrefixCommands() {
        const commandsPath = path.join(__dirname, '../../../commands/Prefix');
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }

        const commandFiles = this.getFiles(commandsPath);
        
        for (const file of commandFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const command = require(file);
                if (command.name && typeof command.run === 'function') {
                    this.commands.set(command.name.toLowerCase(), command);
                    
                    if (command.subname && Array.isArray(command.subname)) {
                        for (const alias of command.subname) {
                            this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
                        }
                    }
                } else {
                    console.error(`Hatalı prefix komut dosyası: ${file}`);
                }
            } catch (error) {
                console.error(`Prefix komut yüklemesi sırasında hata: ${file} - ${error.message}`);
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
        
        let command = this.commands.get(commandName);
        
        if (!command) {
            const mainCommandName = this.aliases.get(commandName);
            if (mainCommandName) {
                command = this.commands.get(mainCommandName);
            }
        }

        if (!command) {
            return;
        }

        try {
            await command.run(this.client, message, args, this.config);
            
            if (message.deletable) {
                await message.delete().catch(error => {
                    console.error(`Komut mesajı silinemedi: ${error.message}`);
                });
            }
        } catch (error) {
            console.error(`Prefix komut çalıştırma hatası ${commandName}: ${error.message}`);
            if (message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
                message.channel.send('❌ Bir hata oluştu, lütfen daha sonra tekrar deneyin.')
                    .then((msg) => setTimeout(() => msg.delete().catch(() => { }), 2500))
                    .catch(replyError => {
                        console.error(`Hata yanıtı gönderilemedi: ${replyError.message}`);
                    });
                
                if (message.deletable) {
                    await message.delete().catch(error => {
                        console.error(`Hata sonrası komut mesajı silinemedi: ${error.message}`);
                    });
                }
            }
        }
    }

    async reload() {
        this.commands.clear();
        this.aliases.clear();
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