import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './db.js';
import bcrypt from 'bcrypt';

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
// 1. DERS YÖNETİM SİSTEMİ
// ==========================================

app.get('/api/sktkdersler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkdersler ORDER BY ders ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, message: "Veritabanı erişim hatası." });
    }
});

app.post('/api/sktkders-ekle', async (req, res) => {
    const { ders } = req.body;
    if (!ders || ders.trim() === "") return res.status(400).json({ success: false, message: "Ders adı boş bırakılamaz." });
    try {
        const query = 'INSERT INTO sktkdersler (ders, durum) VALUES ($1, true) RETURNING *';
        const result = await db.query(query, [ders.trim()]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/sktkdersler/:id', async (req, res) => {
    const { id } = req.params;
    const { ders } = req.body;
    try {
        const result = await db.query('UPDATE sktkdersler SET ders = $1 WHERE id = $2 RETURNING *', [ders.trim(), id]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/sktkdersler/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM sktkdersler WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Ders silindi." });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.patch('/api/sktkdersler/:id/durum', async (req, res) => {
    const { id } = req.params;
    const { durum } = req.body; // Frontend'den gelen yeni durum (true/false)

    try {
        const query = 'UPDATE sktkdersler SET durum = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [durum, id]);

        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                message: "Ders durumu başarıyla güncellendi.",
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Güncellenecek ders bulunamadı."
            });
        }
    } catch (error) {
        console.error("Durum güncelleme hatası:", error);
        res.status(500).json({
            success: false,
            message: "Sunucu hatası oluştu."
        });
    }
});

// ==========================================
// 2. ÖDEV VE ARŞİV SİSTEMİ
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
        const query = `INSERT INTO sktkodev (isim, soyisim, no, ders, aciklama, dosyolu, yuktarihi) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *`;
        const result = await db.query(query, [isim.trim(), soyisim.trim(), no.trim(), ders.trim(), aciklama || '', dosyolu]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false });
    }
});

// ==========================================
// 3. MESAJ SİSTEMİ
// ==========================================

app.get('/api/sktkmesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkmesajturu ORDER BY id ASC');
        res.status(200).json(result.rows || []);
    } catch (error) {
        console.error("Mesaj türü çekme hatası:", error);
        res.status(500).json({ success: false, message: "Veritabanı hatası." });
    }
});

app.get('/api/sktkmesajlar', async (req, res) => {
    try {

        const query = `
            SELECT m.id, m.baslik, m.aciklama, m.atistarihi, m.mesajturu_id, t.tur as mesaj_turu 
            FROM sktkmesaj m 
            LEFT JOIN sktkmesajturu t ON m.mesajturu_id = t.id 
            ORDER BY m.atistarihi DESC`;
        const queryResult = await db.query(query);
        res.status(200).json(queryResult.rows);
    } catch (error) {
        console.error("Liste çekme hatası:", error);
        res.status(500).json([]);
    }
});

app.put('/api/sktkmesaj-duzenle/:id', async (req, res) => {
    const { id } = req.params;
    const { baslik, aciklama, mesajturu_id } = req.body;

    try {

        const query = `
            UPDATE sktkmesaj 
            SET baslik = $1, aciklama = $2, mesajturu_id = $3 
            WHERE id = $4 
            RETURNING *`;

        const result = await db.query(query, [baslik, aciklama, mesajturu_id, id]);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Kayıt bulunamadı." });
        }
    } catch (error) {
        console.error("Düzenleme hatası:", error); // Terminalde hatanın detayını görebilirsiniz
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
});


app.delete('/api/sktkmesaj-sil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Tablo isminin 'sktkmesaj' olduğundan emin olun
        const query = 'DELETE FROM sktkmesaj WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);

        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                message: "Bildiri başarıyla sistemden kaldırıldı."
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Silinecek kayıt bulunamadı."
            });
        }
    } catch (error) {
        console.error("Silme hatası:", error);
        res.status(500).json({
            success: false,
            message: "Silme işlemi sırasında sunucu hatası oluştu."
        });
    }
});

//////////////////////////////////
/// 4. ADMİN GİRİŞ SİSTEMİ     ///
//////////////////////////////////

// server.js içindeki login rotasının yeni hali
app.post('/api/sktkadmin/login', async (req, res) => {
    const { id, sifre } = req.body;
    try {
        const result = await db.query('SELECT * FROM sktkadmin WHERE kullaniciadi = $1', [String(id).trim()]);

        if (result.rows.length > 0) {
            const admin = result.rows[0];
            const dbHash = String(admin.sifre).trim();

            // Sadece Bcrypt ile kontrol kalsın
            const sifreDogruMu = await bcrypt.compare(String(sifre), dbHash);

            if (sifreDogruMu) {
                const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '24h' });
                res.status(200).json({ success: true, token });
            } else {
                res.status(401).json({ success: false, message: "Hatalı şifre!" });
            }
        } else {
            res.status(401).json({ success: false, message: "Kullanıcı bulunamadı!" });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.put('/api/admin-ad-guncelle', async (req, res) => {
    const { eskiAd, yeniAd, dogrulamaSifresi } = req.body;
    try {
        const admin = (await db.query('SELECT * FROM sktkadmin LIMIT 1')).rows[0];

        // HASH KONTROLÜ: Veritabanındaki hashli şifre ile girilen şifreyi karşılaştırıyoruz
        const sifreDogruMu = await bcrypt.compare(String(dogrulamaSifresi), admin.sifre);

        if (!sifreDogruMu || admin.kullaniciadi !== eskiAd) {
            return res.status(401).json({ success: false, message: "Bilgiler uyuşmuyor!" });
        }

        await db.query('UPDATE sktkadmin SET kullaniciadi = $1 WHERE id = $2', [yeniAd, admin.id]);
        res.json({ success: true, message: "Kullanıcı adınız güncellendi." });
    } catch (error) {
        console.error("Ad güncelleme hatası:", error);
        res.status(500).json({ success: false });
    }
});

app.put('/api/admin-sifre-guncelle', async (req, res) => {
    const { eskiSifre, yeniSifre } = req.body;
    try {
        const admin = (await db.query('SELECT * FROM sktkadmin LIMIT 1')).rows[0];

        if (!admin) {
            return res.status(404).json({ success: false, message: "Yönetici bulunamadı!" });
        }
        const eskiDogruMu = await bcrypt.compare(String(eskiSifre), admin.sifre);
        if (!eskiDogruMu) {
            return res.status(401).json({ success: false, message: "Mevcut şifreniz hatalı!" });
        }
        const hashedYeniSifre = await bcrypt.hash(String(yeniSifre), 10);
        await db.query('UPDATE sktkadmin SET sifre = $1 WHERE id = $2', [hashedYeniSifre, admin.id]);
        res.json({
            success: true,
            message: "Şifreniz başarıyla mühürlendi ve güncellendi."
        });
    } catch (error) {
        console.error("Şifre Güncelleme Hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
});

// ==========================================
// 5. SABİT LİNKLER SİSTEMİ
// ==========================================

app.get('/api/sktklinkler', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktklinkler WHERE id = 1');
        res.status(200).json(result.rows[0]);
    } catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/sktklinkler-guncelle', async (req, res) => {
    const { link1, link2 } = req.body;
    try {
        await db.query(`UPDATE sktklinkler SET link1 = $1, link2 = $2 WHERE id = 1`, [link1, link2]);
        res.status(200).json({ success: true, message: "Linkler güncellendi." });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => {
    console.log(`| SUNUCU AKTİF: http://localhost:${PORT} |`);
});