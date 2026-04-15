import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Admin() {
    const location = useLocation();
    const navigate = useNavigate();

    // Form State'leri - Kategori Id kaldırıldı
    const [baslik, setBaslik] = useState("");
    const [aciklama, setAciklama] = useState("");
    const [mesajTuruId, setMesajTuruId] = useState("");

    // Düzenleme Modu Kontrolcüleri
    const [duzenlemeModu, setDuzenlemeModu] = useState(false);
    const [duzenlenecekId, setDuzenlenecekId] = useState(null);

    const [mesajTurleri, setMesajTurleri] = useState([]);

    useEffect(() => {
        const fetchVeriler = async () => {
            try {
                // Sadece mesaj türlerini çekiyoruz, kategori fetch işlemi imha edildi
                const res = await fetch("http://localhost:5000/api/mesajturu");
                setMesajTurleri(await res.json());
            } catch (error) {
                toast.error("Sistem verileri yüklenirken bir sorun oluştu.");
            }
        };
        fetchVeriler();

        // ARŞİVDEN GELEN VERİ KONTROLÜ
        if (location.state && location.state.düzenlenecekMesaj) {
            const m = location.state.düzenlenecekMesaj;
            setBaslik(m.baslik);
            setAciklama(m.aciklama);
            setMesajTuruId(m.mesajturu_id);
            setDuzenlemeModu(true);
            setDuzenlenecekId(m.id);

            toast("Kayıt resmi düzenleme için hazırlandı.", { icon: '📝' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    const handleMesajIslemi = async (e) => {
        e.preventDefault();
        // Kategori kontrolü kaldırıldı, sadece statü kontrolü kaldı
        if (!mesajTuruId) return toast.error("Lütfen bildiri statüsünü seçiniz.");

        const url = duzenlemeModu
            ? `http://localhost:5000/api/mesaj-duzenle/${duzenlenecekId}`
            : "http://localhost:5000/api/mesaj-ekle";

        const method = duzenlemeModu ? "PUT" : "POST";
        const toastId = toast.loading(duzenlemeModu ? 'Değişiklikler işleniyor...' : 'Bildiri yayınlanıyor...');

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baslik,
                    aciklama,
                    mesajturu_id: mesajTuruId
                    // kategori_id gönderimi durduruldu
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(duzenlemeModu ? "Kayıt başarıyla güncellendi!" : "Bildiri başarıyla yayınlandı!", { id: toastId });

                setBaslik(""); setAciklama(""); setMesajTuruId("");
                setDuzenlemeModu(false); setDuzenlenecekId(null);

                if (duzenlemeModu) navigate('/admin/arsiv');
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
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-cyan-100/50 p-8 border border-cyan-50 font-sans">
            <h3 className="text-2xl font-bold text-slate-700 mb-8 tracking-tight">
                {duzenlemeModu ? "Bildiri Düzenleme Kürsüsü" : "Yeni Bildiri Ekle"}
            </h3>
            <form onSubmit={handleMesajIslemi} className="space-y-6 text-left">

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Başlığı</label>
                    <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)} className="font-bold w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm text-slate-700 transition-all" required />
                </div>

                {/* Kategori sütunu kaldırıldı, Statü tam genişliğe yayıldı */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Statüsü</label>
                    <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
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
                                <span className={`font-bold text-sm transition-colors ${String(mesajTuruId) === String(tur.id) ? "text-cyan-700" : "text-slate-500"}`}>
                                    {tur.tur}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri İçeriği</label>
                    <div className="bg-white rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                        <ReactQuill theme="snow" value={aciklama} onChange={setAciklama} modules={editorModulleri} className="h-64 sm:h-80 md:h-96 pb-12 rounded-b-2xl border-none" />
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <button type="submit" className="font-bold flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl shadow-lg shadow-cyan-200 active:scale-95 text-lg transition-all uppercase tracking-widest">
                        {duzenlemeModu ? "Değişiklikleri Kaydet" : "Bildiriyi Yayınla"}
                    </button>
                    {duzenlemeModu && (
                        <button
                            type="button"
                            onClick={() => { navigate('/admin/arsiv'); }}
                            className="font-bold px-8 bg-slate-100 text-slate-500 py-4 rounded-2xl transition-all hover:bg-slate-200"
                        >
                            Vazgeç
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}