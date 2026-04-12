import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import APanel from '../Components/APanel';
import AltBilgi from '../Components/AltBilgi';

export default function AdminLayout() {
    const navigate = useNavigate();

    // Güvenlik Duvarı: Oturum kontrolü ana iskelette yapılıyor
    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            navigate("/giris");
        }
    }, [navigate]);

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