import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// LAZY LOAD BİLEŞENİ: Satır bazlı izleme yaparak performansı korur.
const LazyOdevSatiri = ({ odev, tarihFormatla, handleIncele }) => {
    const [gorunur, setGorunur] = useState(false);
    const satirRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setGorunur(true);
                    observer.unobserve(satirRef.current);
                }
            },
            { threshold: 0.1 }
        );

        if (satirRef.current) observer.observe(satirRef.current);
        return () => observer.disconnect();
    }, []);

    const uzanti = odev.dosyolu ? odev.dosyolu.split('.').pop().toLowerCase() : null;

    return (
        <tr ref={satirRef} className="hover:bg-cyan-50/10 transition-all duration-300 min-h-[100px]">
            {gorunur ? (
                <>
                    <td className="px-6 md:px-8 py-6 animate-in fade-in duration-500">
                        <div className="max-w-[180px] overflow-x-auto ozel-scroll pb-1">
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-slate-700 text-sm tracking-tight whitespace-nowrap">{odev.isim}</span>
                                <span className="font-bold text-slate-700 text-sm tracking-tight whitespace-nowrap">{odev.soyisim}</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-cyan-500 font-black mt-1 uppercase tracking-widest">{odev.no}</div>
                    </td>

                    <td className="px-6 md:px-8 py-6 text-center animate-in fade-in duration-500">
                        <div className="w-full max-w-[260px] mx-auto overflow-x-auto ozel-scroll pb-1.5">
                            <span className="bg-white text-slate-500 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase border border-slate-100 shadow-sm whitespace-nowrap inline-block">
                                {odev.ders}
                            </span>
                        </div>
                    </td>

                    <td className="px-6 md:px-8 py-6 animate-in fade-in duration-500">
                        <div className="max-h-24 overflow-y-auto pr-2 text-xs text-slate-500 leading-relaxed font-medium italic ozel-scroll">
                            {odev.aciklama && odev.aciklama.trim() !== "" ? odev.aciklama : "---"}
                        </div>
                    </td>

                    <td className="px-6 md:px-8 py-6 text-[10px] font-bold text-slate-400 text-left animate-in fade-in duration-500">
                        {tarihFormatla(odev.yuktarihi)}
                    </td>

                    <td className="px-6 md:px-8 py-6 text-right animate-in fade-in duration-500">
                        <div className="flex flex-col items-end gap-2">
                            {odev.dosyolu ? (
                                <button
                                    onClick={() => handleIncele(odev.dosyolu)}
                                    className={`inline-flex items-center gap-2 px-4 md:px-6 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 active:scale-95 ${uzanti === 'pdf' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-100' : 'bg-[#1e3a5a] hover:bg-[#152940] shadow-blue-100'}`}
                                >
                                    {uzanti === 'pdf' ? (
                                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>İncele</>
                                    ) : (
                                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>İndir</>
                                    )}
                                </button>
                            ) : (
                                <span className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-300 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest select-none">Doküman Yok</span>
                            )}
                        </div>
                    </td>
                </>
            ) : (
                <td colSpan="5" className="h-[100px] bg-slate-50/50 animate-pulse"></td>
            )}
        </tr>
    );
};

export default function AdminOdevler() {
    const [odevler, setOdevler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [seciliPdf, setSeciliPdf] = useState(null);

    useEffect(() => {
        fetch('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkodevler')
            .then(res => res.json())
            .then(data => {
                setOdevler(Array.isArray(data) ? data : []);
                setYukleniyor(false);
            })
            .catch(() => {
                toast.error("Arşiv verileri getirilemedi.");
                setYukleniyor(false);
            });
    }, []);

    const tarihVeSaatFormatla = (tarihStr) => {
        if (!tarihStr) return "Tarih Yok";
        const d = new Date(tarihStr);
        return d.toLocaleString('tr-TR');
    };

    const handleDosyaIncele = (dosyaYolu) => {
        if (!dosyaYolu) return toast.error("Dosya yolu bulunamadı!");


        let temizYol = dosyaYolu.replace(/\/+$/, "");
        const dosyaAdi = temizYol.split('/').pop();
        const tamYol = `https://altinolukmyo.apps.srv.aykutdurgut.com.tr/uploads/${dosyaAdi}`;

        const uzanti = dosyaAdi.split('.').pop().toLowerCase();

        if (uzanti === 'pdf') {
            setSeciliPdf(tamYol);
        } else {
            window.open(tamYol, '_blank');
            toast.success("Dosya indiriliyor...");
        }
    };

    if (yukleniyor) return <div className="p-10 text-center text-slate-400 italic font-sans">Arşiv taranıyor...</div>;

    return (
        <div className="p-4 sm:p-8 font-sans text-left bg-slate-50 min-h-screen">
            <style dangerouslySetInnerHTML={{
                __html: `
                .ozel-scroll { scrollbar-width: thin; scrollbar-color: #1e3a5a transparent; }
                .ozel-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
                .ozel-scroll::-webkit-scrollbar-thumb { background-color: #1e3a5a; border-radius: 20px; }
            `}} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter">
                        ÖDEV YÖNETİM <span className="text-cyan-600 not-italic font-light">PANELİ</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Akademik Arşiv ve Kontrol Merkezi</p>
                </div>

                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto ozel-scroll transform scale-y-[-1]">
                        <div className="transform scale-y-[-1] pt-3 pb-2">
                            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="w-[20%] px-6 md:px-8 py-6">Öğrenci Bilgisi</th>
                                        <th className="w-[25%] px-6 md:px-8 py-6 text-center">Ders</th>
                                        <th className="w-[25%] px-6 md:px-8 py-6">Açıklama</th>
                                        <th className="w-[15%] px-6 md:px-8 py-6 text-left">Vakit</th>
                                        <th className="w-[15%] px-6 md:px-8 py-6 text-right">Eylem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {odevler.map((odev) => (
                                        <LazyOdevSatiri
                                            key={odev.id}
                                            odev={odev}
                                            tarihFormatla={tarihVeSaatFormatla}
                                            handleIncele={handleDosyaIncele}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {seciliPdf && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3a5a]/40 backdrop-blur-md p-4 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-8 border-white">
                        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center px-8 shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Resmi Evrak Ön İzleme
                            </span>
                            <button
                                onClick={() => setSeciliPdf(null)}
                                className="bg-white text-slate-600 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
                            >
                                Kapat
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 relative">
                            <iframe
                                key={seciliPdf}
                                src={seciliPdf}
                                className="w-full h-full border-none absolute inset-0"
                                title="PDF"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}