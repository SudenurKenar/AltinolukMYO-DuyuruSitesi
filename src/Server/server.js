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

// --- MULTER YAPILANDIRMASI ---
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
// STATİK DOSYA SUNUMU VE ÖN İZLEME PROTOKOLÜ
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('Content-Security-Policy', "default-src 'self'");
        res.set('Content-Disposition', 'inline');

        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.txt': 'text/plain'
        };
        if (mimeTypes[ext]) res.set('Content-Type', mimeTypes[ext]);
    }
}));

// ==========================================
// 1. DUYURU VE MESAJ YÖNETİMİ (KATEGORİSİZ)
// ==========================================
app.get('/api/mesajlar', async (req, res) => {
    try {
        const query = `
            SELECT m.id, m.baslik, m.aciklama, m.atistarihi, m.mesajturu_id,
                   t.tur as mesaj_turu
            FROM mesaj m
            LEFT JOIN mesajturu t ON m.mesajturu_id = t.id
            ORDER BY m.atistarihi DESC`;
        const queryResult = await db.query(query);
        res.status(200).json(queryResult.rows);
    } catch (error) { res.status(500).json([]); }
});

app.post('/api/mesaj-ekle', async (req, res) => {
    const { baslik, aciklama, mesajturu_id } = req.body;
    try {
        const query = 'INSERT INTO mesaj (baslik, aciklama, mesajturu_id) VALUES ($1, $2, $3) RETURNING *';
        const result = await db.query(query, [baslik, aciklama, mesajturu_id]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// 2. STATÜ YÖNETİMİ
// ==========================================
app.get('/api/mesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM mesajturu ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// 3. ÖDEV ARŞİV SİSTEMİ
// ==========================================
app.get('/api/odevler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM odev ORDER BY yuktarihi DESC');
        res.status(200).json(result.rows || []);
    } catch (error) {
        console.error("Arşiv listeleme hatası:", error);
        res.status(500).json([]);
    }
});

app.post('/api/odevler', upload.single('odev_dosyasi'), async (req, res) => {
    const { no, isim, soyisim, ders, aciklama } = req.body;
    const dosyolu = req.file ? `/uploads/${req.file.filename}` : null;

    if (!no || no.length < 12 || !isim || !soyisim || !ders || !dosyolu) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: "Veri doğrulama hatası." });
    }

    try {
        const query = `
            INSERT INTO odev (isim, soyisim, no, ders, aciklama, dosyolu, yuktarihi) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
            RETURNING *`;

        const result = await db.query(query, [isim, soyisim, no, ders, aciklama || '', dosyolu]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: "Sunucu mühürleme hatası." });
    }
});

// ==========================================
// 4. ADMİNİSTRASYON GİRİŞİ
// ==========================================
app.post('/api/admin/login', async (req, res) => {
    const { id, sifre } = req.body;
    try {
        const result = await db.query('SELECT * FROM admin WHERE kullaniciadi = $1 AND sifre = $2', [String(id), String(sifre)]);
        if (result.rows.length > 0) {
            const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: "Geçersiz kimlik bilgileri." });
        }
    } catch (error) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => {
    console.log(`| SUNUCU AKTİF: http://localhost:${PORT} |`);
});