import React, { useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { getMozoSession } from '../services/mozoService';
import { 
    Clock, 
    TrendingUp, 
    ShoppingCart, 
    Award, 
    CheckCircle2, 
    LayoutGrid,
    ChevronRight,
    Star,
    Utensils,
    Coffee
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MozoDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { orders } = usePedidos();
    const mozo = getMozoSession();

    const stats = useMemo(() => {
        const myOrders = orders?.filter(o => o.mozoId === mozo.id) || [];
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
        const diff = Math.floor((now - start) / (1000 * 60)); 
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m`;
    }, [mozo.shiftStart]);

    const handleNavigate = (path) => {
        if ('vibrate' in navigator) navigator.vibrate(30);
        navigate(`/${negocioId}/app/mozos/${path}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            {/* Profile Header Block */}
            <div className="relative overflow-hidden bg-white/[0.02] p-6 rounded-[32px] border border-white/5 backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Utensils size={100} />
                </div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[24px] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            <Award className="text-amber-950" size={32} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-[#0c0a09] shadow-lg">
                            <CheckCircle2 size={14} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 w-max mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-[9px] text-amber-400 font-black uppercase tracking-[0.2em]">Servicio Activo</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-white">{mozo.name}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-500" /> Turno iniciado: <span className="text-white">{shiftTime}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] backdrop-blur-md p-5 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <TrendingUp size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Caja Propia</p>
                        <p className="text-xl font-black uppercase tracking-tight text-white">${stats.revenue.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="bg-white/[0.02] backdrop-blur-md p-5 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 mb-3 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        <ShoppingCart size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Órdenes Activas</p>
                        <p className="text-xl font-black uppercase tracking-tight text-white">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Command Center */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-white/10"></span> Terminal de Comandos
                </h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => handleNavigate('mesas')}
                        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-[28px] shadow-lg shadow-amber-500/5 group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4 text-amber-50">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                                <LayoutGrid size={22} />
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black uppercase tracking-widest text-amber-400">Mapa de Salón</p>
                                <p className="text-[10px] items-center text-amber-500/60 font-bold uppercase tracking-wider mt-0.5">Control sobre {stats.tables} mesas</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:translate-x-1 group-hover:bg-amber-500/20 transition-all">
                            <ChevronRight size={18} />
                        </div>
                    </button>

                    <button 
                        onClick={() => handleNavigate('cobrar')}
                        className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-[28px] hover:border-white/10 group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Coffee size={22} />
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black uppercase tracking-widest text-white">Centro de Cobros</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Facturar consumos de mesa</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Performance Widget */}
            <div className="bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 p-5 rounded-[24px] flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Star size={18} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-amber-100 uppercase tracking-widest leading-none mb-1">Rendimiento</p>
                        <p className="text-[9px] text-amber-500/60 font-bold uppercase tracking-[0.2em]">Basado en 42 mesas</p>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <p className="text-2xl font-black uppercase tracking-tight text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">4.9</p>
                </div>
            </div>
        </div>
    );
}
