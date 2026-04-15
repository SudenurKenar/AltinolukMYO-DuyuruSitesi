import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function OdevGonder() {
    const [form, setForm] = useState({
        no: '',
        isim: '',
        soyisim: '',
        ders: '',
        aciklama: ''
    });
    const [dosya, setDosya] = useState(null);

    // HARF KONTROLÜ
    const handleHarfChange = (e, alan, etiket) => {
        const value = e.target.value;
        const gecersizKarakter = /[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g;

        if (gecersizKarakter.test(value)) {
            toast.error(`${etiket} alanına sadece harf girebilirsiniz Hanımım!`, { id: 'karakter-hatasi' });
            return;
        }
        setForm({ ...form, [alan]: value });
    };

    // NO KONTROLÜ
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

    // DOSYA SEÇİMİ
    const handleFileChange = (e) => {
        const secilenDosya = e.target.files[0];
        if (!secilenDosya) return;

        if (secilenDosya.type !== "application/pdf") {
            toast.error("Sadece PDF formatında ödev kabul edilmektedir!", { id: 'dosya-tipi-hatasi' });
            e.target.value = "";
            setDosya(null);
            return;
        }
        setDosya(secilenDosya);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // MUHAFIZ KONTROLLERİ
        if (!form.no || form.no.length < 12) {
            return toast.error("HATA: Öğrenci numaranız 12 hane olmalıdır.", { id: 'val-no' });
        }
        if (!form.isim || !form.soyisim || !form.ders) {
            return toast.error("HATA: Lütfen tüm zorunlu alanları doldurunuz.", { id: 'val-fields' });
        }
        if (!dosya) {
            return toast.error("HATA: Ödev dosyanızı yüklemediniz!", { id: 'val-dosya' });
        }

        const formData = new FormData();
        formData.append('no', form.no);
        formData.append('isim', form.isim);
        formData.append('soyisim', form.soyisim);
        formData.append('ders', form.ders);
        formData.append('aciklama', form.aciklama);
        formData.append('odev_dosyasi', dosya); // Multer bu ismi bekliyor

        try {
            const res = await fetch('http://localhost:5000/api/odevler', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Ödeviniz başarıyla mühürlendi Hanımım.");
                setForm({ no: '', isim: '', soyisim: '', ders: '', aciklama: '' });
                setDosya(null);
            } else {
                toast.error(data.message || "Ferman reddedildi: Ödev kaydedilemedi.");
            }
        } catch (error) {
            toast.error("Saray sunucusuyla bağlantı koptu.");
        }
    };

    return (
        /* font-sans eklenerek tüm siteyle uyum sağlandı */
        <div className="max-w-2xl mx-auto py-12 px-4 font-sans text-left">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-[#1e3a5a] mb-6 text-center italic">Ödev Teslim Formu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Öğrenci Numarası</label>
                        <input
                            type="text" placeholder="12 Haneli Numaranız"
                            value={form.no}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold"
                            onChange={handleNoChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Ad</label>
                            <input
                                type="text" placeholder="Adınız"
                                value={form.isim}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold"
                                onChange={(e) => handleHarfChange(e, 'isim', 'Ad')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Soyad</label>
                            <input
                                type="text" placeholder="Soyadınız"
                                value={form.soyisim}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold"
                                onChange={(e) => handleHarfChange(e, 'soyisim', 'Soyad')}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Ders Adı</label>
                        <input
                            type="text" placeholder="Örn: Web Programlama"
                            value={form.ders}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold"
                            onChange={(e) => setForm({ ...form, ders: e.target.value })}
                        />
                    </div>

                    <div className="border-2 border-dashed border-cyan-100 p-4 rounded-xl bg-cyan-50/20 text-center">
                        <label className="cursor-pointer">
                            <span className="text-cyan-700 font-bold block mb-2 text-xs">
                                {dosya ? `Seçilen: ${dosya.name}` : "Dosya Seçin (Sadece PDF)"}
                            </span>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                            <div className="inline-block px-4 py-1.5 bg-white border border-cyan-200 rounded-lg text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:bg-cyan-50 transition-all">PDF Dosyası Seç</div>
                        </label>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Açıklama (Opsiyonel)</label>
                        <textarea
                            placeholder="Eklemek istediğiniz notlar..."
                            value={form.aciklama}
                            rows="3"
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-cyan-500/20 text-sm"
                            onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 active:scale-95 transition-all shadow-md mt-2 uppercase tracking-widest text-xs">
                        Ödevi Gönder
                    </button>
                </form>
            </div>
        </div>
    );
}