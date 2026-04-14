import React, { useState, useEffect } from 'react';
import { CreditCard, History, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchPagosAdmin } from '../services/paymentService';

export default function PagosPage() {
    const { negocioId, config } = useConfig();
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        const loadPagos = async () => {
            try {
                const data = await fetchPagosAdmin(negocioId);
                setPagos(data);
            } catch (error) {
                console.error("Error fetching payments", error);
            } finally {
                setLoading(false);
            }
        };
        loadPagos();
    }, [negocioId]);

    const filteredPagos = pagos.filter(p => filter === 'todos' ? true : p.estado === filter);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const StatusBadge = ({ estado }) => {
        if (estado === 'pagado') {
            return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Pagado</span>;
        }
        if (estado === 'pendiente') {
            return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><Clock size={12}/> Pendiente</span>;
        }
        return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelado</span>;
    };

    // Calculate metrics
    const recibidos = pagos.filter(p => p.estado === 'pagado').reduce((acc, curr) => acc + curr.monto, 0);
    const pendientes = pagos.filter(p => p.estado === 'pendiente').reduce((acc, curr) => acc + curr.monto, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] flex items-center gap-4">
                        <CreditCard size={40} className="text-blue-500" />
                        Finanzas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Online</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Gestión de Pagos por MercadoPago
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-emerald-500/20 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
                    <History className="text-emerald-500/20 absolute -right-4 -bottom-4" size={100} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Total Recibido</p>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{formatCurrency(recibidos)}</p>
                </div>
                
                <div className="bg-slate-900 border border-amber-500/20 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
                    <Clock className="text-amber-500/20 absolute -right-4 -bottom-4" size={100} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Por Cobrar (Pendiente)</p>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{formatCurrency(pendientes)}</p>
                </div>

                <div className="bg-slate-900 border border-blue-500/20 rounded-[32px] p-8 shadow-xl flex flex-col justify-center gap-4">
                    <p className="text-[10px] items-center gap-2 font-black uppercase tracking-widest text-slate-400 flex">
                        <Filter size={14} /> Filtros Rápidos
                    </p>
                    <div className="flex gap-2">
                        {['todos', 'pagado', 'pendiente'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla Historial */}
            <div className="bg-slate-900 border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Historial de Transacciones</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, concepto..." 
                            className="bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white w-72" 
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-10">Fecha</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Concepto</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Monto</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        Cargando transacciones...
                                    </td>
                                </tr>
                            ) : filteredPagos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        No hay pagos que coincidan
                                    </td>
                                </tr>
                            ) : (
                                filteredPagos.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {new Date(p.fecha).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {new Date(p.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </td>
                                        <td className="p-6 text-sm font-bold">{p.cliente}</td>
                                        <td className="p-6">
                                            <p className="text-sm text-slate-300 font-bold">{p.concepto}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                                                ID: MP-{p.id.padStart(6, '0')}
                                            </p>
                                        </td>
                                        <td className="p-6 text-right font-black italic text-lg tracking-tighter text-white">
                                            {formatCurrency(p.monto)}
                                        </td>
                                        <td className="p-6 flex justify-center">
                                            <StatusBadge estado={p.estado} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
