import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Baslik() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const sitesDropdownRef = useRef(null); // Siteler dropdown'ı için ref

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSitesOpen, setIsSitesOpen] = useState(false); // Siteler menüsü açık/kapalı state'i
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Sabit linkler için state
    const [dynamicLinks, setDynamicLinks] = useState({
        link1: "#", // İletişim
        link2: "#"  // Rapor Formatı
    });

    // Admin panelden girilen ve sırayla gelecek olan dinamik menü siteleri
    const [menuSites, setMenuSites] = useState([]);

    useEffect(() => {
        // Oturum kontrolü
        setIsLoggedIn(sessionStorage.getItem("isLoggedIn") === "true");

        // Backend'den güncel sabit linkleri çekme
        const fetchLinks = async () => {
            try {
                const response = await fetch('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/sktklinkler');
                if (response.ok) {
                    const data = await response.json();
                    setDynamicLinks({
                        link1: data.link1 || "#",
                        link2: data.link2 || "#"
                    });
                }
            } catch (error) {
                console.error("Linkler yüklenirken teknik bir aksaklık yaşandı:", error);
            }
        };

        // Admin panelden girilen dinamik menü elemanlarını çekme
        const fetchMenuSites = async () => {
            try {
                const response = await fetch('https://altinolukmyo.apps.srv.aykutdurgut.com.tr/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    // Backend zaten 'ORDER BY sira ASC' ile gönderiyor
                    setMenuSites(data);
                }
            } catch (error) {
                console.error("Menü siteleri çekilirken hata oluştu:", error);
            }
        };

        fetchLinks();
        fetchMenuSites();

        // Dışarı tıklayınca dropdown'ları kapatma sihirbazı
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
            if (sitesDropdownRef.current && !sitesDropdownRef.current.contains(e.target)) {
                setIsSitesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        setIsLoggedIn(false);
        navigate("/");
        window.location.reload();
    };

    // Stil Sabitleri
    const navItemStyle = "h-full px-4 flex items-center font-sans text-cyan-700 hover:text-white hover:bg-cyan-600 font-bold text-xs transition-all duration-300 cursor-pointer text-center";
    const dividerStyle = "w-[1px] h-4 bg-cyan-500/30 shrink-0";

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cyan-100 shadow-sm text-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo ve Üniversite Adı */}
                    <div
                        className="flex items-center gap-3 cursor-pointer shrink-0 group"
                        onClick={() => navigate("/")}
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-cyan-50 transition-all duration-500 ease-out group-hover:shadow-md group-hover:-translate-y-2 group-hover:border-cyan-200">
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-cyan-900 leading-none flex items-baseline gap-1">
                                <span>ALTINOLUK <span className="text-cyan-600">MYO</span></span>
                                <span className="text-[#1e3a5a] font-black">TK</span>
                            </h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                                Balıkesir Üniversitesi
                            </span>
                        </div>
                    </div>

                    {/* Masaüstü Navigasyon */}
                    <div className="flex items-center gap-4">
                        <nav className="hidden sm:flex items-center h-10 border-2 border-cyan-500/30 rounded-full bg-cyan-50/10 shadow-sm overflow-visible pr-2">
                            <button onClick={() => navigate("/OdevGonder")} className={navItemStyle}>Ödev Gönder</button>
                            <div className={dividerStyle}></div>

                            {/* Masaüstü "Siteler" Dropdown Butonu */}
                            <div className="relative h-full" ref={sitesDropdownRef}>
                                <button
                                    onClick={() => setIsSitesOpen(!isSitesOpen)}
                                    className={`${navItemStyle} gap-1 flex items-center`}
                                >
                                    <span>Siteler</span>
                                    <svg className={`w-3 h-3 transition-transform duration-300 ${isSitesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Siteler Açılır Pencere (Sadece Başlıklar Görünür, Sıralı) */}
                                <div className={`absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white border border-cyan-100 rounded-2xl shadow-xl transition-all origin-top ${isSitesOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                                        {menuSites.length > 0 ? (
                                            menuSites.map((site) => (
                                                <a
                                                    key={site.id}
                                                    href={site.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-xl transition-colors"
                                                    onClick={() => setIsSitesOpen(false)}
                                                >
                                                    {site.baslik}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="block px-4 py-2.5 text-xs text-slate-400 font-medium italic text-center">Site eklenmemiş</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={dividerStyle}></div>
                            <a href={dynamicLinks.link2} target="_blank" rel="noopener noreferrer" className={navItemStyle}>Rapor Formatı</a>
                            <div className={dividerStyle}></div>
                            <a href={dynamicLinks.link1} target="_blank" rel="noopener noreferrer" className={navItemStyle}>İletişim</a>
                        </nav>

                        {/* Yönetici Dropdown / Giriş Butonu */}
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="h-10 flex items-center justify-center px-5 rounded-full bg-cyan-600 text-white font-bold text-sm shadow-sm active:scale-95 gap-2"
                                    >
                                        <span>Yönetici</span>
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
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

                        {/* Mobil Menü Butonu (Burger) */}
                        <button
                            className="lg:hidden p-2 text-cyan-600 focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="relative w-7 h-7 flex items-center justify-center">
                                <svg
                                    className={`w-full h-full transition-all duration-500 ease-in-out transform ${isMenuOpen ? "rotate-180 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path d="M4 8h16M4 16h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <svg
                                    className={`absolute w-full h-full transition-all duration-500 ease-in-out transform ${isMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-180 opacity-0 scale-0"}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Menü İçeriği */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-md ${isMenuOpen ? "max-h-[650px] border-b border-cyan-100 opacity-100" : "max-h-0 opacity-0"}`}>
                <nav className="flex flex-col p-6 space-y-3">
                    <button
                        onClick={() => { navigate("/OdevGonder"); setIsMenuOpen(false); }}
                        className="flex items-center justify-between w-full bg-cyan-50 text-cyan-700 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-cyan-100 active:scale-95 transition-all shadow-sm"
                    >
                        Ödev Gönder
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>

                    {/* Mobil "Siteler" Butonu (linkmenu.jsx sayfasına yönlendirir) */}
                    <button
                        onClick={() => { navigate("/linkmenu"); setIsMenuOpen(false); }}
                        className="flex items-center gap-4 px-6 py-4 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all border border-transparent active:border-slate-100 text-left w-full"
                    >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        Siteler
                    </button>

                    <a href={dynamicLinks.link2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-6 py-4 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all border border-transparent active:border-slate-100">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        Rapor Formatı
                    </a>

                    <a href={dynamicLinks.link1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-6 py-4 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all border border-transparent active:border-slate-100">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        İletişim
                    </a>

                    <div className="pt-4 mt-2 border-t border-slate-50 space-y-3">
                        {isLoggedIn ? (
                            <>
                                <button onClick={() => { navigate("/admin"); setIsMenuOpen(false); }} className="w-full py-4 bg-cyan-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-cyan-100 active:scale-95 transition-all">Admin Sayfası</button>
                                <button onClick={handleLogout} className="w-full py-4 bg-rose-50 text-rose-500 font-bold text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all">Çıkış Yap</button>
                            </>
                        ) : (
                            <button onClick={() => { navigate("/giris"); setIsMenuOpen(false); }} className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-100 active:scale-95 transition-all">Giriş Yap</button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}