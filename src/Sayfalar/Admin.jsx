import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Admin() {
    const location = useLocation();
    const navigate = useNavigate();

    // Form State'leri - Orijinal yapı korunmuştur
    const [baslik, setBaslik] = useState("");
    const [aciklama, setAciklama] = useState("");
    const [mesajTuruId, setMesajTuruId] = useState("");

    const [duzenlemeModu, setDuzenlemeModu] = useState(false);
    const [duzenlenecekId, setDuzenlenecekId] = useState(null);
    const [mesajTurleri, setMesajTurleri] = useState([]);

    useEffect(() => {
        const fetchVeriler = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/mesajturu");
                setMesajTurleri(await res.json());
            } catch (error) {
                toast.error("Sistem verileri yüklenirken bir sorun oluştu.");
            }
        };
        fetchVeriler();

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
        /* px-4 md:px-0: Mobilde kenarlara yapışmasın diye hafif boşluk eklendi */
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-cyan-100/50 p-6 md:p-8 border border-cyan-50 font-sans px-4 md:px-8">

            <form onSubmit={handleMesajIslemi} className="space-y-6 text-left">

                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter">
                        BİLDİRİ YÖNETİM <span className="text-cyan-600 not-italic font-light">PANELİ</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Bildiri yazma paneli</p>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Statüsü</label>
                    {/* gap-3 md:gap-6: Mobilde statüler birbirine çok girmesin diye daraltıldı */}
                    <div className="flex flex-wrap gap-3 md:gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
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
                                <span className={`font-bold text-xs md:text-sm transition-colors ${String(mesajTuruId) === String(tur.id) ? "text-cyan-700" : "text-slate-500"}`}>
                                    {tur.tur}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri İçeriği</label>
                    <div className="bg-white rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all overflow-hidden">
                        {/* h-48 sm:h-80: Mobilde klavye açıldığında ekranı kapatmasın diye yükseklik ayarlandı */}
                        <ReactQuill theme="snow" value={aciklama} onChange={setAciklama} modules={editorModulleri} className="h-48 sm:h-80 md:h-96 pb-12 border-none" />
                    </div>
                </div>

                {/* flex-col md:flex-row: Mobilde butonlar alt alta gelerek daha kolay tıklanır hale getirildi */}
                <div className="pt-4 flex flex-col md:flex-row gap-4">
                    <button type="submit" className="font-bold flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl shadow-lg shadow-cyan-200 active:scale-95 text-base md:text-lg transition-all uppercase tracking-widest">
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