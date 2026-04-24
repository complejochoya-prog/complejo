import React, { useState } from 'react';
import { 
    Users, 
    UserPlus, 
    Calendar, 
    Search, 
    Filter, 
    MoreVertical, 
    Download, 
    Mail, 
    Phone,
    CheckCircle2,
    Clock
} from 'lucide-react';

export default function EscuelaAdmin() {
    const [searchTerm, setSearchTerm] = useState('');

    const students = [
        { id: 1, name: 'Mateo González', category: 'Mini-Cracks', age: 5, guardian: 'Juan González', phone: '11 2233-4455', status: 'active', payment: 'paid' },
        { id: 2, name: 'Bautista Lopez', category: 'Pre-Infantil', age: 8, guardian: 'Maria Lopez', phone: '11 5566-7788', status: 'active', payment: 'pending' },
        { id: 3, name: 'Santino Rodriguez', category: 'Infantil', age: 11, guardian: 'Pedro Rodriguez', phone: '11 9900-1122', status: 'inactive', payment: 'overdue' },
        { id: 4, name: 'Thiago Diaz', category: 'Juveniles', age: 14, guardian: 'Lucia Diaz', phone: '11 3344-5566', status: 'active', payment: 'paid' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                        Gestión <span className="text-blue-500">Escuela</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Administración de alumnos y categorías</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <Download size={14} /> Exportar
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                        <UserPlus size={16} /> Nuevo Alumno
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Alumnos', value: '128', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Presentes Hoy', value: '42', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Cuotas Pendientes', value: '12', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Nuevos (Mes)', value: '+8', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass-premium p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="glass-premium rounded-[32px] border border-white/5 overflow-hidden">
                {/* Filters/Search Bar */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/[0.02]">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar alumno, tutor o categoría..."
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-white/5 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
                            <Filter size={16} /> Categorías
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-white/5 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
                            <Calendar size={16} /> Asistencia
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Alumno</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tutor / Contacto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado Pago</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-500/20">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{student.age} años</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                            {student.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-white/80 font-medium">{student.guardian}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <Phone size={10} /> {student.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                student.payment === 'paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                                student.payment === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                                                'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                            }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                student.payment === 'paid' ? 'text-emerald-500' : 
                                                student.payment === 'pending' ? 'text-amber-500' : 
                                                'text-rose-500'
                                            }`}>
                                                {student.payment === 'paid' ? 'Al día' : 
                                                 student.payment === 'pending' ? 'Pendiente' : 
                                                 'Deuda'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                <Mail size={14} />
                                            </button>
                                            <button className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-6 bg-white/[0.01] flex items-center justify-between border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mostrando 4 de 128 alumnos</p>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 bg-slate-950 border border-white/5 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">Anterior</button>
                        <button className="px-4 py-2 bg-slate-950 border border-white/5 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
