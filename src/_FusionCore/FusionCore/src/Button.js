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
            console.log(`Created directory: ${buttonPath}`);
        }

        const buttonFiles = this.getFiles(buttonPath);
        console.log(`Found ${buttonFiles.length} button handler files`);

        for (const file of buttonFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const button = require(file);

                if (button.customId && typeof button.execute === 'function') {
                    this.handlers.set(button.customId, button.execute);
                    console.log(`[Button] handler: ${button.customId}`);
                } else {
                    console.warn(`Invalid button handler format: ${file}`);
                }
            } catch (err) {
                console.error(`Failed to load button handler ${file}: ${err.message}`);
            }
        }
    }

    async handleInteraction(interaction) {
        // Önek eşleşmesi için buton ID'sini kontrol et
        const buttonId = interaction.customId;
        let handler;
    
        // Önekleri kontrol et (örneğin: "tsr_first_", "tsr_last_")
        if (buttonId.startsWith('tsr_first_')) {
            handler = this.handlers.get('tsr_first_');
        } else if (buttonId.startsWith('tsr_last_')) {
            handler = this.handlers.get('tsr_last_');
        } else if (buttonId.startsWith('tsr_next_')) {
            handler = this.handlers.get('tsr_next_');
        } else if (buttonId.startsWith('tsr_prev_')) {
            handler = this.handlers.get('tsr_prev_');
        } else {
            // Diğer butonlar için tam eşleşme
            handler = this.handlers.get(buttonId);
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
            console.error(`Button processing error: ${error.message}`);
            await interaction.reply({
                content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            }).catch(() => {});
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