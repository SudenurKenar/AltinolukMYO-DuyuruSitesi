import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './db.js';

/**
 * Uygulama Yapılandırması ve Küresel Değişkenler
 */
const app = express();
const PORT = 5000;
const JWT_SECRET = 'kurumsal_erisim_anahtari_2026';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Orta Katman Yazılımları (Middleware)
 */
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

/**
 * Multer Depolama Yapılandırması
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Geçersiz format. Sadece PDF, ZIP ve RAR kabul edilir."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 1. DERS YÖNETİM SİSTEMİ (sktk Eklendi)
// ==========================================

app.get('/api/sktkdersler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkdersler ORDER BY ders ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Ders listesi çekme hatası:", error);
        res.status(500).json({ success: false, message: "Veritabanı erişim hatası." });
    }
});

app.post('/api/sktkders-ekle', async (req, res) => {
    const { ders } = req.body;
    if (!ders || ders.trim() === "") {
        return res.status(400).json({ success: false, message: "Ders adı boş bırakılamaz." });
    }
    try {
        const query = 'INSERT INTO sktkdersler (ders, durum) VALUES ($1, true) RETURNING *';
        const result = await db.query(query, [ders.trim()]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Ders kaydı oluşturulamadı." });
    }
});

app.put('/api/sktkdersler/:id', async (req, res) => {
    const { id } = req.params;
    const { ders } = req.body;
    if (!ders || ders.trim() === "") return res.status(400).json({ success: false });

    try {
        const result = await db.query(
            'UPDATE sktkdersler SET ders = $1 WHERE id = $2 RETURNING *',
            [ders.trim(), id]
        );
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.patch('/api/sktkdersler/:id/durum', async (req, res) => {
    const { id } = req.params;
    const { durum } = req.body;
    try {
        await db.query('UPDATE sktkdersler SET durum = $1 WHERE id = $2', [durum, id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Statü güncelleme hatası." });
    }
});

app.delete('/api/sktkdersler/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM sktkdersler WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Ders silindi." });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// 2. ÖDEV VE ARŞİV SİSTEMİ (sktk Eklendi)
// ==========================================

app.get('/api/sktkodevler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkodev ORDER BY yuktarihi DESC');
        res.status(200).json(result.rows || []);
    } catch (error) { res.status(500).json([]); }
});

app.post('/api/sktkodevler', upload.single('odev_dosyasi'), async (req, res) => {
    const { no, isim, soyisim, ders, aciklama } = req.body;
    const dosyolu = req.file ? `/uploads/${req.file.filename}` : null;

    if (!no || no.trim().length !== 12 || !isim || !soyisim || !ders) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: "Eksik veri girişi." });
    }

    try {
        const query = `
            INSERT INTO sktkodev (isim, soyisim, no, ders, aciklama, dosyolu, yuktarihi) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
            RETURNING *`;
        const result = await db.query(query, [isim.trim(), soyisim.trim(), no.trim(), ders.trim(), aciklama || '', dosyolu]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// 3. MESAJ VE ADMİN SİSTEMİ (sktk Eklendi)
// ==========================================

app.get('/api/sktkmesajlar', async (req, res) => {
    try {
        const query = `
            SELECT m.id, m.baslik, m.aciklama, m.atistarihi, m.mesajturu_id,
                   t.tur as mesaj_turu
            FROM sktkmesaj m
            LEFT JOIN sktkmesajturu t ON m.mesajturu_id = t.id
            ORDER BY m.atistarihi DESC`;
        const queryResult = await db.query(query);
        res.status(200).json(queryResult.rows);
    } catch (error) { res.status(500).json([]); }
});

app.get('/api/sktkmesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkmesajturu ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/sktkadmin/login', async (req, res) => {
    const { id, sifre } = req.body;
    try {
        const result = await db.query('SELECT * FROM sktkadmin WHERE kullaniciadi = $1 AND sifre = $2', [String(id), String(sifre)]);
        if (result.rows.length > 0) {
            const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: "Yetkisiz erişim denemesi." });
        }
    } catch (error) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => {
    console.log(`| SUNUCU AKTİF: http://localhost:${PORT} |`);
});