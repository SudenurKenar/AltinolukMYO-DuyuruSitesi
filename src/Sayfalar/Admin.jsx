import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Admin() {
    const location = useLocation();
    const navigate = useNavigate();

    const [baslik, setBaslik] = useState("");
    const [aciklama, setAciklama] = useState("");
    const [mesajTuruId, setMesajTuruId] = useState("");

    const [duzenlemeModu, setDuzenlemeModu] = useState(false);
    const [duzenlenecekId, setDuzenlenecekId] = useState(null);
    const [mesajTurleri, setMesajTurleri] = useState([]);

    useEffect(() => {
        const fetchVeriler = async () => {
            try {
                const res = await fetch("https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkmesajturu");
                setMesajTurleri(await res.json());
            } catch (error) {
                toast.error("Sistem verileri yüklenirken bir sorun oluştu.");
            }
        };
        fetchVeriler();

        if (location.state && location.state.düzenlenecekMesaj) {
            const m = location.state.düzenlenecekMesaj;
            setBaslik(m.baslik || "");
            setAciklama(m.aciklama || "");
            setMesajTuruId(m.mesajturu_id);
            setDuzenlemeModu(true);
            setDuzenlenecekId(m.id);
            toast("Kayıt resmi düzenleme için hazırlandı.", { icon: '📝' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    const handleMesajIslemi = async (e) => {
        e.preventDefault();


        if (!baslik.trim()) return toast.error("Lütfen bildiri başlığını yazınız.");
        if (!mesajTuruId) return toast.error("Lütfen bildiri statüsünü seçiniz.");


        const editörMetni = aciklama.replace(/<[^>]*>/g, '').trim();
        if (!editörMetni) return toast.error("Lütfen bildiri içeriğini (mesajı) yazınız.");

        const url = duzenlemeModu
            ? `https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkmesaj-duzenle/${duzenlenecekId}`
            : "https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkmesaj-ekle";

        const method = duzenlemeModu ? "PUT" : "POST";
        const toastId = toast.loading(duzenlemeModu ? 'Değişiklikler işleniyor...' : 'Bildiri yayınlanıyor...');

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baslik: baslik.trim(),
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
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-cyan-100/50 p-6 md:p-8 border border-cyan-50 font-sans px-4 md:px-8">
            <form onSubmit={handleMesajIslemi} className="space-y-6 text-left">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter">
                        BİLDİRİ YÖNETİM <span className="text-cyan-600 not-italic font-light">PANELİ</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                        Bildiri Yazma ve Düzenleme paneli
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Başlığı</label>
                    <input
                        type="text"
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        placeholder="Örn: Sınav Takvimi Hakkında"
                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri Statüsü</label>
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bildiri İçeriği (Bildirinin detay sayfasında nasıl gözüküceğini görmek için sol paneli kapatınız)</label>
                    <div className="bg-white rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all overflow-hidden">
                        <style>
                            {`
                                .ql-editor {
                                    min-height: 400px;
                                    font-family: 'serif';
                                    font-size: 14.5px;
                                    line-height: 1.7;
                                    padding: 40px 60px !important;
                                    text-align: left;
                                    hyphens: none !important;
                                    -webkit-hyphens: none !important;
                                    overflow-wrap: break-word;
                                }
                                .ql-container {
                                    border-bottom-left-radius: 1rem;
                                    border-bottom-right-radius: 1rem;
                                    background: white;
                                }
                                .ql-toolbar {
                                    background: #f8fafc;
                                    border-top-left-radius: 1rem;
                                    border-top-right-radius: 1rem;
                                    border-color: #e2e8f0 !important;
                                }
                            `}
                        </style>
                        <ReactQuill
                            theme="snow"
                            value={aciklama}
                            onChange={setAciklama}
                            modules={editorModulleri}
                            className="border-none"
                        />
                    </div>
                </div>

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