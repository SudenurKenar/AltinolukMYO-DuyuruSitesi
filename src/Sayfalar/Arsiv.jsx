import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OnayModali from '../Components/OnayModali';

export default function Arsiv() {
    const [mesajlar, setMesajlar] = useState([]);
    const navigate = useNavigate();

    // Modal durum yönetimi
    const [modalAcik, setModalAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        fetchBildiriler();
    }, []);

    const fetchBildiriler = async () => {
        try {
            const msjRes = await fetch("http://localhost:5000/api/sktkmesajlar");
            const msjData = await msjRes.json();
            // Veritabanından gelen kategorisiz veriyi state'e aktarıyoruz
            setMesajlar(msjData);
        } catch (error) {
            toast.error("Arşiv kayıtlarına ulaşılamıyor. Sunucu bağlantısını kontrol edin.");
        }
    };

    const handleDuzenle = (mesaj) => {
        navigate('/admin', { state: { düzenlenecekMesaj: mesaj } });
        toast.success("Seçili kayıt düzenleme moduna aktarıldı.");
    };

    const handleSilTiklama = (id) => {
        setSilinecekId(id);
        setModalAcik(true);
    };

    const handleGercekSilme = async () => {
        if (!silinecekId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/sktkmesaj-sil/${silinecekId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Kayıt sistemden başarıyla kaldırıldı.", { icon: '🔥' });
                setMesajlar(mesajlar.filter(m => m.id !== silinecekId));
            } else {
                toast.error("Silme başarısız: " + result.message);
            }
        } catch (error) {
            toast.error("Silme işlemi sırasında sistemsel bir hata oluştu.");
        } finally {
            setModalAcik(false);
            setSilinecekId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100 font-sans">
            <OnayModali
                acikMi={modalAcik}
                kapat={() => setModalAcik(false)}
                onayla={handleGercekSilme}
                baslik="Kaydı Siliyorsunuz"
                mesaj="Bu bildiriyi sistemden ebediyen silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />

            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter">
                    BİLDİRİ YÖNETİM <span className="text-cyan-600 not-italic font-light">PANELİ</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Eski bildiri kayıtları</p>
            </div>

            {mesajlar.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-medium text-lg italic">
                    Sistemde henüz yayınlanmış bir bildiri bulunmamaktadır.
                </div>
            ) : (
                <div className="space-y-6">
                    {mesajlar.map((mesaj) => (
                        <div key={mesaj.id} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 p-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all text-left">

                            <div className="flex-1 w-full overflow-hidden">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {mesaj.mesaj_turu || "Duyuru"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider">
                                        {new Date(mesaj.atistarihi).toLocaleDateString('tr-TR')}
                                    </span>
                                    {/* Kategori etiketi buradan tasfiye edildi */}
                                </div>

                                <h4 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">{mesaj.baslik}</h4>

                                <div className="bg-slate-50 p-4 rounded-xl max-h-32 overflow-y-auto custom-scrollbar border border-slate-100">
                                    <div className="text-sm text-slate-600 prose prose-sm max-w-none font-serif" dangerouslySetInnerHTML={{ __html: mesaj.aciklama }} />
                                </div>
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="flex lg:flex-col gap-3 shrink-0 pt-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 mt-4 lg:mt-0">
                                <button
                                    onClick={() => handleDuzenle(mesaj)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Düzenle
                                </button>

                                <button
                                    onClick={() => handleSilTiklama(mesaj.id)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
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