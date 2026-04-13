import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SayfaBulunamadi() {
    const navigate = useNavigate();

    // DİKKAT: style={style} eklendi. Artık rüzgar emirlerini alabiliyor!
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
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 relative font-serif p-4 overflow-hidden">

            {/* Garantili CSS Mührü */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes turkuazPulse {
                    0%, 100% { color: #ffffff; text-shadow: 0 4px 10px rgba(8, 145, 178, 0.1); }
                    50% { color: #0891b2; text-shadow: 0 10px 30px rgba(8, 145, 178, 0.5); }
                }
                .animate-renk-pulse { animation: turkuazPulse 3s ease-in-out infinite; }

                /* Rüzgar 1: Sağa Kavis */
                @keyframes suzulme1 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.35; }
                    50% { transform: translate(40px, -50vh) rotate(180deg); }
                    90% { opacity: 0.35; }
                    100% { transform: translate(-20px, -110vh) rotate(360deg); opacity: 0; }
                }
                /* Rüzgar 2: Sola Kavis */
                @keyframes suzulme2 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.35; }
                    50% { transform: translate(-50px, -45vh) rotate(-120deg); }
                    90% { opacity: 0.35; }
                    100% { transform: translate(30px, -110vh) rotate(-360deg); opacity: 0; }
                }
                /* Rüzgar 3: Zikzak */
                @keyframes suzulme3 {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.35; }
                    30% { transform: translate(30px, -30vh) rotate(90deg); }
                    70% { transform: translate(-30px, -70vh) rotate(200deg); }
                    90% { opacity: 0.35; }
                    100% { transform: translate(10px, -110vh) rotate(270deg); opacity: 0; }
                }
            `}} />

            {/* ARKA PLAN: Kaotik Rüzgarda Süzülen Zeytin Dalları */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Tailwind'e güvenmeyip animasyonları "style" ile zorla basıyoruz */}
                <ZeytinSimge className="absolute w-20 h-20 bottom-[-10vh] left-[5%]" style={{ animation: 'suzulme1 16s ease-in-out infinite 0s' }} />
                <ZeytinSimge className="absolute w-12 h-12 bottom-[-15vh] left-[22%]" style={{ animation: 'suzulme3 22s linear infinite 3s' }} />
                <ZeytinSimge className="absolute w-32 h-32 bottom-[-20vh] left-[45%]" style={{ animation: 'suzulme2 19s ease-in-out infinite 1s' }} />
                <ZeytinSimge className="absolute w-16 h-16 bottom-[-10vh] left-[65%]" style={{ animation: 'suzulme1 14s ease-in-out infinite 6s' }} />
                <ZeytinSimge className="absolute w-28 h-28 bottom-[-25vh] left-[88%]" style={{ animation: 'suzulme3 25s linear infinite 2s' }} />

                <ZeytinSimge className="absolute w-14 h-14 bottom-[-30vh] left-[15%]" style={{ animation: 'suzulme2 17s ease-in-out infinite 8s' }} />
                <ZeytinSimge className="absolute w-24 h-24 bottom-[-12vh] left-[75%]" style={{ animation: 'suzulme1 21s ease-in-out infinite 5s' }} />
            </div>

            {/* ÖN PLAN: Mesaj İçeriği */}
            <div className="relative z-10 max-w-2xl w-full text-center">

                <div>
                    <h1 className="text-8xl md:text-[120px] font-black select-none tracking-tighter animate-renk-pulse transition-colors">
                        404
                    </h1>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 mt-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                        Sayfa Bulunamadı
                    </h2>

                    <p className="text-slate-500 font-medium mb-8 text-sm md:text-base leading-relaxed">
                        Altınoluk Meslek Yüksekokulu sisteminde erişmeye çalıştığınız bağlantı mevcut değildir. <br className="hidden md:block" />
                        Sayfa adresi değiştirilmiş, yayından kaldırılmış veya URL hatalı girilmiş olabilir.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Önceki Sayfaya Dön
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-cyan-700 hover:bg-cyan-800 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Balıkesir Üniversitesi • Altınoluk MYO Bilgisayar Programcılığı
                </p>
            </div>
        </div>
    );
}