import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import APanel from '../Components/APanel';
import AltBilgi from '../Components/AltBilgi';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    // Masaüstünde varsayılan olarak açık (true) başlasın.
    const [panelAcik, setPanelAcik] = useState(true);

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");

        if (!isLoggedIn) {
            navigate("/giris", { replace: true });
        } else {
            setIsChecking(false);
        }
    }, [navigate]);

    if (isChecking) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'font-bold text-sm rounded-xl shadow-lg',
                    duration: 3000,
                }}
            />

            {/* Yan Menü - Durumu ve değiştirme yetkisini menüye iletiyoruz */}
            <APanel panelAcik={panelAcik} setPanelAcik={setPanelAcik} />

            {/* Ana İçerik Alanı - Panel daraldığında flex-1 sayesinde otomatik olarak ekranı kaplayıp ortalar */}
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar w-full transition-all duration-500 ease-in-out">
                <main className="flex-1 p-4 sm:p-6 md:p-10">
                    <Outlet />
                </main>
                <AltBilgi />
            </div>
        </div>
    );
}