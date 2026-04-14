import React, { useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession } from '../services/mozoService';
import { 
    Clock, 
    TrendingUp, 
    ShoppingCart, 
    Award, 
    CheckCircle2, 
    LayoutGrid,
    ChevronRight,
    Star
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MozoDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { orders } = useConfig();
    const mozo = getMozoSession();

    const stats = useMemo(() => {
        const myOrders = orders.filter(o => o.mozoId === mozo.id);
        const myRevenue = myOrders.filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.total || 0), 0);
        const pending = myOrders.filter(o => o.status !== 'paid').length;
        
        return {
            total: myOrders.length,
            revenue: myRevenue,
            pending,
            tables: new Set(myOrders.filter(o => o.status !== 'paid').map(o => o.table)).size
        };
    }, [orders, mozo.id]);

    const shiftTime = useMemo(() => {
        if (!mozo.shiftStart) return '0h 0m';
        const start = new Date(mozo.shiftStart);
        const now = new Date();
        const diff = Math.floor((now - start) / (1000 * 60)); // minutes
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m`;
    }, [mozo.shiftStart]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Header */}
            <div className="flex items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5">
                <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative">
                    <Award className="text-slate-950" size={32} />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-slate-950">
                        <CheckCircle2 size={14} className="text-slate-950" />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-1">Mozo Activo</p>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{mozo.name}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Clock size={12} className="text-slate-700" /> En turno hace: {shiftTime}
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Ventas Hoy</p>
                        <p className="text-2xl font-black italic tracking-tighter text-white">${stats.revenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pedidos Activos</p>
                        <p className="text-2xl font-black italic tracking-tighter text-white">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Acceso Rápido</h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate(`/${negocioId}/app/mozos/mesas`)}
                        className="w-full flex items-center justify-between p-6 bg-indigo-500 rounded-[30px] shadow-xl shadow-indigo-500/10 group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4 text-slate-950">
                            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                                <LayoutGrid size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-black uppercase tracking-widest">Ver Salón</p>
                                <p className="text-[10px] font-bold opacity-60">Gestionar mis {stats.tables} mesas</p>
                            </div>
                        </div>
                        <ChevronRight className="text-black/30 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={() => navigate(`/${negocioId}/app/mozos/cobrar`)}
                        className="w-full flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-[30px] hover:border-white/10 group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                <Award size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-black uppercase tracking-widest text-white">Cerrar Cuentas</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Procesar pagos y facturación</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-800 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Performance */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                        <Star size={18} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">Mi Calificación</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Basado en 24 reseñas</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black italic tracking-tighter text-indigo-400">4.9</p>
                </div>
            </div>
        </div>
    );
}
