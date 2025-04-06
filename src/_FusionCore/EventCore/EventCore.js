const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../../events');

const EventCore  = (client) => {
    if (!fs.existsSync(eventsPath)) {
        console.warn('[Event] Warning: "events" klasörü bulunamadı.');
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(` [Event] Loaded: ${event.name}`);
        } else {
            console.warn(`[Event] ERROR: ${file} yüklenemedi, geçersiz yapı.`);
        }
    }
};

module.exports = { EventCore  };
