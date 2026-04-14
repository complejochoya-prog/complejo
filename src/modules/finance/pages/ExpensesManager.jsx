import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import ExpenseCard from '../components/ExpenseCard';
import { ChevronLeft, Plus, Search, Filter, ArrowDownRight, TrendingDown } from 'lucide-react';

export default function ExpensesManager() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { expenses, loading } = useFinance(negocioId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver al Dashboard Financiero
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 border border-white/5 p-10 rounded-[48px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <TrendingDown size={120} />
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-red-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-red-600/30">
                        <ArrowDownRight size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                            Gestión de <span className="text-red-400">Gastos</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Control de egresos, proveedores y servicios</p>
                    </div>
                </div>

                <div className="z-10">
                    <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                        <Plus size={18} />
                        Registrar Gasto
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                 <div className="col-span-1 sm:col-span-3 bg-slate-900 border border-white/5 rounded-[32px] p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar gasto por concepto o categoría..." 
                            className="w-full bg-slate-950 border border-white/5 rounded-[20px] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-white placeholder:text-slate-600"
                        />
                    </div>
                    <button className="bg-slate-950 border border-white/5 px-6 py-4 rounded-[20px] flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                        <Filter size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filtrar</span>
                    </button>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] text-center">
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-widest block mb-1">Total Gastos Mes</span>
                    <span className="text-xl font-black italic text-white">$450.000</span>
                </div>
            </div>

            {/* Expenses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expenses.map(exp => (
                    <ExpenseCard key={exp.id} expense={exp} />
                 ))}
            </div>

            {expenses.length === 0 && !loading && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">No se encontraron gastos</span>
                </div>
            )}
        </div>
    );
}
