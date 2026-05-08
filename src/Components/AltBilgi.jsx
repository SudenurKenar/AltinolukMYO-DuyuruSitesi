import React from 'react';
import { useNavigate } from "react-router-dom";

export default function AltBilgi() {
    const navigate = useNavigate();

    return (
        <footer className="relative bg-white/80 backdrop-blur-lg border-t border-cyan-100 shadow-sm text-slate-700">
            <div className="mt-1 pt-2 text-center pb-5">
                <p className="text-[10px] font-black tracking-[0.5em] uppercase text-cyan-900/40 select-none">
                    &copy; 2026 SUDENUR KENAR
                </p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto select-text">
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="mt-8 text-[2px] cursor-default selection:bg-cyan-600 selection:text-white"
                    style={{
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        color: 'rgba(255, 255, 255, 0.01)',
                        textDecoration: 'none'
                    }}
                >
                    Aykut Durgut altınoluk meslek yüksekokulu altınoluk myo bilgisayar programcılığı ayk dur
                </a>
            </div>
        </footer>
    );
}