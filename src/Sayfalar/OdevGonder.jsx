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

    // HARF VE ÖZEL KARAKTER KONTROLÜ
    const handleHarfChange = (e, alan, etiket) => {
        const value = e.target.value;

        // Regex: Sadece harfler (Türkçe dahil) ve boşluklara izin verir. 
        // Geri kalan her şey (sayılar ve özel karakterler) yasak!
        const gecersizKarakter = /[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g;

        if (gecersizKarakter.test(value)) {
            toast.error(`${etiket} alanına sayı veya özel karakter giremezsiniz Kraliçem!`, {
                id: 'karakter-hatasi', // Uyarıların üst üste binmesini engeller
            });
            return; // State güncellenmez, giriş engellenir
        }

        setForm({ ...form, [alan]: value });
    };

    // ÖĞRENCİ NO KONTROLÜ
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dosya) return toast.error("Lütfen ödev dosyasını seçiniz.");

        const formData = new FormData();
        formData.append('no', form.no);
        formData.append('isim', form.isim);
        formData.append('soyisim', form.soyisim);
        formData.append('ders', form.ders);
        formData.append('aciklama', form.aciklama);
        formData.append('odev_dosyasi', dosya);

        try {
            const res = await fetch('http://localhost:5000/api/odevler', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Ödeviniz başarıyla mühürlendi.");
                setForm({ no: '', isim: '', soyisim: '', ders: '', aciklama: '' });
                setDosya(null);
            }
        } catch (error) {
            toast.error("Sistem bağlantısı koptu.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 font-serif text-left">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-[#1e3a5a] mb-6 text-center italic">Ödev Teslim Formu</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text" placeholder="Öğrenci Numarası" required
                        value={form.no}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20"
                        onChange={handleNoChange}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Ad" required
                            value={form.isim}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20"
                            onChange={(e) => handleHarfChange(e, 'isim', 'Ad')}
                        />
                        <input
                            type="text" placeholder="Soyad" required
                            value={form.soyisim}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/20"
                            onChange={(e) => handleHarfChange(e, 'soyisim', 'Soyad')}
                        />
                    </div>

                    <input type="text" placeholder="Ders" required value={form.ders} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" onChange={(e) => setForm({ ...form, ders: e.target.value })} />

                    <div className="border-2 border-dashed border-cyan-100 p-4 rounded-xl bg-cyan-50/20 text-center">
                        <label className="cursor-pointer">
                            <span className="text-cyan-700 font-bold block mb-2">{dosya ? `Seçilen: ${dosya.name}` : "Ödev Dosyasını Seçin"}</span>
                            <input type="file" className="hidden" onChange={(e) => setDosya(e.target.files[0])} />
                            <div className="inline-block px-4 py-1.5 bg-white border border-cyan-200 rounded-lg text-[10px] font-black text-cyan-600 uppercase tracking-widest">Dosya Seç</div>
                        </label>
                    </div>

                    <textarea placeholder="Ödev Açıklaması" value={form.aciklama} rows="3" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none" onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />

                    <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 active:scale-95 transition-all shadow-md">
                        Ödevi Gönder
                    </button>
                </form>
            </div>
        </div>
    );
}