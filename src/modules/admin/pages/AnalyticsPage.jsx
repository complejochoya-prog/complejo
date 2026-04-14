import React, { useState, useEffect } from 'react';
import { 
    BrainCircuit, TrendingUp, CalendarDays, DollarSign, 
    ShoppingCart, Clock, AlertTriangle, Lightbulb, Activity, Target, Zap, Star
} from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchAnalytics } from '../services/analyticsService';

export default function AnalyticsPage() {
    const { negocioId } = useConfig();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(30);

    useEffect(() => {
        loadAnalytics();
    }, [negocioId, range]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const result = await fetchAnalytics(negocioId, range);
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const { resumen, graficos, recomendaciones, alertas } = data;

    const renderIcon = (name) => {
        switch (name) {
            case 'clock': return <Clock size={16} />;
            case 'shopping': return <ShoppingCart size={16} />;
            case 'target': return <Target size={16} />;
            case 'zap': return <Zap size={16} />;
            case 'star': return <Star size={16} />;
            default: return <Lightbulb size={16} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Inteligencia</span> Artificial
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Análisis predictivo del Complejo
                    </p>
                </div>
                
                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setRange(days)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                range === days 
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {days} Días
                        </button>
                    ))}
                </div>
            </div>

            {/* Alertas */}
            {alertas?.length > 0 && (
                <div className="flex flex-col gap-3">
                    {alertas.map(a => (
                        <div key={a.id} className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-[20px]">
                            <AlertTriangle size={20} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">{a.texto}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Resumen del Día */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 text-center hover:bg-emerald-500/5 transition-colors">
                    <CalendarDays size={24} className="mx-auto mb-3 text-emerald-400" />
                    <p className="text-4xl font-black italic tracking-tighter text-white">{resumen.reservas_totales}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Reservas</p>
                </div>
                
                <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 text-center hover:bg-emerald-500/5 transition-colors">
                    <DollarSign size={24} className="mx-auto mb-3 text-emerald-400" />
                    <p className="text-4xl font-black italic tracking-tighter text-emerald-400">${resumen.ventas_bar.toLocaleString('es-AR')}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Ventas Bar</p>
                </div>
                
                <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 text-center hover:bg-emerald-500/5 transition-colors">
                    <TrendingUp size={24} className="mx-auto mb-3 text-cyan-400" />
                    <p className="text-2xl font-black italic tracking-tighter text-white mt-2 leading-none">{resumen.horaPico}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Hora Pico</p>
                </div>
                
                <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 text-center hover:bg-emerald-500/5 transition-colors">
                    <BrainCircuit size={24} className="mx-auto mb-3 text-fuchsia-400" />
                    <p className="text-[14px] font-black uppercase tracking-tighter text-white mt-1 leading-tight line-clamp-2">{resumen.producto_top}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Producto Top</p>
                </div>
            </div>

            {/* Two Column Layout for Graph & IA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    {/* Simulated Graph (Ocupación Semanal) */}
                    <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-xl">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white mb-8">
                            <Activity size={18} className="text-cyan-400" />
                            Ocupación Semanal
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-2 mt-auto">
                            {graficos.ocupacion.map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                    <span className="text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">{val}%</span>
                                    <div 
                                        className="w-full bg-gradient-to-t from-emerald-600/20 to-cyan-400 rounded-xl relative overflow-hidden transition-all duration-1000 group-hover:from-emerald-500/40 group-hover:to-cyan-300"
                                        style={{ height: `${val}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{graficos.dias[idx]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ventas del Bar */}
                        <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-xl flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white mb-8">
                                <DollarSign size={18} className="text-fuchsia-400" />
                                Ingresos Mensuales
                            </h3>
                            <div className="flex-1 flex items-end justify-between gap-2 mt-auto h-32">
                                {graficos.ingresos_mensuales.map((val, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div 
                                            className="w-full bg-gradient-to-t from-fuchsia-600/20 to-fuchsia-400 rounded-t-xl"
                                            style={{ height: `${(val / 5) * 100}%` }}
                                        />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{graficos.meses[idx]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ranking Productos */}
                        <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-xl flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white mb-8">
                                <Star size={18} className="text-amber-400" />
                                Ranking Productos
                            </h3>
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                                {graficos.ranking_productos.map((prod, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            <span>{prod.nombre || prod.edit}</span>
                                            <span className="text-amber-400">{prod.qty} uds</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full" 
                                                style={{ width: `${(prod.qty / 300) * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recomendaciones / IA Engine */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-[40px] p-8 shadow-2xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BrainCircuit size={120} />
                    </div>
                    
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-emerald-400 mb-8 relative z-10">
                        <Lightbulb size={18} className="text-emerald-400" />
                        Motor Cognitivo
                    </h3>
                    
                    <div className="space-y-4 relative z-10 overflow-y-auto pr-2">
                        {recomendaciones.map((rec) => (
                            <div 
                                key={rec.id} 
                                className={`p-5 rounded-3xl border transition-all ${
                                    rec.tipo === 'sugerencia' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                                    : 'bg-white/5 border-white/5'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 p-2 rounded-xl ${
                                        rec.tipo === 'sugerencia' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/70'
                                    }`}>
                                        {renderIcon(rec.icon)}
                                    </div>
                                    <div>
                                        {rec.tipo === 'sugerencia' && (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Acción Recomendada</span>
                                        )}
                                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-wider">{rec.texto}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
