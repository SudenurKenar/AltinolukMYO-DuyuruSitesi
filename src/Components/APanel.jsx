import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Archive, GraduationCap, BookOpen, ArrowLeft, Menu, X, ChevronLeft, ChevronRight, Settings, User, ListChecks, CalendarRange, Link2 } from 'lucide-react';

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
                <div className={`p-6 border-b border-cyan-50 transition-all duration-500 ${panelAcik ? 'text-left' : 'text-center px-2'}`}>
                    <div className="flex items-center justify-center min-h-[48px]">
                        {panelAcik ? (
                            <h2 className="text-xl font-black text-cyan-900 tracking-tight whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
                                Yönetim <span className="text-cyan-600">Paneli</span>
                                <div className="h-1 w-8 bg-cyan-500 rounded-full mt-1"></div>
                            </h2>
                        ) : (
                            /* KÜÇÜLEN EKRAN LOGOSU - YENİ TASARIM */
                            <div className="relative group cursor-pointer flex items-center justify-center">
                                {/* Dış Çerçeve */}
                                <div className="w-11 h-11 border-2 border-cyan-100 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:border-cyan-500 group-hover:rotate-45">
                                    {/* İç Dolgu Amblem */}
                                    <div className="w-6 h-6 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-200 flex items-center justify-center transition-all duration-500 group-hover:-rotate-45 group-hover:bg-cyan-700">
                                        {/* En İçteki Beyaz Nokta/Çekirdek */}
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Arka Plan Glow Efekti (Sadece Hover'da) */}
                                <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            </div>
                        )}
                    </div>

                    {panelAcik && (
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-2 truncate animate-in fade-in duration-700">
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

                    <Link to="/admin/konular" onClick={() => setMobilAcik(false)} className={linkStili("/admin/konular")} title="Dönem & Konu">
                        <ListChecks size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Konu Yönetimi</span>}
                    </Link>

                    <Link to="/admin/donemler" onClick={() => setMobilAcik(false)} className={linkStili("/admin/donemler")} title="Dönem Yönetimi">
                        <CalendarRange size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Dönem Yönetimi</span>}
                    </Link>

                    <Link to="/admin/menuyonetimi" onClick={() => setMobilAcik(false)} className={linkStili("/admin/menuyonetimi")} title="Menü Siteleri Yönetimi">
                        <Link2 size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Site Yönlendirmesi</span>}
                    </Link>

                    <Link to="/admin/linkler" onClick={() => setMobilAcik(false)} className={linkStili("/admin/linkler")} title="Link Yönetimi">
                        <Settings size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Link Yönetimi</span>}
                    </Link>

                    <Link to="/admin/profil" onClick={() => setMobilAcik(false)} className={linkStili("/admin/profil")} title="Profil">
                        <User size={20} className="shrink-0" />
                        {panelAcik && <span className="truncate">Profil Yönetimi</span>}
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