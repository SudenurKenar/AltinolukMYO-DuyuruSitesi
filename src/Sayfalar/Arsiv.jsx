import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Arsiv() {
    const [mesajlar, setMesajlar] = useState([]);

    useEffect(() => {
        fetchBildiriler();
    }, []);

    const fetchBildiriler = async () => {
        try {
            const msjRes = await fetch("http://localhost:5000/api/mesajlar");
            const msjData = await msjRes.json();
            setMesajlar(msjData);
        } catch (error) {
            toast.error("Arşiv kayıtlarına ulaşılamıyor. Sunucu bağlantısını kontrol edin.");
        }
    };

    const handleDuzenle = (id) => {
        toast('Düzenleme modülü henüz inşa aşamasında Kraliçem.', { icon: '🛠️' });
    };

    const handleSil = (id) => {
        toast('Silme büyüsü (API) sunucuya henüz eklenmedi.', { icon: '📜' });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Bildiri Arşivi</h3>
            <p className="text-slate-500 mb-8 font-medium">Sistemdeki tüm bildirileri buradan inceleyebilir, düzenleyebilir veya silebilirsiniz.</p>

            {mesajlar.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-medium text-lg">
                    Sistemde henüz yayınlanmış bir bildiri bulunmamaktadır.
                </div>
            ) : (
                <div className="space-y-6">
                    {mesajlar.map((mesaj) => (
                        <div key={mesaj.id} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 p-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all">

                            <div className="flex-1 w-full overflow-hidden">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider rounded-lg">
                                        {mesaj.mesaj_turu || "Belirtilmemiş"}
                                    </span>
                                    <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                                        {new Date(mesaj.atistarihi).toLocaleDateString('tr-TR')}
                                    </span>
                                    <span className="text-[10px] text-slate-300 font-bold tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
                                        ID: {mesaj.id}
                                    </span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{mesaj.baslik}</h4>

                                {/* Geçmiş Fermanın İçeriği (HTML formatında olduğu için dangerouslySetInnerHTML kullanıyoruz) */}
                                <div className="bg-slate-50 p-4 rounded-xl max-h-32 overflow-y-auto custom-scrollbar border border-slate-100">
                                    <div
                                        className="text-sm text-slate-600 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: mesaj.aciklama }}
                                    />
                                </div>
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="flex lg:flex-col gap-3 shrink-0 pt-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 mt-4 lg:mt-0">
                                <button
                                    onClick={() => handleDuzenle(mesaj.id)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Düzenle
                                </button>

                                <button
                                    onClick={() => handleSil(mesaj.id)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}