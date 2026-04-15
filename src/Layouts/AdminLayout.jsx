import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import APanel from '../Components/APanel';
import AltBilgi from '../Components/AltBilgi';

export default function AdminLayout() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true); // Kontrol ediliyor mu?

    useEffect(() => {
        // sessionStorage kontrolü yapıyoruz
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");

        if (!isLoggedIn) {
            // Giriş yoksa anında yönlendir ve kontrolü bitirme (sayfa render olmasın)
            navigate("/giris", { replace: true });
        } else {
            // Giriş varsa yükleme durumunu kapat ve içeriği göster
            setIsChecking(false);
        }
    }, [navigate]);

    if (isChecking) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'font-bold text-sm rounded-xl shadow-lg',
                    duration: 3000,
                }}
            />

            <APanel />
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                <main className="flex-1 p-6 md:p-10">
                    <Outlet />
                </main>
                <AltBilgi />
            </div>
        </div>
    );
}