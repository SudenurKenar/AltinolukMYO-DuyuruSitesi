import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function APanel() {
    const location = useLocation();

    // Hangi sayfada olduğumuzu kontrol edip menüyü ona göre renklendiren yardımcı fonksiyon
    const aktifMi = (yol) => location.pathname === yol;

    const linkStili = (yol) => `
        w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
        ${aktifMi(yol)
            ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
            : "text-slate-500 hover:bg-cyan-50 hover:text-cyan-700"
        }
    `;

    return (
        <aside className="w-full md:w-64 bg-white border-r border-cyan-100 flex flex-col shadow-sm shrink-0 z-10 h-full">
            <div className="p-6 border-b border-cyan-50">
                <h2 className="text-xl font-black text-cyan-900 tracking-tight">
                    Yönetim <span className="text-cyan-600">Paneli</span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                    Altınoluk MYO
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Link to="/admin" className={linkStili("/admin")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Yeni Bildiri Ekle
                </Link>

                <Link to="/admin/arsiv" className={linkStili("/admin/arsiv")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    Bildiri Arşivi
                </Link>

                <Link to="/admin/kategori" className={linkStili("/admin/kategori")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    Kategori Yönetimi
                </Link>

                <Link to="/admin/odevler" className={linkStili("/admin/odevler")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Ödev Yönetimi
                </Link>
            </nav>
            <Link
                to="/"
                className="group flex items-center justify-center gap-2 p-4 mt-auto text-sm font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border-t border-slate-100 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-300"
            >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Ana Sayfaya Dön
            </Link>

        </aside>
    );
}