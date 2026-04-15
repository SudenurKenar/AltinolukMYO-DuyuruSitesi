import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminOdevler() {
    const [odevler, setOdevler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [seciliPdf, setSeciliPdf] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/odevler')
            .then(res => res.json())
            .then(data => {
                setOdevler(Array.isArray(data) ? data : []);
                setYukleniyor(false);
            })
            .catch(() => {
                toast.error("Arşiv fermanları getirilemedi.");
                setOdevler([]);
                setYukleniyor(false);
            });
    }, []);

    const tarihVeSaatFormatla = (tarihStr) => {
        if (!tarihStr) return "Tarih Yok";
        try {
            const d = new Date(tarihStr);
            return d.toLocaleString('tr-TR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return "Format Hatası"; }
    };

    if (yukleniyor) return <div className="p-10 text-center font-sans text-slate-400 italic">Arşiv taranıyor...</div>;

    return (
        /* font-sans: Tüm bileşeni modern çizgiye taşıyan ana mühür */
        <div className="p-4 sm:p-8 font-sans text-left bg-slate-50 min-h-screen relative">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1e3a5a] tracking-tight text-left">Ödev Teslim Arşivi</h1>
                <p className="text-sm text-slate-500 mt-2 font-medium italic">Gelen tüm PDF ödevleri indirmeden buradan inceleyebilirsiniz Hanımım.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Öğrenci Bilgisi</th>
                                <th className="px-8 py-5">Ders</th>
                                <th className="px-8 py-5">Öğrenci Notu</th>
                                <th className="px-8 py-5">Gönderim Vakti</th>
                                <th className="px-8 py-5">PDF'ler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {odevler.length > 0 ? odevler.map((odev) => (
                                <tr key={odev.id} className="hover:bg-cyan-50/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-800 text-sm tracking-tight">{odev.isim} {odev.soyisim}</div>
                                        <div className="text-[10px] text-cyan-600 font-black uppercase tracking-widest mt-1">{odev.no}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-semibold text-slate-600">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide">{odev.ders}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs text-slate-500 leading-relaxed max-w-xs italic line-clamp-2">
                                            {odev.aciklama || "---"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                                            {tarihVeSaatFormatla(odev.yuktarihi)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSeciliPdf(`http://localhost:5000${odev.dosyolu}`)}
                                            className="inline-flex items-center justify-center px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-100 transition-all active:scale-95 shadow-sm"
                                        >
                                            Ödevİ İncele
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center text-slate-300 italic font-medium">
                                        Henüz bir ödev bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PDF ÖN İZLEME MODALI --- */}
            {seciliPdf && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3a5a]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-4 border-white font-sans">
                        <div className="p-4 bg-slate-50 border-b flex justify-between items-center px-8">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Ödev Ön İzleme Paneli</span>
                            <button
                                onClick={() => setSeciliPdf(null)}
                                className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                                Kapat
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-200">
                            <iframe
                                src={`${seciliPdf}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="PDF Ön İzleme"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}