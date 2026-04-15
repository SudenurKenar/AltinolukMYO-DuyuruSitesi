import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './db.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'kurumsal_erisim_anahtari_2026';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// --- MULTER AYARLARI ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// STATİK DOSYA SUNUMU (GÜVENLİ ÖN İZLEME AYARI)
// ==========================================
// Tarayıcının dosyayı indirmeyip açması için Content-Type ve Content-Disposition ayarları yapıldı.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();

        // Güvenlik Başlıkları
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('Content-Security-Policy', "default-src 'self'");

        // 'inline' komutu: "İndirme, tarayıcı içinde göster" emridir.
        res.set('Content-Disposition', 'inline');

        // Tarayıcıya dosyanın ne olduğunu açıkça söylüyoruz
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/image/png',
            '.txt': 'text/plain',
            '.html': 'text/html'
        };

        if (mimeTypes[ext]) {
            res.set('Content-Type', mimeTypes[ext]);
        }
    }
}));

// ==========================================
// 1. BİLDİRİ ROTALARI (CRUD)
// ==========================================
app.get('/api/mesajlar', async (req, res) => {
    try {
        const query = `
            SELECT m.id, m.baslik, m.aciklama, m.atistarihi, m.mesajturu_id, m.kategori_id,
                   t.tur as mesaj_turu, k.ad as kategori_adi
            FROM mesaj m
            LEFT JOIN mesajturu t ON m.mesajturu_id = t.id
            LEFT JOIN kategori k ON m.kategori_id = k.id
            ORDER BY m.atistarihi DESC`;
        const queryResult = await db.query(query);
        res.status(200).json(queryResult.rows);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/mesaj-ekle', async (req, res) => {
    const { baslik, aciklama, mesajturu_id, kategori_id } = req.body;
    try {
        const query = 'INSERT INTO mesaj (baslik, aciklama, mesajturu_id, kategori_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await db.query(query, [baslik, aciklama, mesajturu_id, kategori_id]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ==========================================
// 2. KATEGORİ VE MESAJ TURU ROTALARI
// ==========================================
app.get('/api/kategori', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kategori ORDER BY ad ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/mesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM mesajturu ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ==========================================
// 3. ÖDEV SİSTEMİ
// ==========================================

app.get('/api/odevler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM odev ORDER BY yukleme_tarihi DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Ödev listeleme hatası:", error);
        res.status(500).json({ success: false });
    }
});

app.post('/api/odevler', upload.single('odev_dosyasi'), async (req, res) => {
    const { no, isim, soyisim, ders, aciklama } = req.body;
    const dosya_yolu = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const query = `
            INSERT INTO odev (isim, soyisim, no, ders, aciklama, dosya_yolu, yukleme_tarihi) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
            RETURNING *`;

        const result = await db.query(query, [isim, soyisim, no, ders || 'Genel', aciklama || '', dosya_yolu]);

        res.status(201).json({
            success: true,
            message: "Ödev arşive mühürlendi Hanımım.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("ÖDEV KAYIT HATASI:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 4. ADMİN GİRİŞ
// ==========================================
app.post('/api/admin/login', async (req, res) => {
    const { id, sifre } = req.body;
    try {
        const result = await db.query('SELECT * FROM admin WHERE kullaniciadi = $1 AND sifre = $2', [String(id), String(sifre)]);
        if (result.rows.length > 0) {
            const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: "Hatalı giriş." });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`| SUNUCU AKTİF: http://localhost:${PORT} |`);
});