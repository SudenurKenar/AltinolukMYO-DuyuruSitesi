import React, { useState, useEffect } from 'react';
import { User, Lock, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, X } from 'lucide-react';


const PasswordInput = ({ label, icon: Icon, value, onChange, show, setShow, placeholder, preventPaste = false, preventCopy = false }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
            <Icon size={14} className="text-cyan-500" />
            {label}
        </label>
        <div className="relative group">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onCopy={(e) => preventCopy && e.preventDefault()}
                onPaste={(e) => preventPaste && e.preventDefault()}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold text-slate-700"
                required
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors px-2"
            >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    </div>
);

export default function AdminProfil() {
    const [kullaniciData, setKullaniciData] = useState({ eskiAd: '', yeniAd: '', dogrulamaSifresi: '' });
    const [sifreData, setSifreData] = useState({ eskiSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [showSifreler, setShowSifreler] = useState({ dogrulama: false, eski: false, yeni: false, tekrar: false });

    // Tepeden inen mesajın 5 saniye sonra kendiliğinden kapanması için
    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => setStatus({ type: '', message: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [status.message]);

    const apiGonder = async (endpoint, body) => {
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`https://altinolukmyo.apps.srv.aykutdurgut.com.tr/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', message: data.message });
                if (endpoint === 'admin-ad-guncelle') setKullaniciData({ eskiAd: '', yeniAd: '', dogrulamaSifresi: '' });
                else setSifreData({ eskiSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
            } else {
                setStatus({ type: 'error', message: data.message });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Sunucuya ulaşılamadı!' });
        } finally {
            setLoading(false);
        }
    };

    const sifreGecerliMi = (sifre) => {
        const regex = /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\w\sÇĞİÖŞÜçğıöşü]).{8,}$/;
        return regex.test(sifre);
    };

    return (
        <div className="relative p-4 md:p-8 animate-in fade-in duration-700 max-w-5xl mx-auto space-y-8">

            {/* TEPEDEN İNEN MESAJ KUTUSU */}
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

            <div className="mb-4">
                <h1 className="text-3xl font-black text-cyan-900 flex items-center gap-3">
                    <ShieldCheck className="text-cyan-600" size={32} />
                    Güvenlik <span className="text-cyan-600">Yönetimi</span>
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Bilgilerinizi güncelleyebilirsiniz</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. KULLANICI ADI FORMU */}
                <form onSubmit={(e) => { e.preventDefault(); apiGonder('admin-ad-guncelle', kullaniciData); }} className="bg-white p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm space-y-6">
                    <h2 className="font-black text-cyan-800 text-base uppercase tracking-tighter border-b pb-3 border-cyan-50 flex items-center gap-2">
                        <User size={18} /> isim Değişimi
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-2">Mevcut Kullanıcı Adı</label>
                            <input type="text" value={kullaniciData.eskiAd} onChange={(e) => setKullaniciData({ ...kullaniciData, eskiAd: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-cyan-500 font-bold text-slate-700 transition-all" placeholder="Eski adınız" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-2 text-cyan-600">Yeni Kullanıcı Adı</label>
                            <input type="text" value={kullaniciData.yeniAd} onChange={(e) => setKullaniciData({ ...kullaniciData, yeniAd: e.target.value })} className="w-full bg-white border-2 border-cyan-100 rounded-2xl py-4 px-6 outline-none focus:border-cyan-500 font-bold text-slate-800 shadow-inner transition-all" placeholder="Yeni adınız" required />
                        </div>
                        <PasswordInput label="Onay Şifreniz" icon={KeyRound} value={kullaniciData.dogrulamaSifresi} onChange={(e) => setKullaniciData({ ...kullaniciData, dogrulamaSifresi: e.target.value })} show={showSifreler.dogrulama} setShow={(val) => setShowSifreler({ ...showSifreler, dogrulama: val })} placeholder="Onay için şifreniz" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-cyan-600 transition-all text-xs tracking-[0.2em] shadow-lg disabled:opacity-50">KİMLİĞİ GÜNCELLE</button>
                </form>

                {/* 2. ŞİFRE FORMU */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!sifreGecerliMi(sifreData.yeniSifre)) return setStatus({ type: 'error', message: 'Şifre en az 8 karakter, büyük-küçük harf, rakam ve sembol içermeli!' });
                    if (sifreData.yeniSifre !== sifreData.yeniSifreTekrar) return setStatus({ type: 'error', message: 'Yeni şifreler eşleşmiyor!' });
                    apiGonder('admin-sifre-guncelle', sifreData);
                }} className="bg-white p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm space-y-6">
                    <h2 className="font-black text-cyan-800 text-base uppercase tracking-tighter border-b pb-3 border-cyan-50 flex items-center gap-2">
                        <Lock size={18} /> Anahtar Değişimi
                    </h2>
                    <div className="space-y-4">
                        <PasswordInput label="Eski Şifre" icon={KeyRound} value={sifreData.eskiSifre} onChange={(e) => setSifreData({ ...sifreData, eskiSifre: e.target.value })} show={showSifreler.eski} setShow={(val) => setShowSifreler({ ...showSifreler, eski: val })} />
                        <div className="h-px bg-slate-50 w-full"></div>
                        <PasswordInput label="Yeni Şifre" icon={Lock} value={sifreData.yeniSifre} onChange={(e) => setSifreData({ ...sifreData, yeniSifre: e.target.value })} show={showSifreler.yeni} setShow={(val) => setShowSifreler({ ...showSifreler, yeni: val })} preventCopy={true} />
                        <PasswordInput label="Yeni Şifre (Tekrar)" icon={Lock} value={sifreData.yeniSifreTekrar} onChange={(e) => setSifreData({ ...sifreData, yeniSifreTekrar: e.target.value })} show={showSifreler.tekrar} setShow={(val) => setShowSifreler({ ...showSifreler, tekrar: val })} preventPaste={true} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white font-black py-4 rounded-2xl hover:bg-cyan-700 transition-all text-xs tracking-[0.2em] shadow-lg disabled:opacity-50">ANAHTARI GÜNCELLE</button>
                </form>
            </div>
        </div>
    );
}