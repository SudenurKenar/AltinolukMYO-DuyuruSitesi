import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnaLayout from '../Layouts/AnaLayout';

export default function DuyuruDetay() {
    const { id } = useParams();
    const [detay, setDetay] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/mesajlar`)
            .then(res => res.json())
            .then(data => {
                const bulundu = data.find(m => String(m.id) === String(id));
                if (bulundu) setDetay(bulundu);
                else toast.error("İçerik arşivde bulunamadı.");
            })
            .catch(() => toast.error("Sistem bağlantısı koptu."));

        window.scrollTo(0, 0);
    }, [id]);

    if (!detay) return (
        <AnaLayout>
            <div className="flex h-96 items-center justify-center font-bold text-slate-300 uppercase tracking-widest text-[10px] font-sans">
                Yükleniyor...
            </div>
        </AnaLayout>
    );

    const tarihObje = new Date(detay.atistarihi);
    const tarih = tarihObje.toLocaleDateString('tr-TR');
    const saat = tarihObje.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <AnaLayout>
            {/* Sayfa genelinde font-serif hakimiyeti mühürlendi */}
            <div className="w-full max-w-[1200px] mx-auto min-h-[calc(100vh-250px)] px-2 sm:px-6 lg:px-10 py-4 sm:py-10 font-serif">

                <div className="w-full bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">

                    {/* Header: Başlık ve Meta Veriler */}
                    <header className="px-5 sm:px-12 lg:px-20 py-8 lg:py-16 bg-slate-50/5 border-b border-slate-100/60">
                        {/* Başlık: Koyu Mavi ve Serif */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1e3a5a] leading-tight tracking-tight mb-8">
                            {detay.baslik}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-slate-100/60 pt-6">

                            {/* Sol: Zaman ve Statü (Bilgi kısımlarında okunabilirlik için sans-serif kalabilir veya serif'e zorlanabilir) */}
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <span>{tarih}</span>
                                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                                    <span>{saat}</span>
                                </div>
                                <span className="hidden sm:inline w-1.5 h-[2px] bg-slate-100 rounded-full"></span>
                                <span className="text-cyan-600 font-black tracking-[0.2em]">{detay.mesaj_turu}</span>
                            </div>

                            {/* Sağ: Kategori - Turkuaz Mühür */}
                            <span className="px-5 py-2 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-100 font-sans">
                                {detay.kategori_adi || "Genel"}
                            </span>
                        </div>
                    </header>

                    {/* Main: Mesaj İçeriği - Tamamen Serif Nizamı */}
                    <main className="px-5 sm:px-12 lg:px-20 py-10 lg:py-20 bg-white">
                        <div className="w-full max-w-[950px] text-left">
                            <div
                                className="text-slate-700 text-base sm:text-lg lg:text-[19px] leading-[1.8] 
                                           prose prose-slate max-w-none font-serif
                                           [&>h1]:font-serif [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-[#1e3a5a] [&>h1]:mb-6
                                           [&>h2]:font-serif [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-700 [&>h2]:mt-10 [&>h2]:mb-4
                                           [&>h3]:font-serif [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-700 [&>h3]:mt-8 [&>h3]:mb-3
                                           [&>p]:mb-8 [&>p]:leading-relaxed
                                           [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-8 [&>ul]:space-y-3
                                           [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-8 [&>ol]:space-y-3
                                           [&>strong]:font-bold [&>strong]:text-slate-900
                                           [&>a]:text-cyan-600 [&>a]:font-bold [&>a]:underline"
                                dangerouslySetInnerHTML={{ __html: detay.aciklama }}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </AnaLayout>
    );
}