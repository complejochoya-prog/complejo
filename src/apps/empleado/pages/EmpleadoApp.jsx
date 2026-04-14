import React, { useState } from 'react';
import { Clock, CheckCircle2, ListTodo, BarChart3, CalendarDays, LogOut } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useAuth } from '../../../context/AuthContext';

export default function EmpleadoApp() {
    const { config } = useConfig();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('turnos');

    const turnos = [
        { dia: 'Lunes', horario: '08:00 - 16:00', estado: 'completado' },
        { dia: 'Martes', horario: '08:00 - 16:00', estado: 'completado' },
        { dia: 'Miércoles', horario: '14:00 - 22:00', estado: 'actual' },
        { dia: 'Jueves', horario: '08:00 - 16:00', estado: 'pendiente' },
        { dia: 'Viernes', horario: '16:00 - 00:00', estado: 'pendiente' },
    ];

    const tareas = [
        { titulo: 'Limpiar cancha 3', prioridad: 'alta', estado: 'pendiente' },
        { titulo: 'Reponer stock bebidas', prioridad: 'media', estado: 'pendiente' },
        { titulo: 'Verificar iluminación', prioridad: 'baja', estado: 'completado' },
    ];

    const stats = {
        horasMes: 120,
        turnosCompletados: 18,
        tareasCompletadas: 12,
        asistencia: '95%'
    };

    const tabs = [
        { id: 'turnos', label: 'Turnos', icon: CalendarDays },
        { id: 'tareas', label: 'Tareas', icon: ListTodo },
        { id: 'stats', label: 'Stats', icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 font-inter text-white pb-24">
            {/* Header */}
            <header className="bg-slate-900 border-b border-white/10 p-5 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Clock size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tight leading-none">Portal Empleado</h1>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">{config?.nombre || 'Complejo'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <button onClick={logout} className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-5">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 text-slate-500 hover:text-white'
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="p-5">
                {/* TURNOS */}
                {activeTab === 'turnos' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Semana Actual</h2>
                        {turnos.map((t, i) => (
                            <div key={i} className={`bg-slate-900 rounded-3xl p-5 border flex items-center justify-between transition-all ${
                                t.estado === 'actual' ? 'border-blue-500/30 bg-blue-500/5' :
                                t.estado === 'completado' ? 'border-white/5 opacity-60' :
                                'border-white/5'
                            }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        t.estado === 'actual' ? 'bg-blue-500 text-white' :
                                        t.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-white/5 text-slate-500'
                                    }`}>
                                        {t.estado === 'completado' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{t.dia}</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">{t.horario}</p>
                                    </div>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                                    t.estado === 'actual' ? 'bg-blue-500/20 text-blue-400' :
                                    t.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400' :
                                    'bg-white/5 text-slate-500'
                                }`}>
                                    {t.estado === 'actual' ? 'En curso' : t.estado === 'completado' ? 'OK' : 'Próximo'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAREAS */}
                {activeTab === 'tareas' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Tareas Asignadas</h2>
                        {tareas.map((t, i) => (
                            <div key={i} className={`bg-slate-900 rounded-3xl p-5 border border-white/5 flex items-center justify-between ${t.estado === 'completado' ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-10 rounded-full ${
                                        t.prioridad === 'alta' ? 'bg-red-500' :
                                        t.prioridad === 'media' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{t.titulo}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Prioridad {t.prioridad}</p>
                                    </div>
                                </div>
                                {t.estado === 'completado' ? (
                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                ) : (
                                    <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20">
                                        Completar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* STATS */}
                {activeTab === 'stats' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Resumen del Mes</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Horas Trabajadas', value: stats.horasMes + 'h', color: 'text-blue-400' },
                                { label: 'Turnos Cumplidos', value: stats.turnosCompletados, color: 'text-emerald-400' },
                                { label: 'Tareas Hechas', value: stats.tareasCompletadas, color: 'text-amber-400' },
                                { label: 'Asistencia', value: stats.asistencia, color: 'text-violet-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-900 rounded-3xl p-6 border border-white/5 text-center">
                                    <p className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
