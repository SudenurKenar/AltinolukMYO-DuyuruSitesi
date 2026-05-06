import React, { useState, useEffect, useRef } from 'react';
import DuyuruKarti from '../Components/DuyuruKarti';

const baslikFormatla = (metin, limit = 65) => {
    if (!metin) return "";

    const buyukHarf = metin.toLocaleUpperCase('tr-TR');
    return buyukHarf.length > limit ? buyukHarf.substring(0, limit) + "..." : buyukHarf;
};

// Her bir duyuru kartını ekrana girdikçe süzülerek getiren Lazy Load bileşeni
const LazyDuyuru = ({ b, borderClass, btnHoverClass }) => {
    const [gorunurMu, setGorunurMu] = useState(false);
    const kartRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setGorunurMu(true);
                    observer.unobserve(kartRef.current);
                }
            },
            { threshold: 0.1 }
        );

        if (kartRef.current) observer.observe(kartRef.current);

        return () => {
            if (kartRef.current) observer.unobserve(kartRef.current);
        };
    }, []);

    return (
        <div
            ref={kartRef}
            className={`transition-all duration-700 ease-out transform ${gorunurMu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
        >
            {gorunurMu ? (
                // Başlık burada formatlanarak alt bileşene iletilir
                <DuyuruKarti
                    b={{ ...b, baslik: baslikFormatla(b.baslik, 65) }}
                    borderClass={borderClass}
                    btnHoverClass={btnHoverClass}
                />
            ) : (
                <div className="h-32 bg-slate-50/50 animate-pulse rounded-2xl m-4" />
            )}
        </div>
    );
};

const SayfaNavigasyonu = ({ toplam, mevcut, setSayfa, aktifRenk, duyuruBasina, mobilFiltre }) => {
    const sayfaSayisi = Math.ceil(toplam / duyuruBasina) || 1;

    if (mobilFiltre && sayfaSayisi <= 1) {
        return (
            <div className="hidden lg:flex justify-center gap-1.5 mt-10">
                <button className={`w-10 h-10 rounded-xl font-bold text-xs ${aktifRenk} text-white shadow-lg`}>1</button>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap justify-center gap-1.5 mt-6 sm:mt-10">
            {[...Array(sayfaSayisi)].map((_, i) => (
                <button
                    key={i + 1}
                    onClick={() => { setSayfa(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold text-[10px] transition-all 
                        ${mevcut === i + 1 ? `${aktifRenk} text-white shadow-md` : "bg-white text-slate-400 border border-slate-100 hover:border-cyan-200"}`}
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
        fetch("https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktkmesajlar")
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
            {/* Mobil Tab Görünümü */}
            <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setAktifTab('surekli')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${aktifTab === 'surekli' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}>Sürekli</button>
                <button onClick={() => setAktifTab('guncel')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${aktifTab === 'guncel' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>Güncel</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
                {/* Sürekli Duyurular Kolonu */}
                <div className={`${aktifTab !== 'surekli' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                    <div className="hidden lg:block mb-8 text-left">
                        <h2 className="text-2xl text-slate-800"><span className="font-bold text-cyan-600">Sürekli</span> Duyurular</h2>
                        <div className="mt-2 h-1 w-16 bg-cyan-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm min-h-[400px]">
                        {sayfaKes(surekli, surekliSayfa).length > 0 ? (
                            sayfaKes(surekli, surekliSayfa).map(b => (
                                <LazyDuyuru key={b.id} b={b} borderClass="bg-cyan-600" btnHoverClass="hover:bg-cyan-600 hover:text-white" />
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-300 italic text-sm">Arşivde sürekli duyuru bulunamadı.</div>
                        )}
                    </div>
                    <SayfaNavigasyonu toplam={surekli.length} mevcut={surekliSayfa} setSayfa={setSurekliSayfa} aktifRenk="bg-cyan-600" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>

                {/* Güncel Akış Kolonu */}
                <div className={`${aktifTab !== 'guncel' ? 'hidden lg:flex' : 'flex'} flex-col`}>
                    <div className="hidden lg:block mb-8 text-left">
                        <h2 className="text-2xl text-slate-800"><span className="font-bold text-cyan-700">Güncel</span> Akış</h2>
                        <div className="mt-2 h-1 w-16 bg-cyan-700 rounded-full"></div>
                    </div>
                    <div className="flex-1 rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm min-h-[400px]">
                        {sayfaKes(guncel, guncelSayfa).length > 0 ? (
                            sayfaKes(guncel, guncelSayfa).map(b => (
                                <LazyDuyuru key={b.id} b={b} borderClass="bg-cyan-700" btnHoverClass="hover:bg-cyan-700 hover:text-white" />
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-300 italic text-sm">Arşivde güncel duyuru bulunamadı.</div>
                        )}
                    </div>
                    <SayfaNavigasyonu toplam={guncel.length} mevcut={guncelSayfa} setSayfa={setGuncelSayfa} aktifRenk="bg-cyan-700" duyuruBasina={duyuruBasina} mobilFiltre={true} />
                </div>
            </div>
        </div>
    );
}