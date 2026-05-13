import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import OnayModali from '../Components/OnayModali';

export default function AdminDonem() {
    const [donemler, setDonemler] = useState([]);
    const [yeniDonem, setYeniDonem] = useState("");
    const [yukleniyor, setYukleniyor] = useState(false);

    // Düzenleme ve Modal State'leri
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [duzenlemeMetni, setDuzenlemeMetni] = useState('');
    const [silmeModaliAcik, setSilmeModaliAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        fetchDonemler();
    }, []);

    const fetchDonemler = async () => {
        try {
            const res = await axios.get("https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonemler");
            setDonemler(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Dönemler yüklenemedi.");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formatliDonem = yeniDonem.trim().toLocaleUpperCase('tr-TR');

        if (!formatliDonem) return toast.error("Lütfen bir dönem ismi giriniz.");

        setYukleniyor(true);
        try {
            const res = await axios.post("https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonem-ekle", {
                donem_adi: formatliDonem
            });
            if (res.data.success) {
                toast.success("Dönem başarıyla kaydedildi.");
                setYeniDonem("");
                fetchDonemler();
            }
        } catch (error) {
            toast.error("Kayıt hatası.");
        } finally {
            setYukleniyor(false);
        }
    };

    const handleDurumDegistir = async (id, mevcutDurum) => {
        const yeniDurum = mevcutDurum === 'aktif' ? 'pasif' : 'aktif';
        try {
            const res = await axios.patch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonem-durum/${id}`, {
                durum: yeniDurum
            });
            if (res.status === 200) {
                toast.success(`Dönem statüsü ${yeniDurum} yapıldı.`);
                fetchDonemler();
            }
        } catch (error) {
            toast.error("Durum güncelleme hatası.");
        }
    };

    const donemGuncelle = async (id) => {
        const formatliMetin = duzenlemeMetni.trim().toLocaleUpperCase('tr-TR');
        try {
            await axios.put(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonem-guncelle/${id}`, {
                donem_adi: formatliMetin
            });
            setDuzenlemeId(null);
            fetchDonemler();
            toast.success("Dönem bilgisi güncellendi.");
        } catch (error) {
            toast.error("Güncelleme hatası.");
        }
    };

    const silmeOnayiAc = (id) => {
        setSilinecekId(id);
        setSilmeModaliAcik(true);
    };

    const handleGercekSilme = async () => {
        try {
            const res = await axios.delete(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonem-sil/${silinecekId}`);
            if (res.data.success) {
                toast.success("Dönem başarıyla kayıtlardan silindi.");
                setSilmeModaliAcik(false);
                fetchDonemler();
            }
        } catch (error) {
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-left">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                    Akademik <span className="text-cyan-600 not-italic font-light">Dönem Denetimi</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                    Resmi Akademik Takvim Ayarları
                </p>
            </div>

            {/* Yeni Dönem Giriş Alanı */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
                <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Yeni Dönem Tanımı</label>
                        <input
                            type="text"
                            value={yeniDonem}
                            onChange={(e) => setYeniDonem(e.target.value.toLocaleUpperCase('tr-TR'))}
                            placeholder="Örn: 2025-2026 GÜZ"
                            className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold transition-all uppercase"
                        />
                    </div>
                    <button type="submit" disabled={yukleniyor} className="px-12 py-4 rounded-2xl font-black bg-cyan-600 text-white hover:bg-cyan-700 transition-all uppercase text-xs shadow-lg shadow-cyan-100">
                        SİSTEME EKLE
                    </button>
                </form>
            </div>

            {/* Yönetim Listesi */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse table-fixed min-w-[700px]">
                        <thead className="bg-slate-50/50">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="w-[15%] px-8 py-6">Dönem No</th>
                                <th className="w-[45%] px-8 py-6">Dönem Adı</th>
                                <th className="w-[20%] px-8 py-6 text-center">Durum</th>
                                <th className="w-[20%] px-8 py-6 text-right">Yönetim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {donemler.map((item) => (
                                <tr key={item.id} className={`group transition-all ${item.durum === 'pasif' ? 'bg-slate-50/60 opacity-70' : 'hover:bg-cyan-50/20'}`}>
                                    <td className="px-8 py-6 font-mono text-slate-400 text-[11px]">#{item.id}</td>

                                    <td className="px-8 py-6">
                                        {duzenlemeId === item.id ? (
                                            <input
                                                value={duzenlemeMetni}
                                                onChange={(e) => setDuzenlemeMetni(e.target.value.toLocaleUpperCase('tr-TR'))}
                                                className="w-full p-2 border-b-2 border-cyan-500 outline-none font-bold bg-transparent text-slate-700 uppercase"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="max-w-[300px] overflow-x-auto custom-scrollbar-mini pb-1">
                                                <span className={`font-bold uppercase tracking-tight whitespace-nowrap ${item.durum === 'pasif' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {item.donem_adi}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => handleDurumDegistir(item.id, item.durum)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all
                                            ${item.durum === 'aktif'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                    : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-600 hover:text-white'}`}
                                        >
                                            {item.durum === 'aktif' ? '● AKTİF' : '○ PASİF'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-4">
                                        {duzenlemeId === item.id ? (
                                            <>
                                                <button onClick={() => donemGuncelle(item.id)} className="text-emerald-600 font-black text-[10px] uppercase hover:underline">KAYDET</button>
                                                <button onClick={() => setDuzenlemeId(null)} className="text-slate-400 font-black text-[10px] uppercase hover:underline">İPTAL</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setDuzenlemeId(item.id); setDuzenlemeMetni(item.donem_adi); }} className="text-cyan-600 font-black text-[10px] uppercase hover:underline">DÜZENLE</button>
                                                <button onClick={() => silmeOnayiAc(item.id)} className="text-red-400 font-black text-[10px] uppercase hover:underline">SİL</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OnayModali
                acikMi={silmeModaliAcik}
                kapat={() => setSilmeModaliAcik(false)}
                onayla={handleGercekSilme}
                baslik="DÖNEM SİLME ONAYI"
                mesaj="Bu dönem kaydını silmek üzeresiniz. Bu işlem geri alınamaz ve bağlı verileri etkileyebilir. Onaylıyor musunuz?"
                onayMetni="EVET, SİLİNSİN"
                iptalMetni="VAZGEÇ"
            />
        </div>
    );
}