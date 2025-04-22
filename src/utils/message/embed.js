const { EmbedBuilder } = require('discord.js');
const embedSettings = require('../../config/genaral/embed.json'); // JSON dosyasını require ile yükle

/**
 * Creates a Discord embed with the provided options
 * @param {Object} options - The embed options
 * @param {String} [options.title] - The embed title
 * @param {String} [options.description] - The embed description
 * @param {String} [options.color] - The embed color in hex format
 * @param {String} [options.footer] - The embed footer text
 * @param {String} [options.footerIcon] - The embed footer icon URL
 * @param {String} [options.thumbnail] - The embed thumbnail URL
 * @param {String} [options.image] - The embed image URL
 * @param {String} [options.authorName] - The embed author name
 * @param {String} [options.authorIcon] - The embed author icon URL
 * @param {Array} [options.fields] - The embed fields
 * @returns {EmbedBuilder} - The created embed
 */
function createEmbed(options = {}) {
  const embed = new EmbedBuilder();

  // Varsayılan ayarları JSON'dan al
  const defaultSettings = embedSettings.default;

  // Başlık
  if (options.title) embed.setTitle(options.title);
  else if (defaultSettings.title) embed.setTitle(defaultSettings.title);

  // Açıklama
  if (options.description) embed.setDescription(options.description);
  else if (defaultSettings.description) embed.setDescription(defaultSettings.description);

  // Renk
  if (options.color) embed.setColor(options.color);
  else if (defaultSettings.color) embed.setColor(defaultSettings.color);

  // Zaman damgası
  if (options.timestamp) embed.setTimestamp();

  // Footer
  if (options.footer) {
    embed.setFooter({
      text: options.footer,
      iconURL: options.footerIcon || defaultSettings.footerIcon
    });
  } else if (defaultSettings.footer) {
    embed.setFooter({
      text: defaultSettings.footer,
      iconURL: defaultSettings.footerIcon
    });
  }

  // Thumbnail
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  else if (defaultSettings.thumbnail) embed.setThumbnail(defaultSettings.thumbnail);

  // Resim
  if (options.image) embed.setImage(options.image);
  else if (defaultSettings.image) embed.setImage(defaultSettings.image);

  // Yazar
  if (options.authorName) {
    embed.setAuthor({
      name: options.authorName,
      iconURL: options.authorIcon || defaultSettings.authorIcon
    });
  } else if (defaultSettings.authorName) {
    embed.setAuthor({
      name: defaultSettings.authorName,
      iconURL: defaultSettings.authorIcon
    });
  }

  // Alanlar (Fields)
  if (options.fields && Array.isArray(options.fields)) {
    for (const field of options.fields) {
      if (field.name && field.value) {
        embed.addFields({
          name: field.name,
          value: field.value,
          inline: field.inline ?? false
        });
      }
    }
  } else if (defaultSettings.fields && Array.isArray(defaultSettings.fields)) {
    for (const field of defaultSettings.fields) {
      if (field.name && field.value) {
        embed.addFields({
          name: field.name,
          value: field.value,
          inline: field.inline ?? false
        });
      }
    }
  }

  return embed;
}

module.exports = { createEmbed };