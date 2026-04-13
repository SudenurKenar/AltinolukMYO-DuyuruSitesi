import React from 'react';
import { Link } from 'react-router-dom'; // Yönlendirme için Link eklendi

const DuyuruKarti = ({ b, borderClass, btnHoverClass }) => {
    const tarihObje = new Date(b.atistarihi);
    const tarih = tarihObje.toLocaleDateString('tr-TR');
    const saat = tarihObje.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // URL Dostu Başlık Fonksiyonu (Slugify)
    const slugify = (text) => {
        const trMap = {
            'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
            'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
        };
        return text.toString().toLowerCase()
            .replace(/[çğşüıöÇĞŞÜİÖ]/g, (m) => trMap[m])
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    // Kategori ismini 30 karakter ile sınırlama kuralı
    const kategoriIsmi = b.kategori_adi || "Duyuru";
    const kisaKategori = kategoriIsmi.length > 30
        ? kategoriIsmi.substring(0, 30) + "..."
        : kategoriIsmi;

    return (
        <div className="group bg-white border-b border-slate-50 p-4 sm:p-6 transition-all hover:bg-slate-50 relative overflow-hidden flex items-center min-h-[110px] sm:min-h-[130px]">
            {/* Yan Vurgu Çizgisi */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2 ${borderClass}`}></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0">
                    {/* Üst Bilgi: Zaman Sola Sabitlendi */}
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                        <span>{tarih}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span>{saat}</span>
                    </div>

                    {/* Başlık */}
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors leading-tight truncate">
                        {b.baslik}
                    </h3>

                    {/* Açıklama */}
                    <div
                        className="text-slate-500 text-[11px] sm:text-xs mt-1 line-clamp-1 opacity-70 font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: b.aciklama }}
                    />
                </div>

                {/* Sağ Taraf: Kategori Etiketi ve Link Dikey Hizalandı */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Kategori Etiketi */}
                    <span
                        title={kategoriIsmi}
                        className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-white ${borderClass} opacity-95 shadow-sm max-w-[150px] truncate`}
                    >
                        {kisaKategori}
                    </span>

                    {/* İncele Butonu (Link Olarak Güncellendi) */}
                    <Link
                        to={`/detay/${b.id}/${slugify(b.baslik)}`}
                        className={`inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 bg-slate-100 text-slate-600 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-sm ${btnHoverClass}`}
                    >
                        İncele
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DuyuruKarti;