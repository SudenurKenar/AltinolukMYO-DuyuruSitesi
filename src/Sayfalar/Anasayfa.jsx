import React, { useState, useEffect } from 'react';
import DuyuruKarti from '../Components/DuyuruKarti';

const SayfaNavigasyonu = ({ toplam, mevcut, setSayfa, aktifRenk, duyuruBasina, mobilFiltre }) => {
    const sayfaSayisi = Math.ceil(toplam / duyuruBasina) || 1;

    // KRİTİK DÜZENLEME: 
    // Masaüstünde (lg) her zaman görünür (simetri için).
    // Mobilde sadece sayfa sayısı 1'den büyükse görünür (zorunlu 10 sınırı).
    if (mobilFiltre && sayfaSayisi <= 1) {
        return <div className="hidden lg:flex justify-center gap-1.5 mt-10">
            <button className={`w-10 h-10 rounded-xl font-bold text-xs ${aktifRenk} text-white shadow-lg`}>1</button>
        </div>;
    }

    return (
        <div className="flex flex-wrap justify-center gap-1.5 mt-6 sm:mt-10">
            {[...Array(sayfaSayisi)].map((_, i) => (
                <button
                    key={i + 1}
                    onClick={() => {
                        setSayfa(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs transition-all ${mevcut === i + 1 ? `${aktifRenk} text-white` : "bg-white text-slate-400 border border-slate-100"
                        }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default function Anasayfa() {
    const [bildiriler, setBildiriler] = useState([]);
    const [aktifTab, setAktifTab] = useState('surekli');
    const [surekliSayfa, setSurekliSayfa] = useState(1);
    const [guncelSayfa, setGuncelSayfa] = useState(1);
    const duyuruBasina = 10;

    useEffect(() => {
        const fetchBildiriler = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/mesajlar");
                setBildiriler(await res.json());
            } catch (error) { console.error("Fermanlar yüklenemedi!"); }
        };
        fetchBildiriler();
    }, []);

    const surekli = bildiriler.filter(b => b.mesaj_turu === "Sürekli");
    const guncel = bildiriler.filter(b => b.mesaj_turu === "Güncel");

    const mevcutSurekli = surekli.slice((surekliSayfa - 1) * duyuruBasina, surekliSayfa * duyuruBasina);
    const mevcutGuncel = guncel.slice((guncelSayfa - 1) * duyuruBasina, guncelSayfa * duyuruBasina);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 font-sans min-h-screen">

            {/* MOBİL TAB SEÇİCİ */}
            <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setAktifTab('surekli')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${aktifTab === 'surekli' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
                >
                    Sürekli Duyurular
                </button>
                <button
                    onClick={() => setAktifTab('guncel')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${aktifTab === 'guncel' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}
                >
                    Güncel Akış
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

                {/* SÜREKLİ DUYURULAR */}
                <div className={`flex flex-col ${aktifTab !== 'surekli' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="hidden lg:block mb-8 px-2">
                        <h2 className="text-2xl text-slate-800 tracking-tight"><span className="font-bold text-cyan-600">Sürekli</span> Duyurular</h2>
                        <div className="mt-2 h-1 w-16 bg-cyan-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 rounded-2xl sm:rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
                        {mevcutSurekli.map(b => (
                            <DuyuruKarti key={b.id} b={b} borderClass="bg-cyan-600" btnHoverClass="hover:bg-cyan-600 hover:text-white" />
                        ))}
                    </div>
                    {/* mobilFiltre true gönderildi */}
                    <SayfaNavigasyonu toplam={surekli.length} mevcut={surekliSayfa} setSayfa={setSurekliSayfa} aktifRenk="bg-cyan-600" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>

                {/* GÜNCEL AKIŞ */}
                <div className={`flex flex-col ${aktifTab !== 'guncel' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="hidden lg:block mb-8 px-2">
                        <h2 className="text-2xl text-slate-800 tracking-tight"><span className="font-bold text-cyan-700">Güncel</span> Akış</h2>
                        <div className="mt-2 h-1 w-16 bg-cyan-700 rounded-full"></div>
                    </div>
                    <div className="flex-1 rounded-2xl sm:rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
                        {mevcutGuncel.map(b => (
                            <DuyuruKarti key={b.id} b={b} borderClass="bg-cyan-700" btnHoverClass="hover:bg-cyan-700 hover:text-white" />
                        ))}
                    </div>
                    {/* mobilFiltre true gönderildi */}
                    <SayfaNavigasyonu toplam={guncel.length} mevcut={guncelSayfa} setSayfa={setGuncelSayfa} aktifRenk="bg-cyan-700" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>

            </div>
        </div>
    );
}