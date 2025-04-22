const fs = require('fs');
const path = require('path');
const BackupManager = require('./src/BackupManager');

class JsonManager {
  constructor(initializeBackup = false) {
    this.settingsPath = path.join(__dirname, '..', '..', 'src', 'config','database', 'path.json');
    this.settings = this.loadSettings();
    this.backupManager = new BackupManager();
    
    if (initializeBackup) {
      this.initializeBackup();
    }
  }

  initializeBackup() {
    if (this.backupManager.getBackupConfig().autoBackup && !global.backupInitialized) {
      this.backupManager.startBackupScheduler(this.settings);
      global.backupInitialized = true;
      return true;
    }
    return false;
  }

  loadSettings() {
    try {
      if (!fs.existsSync(this.settingsPath)) {
        const defaultSettings = {
          "@backup": "@backup"
        };
        fs.writeFileSync(this.settingsPath, JSON.stringify(defaultSettings, null, 2));
      }
      return JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
    } catch (error) {
      console.error("[ERROR] Settings okunamadı:", error);
      return { "@backup": "@backup" };
    }
  }

  resolvePath(id) {
    if (!this.settings[id]) {
      console.error(`[HATA] Belirtilen ID '${id}' settings.json içinde bulunamadı.`);
      return null;
    }
    return path.resolve(__dirname, '..', this.settings[id]); 
  }

  getFilePath(id, key = null) {
    return this.resolvePath(id); 
  }

  readJson(id) {
    try {
      const filePath = this.getFilePath(id);
      if (!filePath || !fs.existsSync(filePath)) {
        console.warn(`[UYARI] ${filePath} bulunamadı! Yeni dosya oluşturuluyor.`);
        return null;
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`[ERROR] JSON okunamadı (${id}):`, error);
      return null;
    }
  }

  writeJson(id, data) {
    try {
      const filePath = this.getFilePath(id);
      if (!filePath) return false;
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`[ERROR] JSON yazılamadı (${id}):`, error);
      return false;
    }
  }

  set(id, fieldOrData, value) {
    try {
      if (value === undefined) {
        return this.writeJson(id, fieldOrData);
      } else {
        let data = this.readJson(id) || {};
        data[fieldOrData] = value;
        return this.writeJson(id, data);
      }
    } catch (error) {
      console.error("[ERROR] Set işlemi başarısız:", error);
      return false;
    }
  }

  get(id, field = null) {
    try {
      const data = this.readJson(id) || {};
      return field ? (data ? data[field] : null) : data;
    } catch (error) {
      console.error("[ERROR] Get işlemi başarısız:", error);
      return null;
    }
  }

  delete(id) {
    try {
      const filePath = this.getFilePath(id);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[ERROR] Silme işlemi başarısız (${id}):`, error);
      return false;
    }
  }

  getBackupConfig() {
    return this.backupManager.getBackupConfig();
  }

  updateBackupConfig(newConfig) {
    const result = this.backupManager.updateBackupConfig(newConfig);
    if (result && newConfig.autoBackup) {
      this.backupManager.startBackupScheduler(this.settings);
    }
    return result;
  }

  manualBackup() {
    return this.backupManager.manualBackup(this.settings);
  }

  getBackupHistory() {
    return this.backupManager.getBackupHistory();
  }

  restoreBackup(backupFileName) {
    const restoredSettings = this.backupManager.restoreBackup(backupFileName);
    if (restoredSettings) {
      this.settings = restoredSettings;
      return true;
    }
    return false;
  }
}

if (typeof global.backupInitialized === 'undefined') {
  global.backupInitialized = false;
}

module.exports = JsonManager;