const fs = require('fs');
const path = require('path');
class Menu {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.handlers = new Map();
    }
    initialize() {
        this.loadMenuHandlers();
    }
    loadMenuHandlers() {
        const menuPath = path.join(__dirname, '../../../handlers/Menu');
        if (!fs.existsSync(menuPath)) {
            fs.mkdirSync(menuPath, { recursive: true });
        }
        const menuFiles = this.getFiles(menuPath);
        for (const file of menuFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const menuAction = require(file);
                if (menuAction.value && typeof menuAction.execute === 'function') {
                    this.handlers.set(menuAction.value, menuAction.execute);
                } else {
                    console.error(`Hatalı menü handler formatı: ${file}`);
                }
            } catch (err) {
                console.error(`Menü handler yüklemesi sırasında hata: ${file} - ${err.message}`);
            }
        }
    }
    async handleInteraction(interaction) {
        try {
            if (!interaction.isRepliable() || !interaction.isStringSelectMenu()) {
                return;
            }
            const customIdParts = interaction.customId.split('_');
            const handlerName = customIdParts[0];
            if (interaction.customId === 'help_menu') {
                return;
            }
            const handler = this.handlers.get(handlerName);
            if (!handler) {
                return interaction.reply({
                    content: 'Bu seçenek için işlem tanımlanmamış.',
                    ephemeral: true
                }).catch(err => {
                    console.error(`Menü yanıt hatası: ${err.message}`);
                });
            }
            await handler(interaction);
        } catch (error) {
            console.error(`Menü işleme hatası ${interaction.customId || 'bilinmeyen'}: ${error.message}`);
            if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                    ephemeral: true
                }).catch(() => {
                });
            }
        }
    }
    reload() {
        this.handlers.clear();
        this.loadMenuHandlers();
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
module.exports = Menu;