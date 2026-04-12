import React from 'react';
import { useNavigate } from "react-router-dom";

export default function AltBilgi() {
    const navigate = useNavigate();

    return (
        <footer className="bg-white/80 backdrop-blur-lg border-t border-cyan-100 shadow-sm text-slate-700">
            <div className="mt-1 pt-2  text-center pb-5">
                <p className="text-[10px] font-black tracking-[0.5em] uppercase text-cyan-900/40">
                    &copy; 2026 ALTINOLUK-MYO
                </p>
            </div>
        </footer>
    );
}