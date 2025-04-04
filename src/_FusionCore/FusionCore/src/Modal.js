const fs = require('fs');
const path = require('path');
class Modal {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.handlers = new Map();
        this.prefixHandlers = new Map(); 
    }
    initialize() {
        this.loadModalHandlers();
    }
    loadModalHandlers() {
        const modalPath = path.join(__dirname, '../../../handlers/Modal');
        if (!fs.existsSync(modalPath)) {
            fs.mkdirSync(modalPath, { recursive: true });
            console.log(`Created directory: ${modalPath}`);
        }
        const modalFiles = this.getFiles(modalPath);
        console.log(`Found ${modalFiles.length} modal handler files`);
        for (const file of modalFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const modalAction = require(file);
                if (modalAction.customId && typeof modalAction.execute === 'function') {
                    if (modalAction.customId.endsWith('_')) {
                        this.prefixHandlers.set(modalAction.customId, modalAction.execute);
                        console.log(`[Modal] prefix handler: ${modalAction.customId}`);
                    } else {
                        this.handlers.set(modalAction.customId, modalAction.execute);
                        console.log(`[Modal] exact handler: ${modalAction.customId}`);
                    }
                } else {
                    console.warn(`Invalid modal handler format: ${file}`);
                }
            } catch (err) {
                console.error(`Failed to load modal handler ${file}: ${err.message}`);
            }
        }
    }
    async handleInteraction(interaction) {
        const exactHandler = this.handlers.get(interaction.customId);
        if (exactHandler) {
            return this.executeHandler(exactHandler, interaction);
        }
        for (const [prefix, handler] of this.prefixHandlers) {
            if (interaction.customId.startsWith(prefix)) {
                return this.executeHandler(handler, interaction);
            }
        }
        return interaction.reply({
            content: 'Bu modal için işlem tanımlanmamış.',
            ephemeral: true
        });
    }
    async executeHandler(handler, interaction) {
        try {
            await handler(interaction);
        } catch (error) {
            console.error(`Modal processing error ${interaction.customId}:`, error);
            await interaction.reply({
                content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            }).catch(() => {});
        }
    }
    reload() {
        this.handlers.clear();
        this.prefixHandlers.clear();
        this.loadModalHandlers();
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
module.exports = Modal;