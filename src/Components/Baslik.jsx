import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Baslik() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const instaLink = "https://www.instagram.com/aykdur?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

    useEffect(() => {
        setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/");
        window.location.reload();
    };

    // Tüm butonların ortak boyutu ve stili
    const commonButtonStyle = "h-10 flex items-center justify-center px-5 rounded-full transition-all duration-300 font-bold font-sans text-sm shadow-sm active:scale-95 cursor-pointer";
    const mainButtonStyle = `${commonButtonStyle} bg-cyan-600 text-white hover:bg-cyan-700`;

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cyan-100 shadow-sm text-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo ve İsim Alanı */}
                    <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => navigate("/")}>
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl group-hover:scale-105 transition-all shadow-sm border border-cyan-50">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-cyan-900 leading-none">ALTINOLUK <span className="text-cyan-600">MYO</span></h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Balıkesir Üniversitesi</span>
                        </div>
                    </div>

                    {/* Sağ Taraf - Linkler ve Kullanıcı İşlemleri */}
                    <div className="flex items-center gap-4">

                        {/* Turkuaz Çember İçindeki Butonlar (Yükseklik Giriş Butonuyla Aynı) */}
                        <nav className="hidden sm:flex items-center h-10 border-2 border-cyan-500/30 rounded-full bg-cyan-50/10 shadow-sm shadow-cyan-100/50 overflow-hidden">
                            <button
                                onClick={() => navigate("/OdevGonder")}
                                className="h-full px-4 font-sans text-cyan-700 hover:text-white hover:bg-cyan-600 font-bold text-xs transition-all duration-300 cursor-pointer"
                            >
                                Ödev Gönder
                            </button>

                            <div className="w-[2px] h-4 bg-cyan-500/20"></div>

                            <a
                                href={instaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-full px-4 flex items-center font-sans text-cyan-700 hover:text-white hover:bg-cyan-600 font-bold text-xs transition-all duration-300 cursor-pointer"
                            >
                                İletişim
                            </a>
                        </nav>

                        {/* Yönetici Dropdown / Giriş Butonu */}
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`${mainButtonStyle} gap-2`}>
                                        <span className="truncate max-w-[120px]">Yönetici</span>
                                        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <div className={`absolute right-0 mt-3 w-48 bg-white border border-cyan-50 rounded-2xl shadow-xl transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                        <div className="p-2 space-y-1">
                                            <button onClick={() => { navigate("/admin"); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-cyan-50 rounded-xl transition-colors">Admin Sayfası</button>
                                            <hr className="border-cyan-50 mx-2" />
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Çıkış Yap</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => navigate("/giris")} className={mainButtonStyle}>Giriş Yap</button>
                            )}
                        </div>

                        {/* Mobil Menü Butonu */}
                        <button className="lg:hidden p-2 text-slate-600 hover:bg-cyan-50 rounded-lg transition-all" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <svg className={`w-7 h-7 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Menü İçeriği */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-white border-b border-cyan-100 ${isMenuOpen ? "max-h-[500px] opacity-100 shadow-xl" : "max-h-0 opacity-0"}`}>
                <nav className="flex flex-col p-6 space-y-4">
                    <button onClick={() => { navigate("/odev-gonder"); setIsMenuOpen(false); }} className="font-sans text-base font-bold text-slate-600 hover:text-cyan-600 px-4 py-2 hover:bg-cyan-50 rounded-xl transition-all text-center">
                        Ödev Gönder
                    </button>
                    <a href={instaLink} target="_blank" rel="noopener noreferrer" className="font-sans text-base font-bold text-slate-600 hover:text-cyan-600 px-4 py-2 hover:bg-cyan-50 rounded-xl transition-all text-center">
                        İletişim
                    </a>
                    <div className="pt-4 border-t border-slate-100">
                        {isLoggedIn ? (
                            <div className="space-y-3">
                                <button onClick={() => { navigate("/admin"); setIsMenuOpen(false); }} className="w-full py-4 text-cyan-600 font-bold border border-cyan-100 rounded-2xl active:scale-95 transition-transform">Admin Sayfası</button>
                                <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold active:scale-95 transition-transform">Çıkış Yap</button>
                            </div>
                        ) : (
                            <button onClick={() => { navigate("/giris"); setIsMenuOpen(false); }} className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-cyan-200">Giriş Yap</button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}