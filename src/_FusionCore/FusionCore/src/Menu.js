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
            console.log(`Created directory: ${menuPath}`);
        }

        const menuFiles = this.getFiles(menuPath);
        console.log(`Found ${menuFiles.length} menu handler files`);

        for (const file of menuFiles) {
            try {
                delete require.cache[require.resolve(file)];
                const menuAction = require(file);

                if (menuAction.value && typeof menuAction.execute === 'function') {
                    this.handlers.set(menuAction.value, menuAction.execute);
                    console.log(`[Menu] handler: ${menuAction.value}`);
                } else {
                    console.warn(`Invalid menu handler format: ${file}`);
                }
            } catch (err) {
                console.error(`Failed to load menu handler ${file}: ${err.message}`);
            }
        }
    }

    async handleInteraction(interaction) {
        // Check if it's a select menu interaction
        if (!interaction.isStringSelectMenu()) {
            return;
        }

        // Get the selected value
        const selectedValue = interaction.values[0];
        console.log('Selected Value:', selectedValue);

        const handler = this.handlers.get(selectedValue);

        if (!handler) {
            return interaction.reply({
                content: 'Bu seçenek için işlem tanımlanmamış.',
                ephemeral: true
            });
        }

        try {
            await handler(interaction);
        } catch (error) {
            console.error(`Menu processing error ${selectedValue}: ${error.message}`);
            await interaction.reply({
                content: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            }).catch(() => { });
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