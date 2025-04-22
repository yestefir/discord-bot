const fs = require('fs');
const path = require('path');
class Button {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.handlers = new Map();
    }
    initialize() {
        this.loadButtonHandlers();
    }
    loadButtonHandlers() {
        const buttonPath = path.join(__dirname, '../../../handlers/Button');
        if (!fs.existsSync(buttonPath)) {
            fs.mkdirSync(buttonPath, { recursive: true });
        }
        const buttonFiles = this.getFiles(buttonPath);
        
        for (const file of buttonFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const buttonModule = require(file);
                const handlers = Array.isArray(buttonModule) ? buttonModule : [buttonModule];
                for (const handler of handlers) {
                    if (handler.customId && typeof handler.execute === 'function') {
                        if (handler.customId.endsWith('_')) {
                            this.handlers.set(handler.customId, handler.execute);
                        } else {
                            this.handlers.set(handler.customId, handler.execute);
                        }
                    } else {
                        console.error(`Hatalı buton handler formatı: ${file}`);
                    }
                }
            } catch (err) {
                console.error(`Buton handler yüklemesi sırasında hata: ${file} - ${err.message}`);
            }
        }
    }
    async handleInteraction(interaction) {
        const customId = interaction.customId;
        let handler = this.handlers.get(customId);
        if (!handler) {
            const prefix = customId.split('_').slice(0, -1).join('_') + '_';
            handler = this.handlers.get(prefix);
        }
        if (!handler) {
            return interaction.reply({
                content: 'Bu buton için işlem tanımlanmamış.',
                ephemeral: true
            });
        }
        try {
            await handler(interaction);
        } catch (error) {
            console.error(`Buton işleme hatası ${customId}: ${error.message}`);
            await interaction.reply({
                content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            }).catch((replyError) => {
                console.error(`Hata yanıtı gönderilemedi: ${replyError.message}`);
            });
        }
    }
    reload() {
        this.handlers.clear();
        this.loadButtonHandlers();
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
module.exports = Button;