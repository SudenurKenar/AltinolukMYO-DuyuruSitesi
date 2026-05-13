import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './db.js';
import bcrypt from 'bcrypt';


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'kurumsal_erisim_anahtari_2026';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));


app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));


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


// 1. DERS YÖNETİM SİSTEMİ
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
    const { durum } = req.body;
    try {
        const query = 'UPDATE sktkdersler SET durum = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [durum, id]);
        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Ders bulunamadı." });
        }
    } catch (error) { res.status(500).json({ success: false }); }
});

//ÖDEV VE ARŞİV SİSTEMİ 

// ÖDEVLERİ LİSTELEME 
app.get('/api/sktkodevler', async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id,
                o.isim,
                o.soyisim,
                o.no,
                o.ders,
                o.aciklama,
                o.dosyolu,
                o.yuktarihi,
                COALESCE(d.donem_adi, o.donem_adi) as donem, 
                COALESCE(k.konu_adi, o.konu_adi) as konu
            FROM sktkodev o
            LEFT JOIN sktkdonem d ON o.donem_id = d.id
            LEFT JOIN sktkkonu k ON o.konu_id = k.id
            ORDER BY o.yuktarihi DESC`;

        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Ödev listeleme hatası:", error);
        res.status(500).json([]);
    }
});

//YENİ ÖDEV EKLEME 
app.post('/api/sktkodevler', upload.single('odev_dosyasi'), async (req, res) => {
    const { no, isim, soyisim, ders, donem_id, konu_id, aciklama, donem_adi, konu_adi } = req.body;
    const dosyolu = req.file ? req.file.filename : null;

    try {
        const query = `
            INSERT INTO sktkodev (isim, soyisim, no, ders, donem_id, konu_id, aciklama, dosyolu, yuktarihi, donem_adi, konu_adi) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, $10) 
            RETURNING *`;

        const result = await db.query(query, [
            isim.trim(),
            soyisim.trim(),
            no.trim(),
            ders.trim(),
            donem_id,
            konu_id,
            aciklama || '',
            dosyolu,
            donem_adi ? donem_adi.trim() : 'Bilinmeyen Dönem',
            konu_adi ? konu_adi.trim() : 'Genel Konu'
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Ödev kayıt hatası:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. MESAJ SİSTEMİ
app.get('/api/sktkmesajturu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkmesajturu ORDER BY id ASC');
        res.status(200).json(result.rows || []);
    } catch (error) { res.status(500).json({ success: false }); }
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
    } catch (error) { res.status(500).json([]); }
});

// 3. MESAJ SİSTEMİ (Eksik olan ekleme rotası)
app.post('/api/sktkmesaj-ekle', async (req, res) => {
    const { baslik, aciklama, mesajturu_id } = req.body;
    try {
        const query = `INSERT INTO sktkmesaj (baslik, aciklama, mesajturu_id, atistarihi) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`;
        const result = await db.query(query, [baslik, aciklama, mesajturu_id]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Mesaj eklenemedi." });
    }
});

app.put('/api/sktkmesaj-duzenle/:id', async (req, res) => {
    const { id } = req.params;
    const { baslik, aciklama, mesajturu_id } = req.body;
    try {
        const query = `UPDATE sktkmesaj SET baslik = $1, aciklama = $2, mesajturu_id = $3 WHERE id = $4 RETURNING *`;
        const result = await db.query(query, [baslik, aciklama, mesajturu_id, id]);
        if (result.rows.length > 0) res.status(200).json({ success: true, data: result.rows[0] });
        else res.status(404).json({ success: false });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/sktkmesaj-sil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM sktkmesaj WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) res.status(200).json({ success: true });
        else res.status(404).json({ success: false });
    } catch (error) { res.status(500).json({ success: false }); }
});

// 4. ADMİN GİRİŞ SİSTEMİ
app.post('/api/sktkadmin/login', async (req, res) => {
    const { id, sifre } = req.body;
    try {
        const result = await db.query('SELECT * FROM sktkadmin WHERE kullaniciadi = $1', [String(id).trim()]);
        if (result.rows.length > 0) {
            const admin = result.rows[0];
            const sifreDogruMu = await bcrypt.compare(String(sifre), String(admin.sifre).trim());
            if (sifreDogruMu) {
                const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '24h' });
                res.status(200).json({ success: true, token });
            } else res.status(401).json({ success: false, message: "Hatalı şifre!" });
        } else res.status(401).json({ success: false, message: "Kullanıcı yok!" });
    } catch (error) { res.status(500).json({ success: false }); }
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
            message: "Şifreniz başarıyla kaydedildi ve güncellendi."
        });
    } catch (error) {
        console.error("Şifre Güncelleme Hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
});

// 5. SABİT LİNKLER SİSTEMİ
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
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// --- DÖNEM LİSTELE ---
app.get('/api/sktkdonemler', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM sktkdonem ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/sktkdonem-ekle', async (req, res) => {
    try {
        const { donem_adi } = req.body;
        const result = await db.query(
            "INSERT INTO sktkdonem (donem_adi) VALUES($1) RETURNING *",
            [donem_adi]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/sktkdonem-guncelle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { donem_adi } = req.body;
        await db.query("UPDATE sktkdonem SET donem_adi = $1 WHERE id = $2", [donem_adi, id]);
        res.json({ success: true, message: "Dönem güncellendi." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/sktkdonem-durum/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { durum } = req.body;
        await db.query("UPDATE sktkdonem SET durum = $1 WHERE id = $2", [durum, id]);
        res.json({ success: true, message: "Dönem durumu güncellendi." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/sktkdonem-sil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM sktkdonem WHERE id = $1", [id]);
        res.json({ success: true, message: "Dönem silindi." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==================== KONU SİSTEMİ====================

app.get('/api/sktkkonular', async (req, res) => {
    try {
        const query = `
            SELECT 
                k.id, 
                k.konu_adi, 
                k.ders_id, 
                k.donem_id, 
                k.durum,
                COALESCE(dl.ders, 'Ders Atanmamış') as ders_adi,
                COALESCE(dn.donem_adi, 'Bilinmeyen Dönem') as donem_adi
            FROM sktkkonu k
            LEFT JOIN sktkdersler dl ON k.ders_id = dl.id
            LEFT JOIN sktkdonem dn ON k.donem_id = dn.id
            ORDER BY k.id DESC`;

        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Konu Listeleme Hatası:", err.message);
        res.status(500).json({ success: false, error: "Konu listesi getirilirken sunucu hatası oluştu." });
    }
});

// 2. İLİŞKİLİ YENİ KONU EKLE (POST)
app.post('/api/sktkkonular-ekle', async (req, res) => {
    try {
        const { konu_adi, ders_id, donem_id } = req.body;

        if (!konu_adi || !ders_id || !donem_id) {
            return res.status(400).json({ success: false, message: "Eksik parametre! Tüm alanların seçilmesi zorunludur." });
        }

        const query = `
            INSERT INTO sktkkonu (konu_adi, ders_id, donem_id, durum) 
            VALUES ($1, $2, $3, 'aktif') 
            RETURNING *`;

        const result = await db.query(query, [konu_adi.trim(), ders_id, donem_id]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Konu Ekleme Hatası:", err.message);
        res.status(500).json({ success: false, error: "Yeni konu işlenirken bir hata meydana geldi." });
    }
});

// 3. KONU BAŞLIĞINI GÜNCELLE (PUT)
app.put('/api/sktkkonular-guncelle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { konu_adi, ders_id, donem_id } = req.body;

        if (!konu_adi || konu_adi.trim() === "" || !ders_id || !donem_id) {
            return res.status(400).json({ success: false, message: "Konu adı, ders ve dönem alanları boş bırakılamaz." });
        }
        const query = `
            UPDATE sktkkonu 
            SET konu_adi = $1, ders_id = $2, donem_id = $3 
            WHERE id = $4 
            RETURNING *`;

        const result = await db.query(query, [konu_adi.trim(), ders_id, donem_id, id]);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, message: "Konu tüm bağlamlarıyla güncellendi.", data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Güncellenmek istenen konu bulunamadı." });
        }
    } catch (err) {
        console.error("Konu Güncelleme Hatası:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. KONU YAYIN DURUMUNU DEĞİŞTİR (PATCH)
app.patch('/api/sktkkonular-durum/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { durum } = req.body;

        const query = 'UPDATE sktkkonu SET durum = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [durum, id]);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, message: "Konu durumu güncellendi.", data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Konu bulunamadı." });
        }
    } catch (err) {
        console.error("Konu Durum Hatası:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. KONUYU RESMİ KAYITLARDAN SİL (DELETE)
app.delete('/api/sktkkonular-sil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query("DELETE FROM sktkkonu WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, message: "Konu resmi kayıtlardan tamamen silindi." });
        } else {
            res.status(404).json({ success: false, message: "Silinmek istenen konu zaten mevcut değil." });
        }
    } catch (err) {
        console.error("Konu Silme Hatası:", err.message);
        res.status(500).json({ success: false, error: "Silme işlemi sırasında veritabanı reddi gerçekleşti." });
    }
});

// ==================== MENÜ LİNK SİSTEMİ (sktkmenu) ====================

app.get('/api/menu', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sktkmenu ORDER BY sira ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/menu', async (req, res) => {
    const { baslik, link } = req.body;
    if (!baslik || !link) {
        return res.status(400).json({ success: false, message: "Başlık ve link boş bırakılamaz." });
    }
    try {
        const maxSiraResult = await db.query('SELECT COALESCE(MAX(sira), 0) AS max_sira FROM sktkmenu');
        const yeniSira = maxSiraResult.rows[0].max_sira + 1;

        const yeniEleman = await db.query(
            'INSERT INTO sktkmenu (baslik, link, sira) VALUES ($1, $2, $3) RETURNING *',
            [baslik.trim(), link.trim(), yeniSira]
        );
        res.status(201).json({ success: true, data: yeniEleman.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/menu/sira', async (req, res) => {
    const { yeniSiralama } = req.body;
    try {
        await db.query('BEGIN');
        for (let eleman of yeniSiralama) {
            await db.query(
                'UPDATE sktkmenu SET sira = $1 WHERE id = $2',
                [eleman.sira, eleman.id]
            );
        }
        await db.query('COMMIT');
        res.status(200).json({ success: true, message: 'Menü sıralaması başarıyla güncellendi!' });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ success: false, error: error.message });
    }
});

// server.js içerisine eklenecek olan eleman güncelleme rotası:
app.put('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
    const { baslik, link } = req.body;
    try {
        const result = await db.query(
            'UPDATE sktkmenu SET baslik = $1, link = $2 WHERE id = $3 RETURNING *',
            [baslik.trim(), link.trim(), id]
        );
        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Eleman bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM sktkmenu WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ success: true, message: "Menü elemanı silindi." });
        } else {
            res.status(404).json({ success: false, message: "Eleman bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`| SUNUCU AKTİF: Server running on port ${PORT} |`);
});