
const JsonManager = require('../../../../Database/SuperCore/JsonManager');
const config = require('../../../config/genaral/main.json')
module.exports = {
  name: 'backup',
  description: 'Sistem yedekleme işlemlerini yönetir',
  usage: 'backup <create/list/restore/config> [options]',
  async run(client, message, args,) {
    if (!config.OwnerID.includes(message.author.id)) {
        return message.reply('❌ Bu komutu kullanma yetkiniz yok.')
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      }
    const jsonManager = new JsonManager();
    const subCommand = args[0]?.toLowerCase();
    if (!subCommand || !['create', 'list', 'restore', 'config', 'categories'].includes(subCommand)) {
      return message.reply(
        '❓ Lütfen geçerli bir alt komut belirtin:\n' +
        '`.backup create` - Manuel yedekleme başlatır\n' +
        '`.backup list [kategori]` - Tüm yedekleme geçmişini veya belirli bir kategorinin geçmişini gösterir\n' +
        '`.backup categories` - Mevcut yedekleme kategorilerini listeler\n' +
        '`.backup restore <kategori> <dosya>` - Belirtilen yedeği geri yükler\n' +
        '`.backup config <show/edit>` - Yedekleme ayarlarını gösterir veya düzenler'
      );
    }
    if (subCommand === 'create') {
      const loadingMsg = await message.channel.send('⏳ Yedekleme başlatılıyor, lütfen bekleyin...');
      const result = await jsonManager.manualBackup();
      if (result) {
        return loadingMsg.edit('✅ Yedekleme başarıyla tamamlandı!');
      } else {
        return loadingMsg.edit('❌ Yedekleme sırasında bir hata oluştu, lütfen logları kontrol edin.');
      }
    }
    if (subCommand === 'categories') {
      const backups = jsonManager.getBackupHistory();
      const categories = [...new Set(backups.map(backup => backup.category))];
      if (categories.length === 0) {
        return message.reply('ℹ️ Henüz hiç yedek kategorisi bulunmuyor.');
      }
      const categoryList = categories.map((category, index) => {
        return `${index + 1}. \`${category}\``;
      }).join('\n');
      return message.reply(`📋 **Yedekleme Kategorileri:**\n${categoryList}`);
    }
    if (subCommand === 'list') {
      const category = args[1]; 
      let backups;
      if (category) {
        backups = jsonManager.backupManager.getCategoryBackupHistory(category);
        if (!backups || backups.length === 0) {
          return message.reply(`ℹ️ "${category}" kategorisinde henüz hiç yedek bulunmuyor.`);
        }
      } else {
        backups = jsonManager.getBackupHistory();
        if (!backups || backups.length === 0) {
          return message.reply('ℹ️ Henüz hiç yedek bulunmuyor.');
        }
      }
      const pageSize = 10;
      const page = parseInt(args[2]) || 1;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const totalPages = Math.ceil(backups.length / pageSize);
      const backupList = backups.slice(startIndex, endIndex).map((backup, index) => {
        const date = new Date(backup.time).toLocaleString('tr-TR');
        const size = (backup.size / 1024).toFixed(2) + ' KB';
        return `${startIndex + index + 1}. [${backup.category}] \`${backup.name}\` - ${date} (${size})`;
      }).join('\n');
      const title = category 
        ? `📋 **"${category}" Kategori Yedekleri (${page}/${totalPages}):**` 
        : `📋 **Tüm Yedekler (${page}/${totalPages}):**`;
      const navigation = totalPages > 1 
        ? `\n\nSayfa ${page}/${totalPages} - Diğer sayfalar için: \`.backup list ${category ? category + ' ' : ''}[sayfa_no]\`` 
        : '';
      return message.reply(`${title}\n${backupList}${navigation}`);
    }
    if (subCommand === 'restore') {
      const category = args[1];
      const backupName = args[2];
      if (!category || !backupName) {
        return message.reply('❌ Lütfen geri yüklenecek kategoriyi ve yedek dosyasını belirtin.\n' + 
          'Örnek: `.backup restore level-data stats-Data_2025-03-22T12-30-00.json`\n' +
          'Kategorileri görmek için `.backup categories`, yedek listesi için `.backup list [kategori]` komutunu kullanın.');
      }
      const confirmMessage = await message.reply(`⚠️ **DİKKAT:** "${category}" kategorisindeki "${backupName}" yedeğini geri yüklemek üzeresiniz. Bu işlem mevcut verilerin üzerine yazılmasına neden olabilir.\n\n` +
        'Onaylamak için 30 saniye içinde 👍 emoji tepkisi ekleyin.');
      try {
        await confirmMessage.react('👍');
        const filter = (reaction, user) => {
          return reaction.emoji.name === '👍' && user.id === message.author.id;
        };
        const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
        if (collected.size > 0) {
          const loadingMsg = await message.channel.send('⏳ Yedek geri yükleniyor, lütfen bekleyin...');
          const result = jsonManager.backupManager.restoreBackup(category, backupName);
          if (result) {
            return loadingMsg.edit('✅ Yedek başarıyla geri yüklendi! Değişikliklerin etkili olması için botu yeniden başlatmanız gerekebilir.');
          } else {
            return loadingMsg.edit('❌ Yedek geri yükleme sırasında bir hata oluştu, lütfen logları kontrol edin.');
          }
        }
      } catch (error) {
        return message.reply('⏱️ Zaman aşımı: Yedek geri yükleme işlemi iptal edildi.');
      }
    }
    if (subCommand === 'config') {
      const action = args[1]?.toLowerCase();
      const config = jsonManager.getBackupConfig();
      if (!action || action === 'show') {
        const lastBackup = config.lastBackupTime ? 
          new Date(config.lastBackupTime).toLocaleString('tr-TR') : 
          'Henüz yedekleme yapılmadı';
        return message.reply(
          '⚙️ **Yedekleme Ayarları:**\n' +
          `• Otomatik Yedekleme: ${config.autoBackup ? '✅ Aktif' : '❌ Devre Dışı'}\n` +
          `• Yedekleme Aralığı: Her ${config.backupInterval} saatte bir\n` +
          `• Maksimum Yedek Sayısı: ${config.maxBackups}\n` +
          `• Sıkıştırma: ${config.compressBackups ? '✅ Aktif' : '❌ Devre Dışı'}\n` +
          `• Son Yedekleme: ${lastBackup}`
        );
      }
      if (action === 'edit') {
        const setting = args[2]?.toLowerCase();
        const value = args[3];
        if (!setting || !value || !['auto', 'interval', 'max', 'compress'].includes(setting)) {
          return message.reply(
            '❓ Lütfen düzenlenecek ayarı ve değeri belirtin:\n' +
            '`.backup config edit auto true/false` - Otomatik yedeklemeyi açar/kapatır\n' +
            '`.backup config edit interval <saat>` - Yedekleme aralığını saat cinsinden ayarlar\n' +
            '`.backup config edit max <sayı>` - Maksimum yedek sayısını ayarlar\n' +
            '`.backup config edit compress true/false` - Sıkıştırmayı açar/kapatır'
          );
        }
        let newConfig = { ...config };
        if (setting === 'auto') {
          newConfig.autoBackup = value.toLowerCase() === 'true';
        } else if (setting === 'interval') {
          const interval = parseInt(value);
          if (isNaN(interval) || interval < 1) {
            return message.reply('❌ Yedekleme aralığı en az 1 saat olmalıdır.');
          }
          newConfig.backupInterval = interval;
        } else if (setting === 'max') {
          const max = parseInt(value);
          if (isNaN(max) || max < 1) {
            return message.reply('❌ Maksimum yedek sayısı en az 1 olmalıdır.');
          }
          newConfig.maxBackups = max;
        } else if (setting === 'compress') {
          newConfig.compressBackups = value.toLowerCase() === 'true';
        }
        const result = jsonManager.updateBackupConfig(newConfig);
        if (result) {
          return message.reply('✅ Yedekleme ayarları başarıyla güncellendi!');
        } else {
          return message.reply('❌ Ayarlar güncellenirken bir hata oluştu, lütfen logları kontrol edin.');
        }
      }
    }
  }
};