Altınoluk MYO Duyuru Sistemi

Bu proje, Altınoluk MYO bünyesindeki akademik duyuru trafiğini ve öğrenci ödev 
teslim süreçlerini dijitalleştirmek, yönetilebilir ve modern bir platforma taşımak amacıyla geliştirilmiştir. 
Karmaşık süreçleri yalın bir arayüzle buluşturan tam donanımlı (Full-Stack) bir web çözümüdür.

Teknik Mimari

Proje, yüksek performans ve ölçeklenebilirlik hedeflenerek modern teknolojilerle inşa edilmiştir:
Frontend: React 19 tabanlı mimari, Vite ile optimize edilmiş build süreçleri ve Tailwind CSS ile güçlendirilmiş responsive tasarım.
Backend: Node.js ve Express.js üzerinde kurgulanan RESTful API yapısı.
Veritabanı: İlişkisel veri yönetimi için PostgreSQL.
Güvenlik: Kimlik doğrulama süreçlerinde JWT (JSON Web Token) standardı.
Dosya Yönetimi: Ödev ve eklerin sisteme dahil edilmesi için Multer entegrasyonu.

Yerel Ortam Hazırlığı

Repo Klonlama: git clone <repo-url>
Bağımlılıklar: Hem kök dizinde hem de src/Server dizininde npm install komutuyla gerekli paketleri yükleyin.
Veritabanı: PostgreSQL üzerinde DuyuruSite veritabanını oluşturup src/Server/db.js üzerinden bağlantı ayarlarını yapılandırın.

Çalıştırma

API Sunucusu: cd src/Server && node server.js
İstemci: npm run dev
