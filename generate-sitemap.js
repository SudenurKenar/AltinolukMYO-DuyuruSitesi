import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sizin asil alan adınız
const HOSTNAME = 'https://altinolukmyo.aykutdurgut.com.tr';

async function generate() {
  try {
    const smStream = new SitemapStream({ hostname: HOSTNAME });
    // Sitemap dosyasını tam olarak public klasörüne mühürlüyoruz
    const writeStream = createWriteStream(path.resolve(__dirname, 'public', 'sitemap.xml'));
    const pipeline = smStream.pipe(writeStream);

    // --- 1. HALKA AÇIK SABİT SAYFALAR ---
    // Sadece ziyaretçilerin ve öğrencilerin şifresiz görebileceği sayfalar:

    // Ana Sayfa - En yüksek öncelik
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });

    // Ödev Gönder - Öğrenciler için kritik sayfa
    smStream.write({ url: '/OdevGonder', changefreq: 'monthly', priority: 0.8 });


    // --- 2. DİNAMİK DUYURU LİNKLERİ (Opsiyonel) ---
    // Eğer duyuru detaylarınızın (slug ile olanlar) taranmasını istiyorsanız
    // ileride buraya veritabanı döngünüzü ekleyebilirsiniz.

    smStream.end();

    await streamToPromise(pipeline);
    console.log('✅ Site haritası mahrem odalar korunarak asaletle hazırlandı!');
  } catch (e) {
    console.error('❌ Harita mühürlenirken bir hata oluştu:', e);
  }
}

generate();