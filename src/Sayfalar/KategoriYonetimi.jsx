import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function KategoriYonetimi() {
    const [kategoriler, setKategoriler] = useState([]);
    const [yeniKategori, setYeniKategori] = useState("");
    const [duzenlenenId, setDuzenlenenId] = useState(null);

    useEffect(() => {
        fetchKategoriler();
    }, []);

    const fetchKategoriler = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/kategori");
            const data = await res.json();
            setKategoriler(data);
        } catch (error) {
            toast.error("Kategoriler getirilemedi.");
        }
    };

    const handleKaydet = async (e) => {
        e.preventDefault();
        if (!yeniKategori.trim()) return toast.error("Kategori adı boş olamaz.");

        const isUpdate = duzenlenenId !== null;
        const url = isUpdate
            ? `http://localhost:5000/api/kategori-duzenle/${duzenlenenId}`
            : "http://localhost:5000/api/kategori-ekle";

        const tId = toast.loading(isUpdate ? "Güncelleniyor..." : "Kaydediliyor...");

        try {
            const res = await fetch(url, {
                method: isUpdate ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ad: yeniKategori })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(isUpdate ? "Kategori güncellendi." : "Kategori eklendi.", { id: tId });
                setYeniKategori("");
                setDuzenlenenId(null);
                fetchKategoriler();
            } else {
                toast.error("İşlem başarısız.", { id: tId });
            }
        } catch (error) {
            toast.error("Sunucu hatası.", { id: tId });
        }
    };

    const handleSil = async (id) => {
        if (!confirm("Bu kategori silinecektir. Onaylıyor musunuz?")) return;

        const tId = toast.loading("Siliniyor...");
        try {
            const res = await fetch(`http://localhost:5000/api/kategori-sil/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Kategori silindi.", { id: tId });
                fetchKategoriler();
            } else {
                toast.error("Kategori kullanımda olduğu için silinemez.", { id: tId });
            }
        } catch (error) {
            toast.error("Sunucu hatası.", { id: tId });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 font-sans">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Kategori Ekle</h3>
                <form onSubmit={handleKaydet} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={yeniKategori}
                        onChange={(e) => setYeniKategori(e.target.value)}
                        placeholder="Kategori adını giriniz (Örn: Sınav Duyuruları)"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-cyan-500/20 font-bold text-slate-700"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="px-8 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95">
                            {duzenlenenId ? "Güncelle" : "Ekle"}
                        </button>
                        {duzenlenenId && (
                            <button type="button" onClick={() => { setDuzenlenenId(null); setYeniKategori(""); }} className="px-6 bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">Mevcut Kategoriler</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">ID</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Kategori Adı</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {kategoriler.map((kat) => (
                                <tr key={kat.id} className="hover:bg-cyan-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-400 text-sm">#{kat.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{kat.ad}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setDuzenlenenId(kat.id); setYeniKategori(kat.ad); }}
                                            className="text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleSil(kat.id)}
                                            className="text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {kategoriler.length === 0 && (
                        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            Kayıtlı kategori bulunamadı.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}