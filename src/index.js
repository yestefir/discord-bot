const { Client, GatewayIntentBits, Partials } = require('discord.js');

// FusionCore entegrasyonu
const { Core } = require('./_FusionCore/FusionCore/Core');
const { EventCore } = require('./_FusionCore/EventCore/EventCore');


// Config dosyası
const config = require('./config/genaral/main.json');

// Discord Client oluşturma
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

let fusionHandler;

client.once('ready', async () => {
    console.log('@yestefir güvencesi ile');
    console.log("Hazırlanıyor...");

    try {
        // FusionCore'u başlat
             fusionHandler = new Core(client, config);
             fusionHandler.setupListeners();
             await fusionHandler.initialize();
             

        // Event yükleyicisini çağır
        await EventCore(client);


        console.log(`${client.user.tag} hazır!`);
        } catch (error) {
        console.error("Bot başlatılırken hata oluştu:", error);
        }
});
/**
 * Botu başlat.
 */
client.login(config.MainBotToken)
    .then(() => {
        console.log("Bot oturum açtı, FusionCore hazırlanıyor...");
    })
    .catch((err) => {
        console.error("Bot oturum açarken hata oluştu:", err);
    });
