import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import OnayModali from '../Components/OnayModali';

export default function AdminKonu() {
    const [konular, setKonular] = useState([]);
    const [yeniKonu, setYeniKonu] = useState('');
    const [seciliDers, setSeciliDers] = useState('');
    const [seciliDonem, setSeciliDonem] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    const [dersListesi, setDersListesi] = useState([]);
    const [donemListesi, setDonemListesi] = useState([]);

    // Düzenleme State'leri
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [duzenlemeMetni, setDuzenlemeMetni] = useState('');
    const [duzenlemeDersId, setDuzenlemeDersId] = useState('');
    const [duzenlemeDonemId, setDuzenlemeDonemId] = useState('');

    const [silmeModaliAcik, setSilmeModaliAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        verileriYukle();
    }, []);

    const verileriYukle = async () => {
        try {
            const [konuRes, dersRes, donemRes] = await Promise.all([
                axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular'),
                axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdersler'),
                axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkdonemler')
            ]);

            setKonular(Array.isArray(konuRes.data) ? konuRes.data : []);
            setDersListesi(dersRes.data.filter(d => d.durum === true || d.durum === 1));
            setDonemListesi(donemRes.data.filter(d => d.durum === 'aktif'));
        } catch (error) {
            toast.error("Gerekli veriler yüklenirken bir sorun oluştu.");
        }
    };

    const konuEkle = async (e) => {
        e.preventDefault();

        if (!seciliDers) return toast.error("Lütfen konunun ait olacağı dersi seçiniz.");
        if (!seciliDonem) return toast.error("Lütfen konunun ait olacağı dönemi seçiniz.");
        if (!yeniKonu.trim()) return toast.error("Konu başlığı boş bırakılamaz.");

        setYukleniyor(true);
        try {
            const res = await axios.post('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-ekle', {
                konu_adi: yeniKonu.trim(),
                ders_id: Number(seciliDers),
                donem_id: Number(seciliDonem)
            });

            if (res.data.success) {
                toast.success("Yeni konu ilgili ders ve döneme işlendi.");
                setYeniKonu('');
                setSeciliDers('');
                setSeciliDonem('');
                verileriYukle();
            }
        } catch (error) {
            const hataMesaji = error.response?.data?.message || "Kayıt hatası.";
            toast.error(hataMesaji);
        } finally {
            setYukleniyor(false);
        }
    };

    const durumDegistir = async (id, mevcutDurum) => {
        const yeniDurum = mevcutDurum === 'aktif' ? 'pasif' : 'aktif';
        try {
            const res = await axios.patch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-durum/${id}`, { durum: yeniDurum });
            if (res.status === 200) {
                toast.success(`Konu ${yeniDurum} hale getirildi.`);
                verileriYukle();
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
                verileriYukle();
            }
        } catch (error) { toast.error("Silme işlemi başarısız."); }
    };

    const konuGuncelle = async (id) => {
        if (!duzenlemeMetni.trim() || !duzenlemeDersId || !duzenlemeDonemId) {
            return toast.error("Lütfen tüm alanları doldurunuz.");
        }

        try {
            await axios.put(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkkonular-guncelle/${id}`, {
                konu_adi: duzenlemeMetni.trim(),
                ders_id: Number(duzenlemeDersId),
                donem_id: Number(duzenlemeDonemId)
            });
            setDuzenlemeId(null);
            verileriYukle();
            toast.success("Konu bilgileri başarıyla güncellendi.");
        } catch (error) {
            toast.error("Güncelleme hatası.");
        }
    };

    const duzenlemeyiBaslat = (k) => {
        setDuzenlemeId(k.id);
        setDuzenlemeMetni(k.konu_adi);
        setDuzenlemeDersId(k.ders_id || '');
        setDuzenlemeDonemId(k.donem_id || '');
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-left">
            {/* CİLA: Ana çubuğu ve satır içi çubukları (custom-scrollbar-mini) incecik ve koyu mavi yapan asil CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .ozel-scroll { scrollbar-width: thin; scrollbar-color: #1e3a5a transparent; } 
                .ozel-scroll::-webkit-scrollbar { height: 6px; width: 6px; } 
                .ozel-scroll::-webkit-scrollbar-thumb { background-color: #1e3a5a; border-radius: 20px; }
                .custom-scrollbar-mini { scrollbar-width: thin; scrollbar-color: #1e3a5a transparent; }
                .custom-scrollbar-mini::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar-mini::-webkit-scrollbar-thumb { background-color: #1e3a5a; border-radius: 10px; }
            ` }} />

            <div className="mb-10 text-left">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                    Müfredat <span className="text-cyan-600 not-italic font-light">Konu Denetimi</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                    Resmi Konu Başlıkları, Ders ve Dönem Eşleşmeleri
                </p>
            </div>

            {/* Yeni Konu Ekleme Formu */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
                <form onSubmit={konuEkle} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">İlişkili Ders <span className="text-red-500">*</span></label>
                            <select
                                value={seciliDers}
                                onChange={(e) => setSeciliDers(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold text-sm cursor-pointer text-slate-700"
                            >
                                <option value="">Lütfen ders seçiniz...</option>
                                {dersListesi.map((d) => <option key={d.id} value={d.id}>{d.ders}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">İlişkili Dönem <span className="text-red-500">*</span></label>
                            <select
                                value={seciliDonem}
                                onChange={(e) => setSeciliDonem(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold text-sm cursor-pointer text-slate-700"
                            >
                                <option value="">Dönem seçiniz...</option>
                                {donemListesi.map((dn) => <option key={dn.id} value={dn.id}>{dn.donem_adi.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Müfredat Konu Başlığı <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={yeniKonu}
                                onChange={(e) => setYeniKonu(e.target.value)}
                                placeholder="Örn: Format Atma"
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold transition-all text-slate-700"
                            />
                        </div>
                        <button type="submit" disabled={yukleniyor} className="w-full md:w-auto px-12 py-4 rounded-2xl font-black bg-cyan-600 text-white hover:bg-cyan-700 transition-all uppercase text-xs shadow-lg shadow-cyan-100 whitespace-nowrap">
                            SİSTEME EKLE
                        </button>
                    </div>
                </form>
            </div>

            {/* Yönetim Listesi Kapsayıcısı */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                {/* Sürükleme barını EN ÜSTE taşıyan katman */}
                <div className="overflow-x-auto ozel-scroll transform scale-y-[-1]">
                    <div className="transform scale-y-[-1] pt-4">
                        <table className="w-full text-sm text-left border-collapse table-fixed min-w-[950px]">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                    <th className="w-[10%] px-8 py-6">Kimlik No</th>
                                    <th className="w-[30%] px-8 py-6">Konu Başlığı</th>
                                    <th className="w-[35%] px-8 py-6">Ait Olduğu Bağlam (Ders / Dönem)</th>
                                    <th className="w-[10%] px-8 py-6 text-center">Durum</th>
                                    <th className="w-[15%] px-8 py-6 text-right">Yönetim</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {konular.map((k) => (
                                    <tr key={k.id} className={`group transition-all ${k.durum === 'pasif' ? 'bg-slate-50/60 opacity-70' : 'hover:bg-cyan-50/20'}`}>
                                        <td className="px-8 py-6 font-mono text-slate-400 text-[11px]">#{k.id}</td>

                                        {/* Konu Başlığı Sütunu (Artık buradaki çubuk da cilalı ve incecik) */}
                                        <td className="px-8 py-6">
                                            {duzenlemeId === k.id ? (
                                                <input
                                                    value={duzenlemeMetni}
                                                    onChange={(e) => setDuzenlemeMetni(e.target.value)}
                                                    className="w-full p-2 border-b-2 border-cyan-500 outline-none font-bold bg-slate-50 text-slate-700 rounded"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="max-w-[280px] overflow-x-auto custom-scrollbar-mini pb-1">
                                                    <span className={`font-bold tracking-tight whitespace-nowrap ${k.durum === 'pasif' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {k.konu_adi}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Bağlam (Ders / Dönem) Sütunu */}
                                        <td className="px-8 py-6">
                                            {duzenlemeId === k.id ? (
                                                <div className="flex flex-col sm:flex-row gap-2 max-w-[320px]">
                                                    <select
                                                        value={duzenlemeDersId}
                                                        onChange={(e) => setDuzenlemeDersId(e.target.value)}
                                                        className="p-1.5 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                                    >
                                                        <option value="">Ders seç...</option>
                                                        {dersListesi.map((d) => <option key={d.id} value={d.id}>{d.ders}</option>)}
                                                    </select>

                                                    <select
                                                        value={duzenlemeDonemId}
                                                        onChange={(e) => setDuzenlemeDonemId(e.target.value)}
                                                        className="p-1.5 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                                    >
                                                        <option value="">Dönem seç...</option>
                                                        {donemListesi.map((dn) => <option key={dn.id} value={dn.id}>{dn.donem_adi.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 text-left">
                                                    {/* CİLA: Maksimum 35 harf kısıtı (max-w-[35ch]) and asil ince sürgü tam burada aktif */}
                                                    <div className="max-w-[35ch] overflow-x-auto custom-scrollbar-mini pb-1">
                                                        <span className="block w-max px-3 py-1 bg-cyan-50 font-bold text-xs rounded-lg text-cyan-700 whitespace-nowrap">
                                                            {k.ders_adi || "Ders Atanmamış"}
                                                        </span>
                                                    </div>
                                                    <span className="block max-w-max px-3 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-lg uppercase">
                                                        {k.donem_adi || "Bilinmeyen Dönem"}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Durum Sütunu */}
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                disabled={duzenlemeId === k.id}
                                                onClick={() => durumDegistir(k.id, k.durum)}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all disabled:opacity-40
                                                ${k.durum === 'aktif'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-600 hover:text-white'}`}
                                            >
                                                {k.durum === 'aktif' ? '● AKTİF' : '○ PASİF'}
                                            </button>
                                        </td>

                                        {/* Yönetim Sütunu */}
                                        <td className="px-8 py-6 text-right whitespace-nowrap text-xs font-bold">
                                            {duzenlemeId === k.id ? (
                                                <div className="inline-flex gap-3 justify-end w-full">
                                                    <button onClick={() => konuGuncelle(k.id)} className="text-emerald-600 uppercase hover:underline tracking-tight">KAYDET</button>
                                                    <button onClick={() => setDuzenlemeId(null)} className="text-slate-400 uppercase hover:underline tracking-tight">İPTAL</button>
                                                </div>
                                            ) : (
                                                <div className="inline-flex gap-3 justify-end w-full">
                                                    <button onClick={() => duzenlemeyiBaslat(k)} className="text-cyan-600 uppercase hover:underline tracking-tight">DÜZENLE</button>
                                                    <button onClick={() => silmeOnayiAc(k.id)} className="text-red-400 uppercase hover:underline tracking-tight">SİL</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {konular.length === 0 && (
                    <div className="py-20 text-center text-slate-400 italic">Henüz bir konu kaydı bulunmuyor.</div>
                )}
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