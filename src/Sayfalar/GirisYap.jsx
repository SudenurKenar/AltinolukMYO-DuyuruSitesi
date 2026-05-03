import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react'; // İkonlar eklendi

export default function GirisYap() {
    const navigate = useNavigate();
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [sifre, setSifre] = useState('');

    // Bildirim Durumu
    const [status, setStatus] = useState({ type: '', message: '' });

    // Bildirimin 5 saniye sonra kendiliğinden kapanması
    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => setStatus({ type: '', message: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [status.message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' }); // Yeni girişte eski mesajı temizle

        try {
            const response = await fetch('http://localhost:5000/api/sktkadmin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: kullaniciAdi,
                    sifre: sifre
                }),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("userName", kullaniciAdi);

                setStatus({ type: 'success', message: 'Giriş başarılı, yönlendiriliyorsunuz...' });

                setTimeout(() => {
                    navigate("/");
                    window.location.reload();
                }, 1500); // Başarı mesajını görmeniz için kısa bir gecikme
            } else {
                setStatus({ type: 'error', message: data.message || "Giriş başarısız, bilgilerinizi kontrol edin!" });
            }
        } catch (error) {
            setStatus({ type: 'error', message: "Sunucuya bağlanılamadı, lütfen sonra tekrar deneyin." });
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-cyan-50/30 relative overflow-hidden">

            {/* TEPEDEN İNEN BİLDİRİM KUTUSU */}
            {status.message && (
                <div className="fixed top-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
                    <div className={`
                        pointer-events-auto
                        flex items-center gap-3 py-4 px-8 rounded-2xl shadow-2xl border
                        animate-in slide-in-from-top-full duration-500
                        ${status.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-100'}
                    `}>
                        {status.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-rose-500" />}
                        <span className="font-black tracking-tight">{status.message}</span>
                        <button onClick={() => setStatus({ type: '', message: '' })} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Arka Plan Animasyonları */}
            <div className="absolute top-1/4 -left-12 w-48 h-48 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-[blob_7s_infinite]"></div>
            <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-[blob_7s_infinite]" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md relative z-10 transform transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-8">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] p-10 overflow-hidden">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-cyan-900 tracking-tight mb-2">
                            Hoş <span className="text-cyan-600">Geldiniz</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Yönetici Bilgilerinizle Giriş Yapın
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1 group">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-4">Kullanıcı Adı</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={kullaniciAdi}
                                    onChange={(e) => setKullaniciAdi(e.target.value)}
                                    className="w-full bg-white/50 border border-cyan-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 placeholder:text-slate-300 font-medium"
                                    placeholder="Kullanıcı adınızı girin"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 group">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-4">Şifre</label>
                            <input
                                type="password"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                className="w-full bg-white/50 border border-cyan-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 placeholder:text-slate-300 font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-200 transform transition-all duration-300 active:scale-[0.98] hover:shadow-xl group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Güvenli Giriş
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                    Altınoluk Meslek Yüksekokulu <br />
                    <span className="text-cyan-600/60">Bilgisayar Programcılığı</span>
                </p>
            </div>
        </div>
    );
}