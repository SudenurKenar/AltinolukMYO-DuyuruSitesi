import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Sürükle-bırak sihirbazları
import OnayModali from '../Components/OnayModali';

export default function AdminMenuYonetimi() {
    const [siteler, setSiteler] = useState([]);
    const [yeniBaslik, setYeniBaslik] = useState('');
    const [yeniLink, setYeniLink] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    // Düzenleme ve Modal State'leri
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [duzenlemeBaslik, setDuzenlemeBaslik] = useState('');
    const [duzenlemeLink, setDuzenlemeLink] = useState('');
    const [silmeModaliAcik, setSilmeModaliAcik] = useState(false);
    const [silinecekId, setSilinecekId] = useState(null);

    useEffect(() => {
        siteleriGetir();
    }, []);

    const siteleriGetir = async () => {
        try {
            const res = await axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu');
            setSiteler(res.data);
        } catch (error) {
            toast.error("Menü listesi sunucudan yüklenemedi.");
        }
    };

    const siteEkle = async (e) => {
        e.preventDefault();
        if (!yeniBaslik.trim() || !yeniLink.trim()) {
            return toast.error("Başlık ve Link alanları boş bırakılamaz.");
        }

        setYukleniyor(true);
        try {
            const res = await axios.post('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu', {
                baslik: yeniBaslik,
                link: yeniLink
            });
            if (res.data.success) {
                toast.success("Yeni site menüye başarıyla eklendi.");
                setYeniBaslik('');
                setYeniLink('');
                siteleriGetir();
            }
        } catch (error) {
            toast.error("Site eklenirken bir hata oluştu.");
        } finally {
            setYukleniyor(false);
        }
    };

    const silmeOnayiAc = (id) => {
        setSilinecekId(id);
        setSilmeModaliAcik(true);
    };

    const siteSil = async () => {
        try {
            const res = await axios.delete(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu/${silinecekId}`);
            if (res.data.success) {
                toast.success("Menü elemanı başarıyla kaldırıldı.");
                setSilmeModaliAcik(false);
                siteleriGetir();
            }
        } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
        }
    };

    const siteGuncelle = async (id) => {
        if (!duzenlemeBaslik.trim() || !duzenlemeLink.trim()) {
            return toast.error("Başlık ve Link boş olamaz.");
        }
        try {
            await axios.put(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu/${id}`, {
                baslik: duzenlemeBaslik,
                link: duzenlemeLink
            });

            setDuzenlemeId(null);
            siteleriGetir();
            toast.success("Site bilgileri başarıyla güncellendi.");
        } catch (error) {
            toast.error("Güncelleme hatası.");
        }
    };

    // SÜRÜKLE BIRAK BİTTİĞİNDE TETİKLENEN SİHİRLİ FONKSİYON
    const onDragEnd = async (result) => {
        const { destination, source } = result;

        // Eğer liste dışına bırakıldıysa veya yeri değişmediyse işlem yapma
        if (!destination || destination.index === source.index) return;

        const yeniList = [...siteler];
        // Sürüklenen elemanı eski yerinden koparıyoruz
        const [tasınanEleman] = yeniList.splice(source.index, 1);
        // Yeni indeksine enjekte ediyoruz
        yeniList.splice(destination.index, 0, tasınanEleman);

        // State'leri yeni hiyerarşik index sırasına (idx + 1) göre haritalandırarak anında güncelliyoruz
        const güncelSiraliListe = yeniList.map((item, idx) => ({
            ...item,
            sira: idx + 1
        }));

        setSiteler(güncelSiraliListe);

        // Veritabanı payload hazırlığı
        const gonderilecekSiralama = güncelSiraliListe.map(item => ({
            id: item.id,
            sira: item.sira
        }));

        try {
            const res = await axios.put('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu/sira', {
                yeniSiralama: gonderilecekSiralama
            });
            if (res.data.success) {
                toast.success("Yeni menü sıralaması kaydedildi.");
            }
        } catch (error) {
            toast.error("Sıralama veritabanına işlenirken hata oluştu.");
            siteleriGetir(); // Hata durumunda eski güvenli sırayı geri yükle
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-left select-none">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1e3a5a] italic tracking-tighter uppercase">
                    Dış Bağlantı <span className="text-cyan-600 not-italic font-light">Menü Denetimi</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 border-l-2 border-cyan-500 pl-3">
                    Header "Siteler" Yönetimi ve Hiyerarşi Ayarları
                </p>
            </div>

            {/* Yeni Giriş Alanı */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
                <form onSubmit={siteEkle} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="w-full md:w-1/3 space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Site Başlığı</label>
                        <input
                            type="text"
                            value={yeniBaslik}
                            onChange={(e) => setYeniBaslik(e.target.value)}
                            placeholder="Örn: Duyuru Sitesi"
                            className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold transition-all text-sm"
                        />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Yönlendirilecek URL Adresi</label>
                        <input
                            type="url"
                            value={yeniLink}
                            onChange={(e) => setYeniLink(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-semibold transition-all text-sm"
                        />
                    </div>
                    <button type="submit" disabled={yukleniyor} className="w-full md:w-auto px-12 py-4 rounded-2xl font-black bg-cyan-600 text-white hover:bg-cyan-700 transition-all uppercase text-xs shadow-lg shadow-cyan-100 whitespace-nowrap">
                        MENÜYE EKLE
                    </button>
                </form>
            </div>

            {/* DragDropContext Kapsayıcısı */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse table-fixed min-w-[850px]">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="w-[8%] px-8 py-6 text-center">Tutaç</th>
                                    <th className="w-[12%] px-4 py-6">Sıra / No</th>
                                    <th className="w-[28%] px-6 py-6">Site Başlığı</th>
                                    <th className="w-[37%] px-6 py-6">Hedef Bağlantı (Link)</th>
                                    <th className="w-[15%] px-8 py-6 text-right">Yönetim</th>
                                </tr>
                            </thead>

                            {/* Droppable: Sürüklenen elemanların bırakılabileceği alan (tbody) */}
                            <Droppable droppableId="menuSiteleriDroppable">
                                {(provided) => (
                                    <tbody
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="divide-y divide-slate-50"
                                    >
                                        {siteler.map((s, index) => (
                                            /* Draggable: Her bir satırın sürüklenebilir kimliği */
                                            <Draggable key={s.id.toString()} draggableId={s.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`group transition-colors border-b border-slate-100/70 ${snapshot.isDragging
                                                            ? 'bg-cyan-50/60 shadow-md display-table'
                                                            : 'hover:bg-cyan-50/20 bg-white'
                                                            }`}
                                                    >
                                                        {/* 1. SÜREKLEME TUTAÇ ALANI (Farenin tutacağı yer ikonik simge) */}
                                                        <td className="px-8 py-6 text-center">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-cyan-600 transition-colors p-1 flex items-center justify-center inline-block"
                                                                title="Sürüklemek için basılı tutun"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
                                                                </svg>
                                                            </div>
                                                        </td>

                                                        {/* Sıra ve ID Gösterimi */}
                                                        <td className="px-4 py-6 font-mono text-slate-400 text-[11px]">
                                                            <span className="bg-cyan-50 text-cyan-700 font-bold px-2.5 py-1 rounded-md mr-1.5 shadow-sm">{index + 1}</span>
                                                            #{s.id}
                                                        </td>

                                                        {/* SİTE BAŞLIĞI */}
                                                        <td className="px-6 py-6">
                                                            {duzenlemeId === s.id ? (
                                                                <input
                                                                    value={duzenlemeBaslik}
                                                                    onChange={(e) => setDuzenlemeBaslik(e.target.value)}
                                                                    className="w-full p-2 border-b-2 border-cyan-500 outline-none font-bold bg-transparent text-sm"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <div className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                                    <span className="font-bold uppercase tracking-tight text-slate-700">
                                                                        {s.baslik}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* HEDEF LINK */}
                                                        <td className="px-6 py-6 font-mono text-xs text-slate-400">
                                                            {duzenlemeId === s.id ? (
                                                                <input
                                                                    value={duzenlemeLink}
                                                                    onChange={(e) => setDuzenlemeLink(e.target.value)}
                                                                    className="w-full p-2 border-b-2 border-cyan-500 outline-none bg-transparent text-xs"
                                                                />
                                                            ) : (
                                                                <div className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-cyan-600 transition-colors">
                                                                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                        {s.link}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* YÖNETİM BUTONLARI */}
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center justify-end gap-3 w-full">
                                                                {duzenlemeId === s.id ? (
                                                                    <>
                                                                        <button onClick={() => siteGuncelle(s.id)} className="text-emerald-600 font-black text-[10px] uppercase tracking-wider hover:underline whitespace-nowrap">KAYDET</button>
                                                                        <button onClick={() => setDuzenlemeId(null)} className="text-slate-400 font-black text-[10px] uppercase tracking-wider hover:underline whitespace-nowrap">İPTAL</button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => { setDuzenlemeId(s.id); setDuzenlemeBaslik(s.baslik); setDuzenlemeLink(s.link); }} className="text-cyan-600 font-black text-[10px] uppercase tracking-wider hover:underline whitespace-nowrap">DÜZENLE</button>
                                                                        <button onClick={() => silmeOnayiAc(s.id)} className="text-red-400 font-black text-[10px] uppercase tracking-wider hover:underline whitespace-nowrap">SİL</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </table>
                        {siteler.length === 0 && (
                            <div className="w-full px-8 py-12 text-center text-sm font-medium text-slate-400 italic bg-white">
                                Menüye kayıtlı herhangi bir site bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            </DragDropContext>

            {/* Silme Onay Modali */}
            <OnayModali
                acikMi={silmeModaliAcik}
                kapat={() => setSilmeModaliAcik(false)}
                onayla={siteSil}
                baslik="MENÜ ELEMANI SİLME ONAYI"
                mesaj="Bu site bağlantısını menüden kaldırmak üzeresiniz. Bu işlem header (başlık) alanındaki 'Siteler' dropdown listesini doğrudan etkileyecektir. Onaylıyor musunuz?"
                onayMetni="SİLİNSİN"
                iptalMetni="VAZGEÇ"
            />
        </div>
    );
}