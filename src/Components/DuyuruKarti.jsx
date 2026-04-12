import React from 'react';

const DuyuruKarti = ({ b, borderClass, btnHoverClass }) => {
    const tarihObje = new Date(b.atistarihi);
    const tarih = tarihObje.toLocaleDateString('tr-TR');
    const saat = tarihObje.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="group bg-white border-b border-slate-50 p-4 sm:p-6 transition-all hover:bg-slate-50 relative overflow-hidden flex items-center min-h-[100px] sm:h-[130px]">
            <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1 transition-all group-hover:w-2 ${borderClass}`}></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="flex-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-2">
                        <span>{tarih}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span>{saat}</span>
                    </div>
                    {/* Mobilde daha okunaklı, taşmayan başlık */}
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors leading-tight truncate">
                        {b.baslik}
                    </h3>
                    <div
                        className="text-slate-500 text-[11px] sm:text-xs mt-1 line-clamp-1 opacity-80 font-medium"
                        dangerouslySetInnerHTML={{ __html: b.aciklama }}
                    />
                </div>
                {/* Mobilde butonu küçülttük ve daha kibar yaptık */}
                <button className={`w-fit sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-50 sm:bg-slate-100 text-slate-600 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95 ${btnHoverClass}`}>
                    İncele
                </button>
            </div>
        </div>
    );
};

export default DuyuruKarti;