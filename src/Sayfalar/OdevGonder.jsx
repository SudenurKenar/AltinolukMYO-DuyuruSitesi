import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import OnayModali from '../Components/OnayModali';

export default function OdevGonder() {
    const [form, setForm] = useState({
        no: '',
        isim: '',
        soyisim: '',
        ders: '',
        aciklama: ''
    });
    const [dosya, setDosya] = useState(null);
    const [modalAcik, setModalAcik] = useState(false);
    const [yuklemeYuzdesi, setYuklemeYuzdesi] = useState(0);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [dosyaHazirlaniyor, setDosyaHazirlaniyor] = useState(false);
    const [dersListesi, setDersListesi] = useState([]);

    // YENİ: Sürükle-bırak animasyonu için kontrol durumu
    const [surukleniyor, setSurukleniyor] = useState(false);

    useEffect(() => {
        const dersleriGetir = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/sktkdersler');
                const aktifDersler = res.data.filter(d => d.durum === true || d.durum === 1);
                setDersListesi(aktifDersler);
            } catch (error) {
                toast.error("Ders listesi yüklenirken bir aksilik çıktı!");
            }
        };
        dersleriGetir();
    }, []);

    const handleHarfChange = (e, alan, etiket) => {
        const value = e.target.value;
        const gecersizKarakter = /[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g;

        if (gecersizKarakter.test(value)) {
            toast.error(`${etiket} alanına sadece harf girebilirsiniz!`, { id: 'karakter-hatasi' });
            return;
        }
        setForm({ ...form, [alan]: value });
    };

    const handleNoChange = (e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) {
            toast.error("Öğrenci numarası sadece rakamlardan oluşabilir!", { id: 'no-rakam-hatasi' });
            return;
        }
        if (value.length > 12) {
            toast.error("Numara 12 haneyi geçemez!", { id: 'no-limit-hatasi' });
            return;
        }
        setForm({ ...form, no: value });
    };

    // YENİ: Hem sürükle-bırak hem de normal seçim için ortak dosya denetim protokolü
    const dosyaIsle = (secilenDosya) => {
        if (!secilenDosya) return;

        const dosyaAdi = secilenDosya.name.toLowerCase();
        const gecerliUzantilar = [".pdf", ".zip", ".rar"];
        const uzantiKontrol = gecerliUzantilar.some(u => dosyaAdi.endsWith(u));

        if (!uzantiKontrol) {
            toast.error("Yalnızca PDF, ZIP veya RAR formatında ödev kabul edilmektedir!", { id: 'dosya-tipi-hatasi' });
            setDosya(null);
            return;
        }

        if (secilenDosya.size > 200 * 1024 * 1024) {
            toast.error("Dosya boyutu 200MB sınırını aşamaz!", { id: 'boyut-hatasi' });
            setDosya(null);
            return;
        }

        setDosya(secilenDosya);
        setDosyaHazirlaniyor(true);
        setYuklemeYuzdesi(0);

        let interval = setInterval(() => {
            setYuklemeYuzdesi((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setDosyaHazirlaniyor(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const handleFileChange = (e) => {
        dosyaIsle(e.target.files[0]);
        e.target.value = ""; // Aynı dosyayı tekrar seçebilmek için input'u temizler
    };

    // --- SÜRÜKLE BIRAK (DRAG & DROP) OLAYLARI ---
    const handleDragOver = (e) => {
        e.preventDefault(); // Tarayıcının dosyayı yeni sekmede açmasını engeller
        if (!yukleniyor && !dosyaHazirlaniyor) {
            setSurukleniyor(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setSurukleniyor(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setSurukleniyor(false);
        if (!yukleniyor && !dosyaHazirlaniyor) {
            const droppedFile = e.dataTransfer.files[0];
            dosyaIsle(droppedFile);
        }
    };
    // --------------------------------------------

    const odeviGonder = async () => {
        const formData = new FormData();
        formData.append('no', form.no);
        formData.append('isim', form.isim);
        formData.append('soyisim', form.soyisim);
        formData.append('ders', form.ders);
        formData.append('aciklama', form.aciklama);

        if (dosya) {
            formData.append('odev_dosyasi', dosya);
        }

        setYukleniyor(true);
        const toastId = toast.loading("Ödeviniz saraya teslim ediliyor...");

        try {
            const res = await axios.post('http://localhost:5000/api/sktkodevler', formData);

            if (res.data.success) {
                toast.success("Ödev başarıyla mühürlendi.", { id: toastId });
                setForm({ no: '', isim: '', soyisim: '', ders: '', aciklama: '' });
                setDosya(null);
                setYuklemeYuzdesi(0);
                setModalAcik(false);
            }
        } catch (error) {
            toast.error("Sunucu bağlantısı koptu.", { id: toastId });
        } finally {
            setYukleniyor(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.no || form.no.length < 12) return toast.error("Numara 12 hane olmalıdır.");
        if (!form.isim || !form.soyisim || !form.ders) return toast.error("Zorunlu alanları doldurunuz.");

        if (!dosya) {
            setModalAcik(true);
        } else {
            odeviGonder();
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6 md:py-12 px-4 font-sans text-left">
            <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">

                {(dosyaHazirlaniyor || yukleniyor) && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                        <div className="h-full bg-cyan-500 transition-all duration-300 ease-out"
                            style={{ width: `${yuklemeYuzdesi}%` }} />
                    </div>
                )}

                <h2 className="text-xl md:text-2xl font-black text-[#1e3a5a] mb-6 text-center italic border-b-2 border-cyan-500 pb-4 tracking-tight">
                    Ödev Teslim Formu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* Öğrenci No */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
                            Öğrenci Numarası <span className="text-red-500 text-xs ml-0.5">*</span>
                        </label>
                        <input type="text" value={form.no} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all" onChange={handleNoChange} disabled={yukleniyor || dosyaHazirlaniyor} />
                    </div>

                    {/* Ad Soyad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
                                Ad <span className="text-red-500 text-xs ml-0.5">*</span>
                            </label>
                            <input type="text" value={form.isim} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold transition-all" onChange={(e) => handleHarfChange(e, 'isim', 'Ad')} disabled={yukleniyor || dosyaHazirlaniyor} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
                                Soyad <span className="text-red-500 text-xs ml-0.5">*</span>
                            </label>
                            <input type="text" value={form.soyisim} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold transition-all" onChange={(e) => handleHarfChange(e, 'soyisim', 'Soyad')} disabled={yukleniyor || dosyaHazirlaniyor} />
                        </div>
                    </div>

                    {/* Ders Seçimi */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
                            Ders Seçiniz <span className="text-red-500 text-xs ml-0.5">*</span>
                        </label>
                        <select
                            value={form.ders}
                            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all appearance-none cursor-pointer"
                            onChange={(e) => setForm({ ...form, ders: e.target.value })}
                            disabled={yukleniyor || dosyaHazirlaniyor}
                        >
                            <option value="">Lütfen listeden bir ders seçin...</option>
                            {dersListesi.map((d) => (
                                <option key={d.id} value={d.ders}>
                                    {d.ders}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* YENİ: Sürükle Bırak Alanı */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed p-10 rounded-2xl text-center transition-all duration-300 relative
                            ${surukleniyor ? 'border-cyan-500 bg-cyan-100 scale-[1.02] shadow-inner' :
                                dosya ? 'border-cyan-500 bg-cyan-50/30' : 'border-cyan-100 bg-cyan-50/20'}`}
                    >
                        {/* Görünmez arka plan katmanı - Sürüklerken ekstra vurgu için */}
                        {surukleniyor && (
                            <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl pointer-events-none animate-pulse"></div>
                        )}

                        <label className="cursor-pointer group relative z-10 flex flex-col items-center justify-center">
                            <span className="text-cyan-700 font-bold block mb-3 text-xs md:text-sm transition-all">
                                {dosya ? `Sistemdeki Dosya: ${dosya.name}` : surukleniyor ? "Belgeyi Buraya Bırakın..." : "Sürükleyip Bırakın veya Seçin (Maks 200MB)"}
                            </span>

                            {(dosyaHazirlaniyor || yukleniyor) && (
                                <div className="text-5xl font-black text-cyan-600 animate-pulse mb-3">
                                    %{yuklemeYuzdesi}
                                </div>
                            )}

                            <input type="file" className="hidden" accept=".pdf,.zip,.rar" onChange={handleFileChange} disabled={yukleniyor || dosyaHazirlaniyor} />

                            {!yukleniyor && !dosyaHazirlaniyor && !surukleniyor && (
                                <div className="inline-block px-8 py-2.5 bg-white border border-cyan-200 rounded-xl text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-sm">
                                    Dosya Seç
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Ek Açıklamalar</label>
                        <textarea value={form.aciklama} rows="3" className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none text-sm transition-all" onChange={(e) => setForm({ ...form, aciklama: e.target.value })} disabled={yukleniyor || dosyaHazirlaniyor} />
                    </div>

                    <button type="submit"
                        disabled={yukleniyor || dosyaHazirlaniyor}
                        className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg mt-4 uppercase tracking-[0.2em] text-xs
                        ${(yukleniyor || dosyaHazirlaniyor) ? 'bg-slate-300 cursor-not-allowed shadow-none text-slate-500' : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95 shadow-cyan-100'}`}>
                        {dosyaHazirlaniyor ? "Dosya İnceleniyor..." : yukleniyor ? "Teslim Ediliyor..." : "Ödevi Teslim Et"}
                    </button>
                </form>
            </div>

            <OnayModali acikMi={modalAcik} kapat={() => setModalAcik(false)} onayla={odeviGonder}
                baslik="Eksik Dosya Onayı" mesaj="Herhangi bir dosya eki algılanamadı. İşleme devam edilsin mi?"
                onayMetni="Gönder" iptalMetni="Geri Dön" />
        </div>
    );
}