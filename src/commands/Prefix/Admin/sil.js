const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: 'sil',
    subname: ["clear","sıl"],
    description: 'Belirtilen sayıda mesajı siler.',
    /**
     * Komutun çalıştırılma fonksiyonu
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array<string>} args 
     * @param {Object} config 
     */
    async run(client, message, args, config) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Bu komutu kullanmak için mesajları yönetme iznine sahip olmalısın.').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 1500);
            });
        }
        if (!args.length) {
            return message.reply('❌ Silinecek mesaj sayısını belirtmelisin. Kullanım: `!sil <miktar>`').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 1500);
            });
        }
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Lütfen 1 ile 100 arasında geçerli bir sayı belirtin.').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 1500);
            });
        }
        const channel = message.channel;
        try {
            const deletedMessages = await channel.bulkDelete(amount, true);
            const replyMessage = await message.channel.send(`${deletedMessages.size} mesaj başarıyla silindi.`);
            setTimeout(() => {
                replyMessage.delete().catch(() => {});
            }, 1500);
        } catch (error) {
            console.error(`[Prefix Komut Hatası] sil:`, error);
            message.reply('❌ Mesajları silerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 1500);
            });
        }
    },
};