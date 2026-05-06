import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnaLayout from '../Layouts/AnaLayout';
import { Helmet } from 'react-helmet-async';

export default function DuyuruDetay() {
    const { id } = useParams();
    const [detay, setDetay] = useState(null);

    useEffect(() => {
        fetch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkmesajlar`)
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
            <Helmet>
                <title>{detay.baslik} | Altınoluk MYO</title>
            </Helmet>

            <div className="w-full max-w-[1200px] mx-auto min-h-[calc(100vh-250px)] px-2 sm:px-6 lg:px-8 py-4 sm:py-10 font-serif text-left">
                <div className="w-full bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">

                    <header className="px-5 sm:px-10 lg:px-12 py-6 lg:py-10 bg-slate-50/10 border-b border-slate-100/60">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1e3a5a] leading-tight tracking-tight mb-6">
                            {detay.baslik}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100/60 pt-6 font-sans">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <time className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm font-bold text-slate-500">
                                    {tarih} • {saat}
                                </time>
                                <span className="text-cyan-600 font-black">{detay.mesaj_turu}</span>
                            </div>
                        </div>
                    </header>


                    <main className="px-5 sm:px-10 lg:px-12 py-8 lg:py-12 bg-white">
                        <article className="w-full max-w-none">
                            <div
                                className="text-slate-800 text-[15px] sm:text-[17px] leading-[1.7] font-serif
                                           [word-wrap:break-word] [overflow-wrap:anywhere]
                                           prose prose-slate max-w-none
                                           [&_p]:!mb-3 [&_p]:min-h-[1em] [&_p]:whitespace-pre-wrap
                                           [&_ul]:!list-disc [&_ul]:!pl-8 [&_ul]:!mb-4 [&_ul]:!space-y-1
                                           [&_li]:!mb-1 [&_li]:!leading-relaxed
                                           [&_strong]:font-black [&_strong]:text-slate-900
                                           [&_a]:text-cyan-600 [&_a]:underline [&_a]:break-all
                                           [&_h2]:!mt-6 [&_h2]:!mb-2 [&_h2]:text-lg [&_h2]:font-bold"
                                dangerouslySetInnerHTML={{ __html: detay.aciklama }}
                            />
                        </article>

                        <div className="mt-16 pt-8 border-t border-slate-100">
                            <p className="text-[10px] text-slate-300 text-center font-sans tracking-[0.4em] uppercase italic opacity-50">
                                Altınoluk Meslek Yüksekokulu Akademik Duyuru Paneli
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </AnaLayout>
    );
}