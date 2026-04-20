import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Archive, GraduationCap, BookOpen, ArrowLeft, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function APanel({ panelAcik, setPanelAcik }) {
    const location = useLocation();

    // Sadece mobildeki "ekranı kaplayan menüyü" açıp kapatmak için:
    const [mobilAcik, setMobilAcik] = useState(false);

    // Aktif sayfa kontrolü
    const aktifMi = (yol) => location.pathname === yol;

    // Link stili panelin açık/kapalı olma durumuna göre esner
    const linkStili = (yol) => `
        w-full flex items-center ${panelAcik ? 'justify-start px-4 gap-3' : 'justify-center px-0'} 
        py-3 rounded-xl font-bold transition-all duration-200 overflow-hidden
        ${aktifMi(yol)
            ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
            : "text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"
        }
    `;

    return (
        <>
            {/* MOBİL TETİKLEYİCİ - Sadece mobilde sağ üstte yüzer */}
            <button
                onClick={() => setMobilAcik(!mobilAcik)}
                className="md:hidden fixed top-6 right-6 z-[60] p-3 bg-white border border-cyan-100 rounded-2xl text-cyan-600 shadow-xl active:scale-95 transition-all"
            >
                {mobilAcik ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* YAN MENÜ (SIDEBAR) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-cyan-100 flex flex-col shadow-sm transition-all duration-300 ease-in-out
                /* Mobil için kaydırma animasyonu */
                ${mobilAcik ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                /* Masaüstü için sabit kalıp genişlik değiştirme animasyonu */
                md:relative md:translate-x-0 
                ${panelAcik ? 'w-64' : 'w-20'}
                h-full font-sans shrink-0
            `}>

                {/* --- MASAÜSTÜ PANEL DARALT/GENİŞLET BUTONU --- */}
                <button
                    onClick={() => setPanelAcik(!panelAcik)}
                    className="hidden md:flex absolute -right-3.5 top-10 bg-white border-2 border-cyan-100 text-cyan-600 w-7 h-7 rounded-full items-center justify-center shadow-md hover:bg-cyan-50 hover:scale-110 transition-all z-50 cursor-pointer"
                >
                    {panelAcik ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
                </button>

                {/* Logo Alanı */}
                <div className={`p-6 border-b border-cyan-50 transition-all ${panelAcik ? 'text-left' : 'text-center px-2'}`}>
                    <h2 className="text-xl font-black text-cyan-900 tracking-tight whitespace-nowrap overflow-hidden">
                        {panelAcik ? (
                            <>Yönetim <span className="text-cyan-600">Paneli</span></>
                        ) : (
                            <span className="text-cyan-600">YP</span>
                        )}
                    </h2>
                    {panelAcik && (
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1 truncate">
                            Altınoluk MYO
                        </p>
                    )}
                </div>

                {/* Navigasyon Linkleri */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link to="/admin" onClick={() => setMobilAcik(false)} className={linkStili("/admin")} title="Yeni Bildiri Ekle">
                        <LayoutDashboard size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Yeni Bildiri Ekle</span>}
                    </Link>

                    <Link to="/admin/arsiv" onClick={() => setMobilAcik(false)} className={linkStili("/admin/arsiv")} title="Bildiri Arşivi">
                        <Archive size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Bildiri Arşivi</span>}
                    </Link>

                    <Link to="/admin/odevler" onClick={() => setMobilAcik(false)} className={linkStili("/admin/odevler")} title="Ödev Yönetimi">
                        <GraduationCap size={22} className="shrink-0" />
                        {panelAcik && <span className="truncate">Ödev Yönetimi</span>}
                    </Link>

                    <Link to="/admin/dersler" onClick={() => setMobilAcik(false)} className={linkStili("/admin/dersler")} title="Ders Yönetimi">
                        <BookOpen size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Ders Yönetimi</span>}
                    </Link>
                </nav>

                {/* Alt Çıkış/Geri Dönüş Butonu */}
                <Link
                    to="/"
                    title="Ana Sayfaya Dön"
                    className={`group flex items-center justify-center p-4 mt-auto font-black uppercase tracking-widest text-slate-500 bg-slate-50 border-t border-slate-100 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-300 ${panelAcik ? 'gap-2 text-[10px]' : 'text-[0px]'}`}
                >
                    <ArrowLeft size={20} className={`shrink-0 transition-transform duration-300 ${panelAcik ? 'group-hover:-translate-x-1' : ''}`} />
                    {panelAcik && <span className="truncate">Ana Sayfaya Dön</span>}
                </Link>
            </aside>

            {/* MOBİL ARKA PLAN KARARTMA */}
            {mobilAcik && (
                <div
                    className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 md:hidden"
                    onClick={() => setMobilAcik(false)}
                />
            )}
        </>
    );
}