import React, { useState } from 'react';
import { Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Link } from 'react-router-dom';

const NavbarMobile = () => {
    const { businessData } = useConfig();
    const homeContent = businessData?.homeContent || {};
    const [isOpen, setIsOpen] = useState(false);

    const nombreComplejo = homeContent?.nombre || 'C. GIOVANNI';

    return (
        <nav className="fixed top-0 left-0 w-full z-[60] bg-[#070B14]/80 backdrop-blur-md border-b border-zinc-800 md:hidden">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* LADO IZQUIERDO: Nombre/Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {nombreComplejo.charAt(0)}
                    </div>
                    <span className="text-white font-black tracking-tighter text-sm uppercase italic">
                        {nombreComplejo}
                    </span>
                </div>

                {/* LADO DERECHO: Botón Admin Directo + Menú */}
                <div className="flex items-center gap-3">
                    {/* ACCESO RÁPIDO ADMIN (Visible siempre en móvil) */}
                    <Link
                        to="/login"
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-full border border-zinc-700 transition"
                        title="Acceso Admin"
                    >
                        <User size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                    </Link>

                    {/* BOTÓN MENÚ HAMBURGUESA */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white p-1"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* MENÚ DESPLEGABLE (OVERLAY) */}
            <div className={`fixed inset-0 top-16 bg-[#070B14] transition-transform duration-300 z-[55] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col p-8 space-y-8 h-full overflow-y-auto pb-32">
                    <div className="space-y-6">
                        <Link to="/home" onClick={() => setIsOpen(false)} className="block text-3xl font-black italic uppercase tracking-tighter text-white border-b border-zinc-900 pb-4">INICIO</Link>
                        <Link to="/booking-flow" onClick={() => setIsOpen(false)} className="block text-3xl font-black italic uppercase tracking-tighter text-white border-b border-zinc-900 pb-4">CANCHAS</Link>
                        <Link to="/menu" onClick={() => setIsOpen(false)} className="block text-3xl font-black italic uppercase tracking-tighter text-white border-b border-zinc-900 pb-4">BAR & MENÚ</Link>
                        <Link to="/avances" onClick={() => setIsOpen(false)} className="block text-3xl font-black italic uppercase tracking-tighter text-white border-b border-zinc-900 pb-4">MIS RESERVAS</Link>
                    </div>

                    {/* Botón Grande de Login dentro del menú */}
                    <div className="pt-4">
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-yellow-400 text-[#070B14] flex items-center justify-center gap-3 p-5 rounded-[24px] font-black uppercase text-lg italic tracking-tighter shadow-xl shadow-yellow-400/20"
                        >
                            <LayoutDashboard size={24} /> PANEL MAESTRO
                        </Link>
                    </div>

                    <div className="pt-8">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] text-center">
                            Complejo Giovanni © 2026
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarMobile;
