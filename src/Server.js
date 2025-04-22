const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { interactions } = require('./core/interaction/Core');
const { EventCore  } = require('./core/event/EventCore');
const config = require('./config/genaral/main.json');
const JsonManager = require('../Database/SuperCore/JsonManager')

const jsonManager = new JsonManager()
const client = new Client({
    partials: [
        Partials.GuildMember,
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
    shards: 'auto',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
    ],
});

async function initializeinteractions() {
    try {
        client.interactions = new interactions(client, config);
        jsonManager.initializeBackup();
        client.interactions.setupListeners();
        await client.interactions.initialize();
    } catch (error) {
        console.error("interactions başlatma hatası:", error);
    }
}

EventCore(client);

client.once('ready', async () => {
    await initializeinteractions();
});

client.login(config.MainBotToken)
    .then(() => {
        console.log("Bot oturum açtı, hazırlanıyor...");
    })
    .catch((err) => {
        console.error("Bot oturum açarken hata oluştu:", err);
    });

process.on('unhandledRejection', (error) => {
    console.error('İşlenmeyen Promise Hatası:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Yakalanmayan Hata:', error);
});