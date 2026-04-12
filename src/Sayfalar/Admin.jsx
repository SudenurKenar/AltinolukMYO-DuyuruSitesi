import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';

export default function Admin() {
    const [baslik, setBaslik] = useState("");
    const [aciklama, setAciklama] = useState("");
    const [mesajTuruId, setMesajTuruId] = useState("");
    const [kategoriId, setKategoriId] = useState("");

    const [mesajTurleri, setMesajTurleri] = useState([]);
    const [kategoriler, setKategoriler] = useState([]);

    useEffect(() => {
        const fetchVeriler = async () => {
            try {
                // Mesaj Türlerini Getir (Güncel/Sürekli)
                const turRes = await fetch("http://localhost:5000/api/mesajturu");
                setMesajTurleri(await turRes.json());

                // Kategorileri Getir (Sınav, Etkinlik vb.)
                const katRes = await fetch("http://localhost:5000/api/kategori");
                setKategoriler(await katRes.json());
            } catch (error) {
                toast.error("Veriler yüklenirken bir sorun oluştu.");
            }
        };
        fetchVeriler();
    }, []);

    const handleMesajEkle = async (e) => {
        e.preventDefault();
        if (!mesajTuruId || !kategoriId) return toast.error("Lütfen statü ve kategori seçiniz.");

        const toastId = toast.loading('Bildiri yayınlanıyor...');
        try {
            const response = await fetch("http://localhost:5000/api/mesaj-ekle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baslik,
                    aciklama,
                    mesajturu_id: mesajTuruId,
                    kategori_id: kategoriId // Veritabanında bu sütun olmalı
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Bildiri başarıyla yayınlandı!", { id: toastId });
                setBaslik(""); setAciklama(""); setMesajTuruId(""); setKategoriId("");
            } else {
                toast.error("İşlem başarısız!", { id: toastId });
            }
        } catch (error) {
            toast.error("Sunucuya ulaşılamıyor.", { id: toastId });
        }
    };

    const editorModulleri = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link'], ['clean']
        ],
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-cyan-100/50 p-8 border border-cyan-50">
            <h3 className="text-2xl font-bold text-slate-700 mb-8">Yeni Bildiri Ekle</h3>
            <form onSubmit={handleMesajEkle} className="space-y-6">

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Başlığı</label>
                    <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)} className="font-sans font-bold w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-700 transition-all" required />
                </div>

                {/* Statü ve Kategori Yan Yana Hizalandı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">

                    {/* SOL: Mesaj Statüsü (Radio Buttons) */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Statüsü</label>
                        <div className="flex gap-6 ml-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            {mesajTurleri.map((tur) => (
                                <label key={tur.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="mesajTuru"
                                            value={tur.id}
                                            checked={String(mesajTuruId) === String(tur.id)}
                                            onChange={(e) => setMesajTuruId(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded-full transition-all ${String(mesajTuruId) === String(tur.id) ? "border-cyan-600 bg-cyan-600" : "border-slate-300 bg-white"}`}>
                                            {String(mesajTuruId) === String(tur.id) && (
                                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`font-sans font-bold text-sm transition-colors ${String(mesajTuruId) === String(tur.id) ? "text-cyan-700" : "text-slate-500"}`}>
                                        {tur.tur}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* SAĞ: Kategori Seçimi (Select Box) */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Kategori</label>
                        <select
                            value={kategoriId}
                            onChange={(e) => setKategoriId(e.target.value)}
                            className="font-sans font-bold w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-700 appearance-none transition-all"
                            required
                        >
                            <option value="" disabled>Kategori seçiniz...</option>
                            {kategoriler.map((kat) => (
                                <option key={kat.id} value={kat.id}>{kat.ad}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri İçeriği</label>
                    <div className="bg-white rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                        <ReactQuill theme="snow" value={aciklama} onChange={setAciklama} modules={editorModulleri} className="h-64 sm:h-80 md:h-96 pb-12 rounded-b-2xl border-none" />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="font-sans font-bold w-full md:w-auto px-10 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl shadow-lg shadow-cyan-200 active:scale-95 text-lg transition-all">
                        Bildiriyi Yayınla
                    </button>
                </div>
            </form>
        </div>
    );
}