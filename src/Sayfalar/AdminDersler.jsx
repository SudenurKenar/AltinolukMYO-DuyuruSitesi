import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import OnayModali from '../Components/OnayModali';

export default function AdminDersler() {
    const [dersler, setDersler] = useState([]);
    const [yeniDers, setYeniDers] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    // Düzenleme ve Modal State'leri
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [duzenlemeMetni, setDuzenlemeMetni] = useState('');
    const [silmeModaliAcik, setSilmeModaliAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        dersleriGetir();
    }, []);

    const dersleriGetir = async () => {
        try {
            const res = await axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler');
            setDersler(res.data);
        } catch (error) {
            toast.error("Veritabanı listesi yüklenemedi.");
        }
    };

    const dersEkle = async (e) => {
        e.preventDefault();
        // CİLA: Boşlukları temizleyip kontrol ediyoruz
        const temizDers = yeniDers.trim();
        if (!temizDers) return toast.error("Ders tanımı boş bırakılamaz.");

        setYukleniyor(true);
        try {
            // CİLA: Sunucuya tertemiz ve boşluksuz string fırlatıyoruz
            const res = await axios.post('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkders-ekle', { ders: temizDers });
            if (res.data.success) {
                toast.success("Ders başarıyla kaydedildi.");
                setYeniDers('');
                dersleriGetir();
            }
        } catch (error) {
            toast.error("Kayıt hatası.");
        } finally {
            setYukleniyor(false);
        }
    };

    const durumDegistir = async (id, mevcutDurum) => {
        try {
            const yeniDurum = !mevcutDurum;
            const res = await axios.patch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler/${id}/durum`, { durum: yeniDurum });
            if (res.status === 200) {
                toast.success(yeniDurum ? "Ders aktif edildi." : "Ders pasif duruma getirildi.");
                dersleriGetir();
            }
        } catch (error) { toast.error("Durum güncelleme hatası."); }
    };

    const silmeOnayiAc = (id) => {
        setSilinecekId(id);
        setSilmeModaliAcik(true);
    };

    const dersSil = async () => {
        try {
            const res = await axios.delete(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler/${silinecekId}`);
            if (res.data.success) {
                toast.success("Ders resmi kayıtlardan silindi.");
                setSilmeModaliAcik(false);
                dersleriGetir();
            }
        } catch (error) { toast.error("Silme işlemi başarısız."); }
    };

    const dersGuncelle = async (id) => {
        if (!duzenlemeMetni.trim()) return toast.error("Ders adı boş bırakılamaz.");
        try {
            await axios.put(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler/${id}`, { ders: duzenlemeMetni.trim() });
            setDuzenlemeId(null);
            dersleriGetir();
            toast.success("Ders bilgisi güncellendi.");
        } catch (error) { toast.error("Güncelleme hatası."); }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-left">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                    Müfredat <span className="text-cyan-600 not-italic font-light">Ders Denetimi</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                    Resmi Ders Listesi ve Durum Kontrolü
                </p>
            </div>

            {/* Yeni Ders Giriş Alanı */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
                <form onSubmit={dersEkle} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Akademik Ders Tanımı</label>
                        <input
                            type="text"
                            value={yeniDers}
                            onChange={(e) => setYeniDers(e.target.value)}
                            placeholder="Ders adını giriniz..."
                            className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold transition-all"
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
                                <th className="w-[15%] px-8 py-6">Kimlik No</th>
                                <th className="w-[45%] px-8 py-6">Ders Adı</th>
                                <th className="w-[20%] px-8 py-6 text-center">Durum</th>
                                <th className="w-[20%] px-8 py-6 text-right">Yönetim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {dersler.map((d) => (
                                <tr key={d.id} className={`group transition-all ${!d.durum ? 'bg-slate-50/60 opacity-70' : 'hover:bg-cyan-50/20'}`}>
                                    <td className="px-8 py-6 font-mono text-slate-400 text-[11px]">#{d.id}</td>

                                    {/* DERS ADI - KISITLAMA VE SÜRGÜ ALANI */}
                                    <td className="px-8 py-6">
                                        {duzenlemeId === d.id ? (
                                            <input
                                                value={duzenlemeMetni}
                                                onChange={(e) => setDuzenlemeMetni(e.target.value)}
                                                className="w-full p-2 border-b-2 border-cyan-500 outline-none font-bold bg-transparent"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="max-w-[300px] overflow-x-auto custom-scrollbar-mini pb-1">
                                                <span className={`font-bold tracking-tight whitespace-nowrap ${!d.durum ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {d.ders}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => durumDegistir(d.id, d.durum)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all
                                            ${d.durum
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-200 text-slate-500 border-slate-300'}`}
                                        >
                                            {d.durum ? '● AKTİF' : '○ PASİF'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-4">
                                        {duzenlemeId === d.id ? (
                                            <>
                                                <button onClick={() => dersGuncelle(d.id)} className="text-emerald-600 font-black text-[10px] uppercase">KAYDET</button>
                                                <button onClick={() => setDuzenlemeId(null)} className="text-slate-400 font-black text-[10px] uppercase">İPTAL</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setDuzenlemeId(d.id); setDuzenlemeMetni(d.ders); }} className="text-cyan-600 font-black text-[10px] uppercase">DÜZENLE</button>
                                                <button onClick={() => silmeOnayiAc(d.id)} className="text-red-400 font-black text-[10px] uppercase">SİL</button>
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
                onayla={dersSil}
                baslik="DERS SİLME ONAYI"
                mesaj="Bu dersi silmek üzeresiniz. Bu işlem geri alınamaz ve bu dersle ilişkili eski kayıtlar etkilenebilir. Devam edilsin mi?"
                onayMetni="SİLİNSİN"
                iptalMetni="VAZGEÇ"
            />
        </div>
    );
}