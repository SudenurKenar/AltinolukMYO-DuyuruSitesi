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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// 1. BİLDİRİ ROTALARI (CRUD)
// ==========================================

// Listeleme: Kategorileri ve Mesaj Türlerini "Join" ile getirir
app.get('/api/mesajlar', async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id, 
                m.baslik, 
                m.aciklama, 
                m.atistarihi, 
                m.mesajturu_id, 
                m.kategori_id,
                t.tur as mesaj_turu,
                k.ad as kategori_adi
            FROM mesaj m
            LEFT JOIN mesajturu t ON m.mesajturu_id = t.id
            LEFT JOIN kategori k ON m.kategori_id = k.id
            ORDER BY m.atistarihi DESC
        `;
        const queryResult = await db.query(query);
        // Frontend filter() işleminin patlamaması için her zaman rows döndürülür
        res.status(200).json(queryResult.rows);
    } catch (error) {
        console.error("Fermanlar çekilirken hata oluştu:", error);
        res.status(500).json([]); // Hata durumunda boş dizi dönülür
    }
});

// Ekleme: Kategori ID'sini de veritabanına işler
app.post('/api/mesaj-ekle', async (req, res) => {
    const { baslik, aciklama, mesajturu_id, kategori_id } = req.body;
    try {
        const query = 'INSERT INTO mesaj (baslik, aciklama, mesajturu_id, kategori_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await db.query(query, [baslik, aciklama, mesajturu_id, kategori_id]);

        // Eklenen veriyi kategori adıyla birlikte tekrar çekiyoruz ki Frontend anında görsün
        const finalQuery = `
            SELECT m.*, t.tur as mesaj_turu, k.ad as kategori_adi 
            FROM mesaj m
            LEFT JOIN mesajturu t ON m.mesajturu_id = t.id
            LEFT JOIN kategori k ON m.kategori_id = k.id
            WHERE m.id = $1`;
        const finalResult = await db.query(finalQuery, [result.rows[0].id]);

        res.status(201).json({ success: true, data: finalResult.rows[0] });
    } catch (error) {
        console.error("Ekleme Hatası:", error);
        res.status(500).json({ success: false, message: "Bildiri eklenemedi." });
    }
});

// Güncelleme: Kategori güncelleme desteği eklendi
app.put('/api/mesaj-duzenle/:id', async (req, res) => {
    const { id } = req.params;
    const { baslik, aciklama, mesajturu_id, kategori_id } = req.body;
    try {
        const query = `
            UPDATE mesaj 
            SET baslik = $1, aciklama = $2, mesajturu_id = $3, kategori_id = $4 
            WHERE id = $5 
            RETURNING *
        `;
        await db.query(query, [baslik, aciklama, mesajturu_id, kategori_id, id]);

        const finalQuery = `
            SELECT m.*, t.tur as mesaj_turu, k.ad as kategori_adi 
            FROM mesaj m
            LEFT JOIN mesajturu t ON m.mesajturu_id = t.id
            LEFT JOIN kategori k ON m.kategori_id = k.id
            WHERE m.id = $1`;
        const finalResult = await db.query(finalQuery, [id]);

        res.status(200).json({ success: true, data: finalResult.rows[0] });
    } catch (error) {
        console.error("Güncelleme Hatası:", error);
        res.status(500).json({ success: false, message: "Güncelleme başarısız." });
    }
});

// Silme
app.delete('/api/mesaj-sil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM mesaj WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Ferman sistemden kaldırıldı." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Silme işlemi başarısız." });
    }
});

// ==========================================
// 2. KATEGORİ ROTALARI (CRUD)
// ==========================================

app.get('/api/kategori', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kategori ORDER BY ad ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/kategori-ekle', async (req, res) => {
    const { ad } = req.body;
    try {
        const result = await db.query('INSERT INTO kategori (ad) VALUES ($1) RETURNING *', [ad]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.put('/api/kategori-duzenle/:id', async (req, res) => {
    const { id } = req.params;
    const { ad } = req.body;
    try {
        const result = await db.query('UPDATE kategori SET ad = $1 WHERE id = $2 RETURNING *', [ad, id]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.delete('/api/kategori-sil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Önce bu kategoriye bağlı mesaj var mı kontrol edebilirsiniz veya 
        // direkt silmeyi deneyip hata yakalayabilirsiniz.
        await db.query('DELETE FROM kategori WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Kategori arşivi temizlendi." });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Bu kategoriye bağlı duyurular olduğu için silinemez. Önce duyuruları siliniz."
        });
    }
});

// ==========================================
// 3. ÖDEVLER VE MESAJ TURU
// ==========================================

app.get('/api/mesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM mesajturu ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/odevler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM odev ORDER BY yuklenme_tarihi DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/odev-yukle', upload.single('dosya'), async (req, res) => {
    const { isim, soyisim, no, ders, aciklama } = req.body;
    const dosyaYolu = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const query = 'INSERT INTO odev (isim, soyisim, no, ders, aciklama, dosya_yolu) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const result = await db.query(query, [isim, soyisim, String(no), ders, aciklama, dosyaYolu]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
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