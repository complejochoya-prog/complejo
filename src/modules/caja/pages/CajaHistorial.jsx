import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSessionsHistory } from '../services/cajaService';
import {
    ArrowLeft,
    Archive,
    Lock,
    Loader2,
    Clock,
    User,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Banknote,
    CreditCard,
    Smartphone,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

function formatDate(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
}

function formatTime(isoStr) {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export default function CajaHistorial() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await fetchSessionsHistory();
                setSessions(data);
            } catch (err) {
                console.error('Error loading sessions history:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/${negocioId}/caja`)}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl">
                            <Archive size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                                Historial de Cajas
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                                Registro de turnos cerrados
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700 border border-white/5">
                        <Archive size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                            Sin historial
                        </h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm">
                            Aún no se han cerrado cajas. Al cerrar un turno se generará un registro aquí.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((s) => {
                        const isExpanded = expandedId === s.id;
                        const diff = s.diferencia || 0;

                        return (
                            <div
                                key={s.id}
                                className="bg-slate-900/60 border border-white/[0.04] rounded-3xl overflow-hidden hover:border-white/[0.08] transition-all"
                            >
                                {/* Summary Row */}
                                <button
                                    onClick={() => toggleExpand(s.id)}
                                    className="w-full p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
                                            <Lock size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                                    Turno {formatDate(s.openedAt)}
                                                </h3>
                                                <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
                                                    Cerrada
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatTime(s.openedAt)} → {formatTime(s.closedAt)}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                                    <User size={10} />
                                                    {s.openedBy}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                                Saldo Final
                                            </p>
                                            <p className="text-xl font-black text-white italic tracking-tighter">
                                                ${(s.finalBalance || 0).toLocaleString('es-AR')}
                                            </p>
                                        </div>
                                        <div>
                                            {isExpanded ? (
                                                <ChevronUp size={18} className="text-slate-500" />
                                            ) : (
                                                <ChevronDown size={18} className="text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top duration-200">
                                        <div className="border-t border-white/5 pt-5 space-y-4">
                                            {/* Financial Summary */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/[0.03]">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">
                                                        Saldo Inicial
                                                    </p>
                                                    <p className="text-lg font-black text-white italic tracking-tighter">
                                                        ${(s.initialBalance || 0).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <div className="bg-emerald-500/[0.04] rounded-2xl p-4 border border-emerald-500/10">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1 flex items-center gap-1">
                                                        <TrendingUp size={10} /> Ingresos
                                                    </p>
                                                    <p className="text-lg font-black text-emerald-400 italic tracking-tighter">
                                                        ${(s.totalIngresos || 0).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <div className="bg-rose-500/[0.04] rounded-2xl p-4 border border-rose-500/10">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1 flex items-center gap-1">
                                                        <TrendingDown size={10} /> Egresos
                                                    </p>
                                                    <p className="text-lg font-black text-rose-400 italic tracking-tighter">
                                                        ${(s.totalEgresos || 0).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/[0.03]">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1 flex items-center gap-1">
                                                        <DollarSign size={10} /> Diferencia
                                                    </p>
                                                    <p
                                                        className={`text-lg font-black italic tracking-tighter ${
                                                            diff < 0
                                                                ? 'text-rose-400'
                                                                : diff > 0
                                                                ? 'text-emerald-400'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {diff > 0 ? '+' : ''}${diff.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Method Breakdown */}
                                            {s.desglose && (
                                                <div className="bg-slate-950/30 rounded-2xl p-4 border border-white/[0.03]">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">
                                                        Desglose por Método de Pago
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Banknote size={14} className="text-emerald-500" />
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                                                                    Efectivo
                                                                </p>
                                                                <p className="text-sm font-black text-emerald-400 italic tracking-tighter">
                                                                    ${(s.desglose.efectivo || 0).toLocaleString('es-AR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard size={14} className="text-blue-500" />
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                                                                    Transfer
                                                                </p>
                                                                <p className="text-sm font-black text-blue-400 italic tracking-tighter">
                                                                    ${(s.desglose.transferencia || 0).toLocaleString('es-AR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Smartphone size={14} className="text-sky-500" />
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                                                                    MP
                                                                </p>
                                                                <p className="text-sm font-black text-sky-400 italic tracking-tighter">
                                                                    ${(s.desglose.mercadopago || 0).toLocaleString('es-AR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
