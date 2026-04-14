import React from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { ChefHat, Bike, PersonStanding, ChevronLeft } from 'lucide-react';

export default function AppLayout() {
    const { negocioId } = useParams();
    const location = useLocation();

    const getTitle = () => {
        if (location.pathname.includes('mozo')) return 'App Mozos';
        if (location.pathname.includes('delivery')) return 'Logística Delivery';
        if (location.pathname.includes('cocina')) return 'Gestión Cocina';
        return 'App Interna';
    };

    const getIcon = () => {
        if (location.pathname.includes('mozo')) return PersonStanding;
        if (location.pathname.includes('delivery')) return Bike;
        if (location.pathname.includes('cocina')) return ChefHat;
        return ChefHat;
    };

    const Icon = getIcon();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col">
            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to={`/${negocioId}`} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Icon size={16} className="text-blue-400" />
                        </div>
                        <h1 className="text-xs font-black uppercase tracking-[0.2em]">{getTitle()}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">En Línea</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
