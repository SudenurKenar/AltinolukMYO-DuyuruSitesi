import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SayfaBulunamadi() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 relative font-sans p-4">

            {/* YENİ: Özel Renk Geçiş Animasyonumuz (Beyazdan Turkuaza) */}
            <style>
                {`
                    @keyframes turkuazPulse {
                        0%, 100% { 
                            color: #ffffff; 
                            text-shadow: 0 4px 10px rgba(8, 145, 178, 0.1);
                        }
                        50% { 
                            color: #0891b2; /* Projedeki klasik cyan-600 rengimiz */
                            text-shadow: 0 10px 30px rgba(8, 145, 178, 0.5);
                        }
                    }
                    .animate-renk-pulse {
                        animation: turkuazPulse 3s ease-in-out infinite;
                    }
                `}
            </style>

            <div className="relative z-10 max-w-2xl w-full text-center">

                {/* 404 Rakamı (Yeni özel sınıfımızı kullanıyor) */}
                <div>
                    <h1 className="text-8xl md:text-[120px] font-black select-none tracking-tighter animate-renk-pulse transition-colors">
                        404
                    </h1>
                </div>

                {/* Mesaj Alanı */}
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

                {/* Alt Not (Kurumsal İmza) */}
                <p className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Balıkesir Üniversitesi • Altınoluk MYO Bilgisayar Programcılığı
                </p>
            </div>
        </div>
    );
}