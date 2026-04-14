import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Database,
    Users,
    ShoppingCart,
    ChefHat,
    Bell,
    Calendar,
    ShieldAlert,
    History,
    Search
} from 'lucide-react';
import { useHealthCheck } from '../../../hooks/useHealthCheck';
import { useConfig } from '../hooks/useConfig';
import { db } from '../../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function AdminHealthCheck() {
    const { isChecking, lastReport, runFullCheck } = useHealthCheck();
    const { negocioId } = useConfig();
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (!negocioId) return;
        const q = query(collection(db, 'negocios', negocioId, 'system_logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setLogs(list);
        });
        return () => unsubscribe();
    }, [negocioId]);

    const handleManualTest = async () => {
        try {
            await runFullCheck();
        } catch (error) {
            console.error("Manual test failed:", error);
        }
    };

    const StatusCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-${color}-500/10 text-${color}-500 uppercase tracking-widest`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 pb-24 lg:p-12 min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gold/10 text-gold">
                            <Activity size={20} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Estado del Sistema</h1>
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest italic leading-relaxed">
                        Diagnóstico en tiempo real y autocorreció́n de componentes.
                    </p>
                </div>
                <button
                    onClick={handleManualTest}
                    disabled={isChecking}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-all
                        ${isChecking
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gold text-slate-950 shadow-lg shadow-gold/20 hover:scale-105 active:scale-95'
                        }`}
                >
                    {isChecking ? <RefreshCw className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
                    {isChecking ? 'Ejecutando Diagnóstico...' : 'Test Completo del Sistema'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatusCard
                    title="Salud General"
                    value={lastReport ? `${lastReport.stability}%` : '--'}
                    icon={Activity}
                    color={lastReport?.status === 'OK' ? 'green' : 'red'}
                    trend={lastReport?.status || 'N/A'}
                />
                <StatusCard
                    title="Productos Revisados"
                    value={lastReport?.productsReviewed || '0'}
                    icon={Database}
                    color="blue"
                />
                <StatusCard
                    title="Pedidos Activos"
                    value={lastReport?.activeOrders || '0'}
                    icon={ShoppingCart}
                    color="purple"
                />
                <StatusCard
                    title="Errores Corregidos"
                    value={lastReport?.errorsCorrected || '0'}
                    icon={CheckCircle2}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Detailed Status */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gold" />
                        Puntos de Control
                    </h2>

                    {[
                        { label: 'Productos y Precios', icon: Database },
                        { label: 'Sincronización Menú', icon: RefreshCw },
                        { label: 'Pedidos y Estados', icon: ShoppingCart },
                        { label: 'Gestión Personal', icon: Users },
                        { label: 'Control de Stock', icon: ShieldAlert },
                        { label: 'Pantalla Cocina', icon: ChefHat },
                        { label: 'Servicio Notificaciones', icon: Bell },
                        { label: 'Reservas y Conflictos', icon: Calendar },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                    <item.icon size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-green-500 italic">Verificado</span>
                                <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Logs */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                            <History size={16} className="text-gold" />
                            Registro de Autocorrección
                        </h2>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filtrar eventos..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:border-gold outline-none transition-all w-48"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {logs.filter(log => log.message.toLowerCase().includes(filter.toLowerCase())).map((log) => (
                            <div key={log.id} className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${log.errorsCorrected > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <Activity size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-200">{log.message}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            {log.timestamp?.toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-1 rounded-full bg-blue-500"></div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rev: {log.productsReviewed}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-1 rounded-full bg-orange-500"></div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Corr: {log.errorsCorrected}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-1 rounded-full bg-red-500"></div>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Adv: {log.warnings}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="text-center py-20 bg-slate-900/30 rounded-[2rem] border border-dashed border-white/10">
                                <History size={48} className="mx-auto text-slate-800 mb-4" />
                                <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em]">No hay registros disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Final Diagnostic Alert (if test finished) */}
            {lastReport && !isChecking && (
                <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-8 duration-500 bg-slate-900 border border-gold/30 rounded-2xl p-6 shadow-2xl max-w-sm z-[1000] border-l-4 border-l-gold">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gold/10 text-gold">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-white font-black uppercase tracking-widest text-xs mb-1">Diagnóstico Finalizado</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic mb-3 leading-relaxed">
                                El sistema ha sido verificado. {lastReport.errorsCorrected} errores auto-corregidos.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">ESTABILIDAD</p>
                                    <p className="text-sm font-black text-white">{lastReport.stability}%</p>
                                </div>
                                <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">ESTADO</p>
                                    <p className={`text-sm font-black ${lastReport.status === 'OK' ? 'text-green-500' : 'text-red-500'}`}>{lastReport.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
