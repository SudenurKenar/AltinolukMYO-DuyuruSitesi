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
        donem_id: '',
        konu_id: '',
        aciklama: ''
    });
    const [dosya, setDosya] = useState(null);
    const [modalAcik, setModalAcik] = useState(false);
    const [yuklemeYuzdesi, setYuklemeYuzdesi] = useState(0);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [dosyaHazirlaniyor, setDosyaHazirlaniyor] = useState(false);

    // Veritabanından gelecek ana listeler
    const [dersListesi, setDersListesi] = useState([]);
    const [donemListesi, setDonemListesi] = useState([]);
    const [tumKonular, setTumKonular] = useState([]); // İsmi daha net olması için değiştirildi
    const [filtreliKonular, setFiltreliKonular] = useState([]); // Hocanın istediği dinamik liste

    const [surukleniyor, setSurukleniyor] = useState(false);

    useEffect(() => {
        const verileriGetir = async () => {
            try {
                const [dersRes, donemRes, konuRes] = await Promise.all([
                    axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler'),
                    axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonemler'),
                    axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular')
                ]);

                setDersListesi(dersRes.data.filter(d => d.durum === true || d.durum === 1));
                setDonemListesi(donemRes.data.filter(d => d.durum === 'aktif'));
                setTumKonular(konuRes.data.filter(k => k.durum === 'aktif'));
            } catch (error) {
                toast.error("Form seçenekleri yüklenirken bir aksilik çıktı!");
            }
        };
        verileriGetir();
    }, []);

    // HOCANIN İSTEĞİ: Ders veya Dönem değiştiğinde Konu listesini süzüyoruz
    useEffect(() => {
        if (form.ders && form.donem_id) {
            const elenenler = tumKonular.filter(konu =>
                String(konu.ders_adi || konu.ders) === String(form.ders) &&
                String(konu.donem_id) === String(form.donem_id)
            );
            setFiltreliKonular(elenenler);
        } else {
            setFiltreliKonular([]);
        }
    }, [form.ders, form.donem_id, tumKonular]);

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

    const dosyaIsle = (secilenDosya) => {
        if (!secilenDosya) return;
        const dosyaAdi = secilenDosya.name.toLowerCase();
        const gecerliUzantilar = [".pdf", ".zip", ".rar"];
        const uzantiKontrol = gecerliUzantilar.some(u => dosyaAdi.endsWith(u));

        if (!uzantiKontrol) {
            toast.error("Yalnızca PDF, ZIP veya RAR formatında ödev kabul edilmektedir!");
            setDosya(null);
            return;
        }

        if (secilenDosya.size > 200 * 1024 * 1024) {
            toast.error("Dosya boyutu 200MB sınırını aşamaz!");
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
        e.target.value = "";
    };

    const handleDragOver = (e) => { e.preventDefault(); if (!yukleniyor && !dosyaHazirlaniyor) setSurukleniyor(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setSurukleniyor(false); };
    const handleDrop = (e) => { e.preventDefault(); setSurukleniyor(false); if (!yukleniyor && !dosyaHazirlaniyor) dosyaIsle(e.dataTransfer.files[0]); };

    const odeviGonder = async () => {
        const formData = new FormData();
        formData.append('no', form.no);
        formData.append('isim', form.isim);
        formData.append('soyisim', form.soyisim);
        formData.append('ders', form.ders);
        formData.append('donem_id', form.donem_id);
        formData.append('konu_id', form.konu_id);
        formData.append('aciklama', form.aciklama);

        if (dosya) formData.append('odev_dosyasi', dosya);

        // 🔥 MÜHÜR: Tanımsız değişken hataları form.donem_id ve form.konu_id ile düzeltildi!
        const secilenDonemNesnesi = donemListesi.find(d => String(d.id) === String(form.donem_id));
        const secilenKonuNesnesi = tumKonular.find(k => String(k.id) === String(form.konu_id));

        // Bulunan orijinal isimleri veritabanına kazınması için pakete ekliyoruz
        if (secilenDonemNesnesi) formData.append('donem_adi', secilenDonemNesnesi.donem_adi);
        if (secilenKonuNesnesi) formData.append('konu_adi', secilenKonuNesnesi.konu_adi);

        setYukleniyor(true);
        const toastId = toast.loading("Ödeviniz teslim ediliyor...");

        try {
            const res = await axios.post('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkodevler', formData);
            if (res.data.success) {
                toast.success("Ödev başarıyla gönderildi.", { id: toastId });
                setForm({ no: '', isim: '', soyisim: '', ders: '', donem_id: '', konu_id: '', aciklama: '' });
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
        if (!form.isim || !form.soyisim || !form.ders || !form.donem_id || !form.konu_id) {
            return toast.error("Lütfen tüm zorunlu (*) alanları doldurunuz.");
        }

        if (!dosya && (!form.aciklama || form.aciklama.trim() === "")) {
            return toast.error("Ödev boş gönderilemez! Lütfen ya bir dosya ekleyin ya da bir açıklama yazın.");
        }

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

                <h2 className="text-xl md:text-2xl font-black text-[#1e3a5a] mb-6 text-center italic border-b-2 border-cyan-500 pb-4 tracking-tight uppercase">
                    Ödev Teslim Formu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Öğrenci Numarası <span className="text-red-500">*</span></label>
                        <input type="text" value={form.no} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all" placeholder="12 Haneli Numaranız" onChange={handleNoChange} disabled={yukleniyor || dosyaHazirlaniyor} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Ad <span className="text-red-500">*</span></label>
                            <input type="text" value={form.isim} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold transition-all" onChange={(e) => handleHarfChange(e, 'isim', 'Ad')} disabled={yukleniyor || dosyaHazirlaniyor} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Soyad <span className="text-red-500">*</span></label>
                            <input type="text" value={form.soyisim} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold transition-all" onChange={(e) => handleHarfChange(e, 'soyisim', 'Soyad')} disabled={yukleniyor || dosyaHazirlaniyor} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">İlgili Ders <span className="text-red-500">*</span></label>
                        <select value={form.ders} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all appearance-none cursor-pointer"
                            onChange={(e) => setForm({ ...form, ders: e.target.value, konu_id: '' })} disabled={yukleniyor || dosyaHazirlaniyor}>
                            <option value="">Lütfen ders seçiniz...</option>
                            {dersListesi.map((d) => <option key={d.id} value={d.ders}>{d.ders}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Dönem <span className="text-red-500">*</span></label>
                            <select value={form.donem_id} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all appearance-none cursor-pointer"
                                onChange={(e) => setForm({ ...form, donem_id: e.target.value, konu_id: '' })} disabled={yukleniyor || dosyaHazirlaniyor}>
                                <option value="">Dönem seçiniz...</option>
                                {donemListesi.map((dn) => <option key={dn.id} value={dn.id}>{dn.donem_adi.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Ödev Konusu <span className="text-red-500">*</span></label>
                            <select value={form.konu_id} className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold transition-all appearance-none cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed"
                                onChange={(e) => setForm({ ...form, konu_id: e.target.value })}
                                disabled={yukleniyor || dosyaHazirlaniyor || !form.ders || !form.donem_id}>
                                <option value="">
                                    {!form.ders || !form.donem_id ? "Önce Ders ve Dönem Seçiniz..." : "Konu seçiniz..."}
                                </option>
                                {filtreliKonular.map((kn) => <option key={kn.id} value={kn.id}>{kn.konu_adi}</option>)}
                            </select>
                        </div>
                    </div>

                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={`border-2 border-dashed p-10 rounded-2xl text-center transition-all duration-300 relative
                            ${surukleniyor ? 'border-cyan-500 bg-cyan-100 scale-[1.02] shadow-inner' :
                                dosya ? 'border-cyan-500 bg-cyan-50/30' : 'border-cyan-100 bg-cyan-50/20'}`}
                    >
                        {dosya && !yukleniyor && !dosyaHazirlaniyor && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); setDosya(null); setYuklemeYuzdesi(0); }}
                                className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors z-20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <label className="cursor-pointer group relative z-10 flex flex-col items-center justify-center">
                            <span className="text-cyan-700 font-bold block mb-3 text-xs md:text-sm transition-all uppercase tracking-tight">
                                {dosya ? `Sistem Arşivine Hazır: ${dosya.name}` : surukleniyor ? "Belgeyi Buraya Bırakın..." : "Ödev Dosyanızı Buraya Sürükleyin veya Seçin (PDF, ZIP, RAR / Maks 200MB)"}
                            </span>
                            {(dosyaHazirlaniyor || yukleniyor) && (
                                <div className="text-5xl font-black text-cyan-600 animate-pulse mb-3">%{yuklemeYuzdesi}</div>
                            )}
                            <input type="file" className="hidden" accept=".pdf,.zip,.rar" onChange={handleFileChange} disabled={yukleniyor || dosyaHazirlaniyor} />
                            {!yukleniyor && !dosyaHazirlaniyor && !surukleniyor && !dosya && (
                                <div className="inline-block px-8 py-2.5 bg-white border border-cyan-200 rounded-xl text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-sm">Dosya Seç</div>
                            )}
                        </label>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Öğrenci Notu / Açıklama</label>
                        <textarea value={form.aciklama} rows="3" className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none text-sm transition-all focus:ring-2 focus:ring-cyan-500/10" placeholder="Dosya eklemeyecekseniz buraya açıklama yazmanız mecburidir..." onChange={(e) => setForm({ ...form, aciklama: e.target.value })} disabled={yukleniyor || dosyaHazirlaniyor} />
                    </div>

                    <button type="submit" disabled={yukleniyor || dosyaHazirlaniyor}
                        className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg mt-4 uppercase tracking-[0.2em] text-xs
                        ${(yukleniyor || dosyaHazirlaniyor) ? 'bg-slate-300 cursor-not-allowed shadow-none text-slate-500' : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95 shadow-cyan-100'}`}>
                        {dosyaHazirlaniyor ? "Dosya İnceleniyor..." : yukleniyor ? "Teslim Ediliyor..." : "Ödevi Sisteme Gönder"}
                    </button>
                </form>
            </div>

            <OnayModali acikMi={modalAcik} kapat={() => setModalAcik(false)} onayla={odeviGonder}
                baslik="Dosya Eki Eksik" mesaj="Belge yüklemeden sadece açıklama notu ile devam ediyorsunuz. Onaylıyor musunuz?"
                onayMetni="Evet, Gönder" iptalMetni="Dosya Seç" />
        </div>
    );
}