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
            <div className="w-full max-w-[1100px] mx-auto min-h-[calc(100vh-250px)] px-4 sm:px-6 lg:px-8 py-6 sm:py-12 font-serif">
                <div className="w-full bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">

                    {/* Header: Başlık ve Meta Veriler */}
                    <header className="px-6 sm:px-12 lg:px-16 py-8 lg:py-12 bg-slate-50/10 border-b border-slate-100/60">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1e3a5a] leading-tight tracking-tight mb-6">
                            {detay.baslik}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100/60 pt-6">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <span>{tarih}</span>
                                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                                    <span>{saat}</span>
                                </div>
                                <span className="text-cyan-600 font-black">{detay.mesaj_turu}</span>
                            </div>

                            <span className="px-4 py-1.5 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md font-sans">
                                {detay.kategori_adi || "Genel"}
                            </span>
                        </div>
                    </header>

                    {/* Main: Mesaj İçeriği - Boyutlar ve Boşluklar Optimize Edildi */}
                    <main className="px-6 sm:px-12 lg:px-16 py-6 lg:py-10 bg-white">
                        <div className="w-full max-w-[850px] text-left">
                            <div
                                className="text-slate-700 text-[15px] sm:text-[16px] leading-[1.5] 
                                           prose prose-slate max-w-none font-serif
                                           [&>h1]:text-xl [&>h1]:font-black [&>h1]:text-[#1e3a5a] [&>h1]:mb-3
                                           [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-slate-800 [&>h2]:mt-4 [&>h2]:mb-2
                                           [&>p]:mb-4 [&>p]:leading-normal
                                           [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:space-y-0.5
                                           [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol]:space-y-0.5
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