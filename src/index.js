const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Core } = require('./_FusionCore/FusionCore/Core');
const { EventCore  } = require('./_FusionCore/EventCore/EventCore');
const config = require('./config/genaral/main.json');

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

async function initializeFusionCore() {
    try {
        client.Core = new Core(client, config);
        client.Core.setupListeners();
        await client.Core.initialize();
    } catch (error) {
        console.error("FusionCore başlatma hatası:", error);
    }
}

EventCore(client);

client.once('ready', async () => {
    await initializeFusionCore();
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