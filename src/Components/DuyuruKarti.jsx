import React from 'react';
import { Link } from 'react-router-dom';

const DuyuruKarti = ({ b, borderClass, btnHoverClass }) => {
    // Zaman Verileri
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

    return (
        <div className="group bg-white border-b border-slate-50 p-5 sm:p-7 transition-all hover:bg-slate-50/80 relative overflow-hidden flex items-center min-h-[120px] font-sans">

            {/* Sol Vurgu Çizgisi: Kategorinin rengini asaletle yansıtır */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2 ${borderClass}`}></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full text-left">

                <div className="flex-1 min-w-0">
                    {/* Üst Bilgi: Tarih ve Saat */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                        <span>{tarih}</span>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                        <span>{saat}</span>
                    </div>

                    {/* Başlık: Net ve Okunaklı */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-cyan-700 transition-colors leading-tight mb-2">
                        {b.baslik}
                    </h3>

                    {/* İçerik Özeti */}
                    <div
                        className="text-slate-500 text-xs sm:text-sm line-clamp-1 opacity-80 font-medium leading-relaxed italic"
                        dangerouslySetInnerHTML={{ __html: b.aciklama }}
                    />
                </div>

                {/* Sağ Taraf: Sadece İncele Butonu */}
                <div className="shrink-0">
                    <Link
                        to={`/detay/${b.id}/${slugify(b.baslik)}`}
                        className={`inline-flex items-center justify-center px-8 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200 ${btnHoverClass}`}
                    >
                        İncele
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default DuyuruKarti;