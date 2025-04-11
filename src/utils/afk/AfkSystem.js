const JsonManager = require('../../../Database/SuperCore/JsonManager');
const jsonManager = new JsonManager();

function loadAfkData() {
  const data = jsonManager.readJson("afk/data") || {};
  return data;
}

function saveAfkData(afkData) {
  return jsonManager.writeJson("afk/data", afkData);
}

function getAfkReason(user, afkData) {
  if (afkData[user.id]) {
    const afkInfo = afkData[user.id];
    const duration = Date.now() - afkInfo.timestamp;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const reason = afkInfo.reason || 'Sebep belirtilmemiş';
    return {
      reason,
      duration: `${hours > 0 ? `${hours} saat ` : ''}${minutes} dakika`
    };
  }
  return null;
}

async function removeAfk(user, afkData, guild) {
  if (afkData[user.id]) {
    const timestamp = afkData[user.id].timestamp;
    const duration = Date.now() - timestamp;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    const previousNickname = afkData[user.id].previousNickname;

    delete afkData[user.id];
    saveAfkData(afkData);

    const member = await guild.members.fetch(user.id);

    try {
      if (member.nickname && member.nickname.startsWith('[AFK]')) {
        await member.setNickname(previousNickname);
      } else if (member.nickname === null) {
        await member.setNickname(user.username);
      }
    } catch (error) {
      if (error.code === 50013) { 
        console.log(`Botun ${user.username} kullanıcısının adını değiştirme yetkisi yok.`);
        user.send(`AFK modundan çıktınız, ancak botun sizin adınızı değiştirme yetkisi olmadığı için isminiz eski haline döndürülemedi. Lütfen bir sunucu yöneticisiyle iletişime geçin.`);
      } else {
        console.error('Nickname değiştirilirken bir hata oluştu:', error);
      }
    }

    return `${hours > 0 ? `${hours} saat ` : ''}${minutes} dakika AFK kaldınız.`;
  }
  return null;
}

async function setAfk(user, reason, afkData, guild) {
  const member = await guild.members.fetch(user.id);
  const currentNickname = member.nickname || user.username;

  afkData[user.id] = {
    reason,
    timestamp: Date.now(),
    previousNickname: currentNickname,
  };
  saveAfkData(afkData);

  const newNickname = `[AFK] ${currentNickname}`;

  try {
    await member.setNickname(newNickname);
  } catch (error) {
    if (error.code === 50013) { // Missing Permissions
      user.send(`(/) Yetkiniz isim değiştirmeme izin vermedi @yestefir`);
    } else {
      console.error('Nickname değiştirilirken bir hata oluştu:', error);
    }
  }
}

module.exports = {
  loadAfkData,
  saveAfkData,
  removeAfk,
  setAfk,
  getAfkReason
};