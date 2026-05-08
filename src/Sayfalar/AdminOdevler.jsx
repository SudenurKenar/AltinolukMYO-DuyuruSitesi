import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Filter, X, Calendar, FileText, Trash2 } from 'lucide-react';

// LAZY LOAD BİLEŞENİ
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
                        <div className="max-w-[180px] overflow-x-auto ozel-scroll pb-1 text-left">
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-slate-700 text-sm tracking-tight whitespace-nowrap uppercase">{odev.isim}</span>
                                <span className="font-bold text-slate-700 text-sm tracking-tight whitespace-nowrap uppercase">{odev.soyisim}</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-cyan-500 font-black mt-1 uppercase tracking-widest text-left">{odev.no}</div>
                    </td>

                    <td className="px-6 md:px-8 py-6 text-center animate-in fade-in duration-500">
                        <div className="w-full max-w-[260px] mx-auto flex flex-col gap-2 items-center">
                            <span className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase border border-slate-200 shadow-sm whitespace-nowrap inline-block">
                                {odev.ders}
                            </span>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border border-cyan-100">
                                    {odev.donem || "Bilinmeyen Dönem"}
                                </span>
                                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border border-slate-100">
                                    {odev.konu || "Genel Konu"}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td className="px-6 md:px-8 py-6 animate-in fade-in duration-500">
                        <div className="max-h-24 overflow-y-auto pr-2 text-xs text-slate-500 leading-relaxed font-medium italic ozel-scroll text-left">
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
                                    {uzanti === 'pdf' ? "İncele" : "İndir"}
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
    const [filtrelenmişOdevler, setFiltrelenmişOdevler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [seciliPdf, setSeciliPdf] = useState(null);

    // Filtre State'leri
    const [filtreler, setFiltreler] = useState({
        donem: '',
        konu: '',
        ders: '',
        dosyaTuru: 'hepsi', // hepsi, pdf, zip, rar, yok
        baslangicTarihi: '',
        bitisTarihi: ''
    });

    useEffect(() => {
        fetch('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkodevler')
            .then(res => res.json())
            .then(data => {
                const liste = Array.isArray(data) ? data : [];
                setOdevler(liste);
                setFiltrelenmişOdevler(liste);
                setYukleniyor(false);
            })
            .catch(() => {
                toast.error("Arşiv verileri getirilemedi.");
                setYukleniyor(false);
            });
    }, []);

    // Filtreleme Mantığı
    useEffect(() => {
        let sonuc = [...odevler];

        if (filtreler.donem) sonuc = sonuc.filter(o => o.donem === filtreler.donem);
        if (filtreler.konu) sonuc = sonuc.filter(o => o.konu === filtreler.konu);
        if (filtreler.ders) sonuc = sonuc.filter(o => o.ders === filtreler.ders);

        if (filtreler.dosyaTuru !== 'hepsi') {
            if (filtreler.dosyaTuru === 'yok') {
                sonuc = sonuc.filter(o => !o.dosyolu);
            } else {
                sonuc = sonuc.filter(o => o.dosyolu?.toLowerCase().endsWith(filtreler.dosyaTuru));
            }
        }

        if (filtreler.baslangicTarihi) {
            sonuc = sonuc.filter(o => new Date(o.yuktarihi) >= new Date(filtreler.baslangicTarihi));
        }
        if (filtreler.bitisTarihi) {
            const bitis = new Date(filtreler.bitisTarihi);
            bitis.setHours(23, 59, 59); // Günün sonuna kadar al
            sonuc = sonuc.filter(o => new Date(o.yuktarihi) <= bitis);
        }

        setFiltrelenmişOdevler(sonuc);
    }, [filtreler, odevler]);

    const filtreleriTemizle = () => {
        setFiltreler({
            donem: '',
            konu: '',
            ders: '',
            dosyaTuru: 'hepsi',
            baslangicTarihi: '',
            bitisTarihi: ''
        });
        toast.success("Tüm filtreler sıfırlandı.");
    };

    const tarihVeSaatFormatla = (tarihStr) => {
        if (!tarihStr) return "Tarih Yok";
        return new Date(tarihStr).toLocaleString('tr-TR');
    };

    const handleDosyaIncele = (dosyaYolu) => {
        if (!dosyaYolu) return toast.error("Dosya yolu bulunamadı!");
        const dosyaAdi = dosyaYolu.replace(/\/+$/, "").split('/').pop();
        const tamYol = `https://altinolukmyo.apps.srv.aykutdurgut.com.tr/uploads/${dosyaAdi}`;
        if (dosyaAdi.split('.').pop().toLowerCase() === 'pdf') {
            setSeciliPdf(tamYol);
        } else {
            window.open(tamYol, '_blank');
            toast.success("Dosya indiriliyor...");
        }
    };

    if (yukleniyor) return <div className="p-10 text-center text-slate-400 italic font-sans uppercase tracking-widest text-xs">Arşiv taranıyor...</div>;

    return (
        <div className="p-4 sm:p-8 font-sans text-left bg-slate-50 min-h-screen">
            <style dangerouslySetInnerHTML={{ __html: `.ozel-scroll { scrollbar-width: thin; scrollbar-color: #1e3a5a transparent; } .ozel-scroll::-webkit-scrollbar { height: 8px; width: 8px; } .ozel-scroll::-webkit-scrollbar-thumb { background-color: #1e3a5a; border-radius: 20px; }` }} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                            ÖDEV YÖNETİM <span className="text-cyan-600 not-italic font-light">PANELİ</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                            Arşiv Filtreleme ve Sorgulama
                        </p>
                    </div>
                    <button onClick={filtreleriTemizle} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100">
                        <Trash2 size={14} /> Filtreleri Temizle
                    </button>
                </div>

                {/* FİLTRELEME ALANI */}
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* Dönem */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Dönem</label>
                        <select value={filtreler.donem} onChange={(e) => setFiltreler({ ...filtreler, donem: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer">
                            <option value="">Tümü</option>
                            {[...new Set(odevler.map(o => o.donem))].filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    {/* Konu */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Konu</label>
                        <select value={filtreler.konu} onChange={(e) => setFiltreler({ ...filtreler, konu: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer">
                            <option value="">Tümü</option>
                            {[...new Set(odevler.map(o => o.konu))].filter(Boolean).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    {/* Ders */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ders</label>
                        <select value={filtreler.ders} onChange={(e) => setFiltreler({ ...filtreler, ders: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer">
                            <option value="">Tümü</option>
                            {[...new Set(odevler.map(o => o.ders))].filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    {/* Dosya Türü */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Dosya</label>
                        <select value={filtreler.dosyaTuru} onChange={(e) => setFiltreler({ ...filtreler, dosyaTuru: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all cursor-pointer">
                            <option value="hepsi">Hepsi</option>
                            <option value="pdf">PDF</option>
                            <option value="zip">RAR/ZIP</option>
                            <option value="yok">Dosyasız</option>
                        </select>
                    </div>
                    {/* Tarih Aralığı */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Başlangıç</label>
                        <input type="date" value={filtreler.baslangicTarihi} onChange={(e) => setFiltreler({ ...filtreler, baslangicTarihi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bitiş</label>
                        <input type="date" value={filtreler.bitisTarihi} onChange={(e) => setFiltreler({ ...filtreler, bitisTarihi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all" />
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto ozel-scroll transform scale-y-[-1]">
                        <div className="transform scale-y-[-1] pt-3 pb-2">
                            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="w-[20%] px-6 md:px-8 py-6">Öğrenci Bilgisi</th>
                                        <th className="w-[25%] px-6 md:px-8 py-6 text-center">Ders / Dönem / Konu</th>
                                        <th className="w-[25%] px-6 md:px-8 py-6">Öğrenci Notu</th>
                                        <th className="w-[15%] px-6 md:px-8 py-6 text-left">Teslim Vakti</th>
                                        <th className="w-[15%] px-6 md:px-8 py-6 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtrelenmişOdevler.map((odev) => (
                                        <LazyOdevSatiri key={odev.id} odev={odev} tarihFormatla={tarihVeSaatFormatla} handleIncele={handleDosyaIncele} />
                                    ))}
                                </tbody>
                            </table>
                            {filtrelenmişOdevler.length === 0 && (
                                <div className="py-20 text-center text-slate-400 italic uppercase tracking-widest text-xs">Aranan kriterlere uygun ödev bulunamadı.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Ön İzleme Modalı */}
            {seciliPdf && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3a5a]/40 backdrop-blur-md p-4 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-8 border-white">
                        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center px-8 shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Resmi Evrak Ön İzleme</span>
                            <button onClick={() => setSeciliPdf(null)} className="bg-white text-slate-600 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm">Kapat</button>
                        </div>
                        <div className="flex-1 bg-slate-100 relative">
                            <iframe key={seciliPdf} src={seciliPdf} className="w-full h-full border-none absolute inset-0" title="PDF" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}