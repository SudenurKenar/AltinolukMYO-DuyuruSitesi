import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import OnayModali from '../Components/OnayModali';

export default function AdminKonu() {
    const [konular, setKonular] = useState([]);
    const [yeniKonu, setYeniKonu] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    // Düzenleme ve Modal State'leri
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [duzenlemeMetni, setDuzenlemeMetni] = useState('');
    const [silmeModaliAcik, setSilmeModaliAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        konulariGetir();
    }, []);

    const konulariGetir = async () => {
        try {
            const res = await axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular');
            setKonular(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Konu listesi yüklenemedi.");
        }
    };

    const konuEkle = async (e) => {
        e.preventDefault();
        if (!yeniKonu.trim()) return toast.error("Konu başlığı boş bırakılamaz.");
        setYukleniyor(true);
        try {
            const res = await axios.post('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-ekle', { konu_adi: yeniKonu });
            if (res.data.success) {
                toast.success("Yeni konu müfredata işlendi.");
                setYeniKonu('');
                konulariGetir();
            }
        } catch (error) { toast.error("Kayıt hatası."); }
        finally { setYukleniyor(false); }
    };

    const durumDegistir = async (id, mevcutDurum) => {
        const yeniDurum = mevcutDurum === 'aktif' ? 'pasif' : 'aktif';
        try {
            const res = await axios.patch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-durum/${id}`, { durum: yeniDurum });
            if (res.status === 200) {
                toast.success(`Konu ${yeniDurum} hale getirildi.`);
                konulariGetir();
            }
        } catch (error) { toast.error("Durum güncelleme hatası."); }
    };

    const silmeOnayiAc = (id) => {
        setSilinecekId(id);
        setSilmeModaliAcik(true);
    };

    const konuSil = async () => {
        try {
            const res = await axios.delete(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-sil/${silinecekId}`);
            if (res.data.success) {
                toast.success("Konu resmi kayıtlardan silindi.");
                setSilmeModaliAcik(false);
                konulariGetir();
            }
        } catch (error) { toast.error("Silme işlemi başarısız."); }
    };

    const konuGuncelle = async (id) => {
        try {
            await axios.put(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-guncelle/${id}`, { konu_adi: duzenlemeMetni });
            setDuzenlemeId(null);
            konulariGetir();
            toast.success("Konu başlığı güncellendi.");
        } catch (error) { toast.error("Güncelleme hatası."); }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-left">
            <div className="mb-10 text-left">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                    Müfredat <span className="text-cyan-600 not-italic font-light">Konu Denetimi</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                    Resmi Konu Başlıkları ve Yayın Durumu
                </p>
            </div>

            {/* Yeni Konu Giriş Alanı */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
                <form onSubmit={konuEkle} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Yeni Müfredat Konusu</label>
                        <input
                            type="text"
                            value={yeniKonu}
                            onChange={(e) => setYeniKonu(e.target.value)}
                            placeholder="Konu başlığını giriniz..."
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
                                <th className="w-[45%] px-8 py-6">Konu Başlığı</th>
                                <th className="w-[20%] px-8 py-6 text-center">Durum</th>
                                <th className="w-[20%] px-8 py-6 text-right">Yönetim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {konular.map((k) => (
                                <tr key={k.id} className={`group transition-all ${k.durum === 'pasif' ? 'bg-slate-50/60 opacity-70' : 'hover:bg-cyan-50/20'}`}>
                                    <td className="px-8 py-6 font-mono text-slate-400 text-[11px]">#{k.id}</td>

                                    <td className="px-8 py-6">
                                        {duzenlemeId === k.id ? (
                                            <input
                                                value={duzenlemeMetni}
                                                onChange={(e) => setDuzenlemeMetni(e.target.value)}
                                                className="w-full p-2 border-b-2 border-cyan-500 outline-none font-bold bg-transparent text-slate-700"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="max-w-[400px] overflow-x-auto custom-scrollbar-mini pb-1">
                                                <span className={`font-bold tracking-tight whitespace-nowrap ${k.durum === 'pasif' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {k.konu_adi}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => durumDegistir(k.id, k.durum)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all
                                            ${k.durum === 'aktif'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                    : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-600 hover:text-white'}`}
                                        >
                                            {k.durum === 'aktif' ? '● AKTİF' : '○ PASİF'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-4">
                                        {duzenlemeId === k.id ? (
                                            <>
                                                <button onClick={() => konuGuncelle(k.id)} className="text-emerald-600 font-black text-[10px] uppercase hover:underline">KAYDET</button>
                                                <button onClick={() => setDuzenlemeId(null)} className="text-slate-400 font-black text-[10px] uppercase hover:underline">İPTAL</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setDuzenlemeId(k.id); setDuzenlemeMetni(k.konu_adi); }} className="text-cyan-600 font-black text-[10px] uppercase hover:underline">DÜZENLE</button>
                                                <button onClick={() => silmeOnayiAc(k.id)} className="text-red-400 font-black text-[10px] uppercase hover:underline">SİL</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {konular.length === 0 && (
                        <div className="py-20 text-center text-slate-400 italic">Henüz bir konu kaydı bulunmuyor.</div>
                    )}
                </div>
            </div>

            <OnayModali
                acikMi={silmeModaliAcik}
                kapat={() => setSilmeModaliAcik(false)}
                onayla={konuSil}
                baslik="KONU SİLME ONAYI"
                mesaj="Bu konuyu sistemden kaldırmak üzeresiniz. Bu işlem geri alınamaz. Devam edilsin mi?"
                onayMetni="EVET, SİL"
                iptalMetni="VAZGEÇ"
            />
        </div>
    );
}