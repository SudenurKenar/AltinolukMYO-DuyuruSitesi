import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Baslik() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
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

    const handleInstaClick = (e) => {
        e.preventDefault();
        window.open("https://www.instagram.com/aykdur...", "_blank", "noopener,noreferrer");
        setIsMenuOpen(false);
    };

    const buttonStyle = "flex items-center justify-center gap-2 px-5 py-2 rounded-full transition-all duration-300 cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700 font-bold font-sans text-sm shadow-sm hover:shadow-md active:scale-95";

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cyan-100 shadow-sm text-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => navigate("/")}>
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-sm border border-cyan-50">
                            <img src={logo} alt="Altınoluk MYO Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-cyan-900 leading-none">
                                ALTINOLUK <span className="text-cyan-600">MYO</span>
                            </h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Balıkesir Üniversitesi</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Sitede ara..."
                                className="font-sans bg-slate-100 border-none rounded-full py-2 px-4 pl-10 text-sm focus:ring-2 focus:ring-cyan-500/20 w-40 lg:w-56 transition-all outline-none"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button onClick={handleInstaClick} className="font-sans hidden sm:flex items-center text-slate-500 hover:text-cyan-600 font-bold text-sm px-3 cursor-pointer transition-colors">
                            İletişim
                        </button>

                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={buttonStyle}>
                                        <span className="truncate max-w-[120px] font-sans font-bold">Yönetici</span>
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div className={`absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl border border-cyan-50 rounded-2xl shadow-xl transition-all duration-300 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                                        <div className="p-2 space-y-1">
                                            <button onClick={() => { navigate("/admin"); setIsDropdownOpen(false); }} className="font-sans w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-colors">
                                                Admin Sayfasına Git
                                            </button>
                                            <hr className="border-cyan-50 mx-2" />
                                            <button onClick={handleLogout} className="font-sans w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => navigate("/giris")} className={buttonStyle}>
                                    Giriş Yap
                                </button>
                            )}
                        </div>

                        <button className="lg:hidden p-2 text-slate-600 hover:bg-cyan-50 rounded-lg transition-all" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <svg className={`w-7 h-7 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-white/95 border-b border-cyan-100 ${isMenuOpen ? "max-h-[600px] opacity-100 shadow-xl" : "max-h-0 opacity-0"}`}>
                <nav className="flex flex-col p-6 space-y-4">

                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Sitede ara..."
                            className="font-sans w-full bg-slate-100 border-none rounded-xl py-3 px-4 pl-11 text-sm focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <button onClick={handleInstaClick} className="font-sans text-left text-base font-bold text-slate-600 hover:text-cyan-600 px-4 py-2 hover:bg-cyan-50 rounded-xl transition-all">
                        İletişim
                    </button>

                    <div className="pt-4 border-t border-slate-100">
                        {isLoggedIn ? (
                            <div className="space-y-3">
                                <button onClick={() => { navigate("/admin"); setIsMenuOpen(false); }} className="font-sans w-full py-4 text-cyan-600 font-bold border border-cyan-100 rounded-2xl active:scale-95 transition-transform">Admin Sayfası</button>
                                <button onClick={handleLogout} className="font-sans w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold active:scale-95 transition-transform">Çıkış Yap</button>
                            </div>
                        ) : (
                            <button onClick={() => { navigate("/giris"); setIsMenuOpen(false); }} className="font-sans w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-cyan-200">Giriş Yap</button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}