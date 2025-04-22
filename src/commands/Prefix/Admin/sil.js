const { PermissionsBitField } = require(`discord.js`);
const Emote = require(`../../../config/genaral/Emote.json`)
const main = require(`../../../config/genaral/main.json`)

module.exports = {
    name: `sil`,
    subname: ["clear","sıl","temizle"],
    description: `Belirtilen sayıda mesajı siler.`,



    /**
     *
     * @param {import(`discord.js`).Client} client 
     * @param {import(`discord.js`).Message} message 
     * @param {Array<string>} args 
     * @param {Object} config 
     */

    
    async run(client, message, args, config) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply(`${Emote.noEmote} Bu komutu kullanmak için mesajları yönetme iznine sahip olmalısın.`).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }
        if (!args.length) {
            return message.reply(`${Emote.noEmote} Silinecek mesaj sayısını belirtmelisin. Kullanım: \`${main.prefix}sil <miktar>\``).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply(`${Emote.noEmote} Lütfen 1 ile 100 arasında geçerli bir sayı belirtin.`).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }
        const channel = message.channel;
        try {
            const deletedMessages = await channel.bulkDelete(amount, true);
            const replyMessage = await message.channel.send(`${Emote.yesEmote} ${deletedMessages.size} mesaj başarıyla silindi.`);
            setTimeout(() => {
                replyMessage.delete().catch(() => {});
            }, 4000);
        } catch (error) {
            console.error(`[Prefix Komut Hatası] sil:`, error);
            message.reply(`${Emote.noEmote} Mesajları silerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.`).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }
    },
};