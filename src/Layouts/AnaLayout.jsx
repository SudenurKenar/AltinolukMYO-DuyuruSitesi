import React, { useEffect } from 'react';
import Baslik from '../Components/Baslik';
import AltBilgi from '../Components/AltBilgi';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export default function AnaLayout({ children }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        /* w-full ve overflow-x-hidden: Sitenin sağa doğru taşmasını kesin olarak önler */
        <div className="flex flex-col min-h-screen font-serif text-[#5d4037] w-full overflow-x-hidden bg-slate-50">

            <Toaster
                position="top-center"
                toastOptions={{ className: 'font-bold text-sm rounded-xl shadow-lg' }}
            />

            <Baslik />
            <main className="flex-grow">
                {children}
            </main>
            <AltBilgi />
        </div>
    )
}