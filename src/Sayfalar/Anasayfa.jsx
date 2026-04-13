// src/Sayfalar/Anasayfa.jsx
import React, { useState, useEffect } from 'react';
import DuyuruKarti from '../Components/DuyuruKarti';

const SayfaNavigasyonu = ({ toplam, mevcut, setSayfa, aktifRenk, duyuruBasina, mobilFiltre }) => {
    const sayfaSayisi = Math.ceil(toplam / duyuruBasina) || 1;
    if (mobilFiltre && sayfaSayisi <= 1) {
        return <div className="hidden lg:flex justify-center gap-1.5 mt-10">
            <button className={`w-10 h-10 rounded-xl font-bold text-xs ${aktifRenk} text-white shadow-lg`}>1</button>
        </div>;
    }
    return (
        <div className="flex flex-wrap justify-center gap-1.5 mt-6 sm:mt-10">
            {[...Array(sayfaSayisi)].map((_, i) => (
                <button key={i + 1} onClick={() => { setSayfa(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold text-[10px] transition-all ${mevcut === i + 1 ? `${aktifRenk} text-white` : "bg-white text-slate-400 border border-slate-100"}`}>
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default function Anasayfa() {
    const [bildiriler, setBildiriler] = useState([]); // Başlangıç her zaman dizi
    const [aktifTab, setAktifTab] = useState('surekli');
    const [surekliSayfa, setSurekliSayfa] = useState(1);
    const [guncelSayfa, setGuncelSayfa] = useState(1);
    const duyuruBasina = 10;

    useEffect(() => {
        fetch("http://localhost:5000/api/mesajlar")
            .then(res => res.json())
            .then(data => setBildiriler(Array.isArray(data) ? data : []))
            .catch(() => setBildiriler([]));
    }, []);

    const filtrele = (tur) => (bildiriler || []).filter(b => b.mesaj_turu && b.mesaj_turu.trim() === tur);
    const surekli = filtrele("Sürekli");
    const guncel = filtrele("Güncel");

    const sayfaKes = (liste, sayfa) => liste.slice((sayfa - 1) * duyuruBasina, sayfa * duyuruBasina);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 font-sans min-h-screen">
            <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setAktifTab('surekli')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${aktifTab === 'surekli' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}>Sürekli</button>
                <button onClick={() => setAktifTab('guncel')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${aktifTab === 'guncel' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>Güncel</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
                <div className={`${aktifTab !== 'surekli' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                    <div className="hidden lg:block mb-8"><h2 className="text-2xl text-slate-800"><span className="font-bold text-cyan-600">Sürekli</span> Duyurular</h2><div className="mt-2 h-1 w-16 bg-cyan-600 rounded-full"></div></div>
                    <div className="flex-1 rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm min-h-[400px]">
                        {sayfaKes(surekli, surekliSayfa).map(b => <DuyuruKarti key={b.id} b={b} borderClass="bg-cyan-600" btnHoverClass="hover:bg-cyan-600 hover:text-white" />)}
                    </div>
                    <SayfaNavigasyonu toplam={surekli.length} mevcut={surekliSayfa} setSayfa={setSurekliSayfa} aktifRenk="bg-cyan-600" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>

                <div className={`${aktifTab !== 'guncel' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                    <div className="hidden lg:block mb-8"><h2 className="text-2xl text-slate-800"><span className="font-bold text-cyan-700">Güncel</span> Akış</h2><div className="mt-2 h-1 w-16 bg-cyan-700 rounded-full"></div></div>
                    <div className="flex-1 rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm min-h-[400px]">
                        {sayfaKes(guncel, guncelSayfa).map(b => <DuyuruKarti key={b.id} b={b} borderClass="bg-cyan-700" btnHoverClass="hover:bg-cyan-700 hover:text-white" />)}
                    </div>
                    <SayfaNavigasyonu toplam={guncel.length} mevcut={guncelSayfa} setSayfa={setGuncelSayfa} aktifRenk="bg-cyan-700" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>
            </div>
        </div>
    );
}