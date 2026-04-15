import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminOdevler() {
    const [odevler, setOdevler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/odevler')
            .then(res => res.json())
            .then(data => {
                setOdevler(data);
                setYukleniyor(false);
            })
            .catch(() => {
                toast.error("Arşiv fermanları getirilemedi.");
                setYukleniyor(false);
            });
    }, []);

    // Tarih ve Saati asaletle formatlayan fonksiyon
    const tarihVeSaatFormatla = (tarihStr) => {
        if (!tarihStr) return "Tarih Yok";
        try {
            const d = new Date(tarihStr);
            return d.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return "Format Hatası";
        }
    };

    // GÜVENLİK DUVARI: Dosyayı indirmeden ön izleme yaptıran fonksiyon
    const guvenliAc = (dosyaYolu) => {
        const tamUrl = `http://localhost:5000${dosyaYolu}`;
        const uzanti = dosyaYolu.split('.').pop().toLowerCase();

        // PDF, Resim ve Metin dosyaları tarayıcıda doğrudan güvenle açılabilir
        if (['pdf', 'jpg', 'jpeg', 'png', 'txt'].includes(uzanti)) {
            window.open(tamUrl, '_blank');
        }
        // Office dosyaları (Word, Excel) tehlikeli olabilir, onları Google Viewer üzerinden gösteriyoruz
        else if (['doc', 'docx', 'xls', 'xlsx'].includes(uzanti)) {
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(tamUrl)}&embedded=true`;
            window.open(viewerUrl, '_blank');
        }
        // Diğer bilinmeyen dosyalar için indirme uyarısı veya yeni sekme
        else {
            toast.success("Dosya ön izleme için yeni sekmede açılıyor...");
            window.open(tamUrl, '_blank');
        }
    };

    if (yukleniyor) return <div className="p-10 text-center font-serif text-slate-400 italic">Arşiv taranıyor...</div>;

    return (
        <div className="p-4 sm:p-8 font-serif text-left bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1e3a5a] tracking-tight">Ödev Teslim Arşivi</h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">Dosyalar bilgisayarınıza inmeden önce güvenle ön izlenebilir.</p>
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
                                <th className="px-8 py-5 text-right">Güvenlik</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {odevler.map((odev) => (
                                <tr key={odev.id} className="hover:bg-cyan-50/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-800 text-sm">{odev.isim} {odev.soyisim}</div>
                                        <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mt-1">{odev.no}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-600">{odev.ders}</td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs text-slate-600 leading-relaxed max-w-xs italic">
                                            {odev.aciklama || "---"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-bold text-slate-600 font-sans bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                                            {tarihVeSaatFormatla(odev.yuklenme_tarihi)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {/* Butona basıldığında güvenli fonksiyon çalışır */}
                                        <button
                                            onClick={() => guvenliAc(odev.dosya_yolu)}
                                            className="inline-flex items-center justify-center px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-100 transition-all active:scale-95 shadow-sm"
                                        >
                                            İncele
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}