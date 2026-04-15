import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Baslik() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const links = {
        insta: "https://www.instagram.com/aykdur?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        rapor: "https://docs.google.com/document/d/0Bz_ilhORkV4xYm9zS0J6QklRNWM/edit?usp=sharing&ouid=106390446804550896004&resourcekey=0-86UEXlIzTaln8efFILgbnQ&rtpof=true&sd=true"
    };

    useEffect(() => {
        // Sayfa yüklendiğinde oturum durumunu sessionStorage'dan oku
        setIsLoggedIn(sessionStorage.getItem("isLoggedIn") === "true");

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Çıkış yapıldığında sadece o oturuma ait verileri temizle
        sessionStorage.clear();
        setIsLoggedIn(false);
        navigate("/");
        window.location.reload();
    };

    const navItemStyle = "h-full px-4 flex items-center font-sans text-cyan-700 hover:text-white hover:bg-cyan-600 font-bold text-xs transition-all duration-300 cursor-pointer";
    const dividerStyle = "w-[1px] h-4 bg-cyan-500/30";

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cyan-100 shadow-sm text-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Alanı */}
                    <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate("/")}>
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-cyan-50">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-cyan-900 leading-none">ALTINOLUK <span className="text-cyan-600">MYO</span></h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Balıkesir Üniversitesi</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Masaüstü Navigasyon */}
                        <nav className="hidden sm:flex items-center h-10 border-2 border-cyan-500/30 rounded-full bg-cyan-50/10 shadow-sm overflow-hidden">
                            <button onClick={() => navigate("/OdevGonder")} className={navItemStyle}>Ödev Gönder</button>
                            <div className={dividerStyle}></div>
                            <a href={links.rapor} target="_blank" rel="noopener noreferrer" className={navItemStyle}>Rapor Formatı</a>
                            <div className={dividerStyle}></div>
                            <a href={links.insta} target="_blank" rel="noopener noreferrer" className={navItemStyle}>İletişim</a>
                        </nav>

                        {/* Yönetici Girişi / Paneli */}
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="h-10 flex items-center justify-center px-5 rounded-full bg-cyan-600 text-white font-bold text-sm shadow-sm active:scale-95 gap-2">
                                        <span>Yönetici</span>
                                        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                    <div className={`absolute right-0 mt-3 w-48 bg-white border border-cyan-50 rounded-2xl shadow-xl transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                        <div className="p-2 space-y-1">
                                            <button onClick={() => { navigate("/admin"); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-cyan-50 rounded-xl transition-colors">Admin Sayfası</button>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Çıkış Yap</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => navigate("/giris")} className="h-10 flex items-center justify-center px-5 rounded-full bg-cyan-600 text-white font-bold text-sm shadow-sm active:scale-95">Giriş Yap</button>
                            )}
                        </div>

                        {/* Mobil Menü Butonu */}
                        <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Menü */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-white ${isMenuOpen ? "max-h-[500px] border-b border-cyan-100" : "max-h-0"}`}>
                <nav className="flex flex-col p-6 space-y-4">
                    <button onClick={() => { navigate("/OdevGonder"); setIsMenuOpen(false); }} className="font-bold text-slate-600 py-2 text-center">Ödev Gönder</button>
                    <a href={links.rapor} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 py-2 text-center">Rapor Formatı</a>
                    <a href={links.insta} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 py-2 text-center">İletişim</a>
                    {isLoggedIn ? (
                        <div className="pt-4 space-y-2">
                            <button onClick={() => { navigate("/admin"); setIsMenuOpen(false); }} className="w-full py-4 text-cyan-600 font-bold border border-cyan-100 rounded-2xl">Admin Sayfası</button>
                            <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold">Çıkış Yap</button>
                        </div>
                    ) : (
                        <button onClick={() => { navigate("/giris"); setIsMenuOpen(false); }} className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold">Giriş Yap</button>
                    )}
                </nav>
            </div>
        </header>
    );
}