const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Upload ve Downloads klasörlerini oluştur
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
if (!fs.existsSync('./downloads')) fs.mkdirSync('./downloads');

// Statik dosyalar
app.use('/uploads', express.static('uploads'));
app.use('/downloads', express.static('downloads'));

// SQLite Database
const db = new sqlite3.Database('./database.sqlite');

// Create tables
db.serialize(() => {
  // Admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Downloads table (for tracking)
  db.run(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      version TEXT NOT NULL,
      ip TEXT,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Updates table
  db.run(`
    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      version TEXT NOT NULL,
      changelog TEXT,
      file_size TEXT,
      file_path TEXT,
      released_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin (admin / admin123)
  const defaultAdmin = 'admin';
  const defaultPass = bcrypt.hashSync('admin123', 10);
  
  db.get("SELECT * FROM admins WHERE username = ?", [defaultAdmin], (err, row) => {
    if (!row) {
      db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [defaultAdmin, defaultPass]);
      console.log('✓ Default admin created: admin / admin123');
    }
  });
});

// ============= API ENDPOINTS =============

// Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'eduverse-secret-key-2026', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.adminId = decoded.id;
    next();
  });
};

// Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, admin) => {
    if (err || !admin) return res.status(401).json({ error: 'Invalid credentials' });
    
    bcrypt.compare(password, admin.password, (err, result) => {
      if (!result) return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'eduverse-secret-key-2026',
        { expiresIn: '24h' }
      );
      
      res.json({ token, username: admin.username });
    });
  });
});

// Get downloads stats
app.get('/api/admin/stats', verifyToken, (req, res) => {
  db.get("SELECT COUNT(*) as total FROM downloads", (err, total) => {
    db.all("SELECT platform, COUNT(*) as count FROM downloads GROUP BY platform", (err, byPlatform) => {
      db.get("SELECT COUNT(*) as today FROM downloads WHERE date(downloaded_at) = date('now')", (err, today) => {
        res.json({
          total: total?.total || 0,
          byPlatform: byPlatform || [],
          today: today?.today || 0
        });
      });
    });
  });
});

// Get versions
app.get('/api/versions', (req, res) => {
  db.all("SELECT * FROM updates ORDER BY platform, released_at DESC", (err, rows) => {
    res.json(rows || []);
  });
});

// Update version (admin only)
app.post('/api/admin/update-version', verifyToken, (req, res) => {
  const { platform, version, changelog, file_size } = req.body;
  
  db.run(
    "INSERT INTO updates (platform, version, changelog, file_size) VALUES (?, ?, ?, ?)",
    [platform, version, changelog, file_size],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Version added' });
    }
  );
});

// ============= DOSYA YÜKLEME =============
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Admin panelinden APK yükleme
app.post('/api/admin/upload-apk', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Dosya seçilmedi' });
  }
  
  const platform = req.body.platform;
  const version = req.body.version;
  const changelog = req.body.changelog || 'Yeni sürüm';
  const originalName = req.file.originalname;
  const fileExt = path.extname(originalName);
  const targetFileName = `${platform}${fileExt}`;
  const targetPath = path.join(__dirname, 'downloads', targetFileName);
  
  // Dosyayı downloads klasörüne taşı
  fs.renameSync(req.file.path, targetPath);
  
  // Dosya boyutunu formatla
  const fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
  
  // Veritabanına kaydet
  db.run(
    "INSERT INTO updates (platform, version, changelog, file_size, file_path) VALUES (?, ?, ?, ?, ?)",
    [platform, version, changelog, fileSize, `/downloads/${targetFileName}`],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        message: `${platform} dosyası başarıyla yüklendi!`,
        file: targetPath,
        url: `/downloads/${targetFileName}`,
        version: version,
        size: fileSize
      });
    }
  );
});

// Dosya silme endpoint'i
app.delete('/api/admin/delete-file/:platform', verifyToken, (req, res) => {
  const { platform } = req.params;
  const filePath = path.join(__dirname, 'downloads', `${platform}.apk`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Dosya silindi' });
  } else {
    res.status(404).json({ error: 'Dosya bulunamadı' });
  }
});

// Track download
app.post('/api/track-download', (req, res) => {
  const { platform, version } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  db.run(
    "INSERT INTO downloads (platform, version, ip) VALUES (?, ?, ?)",
    [platform, version || 'latest', ip],
    (err) => {
      if (err) console.error('Download tracking error:', err);
      res.json({ success: true });
    }
  );
});

// Get latest versions
app.get('/api/latest', (req, res) => {
  const platforms = ['android', 'windows', 'linux'];
  const result = {};
  
  let pending = platforms.length;
  
  platforms.forEach(platform => {
    db.get(
      "SELECT * FROM updates WHERE platform = ? ORDER BY released_at DESC LIMIT 1",
      [platform],
      (err, row) => {
        result[platform] = row || null;
        pending--;
        if (pending === 0) res.json(result);
      }
    );
  });
});

// Direkt dosya indirme endpoint'i
app.get('/api/download/:platform', (req, res) => {
  const { platform } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const filePath = path.join(__dirname, 'downloads', `${platform}.apk`);
  
  if (fs.existsSync(filePath)) {
    // İndirme takibi yap
    db.run(
      "INSERT INTO downloads (platform, version, ip) VALUES (?, ?, ?)",
      [platform, 'latest', ip],
      (err) => {
        if (err) console.error('Download tracking error:', err);
      }
    );
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Dosya bulunamadı. Lütfen admin panelinden yükleyin.' });
  }
});

// ============= SERVE HTML PAGES =============

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// İndirme sayfası
app.get('/download', (req, res) => {
  res.sendFile(path.join(__dirname, 'download.html'));
});

// Admin paneli
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ EduVerse Web Server running on http://localhost:${PORT}`);
  console.log(`  - Ana Site: http://eduvers.site:${PORT}`);
  console.log(`  - İndirme: http://eduvers.site:${PORT}/download`);
  console.log(`  - Admin: http://eduvers.site:${PORT}/admin`);
  console.log(`  - Dosya yükleme hazır!`);
});
