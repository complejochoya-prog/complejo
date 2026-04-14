import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import FinanceSummary from '../components/FinanceSummary';
import ProfitChart from '../components/ProfitChart';
import IncomeCard from '../components/IncomeCard';
import ExpenseCard from '../components/ExpenseCard';
import { 
    FileText, CreditCard, PieChart, TrendingUp, 
    ArrowRight, Plus, RefreshCw, Loader2 
} from 'lucide-react';

export default function FinanceDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { summary, expenses, loading, refresh } = useFinance(negocioId);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-4">
                        <TrendingUp size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                            Estado Financiero en Tiempo Real
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                        Finanzas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Giovanni</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 px-1">Control integral de ingresos, egresos y facturación</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={refresh}
                        className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => navigate(`/admin/finanzas/facturas`)}
                        className="bg-white text-slate-950 px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-all"
                    >
                        <FileText size={18} />
                        Facturación
                    </button>
                </div>
            </div>

            {/* Top Summaries */}
            {loading && !summary ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            ) : (
                <FinanceSummary summary={summary} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    <ProfitChart data={summary?.monthlyHistory} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Distribución de Ingresos</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {summary?.byArea.map((item, i) => (
                                <IncomeCard 
                                    key={i} 
                                    area={item.area} 
                                    amount={item.income} 
                                    trend={i === 0 ? 15 : i === 1 ? 8 : null} 
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Recent Expenses */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase italic tracking-wider text-white">Últimos Gastos</h3>
                            <button 
                                onClick={() => navigate('/admin/finanzas/gastos')}
                                className="text-red-400 text-[9px] font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                            >
                                Gestionar
                            </button>
                        </div>
                        <div className="p-6 space-y-4 flex-1">
                            {expenses.slice(0, 5).map(exp => (
                                <ExpenseCard key={exp.id} expense={exp} />
                            ))}
                        </div>
                        <div className="p-8 bg-slate-950/50">
                            <button 
                                onClick={() => navigate('/admin/finanzas/gastos')}
                                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all"
                            >
                                <Plus size={16} />
                                Cargar Gasto
                            </button>
                        </div>
                    </div>
                    
                    {/* area focus */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white space-y-4 shadow-2xl shadow-indigo-600/20">
                        <PieChart size={32} />
                        <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Reporte Mensual</h4>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-80 mt-1">Listo para descargar</p>
                        </div>
                        <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                            Exportar PDF <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
