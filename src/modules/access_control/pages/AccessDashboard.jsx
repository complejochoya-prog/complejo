import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, Shield, User, History, 
    ArrowRight, Activity, Zap, CheckCircle 
} from 'lucide-react';
import { useAccessControl } from '../hooks/useAccessControl';
import EmployeeNavbar from '../../employee_app/components/EmployeeNavbar';
import { useEmployeeAuth } from '../../employee_app/hooks/useEmployeeAuth';

export default function AccessDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { logs, loading: logsLoading } = useAccessControl(negocioId);
    const { employeeUser, logout, loading: authLoading } = useEmployeeAuth(negocioId);

    if (authLoading) return null;
    if (!employeeUser) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            <EmployeeNavbar roleName="Control de Accesos" onLogout={logout} />

            <div className="flex-1 p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
                {/* Header Acciones */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                            Panel de <span className="text-indigo-400">Accesos</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 px-1">Monitoreo de entradas y salidas en tiempo real</p>
                    </div>

                    <button 
                        onClick={() => navigate(`/${negocioId}/empleados/checkin`)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                    >
                        <Zap size={18} fill="currentColor" />
                        Abrir Escáner QR
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 block">En Cancha</span>
                            <span className="text-2xl font-black italic text-white">12 Personas</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                            <History size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 block">Ingresos Hoy</span>
                            <span className="text-2xl font-black italic text-white">48</span>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-indigo-600/20 p-6 rounded-[32px] flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CheckCircle size={60} />
                        </div>
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Zap size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 block">IOT Cerraduras</span>
                            <span className="text-lg font-black italic text-indigo-400 uppercase">En Línea</span>
                        </div>
                    </div>
                </div>

                {/* Historial Logs */}
                <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
                            Ultima Actividad por Puerta
                        </h3>
                    </div>

                    <div className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <div key={log.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        log.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                        <ArrowRight size={18} className={log.tipo === 'egreso' ? 'rotate-180' : ''} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black uppercase italic tracking-tighter text-white">{log.cliente}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            {log.cancha} <span className="text-[8px] opacity-30">•</span> {new Date(log.hora).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                    log.tipo === 'ingreso' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                }`}>
                                    {log.tipo}
                                </span>
                            </div>
                        ))}
                    </div>

                    {logs.length === 0 && (
                        <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                            No hay actividad registrada el día de hoy.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
