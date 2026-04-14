import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Maximize, Minimize } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function TVLayout() {
    const { config } = useConfig();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter relative overflow-hidden flex flex-col">
            {/* Header MODO TV oculta si está en fullscreen completo, pero dejémosla visible de forma minimalista */}
            <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white/50">{config?.nombre || 'Complejo'}</h1>
                </div>
                <button 
                    onClick={toggleFullscreen}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md pointer-events-auto transition-all shadow-xl group"
                >
                    {isFullscreen ? <Minimize size={24} className="group-hover:scale-90 transition-transform" /> : <Maximize size={24} className="group-hover:scale-110 transition-transform" />}
                </button>
            </header>

            {/* Contenido */}
            <main className="flex-1 w-full h-full pt-20">
                <Outlet />
            </main>
        </div>
    );
}
