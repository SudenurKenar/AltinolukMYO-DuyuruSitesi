import React, { useState, useEffect } from 'react';

export default function OdevFiltrePaneli({ odevler, filtreler, setFiltreler }) {
    const [filtreliKonular, setFiltreliKonular] = useState([]);

    const benzersizDersler = [...new Set(odevler.map(o => o.ders))].filter(Boolean);
    const benzersizDonemler = React.useMemo(() => {
        const donemHaritasi = {};
        odevler.forEach(o => {
            if (o.donem) {
                if (!donemHaritasi[o.donem] || o.donem_id > donemHaritasi[o.donem]) {
                    donemHaritasi[o.donem] = o.donem_id;
                }
            }
        });

        return Object.keys(donemHaritasi).sort((a, b) => donemHaritasi[b] - donemHaritasi[a]);
    }, [odevler]);

    useEffect(() => {
        let konularHavuzu = odevler;

        if (filtreler.ders) {
            konularHavuzu = konularHavuzu.filter(o => o.ders === filtreler.ders);
        }
        if (filtreler.donem) {
            konularHavuzu = konularHavuzu.filter(o => o.donem === filtreler.donem);
        }

        const süzülenKonular = [...new Set(konularHavuzu.map(o => o.konu))].filter(Boolean);
        setFiltreliKonular(süzülenKonular);
    }, [filtreler.ders, filtreler.donem, odevler]);

    // Ders veya Dönem değiştiğinde seçili kalan konuyu otomatik sıfırlıyoruz
    const handleDersVeyaDonemChange = (alan, deger) => {
        setFiltreler(prev => ({
            ...prev,
            [alan]: deger,
            konu: ''
        }));
    };

    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

            {/* 1. DERS SEÇİMİ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ders</label>
                <select
                    value={filtreler.ders}
                    onChange={(e) => handleDersVeyaDonemChange('ders', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer bg-white"
                >
                    <option value="">Tümü</option>
                    {benzersizDersler.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* 2. DÖNEM SEÇİMİ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Dönem</label>
                <select
                    value={filtreler.donem}
                    onChange={(e) => handleDersVeyaDonemChange('donem', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer bg-white"
                >
                    <option value="">Tümü</option>
                    {benzersizDonemler.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* 3. BAĞIMLI KONU SEÇİMİ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Konu</label>
                <select
                    value={filtreler.konu}
                    onChange={(e) => setFiltreler({ ...filtreler, konu: e.target.value })}
                    disabled={!filtreler.ders || !filtreler.donem}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed bg-white"
                >
                    {!filtreler.ders || !filtreler.donem ? (
                        <option value="">Önce Ders ve Dönem...</option>
                    ) : (
                        <>
                            <option value="">Tümü (Seçilen Bağlam)</option>
                            {filtreliKonular.map(k => <option key={k} value={k}>{k}</option>)}
                        </>
                    )}
                </select>
            </div>

            {/* 4. DOSYA TÜRÜ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Dosya</label>
                <select value={filtreler.dosyaTuru} onChange={(e) => setFiltreler({ ...filtreler, dosyaTuru: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer bg-white">
                    <option value="hepsi">Hepsi</option>
                    <option value="pdf">PDF</option>
                    <option value="zip">RAR/ZIP</option>
                    <option value="yok">Dosyasız</option>
                </select>
            </div>

            {/* 5. BAŞLANGIÇ TARİHİ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Başlangıç</label>
                <input type="date" value={filtreler.baslangicTarihi} onChange={(e) => setFiltreler({ ...filtreler, baslangicTarihi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all" />
            </div>

            {/* 6. BİTİŞ TARİHİ */}
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bitiş</label>
                <input type="date" value={filtreler.bitisTarihi} onChange={(e) => setFiltreler({ ...filtreler, bitisTarihi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all" />
            </div>

        </div>
    );
}