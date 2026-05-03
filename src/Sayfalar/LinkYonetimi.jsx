import React, { useState, useEffect } from 'react';
import { Save, Link2, Globe, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function LinkYonetimi() {
    const [links, setLinks] = useState({ link1: '', link2: '' });
    const [loading, setLoading] = useState(true); // Sayfa açılış yüklemesi
    const [isSaving, setIsSaving] = useState(false); // Kaydetme işlemi yüklemesi
    const [status, setStatus] = useState({ type: '', message: '' });

    // Mevcut linkleri veritabanından çekelim
    useEffect(() => {
        const fetchCurrentLinks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sktklinkler');
                if (response.ok) {
                    const data = await response.json();
                    setLinks({
                        link1: data.link1 || '',
                        link2: data.link2 || ''
                    });
                }
            } catch (error) {
                console.error("Linkler yüklenemedi:", error);
                setStatus({ type: 'error', message: 'Mevcut linkler sunucudan alınamadı.' });
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentLinks();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('http://localhost:5000/api/sktklinkler-guncelle', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(links)
            });

            const result = await response.json();

            if (result.success) {
                setStatus({ type: 'success', message: 'Linkler başarıyla güncellendi.' });
            } else {
                setStatus({ type: 'error', message: result.message || 'Bir hata oluştu.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Sunucuyla bağlantı kurulamadı.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Linkler Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-3xl mx-auto">
                {/* Başlık Bölümü */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-cyan-900 flex items-center gap-3">
                        <Link2 className="text-cyan-600" size={32} />
                        Link <span className="text-cyan-600">Yönetimi</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Ana sayfadaki hızlı erişim butonlarının yönlendireceği adresleri buradan yönetin.
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">

                        {/* İletişim Linki Kartı */}
                        <div className="group bg-white p-6 rounded-[2rem] border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">
                                <Globe size={14} className="text-cyan-500" />
                                İletişim Butonu (Link 1)
                            </label>
                            <input
                                type="url"
                                value={links.link1}
                                onChange={(e) => setLinks({ ...links, link1: e.target.value })}
                                placeholder="https://instagram.com/kullaniciadi"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                required
                            />
                        </div>

                        {/* Rapor Formatı Linki Kartı */}
                        <div className="group bg-white p-6 rounded-[2rem] border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">
                                <Globe size={14} className="text-cyan-500" />
                                Rapor Formatı (Link 2)
                            </label>
                            <input
                                type="url"
                                value={links.link2}
                                onChange={(e) => setLinks({ ...links, link2: e.target.value })}
                                placeholder="https://docs.google.com/..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Durum Mesajları */}
                    {status.message && (
                        <div className={`flex items-center gap-3 p-5 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-300 ${status.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {status.message}
                        </div>
                    )}

                    {/* Kaydet Butonu */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-black py-5 rounded-[2rem] shadow-lg shadow-cyan-100 transform transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <span className="flex items-center justify-center gap-3 tracking-[0.1em]">
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                            )}
                            {isSaving ? "GÜNCELLENİYOR..." : "DEĞİŞİKLİKLERİ YAYINLA"}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}