// src/Sayfalar/Arsiv.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// YENİ: Modal bileşenini içe aktar
import OnayModali from '../Components/OnayModali';

export default function Arsiv() {
    const [mesajlar, setMesajlar] = useState([]);
    const navigate = useNavigate();

    // YENİ: Modalın durumunu tutan state'ler
    const [modalAcik, setModalAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

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

    const handleDuzenle = (mesaj) => {
        navigate('/admin', { state: { düzenlenecekMesaj: mesaj } });
        toast.success("Seçili kayıt düzenleme moduna aktarıldı.");
    };

    // --- SİLME FERMANI (GÜNCELLENDİ) ---
    // Butona tıklandığında direkt silmez, modalı açar
    const handleSilTiklama = (id) => {
        setSilinecekId(id); // Silinecek ID'yi hafızaya al
        setModalAcik(true);  // Modalı aç
    };

    // Modalda "Evet, Sil"e basınca çalışacak asıl fonksiyon
    const handleGercekSilme = async () => {
        if (!silinecekId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/mesaj-sil/${silinecekId}`, {
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
            // İşlem bitince modalı kapat ve ID'yi temizle
            setModalAcik(false);
            setSilinecekId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100">
            {/* YENİ: Modal Bileşeni Buraya Eklenir */}
            <OnayModali
                acikMi={modalAcik}
                kapat={() => setModalAcik(false)}
                onayla={handleGercekSilme}
                baslik="Kaydı Siliyorsunuz"
                mesaj="Bu bildiriyi sistemden ebediyen silmek istediğinize emin misiniz Kraliçem? Bu işlem geri alınamaz."
            />

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
                            {/* ... (Mesaj içeriği kısımları aynı kalıyor) ... */}
                            <div className="flex-1 w-full overflow-hidden">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider rounded-lg">{mesaj.mesaj_turu || "Belirtilmemiş"}</span>
                                    <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-lg">{new Date(mesaj.atistarihi).toLocaleDateString('tr-TR')}</span>
                                    <span className="px-3 py-1 bg-slate-50 text-cyan-600 text-[10px] font-black uppercase rounded-lg border border-cyan-50">{mesaj.kategori_adi || "Genel"}</span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{mesaj.baslik}</h4>
                                <div className="bg-slate-50 p-4 rounded-xl max-h-32 overflow-y-auto custom-scrollbar border border-slate-100">
                                    <div className="text-sm text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: mesaj.aciklama }} />
                                </div>
                            </div>

                            {/* Aksiyon Butonları */}
                            <div className="flex lg:flex-col gap-3 shrink-0 pt-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 mt-4 lg:mt-0">
                                <button
                                    onClick={() => handleDuzenle(mesaj)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-colors"
                                >
                                    Düzenle
                                </button>

                                <button
                                    // DEĞİŞTİ: handleSil yerine handleSilTiklama
                                    onClick={() => handleSilTiklama(mesaj.id)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors"
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