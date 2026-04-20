import React from 'react';

const OnayModali = ({ acikMi, kapat, onayla, baslik, mesaj, onayMetni = "Yine de Gönder", iptalMetni = "Geri Dön" }) => {
    if (!acikMi) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
                onClick={kapat}
            ></div>

            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {baslik || "Sistem Onayı"}
                    </h3>
                </div>

                <div className="p-8 text-center">
                    <p className="text-slate-600 font-medium leading-relaxed">
                        {mesaj}
                    </p>
                </div>

                <div className="flex border-t border-slate-100">
                    <button
                        onClick={kapat}
                        className="flex-1 px-6 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 border-r border-slate-100 transition-colors uppercase tracking-widest"
                    >
                        {iptalMetni}
                    </button>
                    <button
                        onClick={onayla}
                        className="flex-1 px-6 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest"
                    >
                        {onayMetni}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnayModali;