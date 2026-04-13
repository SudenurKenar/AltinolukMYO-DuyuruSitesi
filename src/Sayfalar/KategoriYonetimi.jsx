import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import OnayModali from '../Components/OnayModali';

export default function KategoriYonetimi() {
    const [kategoriler, setKategoriler] = useState([]);
    const [yeniKategori, setYeniKategori] = useState("");
    const [duzenlenenId, setDuzenlenenId] = useState(null);

    // Input alanına odaklanmak için bir referans oluşturuyoruz
    const inputRef = useRef(null);

    const [modalAcik, setModalAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        fetchKategoriler();
    }, []);

    const fetchKategoriler = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/kategori");
            const data = await res.json();
            setKategoriler(data);
        } catch (error) {
            toast.error("Sistem kayıtlarına erişilemedi.");
        }
    };

    const handleKaydet = async (e) => {
        e.preventDefault();
        if (!yeniKategori.trim()) return toast.error("Kategori ismi boş bırakılamaz.");

        const isUpdate = duzenlenenId !== null;
        const url = isUpdate
            ? `http://localhost:5000/api/kategori-duzenle/${duzenlenenId}`
            : "http://localhost:5000/api/kategori-ekle";

        try {
            const res = await fetch(url, {
                method: isUpdate ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ad: yeniKategori })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(isUpdate ? "Kayıt başarıyla güncellendi." : "Yeni kategori sisteme tanımlandı.");
                setYeniKategori("");
                setDuzenlenenId(null);
                fetchKategoriler();
            }
        } catch (error) {
            toast.error("İşlem sırasında sistemsel bir hata oluştu.");
        }
    };

    const handleDuzenleTiklama = (kat) => {
        setDuzenlenenId(kat.id);
        setYeniKategori(kat.ad);

        // Otoriter Yukarı Kaydırma ve Odaklanma Mekanizması
        setTimeout(() => {
            // Sayfayı en üste yumuşakça kaydırır
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Input kutusuna odaklan (imleci içine sok)
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 50); // 50ms gecikme React'ın formu güncellemesine zaman tanır
    };

    const handleSilTiklama = (id) => {
        setSilinecekId(id);
        setModalAcik(true);
    };

    const handleGercekSilme = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/kategori-sil/${silinecekId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Kayıt sistemden başarıyla kaldırıldı.");
                fetchKategoriler();
            } else {
                toast.error("İşlem Reddedildi: Bu kategoriye bağlı duyurular mevcut.");
            }
        } catch (error) {
            toast.error("Sunucu ile bağlantı kurulamadı.");
        } finally {
            setModalAcik(false);
            setSilinecekId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* RESMİ ONAY MODALI */}
            <OnayModali
                acikMi={modalAcik}
                kapat={() => setModalAcik(false)}
                onayla={handleGercekSilme}
                baslik="Kategori İmha Onayı"
                mesaj="Bu kategoriyi sildiğinizde sistem verileri etkilenebilir. Devam etmek istediğinizden emin misiniz?"
            />

            {/* Giriş Alanı */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-10 border border-slate-100">
                <header className="mb-8 border-l-4 border-cyan-600 pl-5">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        {duzenlenenId ? "Kategori Düzenle" : "Kategori Ekle"}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold tracking-widest mt-1">SİSTEM YÖNETİM MERKEZİ</p>
                </header>

                <form onSubmit={handleKaydet} className="flex flex-col sm:flex-row gap-4">
                    <input
                        ref={inputRef} // Referansı buraya bağladık
                        type="text"
                        value={yeniKategori}
                        onChange={(e) => setYeniKategori(e.target.value)}
                        placeholder="Kategori adı giriniz..."
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-cyan-500/50 transition-all font-bold text-slate-700"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="px-10 bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">
                            {duzenlenenId ? "Güncelle" : "Sisteme Ekle"}
                        </button>
                        {duzenlenenId && (
                            <button type="button" onClick={() => { setDuzenlenenId(null); setYeniKategori(""); }} className="px-6 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl text-xs uppercase">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste Alanı */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-6">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Mevcut Kategoriler</h4>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Toplam: {kategoriler.length}</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {kategoriler.map((kat) => (
                        <div key={kat.id} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm border-l-4 border-l-cyan-500">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-300 text-xs">
                                    #{kat.id}
                                </div>
                                <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">{kat.ad}</span>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => handleDuzenleTiklama(kat)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                                >
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleSilTiklama(kat.id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                                >
                                    Kaldır
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {kategoriler.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center">
                        <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Sistemde kayıtlı kategori bulunamadı</p>
                    </div>
                )}
            </div>
        </div>
    );
}