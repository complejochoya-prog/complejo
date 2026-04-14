import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import { ChevronLeft, FileText, Download, Search, Plus, Printer, Mail } from 'lucide-react';

export default function InvoicesManager() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { invoices, loading } = useFinance(negocioId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver a Finanzas
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 border border-white/5 p-10 rounded-[48px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <FileText size={120} />
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30">
                        <FileText size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                            Módulo de <span className="text-emerald-400">Facturación</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Control de comprobantes e impuestos</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 z-10">
                    <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                        <Plus size={18} />
                        Nueva Factura
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="text-sm font-black uppercase italic tracking-wider text-white">Comprobantes Emitidos</h3>
                    <div className="relative w-full sm:w-64">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                         <input 
                            type="text" 
                            placeholder="Buscar factura..." 
                            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[10px] focus:outline-none focus:border-indigo-500 transition-colors text-white uppercase font-black tracking-widest"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">ID</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Fecha</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Monto</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Estado</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 font-mono">{invoice.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-tight text-white">{invoice.client}</span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{invoice.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoice.date}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black italic text-emerald-400">${invoice.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Autorizada</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2.5 rounded-xl bg-slate-950 text-slate-500 hover:text-indigo-400 transition-colors border border-white/5">
                                                <Printer size={14} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-slate-950 text-slate-500 hover:text-indigo-400 transition-colors border border-white/5">
                                                <Mail size={14} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-slate-950 text-slate-500 hover:text-emerald-400 transition-colors border border-white/5">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
