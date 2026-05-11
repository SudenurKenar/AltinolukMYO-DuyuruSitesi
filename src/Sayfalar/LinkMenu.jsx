import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LinkMenu() {
    const navigate = useNavigate();
    const [siteler, setSiteler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        const siteleriGetir = async () => {
            try {
                const res = await axios.get('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu');
                setSiteler(res.data);
            } catch (error) {
                console.error("Menü listesi yüklenemedi:", error);
            } finally {
                setYukleniyor(false);
            }
        };
        siteleriGetir();
    }, []);

    const ZeytinSimge = ({ className, style }) => (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
        >
            <path d="M95 15 Q 60 40 20 90" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" />
            <path d="M80 25 C 95 30 95 50 75 50 C 65 50 70 30 80 25 Z" fill="#6A994E" />
            <path d="M50 45 C 30 35 25 15 40 25 C 50 30 55 40 50 45 Z" fill="#386641" />
            <ellipse cx="65" cy="65" rx="15" ry="22" transform="rotate(-20 65 65)" fill="#2C3E1E" />
            <ellipse cx="60" cy="57" rx="4" ry="9" transform="rotate(-20 60 57)" fill="#A3B18A" fillOpacity="0.6" />
            <ellipse cx="38" cy="72" rx="12" ry="17" transform="rotate(15 38 72)" fill="#3A4F29" />
            <ellipse cx="34" cy="66" rx="3" ry="7" transform="rotate(15 34 66)" fill="#A3B18A" fillOpacity="0.6" />
        </svg>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 relative font-sans p-4 overflow-hidden">

            {/* Arka Plan Animasyonları ve Koyu Mavi - Turkuaz Pulse Efekti */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes logoRenkPulse {
                    0%, 100% { color: #1e3a5a; text-shadow: 0 4px 12px rgba(30, 58, 90, 0.05); }
                    50% { color: #0891b2; text-shadow: 0 8px 24px rgba(8, 145, 178, 0.25); }
                }
                .animate-logo-pulse { animation: logoRenkPulse 4s ease-in-out infinite; }

                /* Rüzgar 1: Sağa Kavis */
                @keyframes suzulme1 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.25; }
                    50% { transform: translate(40px, -50vh) rotate(180deg); }
                    90% { opacity: 0.25; }
                    100% { transform: translate(-20px, -110vh) rotate(360deg); opacity: 0; }
                }
                /* Rüzgar 2: Sola Kavis */
                @keyframes suzulme2 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.25; }
                    50% { transform: translate(-50px, -45vh) rotate(-120deg); }
                    90% { opacity: 0.25; }
                    100% { transform: translate(30px, -110vh) rotate(-360deg); opacity: 0; }
                }
                /* Rüzgar 3: Zikzak */
                @keyframes suzulme3 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.25; }
                    30% { transform: translate(30px, -30vh) rotate(90deg); }
                    70% { transform: translate(-30px, -70vh) rotate(200deg); }
                    90% { opacity: 0.25; }
                    100% { transform: translate(10px, -110vh) rotate(270deg); opacity: 0; }
                }
            `}} />

            {/* ARKA PLAN: Süzülen Zeytin Dalları */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <ZeytinSimge className="absolute w-20 h-20 bottom-[-10vh] left-[5%]" style={{ animation: 'suzulme1 16s ease-in-out infinite 0s' }} />
                <ZeytinSimge className="absolute w-12 h-12 bottom-[-15vh] left-[22%]" style={{ animation: 'suzulme3 22s linear infinite 3s' }} />
                <ZeytinSimge className="absolute w-32 h-32 bottom-[-20vh] left-[45%]" style={{ animation: 'suzulme2 19s ease-in-out infinite 1s' }} />
                <ZeytinSimge className="absolute w-16 h-16 bottom-[-10vh] left-[65%]" style={{ animation: 'suzulme1 14s ease-in-out infinite 6s' }} />
                <ZeytinSimge className="absolute w-28 h-28 bottom-[-25vh] left-[88%]" style={{ animation: 'suzulme3 25s linear infinite 2s' }} />
                <ZeytinSimge className="absolute w-14 h-14 bottom-[-30vh] left-[15%]" style={{ animation: 'suzulme2 17s ease-in-out infinite 8s' }} />
                <ZeytinSimge className="absolute w-24 h-24 bottom-[-12vh] left-[75%]" style={{ animation: 'suzulme1 21s ease-in-out infinite 5s' }} />
            </div>

            {/* ÖN PLAN: Siteler Menüsü İçeriği */}
            <div className="relative z-10 max-w-md w-full text-center flex flex-col h-[calc(100vh-140px)]">

                {/* Başlık Alanı - İstediğiniz Renk Kombinasyonu */}
                <div className="mb-6 shrink-0">
                    <h1 className="text-3xl font-black tracking-tight uppercase italic animate-logo-pulse">
                        DİĞER SİTELER
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Hızlı Erişim ve Harici Bağlantılar
                    </p>
                </div>

                {/* Dinamik Link Listesi */}
                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-3 custom-scrollbar-mini">
                    {yukleniyor ? (
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : siteler.length > 0 ? (
                        siteler.map((site) => (
                            <a
                                key={site.id}
                                href={site.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-left bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/40 active:scale-[0.98] active:bg-cyan-50/50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <h3 className="font-black text-slate-700 uppercase tracking-tight text-sm group-active:text-cyan-700 transition-colors">
                                            {site.baslik}
                                        </h3>
                                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[280px]">
                                            {site.link.replace(/^(https?:\/\/)?(www\.)?/, '')}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-xs italic">
                            Henüz erişilebilir bir site bağlantısı eklenmemiş.
                        </div>
                    )}
                </div>

                {/* Alt Geri Dön Butonu */}
                <div className="pt-2 mt-auto shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-white border border-slate-200 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Geri Dön
                    </button>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-slate-400/80">
                        Altınoluk MYO Bilgisayar Programcılığı
                    </p>
                </div>

            </div>
        </div>
    );
}