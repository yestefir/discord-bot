const fs = require('fs');
const path = require('path');

class BackupManager {
  constructor() {
    this.settingsPath = path.join(__dirname, '..', '..','..', 'src', 'config','database', 'path.json');
    this.backupConfigPath = path.join(__dirname,'..', '..','..', 'src', 'config','database','settings.json');
    this.backupConfig = this.loadBackupConfig();
    this.backupTimer = null;
  }

  loadBackupConfig() {
    try {
      const configDir = path.dirname(this.backupConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      if (!fs.existsSync(this.backupConfigPath)) {
        const defaultConfig = {
          autoBackup: true,
          backupInterval: 6,
          maxBackups: 10,
          compressBackups: false,
          lastBackupTime: null
        };
        fs.writeFileSync(this.backupConfigPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
      }
      return JSON.parse(fs.readFileSync(this.backupConfigPath, 'utf8'));
    } catch (error) {
      return {
        autoBackup: false,
        backupInterval: 6,
        maxBackups: 10,
        compressBackups: false,
        lastBackupTime: null
      };
    }
  }
  saveBackupConfig() {
    try {
      fs.writeFileSync(this.backupConfigPath, JSON.stringify(this.backupConfig, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  }
  updateBackupConfig(newConfig) {
    this.backupConfig = { ...this.backupConfig, ...newConfig };
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
    }
    if (this.backupConfig.autoBackup) {
      this.startBackupScheduler();
    }
    return this.saveBackupConfig();
  }
  startBackupScheduler(pathData) {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    this.pathsToBackup = pathData;
    const intervalMs = this.backupConfig.backupInterval * 60 * 60 * 1000;
    this.backupTimer = setInterval(() => {
      this.backupAllJsonFiles();
    }, intervalMs);
    console.log(`[JsonManager] Backup Manager Aktif! (her ${this.backupConfig.backupInterval} saatte bir).`);
  }
  getBackupDir() {
    try {
      const backupDir = path.resolve(__dirname, '..', '..', '..', 'Database','db','@backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      return backupDir;
    } catch (error) {
      return null;
    }
  }
  backupAllJsonFiles() {
    try {
      if (!this.pathsToBackup) {
        return false;
      }
      let successCount = 0;
      let failCount = 0;
      for (const [key, filePath] of Object.entries(this.pathsToBackup)) {
        if (key === '@backup') continue;
        try {
          const result = this.backupJsonFile(key, filePath);
          if (result) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }
      this.backupConfig.lastBackupTime = new Date().toISOString();
      this.saveBackupConfig();
      this.cleanupOldBackups();
      return failCount === 0;
    } catch (error) {
      return false;
    }
  }
  backupJsonFile(key, jsonPath) {
    try {
      const fullPath = path.resolve(__dirname, '..', '..', '..','Database', jsonPath.replace(/^\.\//, ''));
      if (!fs.existsSync(fullPath)) {
        console.warn(`[UYARI] Yedeklenecek dosya bulunamadı: ${fullPath}`);
        return false;
      }
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch (error) {
        console.error(`[ERROR] Geçersiz JSON formatı (${key}):`, error);
        return false;
      }
      const backupDir = this.getBackupDir();
      if (!backupDir) return false;
      const categoryDir = path.join(backupDir, key.replace(/\//g, '-'));
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const fileName = path.basename(jsonPath);
      const backupFileName = `${fileName.replace('.json', '')}_${timestamp}.json`;
      const backupFilePath = path.join(categoryDir, backupFileName);
      fs.writeFileSync(backupFilePath, JSON.stringify(jsonData, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  } 
  cleanupOldBackups() {
    try {
      const backupDir = this.getBackupDir();
      if (!backupDir) return false;
      const categoryDirs = fs.readdirSync(backupDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      for (const category of categoryDirs) {
        const categoryPath = path.join(backupDir, category);
        const files = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.json'))
          .map(file => ({
            name: file,
            path: path.join(categoryPath, file),
            time: fs.statSync(path.join(categoryPath, file)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time);
        if (files.length > this.backupConfig.maxBackups) {
          for (let i = this.backupConfig.maxBackups; i < files.length; i++) {
            fs.unlinkSync(files[i].path);
            console.log(`[BİLGİ] Eski yedek silindi: ${category}/${files[i].name}`);
          }
        }
      }
      return true;
    } catch (error) {
      console.error("[ERROR] Eski yedekleri temizleme başarısız:", error);
      return false;
    }
  }
  getBackupHistory() {
    try {
      const backupDir = this.getBackupDir();
      if (!backupDir) return [];
      const categories = fs.readdirSync(backupDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      let allBackups = [];
      for (const category of categories) {
        const categoryPath = path.join(backupDir, category);
        const backups = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.json'))
          .map(file => ({
            category: category,
            name: file,
            path: path.join(categoryPath, file),
            time: fs.statSync(path.join(categoryPath, file)).mtime.getTime(),
            date: new Date(fs.statSync(path.join(categoryPath, file)).mtime).toISOString(),
            size: fs.statSync(path.join(categoryPath, file)).size
          }));

        allBackups = [...allBackups, ...backups];
      }
      return allBackups.sort((a, b) => b.time - a.time);
    } catch (error) {
      console.error("[ERROR] Yedekleme geçmişi alınamadı:", error);
      return [];
    }
  }
  getCategoryBackupHistory(category) {
    try {
      const backupDir = this.getBackupDir();
      if (!backupDir) return [];
      const categoryPath = path.join(backupDir, category);
      if (!fs.existsSync(categoryPath)) return [];
      return fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          category: category,
          name: file,
          path: path.join(categoryPath, file),
          time: fs.statSync(path.join(categoryPath, file)).mtime.getTime(),
          date: new Date(fs.statSync(path.join(categoryPath, file)).mtime).toISOString(),
          size: fs.statSync(path.join(categoryPath, file)).size
        }))
        .sort((a, b) => b.time - a.time);
    } catch (error) {
      console.error(`[ERROR] Kategori yedekleme geçmişi alınamadı (${category}):`, error);
      return [];
    }
  }
  restoreBackup(category, backupFileName) {
    try {
      const backupDir = this.getBackupDir();
      if (!backupDir) return false;
      const categoryPath = path.join(backupDir, category);
      const backupFilePath = path.join(categoryPath, backupFileName);
      if (!fs.existsSync(backupFilePath)) {
        console.error(`[HATA] Geri yüklenecek yedek bulunamadı: ${backupFilePath}`);
        return false;
      }
      const pathData = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
      let targetPath = null;
      for (const [key, filePath] of Object.entries(pathData)) {
        if (key === category || key.replace(/\//g, '-') === category) {
          // Tam yolunu oluştur
          targetPath = path.resolve(__dirname, '..', '..', '..','Database', filePath.replace(/^\.\//, ''));
          break;
        }
      }
      if (!targetPath) {
        console.error(`[HATA] Hedef dosya yolu bulunamadı: ${category}`);
        return false;
      }
      const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
      if (fs.existsSync(targetPath)) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupBeforeRestorePath = path.join(categoryPath, `pre_restore_${timestamp}.json`);
        fs.copyFileSync(targetPath, backupBeforeRestorePath);
        console.log(`[BİLGİ] Geri yükleme öncesi yedek alındı: ${backupBeforeRestorePath}`);
      }
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetPath, JSON.stringify(backupData, null, 2));
      console.log(`[BİLGİ] Yedek geri yüklendi: ${category}/${backupFileName} -> ${targetPath}`);
      return true;
    } catch (error) {
      console.error(`[ERROR] Yedek geri yükleme başarısız:`, error);
      return false;
    }
  }
  getBackupConfig() {
    return { ...this.backupConfig };
  }
  manualBackup(pathData) {
    if (pathData) {
      this.pathsToBackup = pathData;
    }
    return this.backupAllJsonFiles();
  }
}

module.exports = BackupManager;