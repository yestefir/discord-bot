const main = require('../../config/genaral/main.json');

const prefix = main.prefix;
const allowedServerId = main.ServerID;

class interactions {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commands = new Map();
        this.prefixCommands = new Map();
        this.buttonHandlers = new Map();
        this.menuHandlers = new Map();
        this.modalHandlers = new Map(); 
        this.initialized = false;

        this.Slash = require('./src/Slash');
        this.Prefix = require('./src/Prefix');
        this.Menu = require('./src/Menu');
        this.Button = require('./src/Button');
        this.Modal = require('./src/Modal'); 

        this.slashHandler = new this.Slash(this.client, this.config);
        this.prefixHandler = new this.Prefix(this.client, this.config);
        this.menuHandler = new this.Menu(this.client, this.config);
        this.buttonHandler = new this.Button(this.client, this.config);
        this.modalHandler = new this.Modal(this.client, this.config); 
    }

    async initialize() {
        if (this.initialized) {
            console.error("Core sistemi zaten başlatılmış!");
            return;
        }

        try {
            await this.slashHandler.initialize();
            await this.prefixHandler.initialize();
            this.menuHandler.initialize();
            this.buttonHandler.initialize();
            this.modalHandler.initialize(); 

            this.initialized = true;
        } catch (error) {
            console.error(`Core başlatma hatası: ${error.message}`);
        }
    }

    setupListeners() {
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.guild || interaction.guild.id !== allowedServerId) {
                if (interaction.isRepliable()) {
                    return interaction.reply({
                        content: 'Yetkisiz sunucuda kullanılamaz!',
                        ephemeral: true
                    }).catch(error => {
                        console.error(`Yetkisiz sunucu yanıtı gönderilemedi: ${error.message}`);
                    });
                }
                return;
            }

            try {
                if (interaction.isCommand()) {
                    await this.slashHandler.handleInteraction(interaction);
                } else if (interaction.isButton()) {
                    await this.buttonHandler.handleInteraction(interaction);
                } else if (interaction.isStringSelectMenu()) {
                    await this.menuHandler.handleInteraction(interaction);
                } else if (interaction.isModalSubmit()) { 
                    await this.modalHandler.handleInteraction(interaction);
                }
            } catch (error) {
                console.error(`Interaction işleme hatası: ${error.message}`);
            }
        });

        this.client.on('messageCreate', async (message) => {
            if (!message.guild || message.guild.id !== allowedServerId) return;
            
            try {
                await this.prefixHandler.handleMessage(message, prefix);
            } catch (error) {
                console.error(`Mesaj işleme hatası: ${error.message}`);
            }
        });
    }

    async reload() {
        try {
            this.commands.clear();
            this.prefixCommands.clear();
            this.buttonHandlers.clear();
            this.menuHandlers.clear();
            this.modalHandlers.clear(); 

            await this.slashHandler.reload();
            await this.prefixHandler.reload();
            this.buttonHandler.reload();
            this.menuHandler.reload();
            this.modalHandler.reload(); 

            return {
                commands: this.commands.size,
                prefixCommands: this.prefixCommands.size,
                buttonHandlers: this.buttonHandlers.size,
                menuHandlers: this.menuHandlers.size,
                modalHandlers: this.modalHandlers.size 
            };
        } catch (error) {
            console.error(`Handler yeniden yükleme hatası: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { interactions };