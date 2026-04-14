import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROLES, ESTADOS, HORARIOS } from '../services/empleadosService';
import { ChevronRight, Mail, Phone, Clock } from 'lucide-react';

const roleColors = {
    admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    encargado: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    recepcion: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    mozo: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    cocina: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    mantenimiento: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    limpieza: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    DELIVERY: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const estadoColors = {
    activo: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    inactivo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    suspendido: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    licencia: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export default function EmpleadoCard({ empleado }) {
    const navigate = useNavigate();
    const { negocioId } = useParams();

    const rolObj = ROLES.find(r => r.id === empleado.rol);
    const estadoObj = ESTADOS.find(s => s.id === empleado.estado);
    const horarioObj = HORARIOS.find(h => h.id === empleado.horario);
    const initials = `${empleado.nombre.charAt(0)}${empleado.apellido.charAt(0)}`;

    return (
        <div
            onClick={() => navigate(`/${negocioId}/empleados/${empleado.id}`)}
            className="group bg-slate-900/60 backdrop-blur-sm border border-white/[0.04] rounded-2xl p-4 md:p-5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black italic shrink-0 ${roleColors[empleado.rol] || 'bg-slate-800 text-white'} border`}>
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                            {empleado.nombre} {empleado.apellido}
                        </h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${roleColors[empleado.rol] || ''}`}>
                            {rolObj?.label || empleado.rol}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${estadoColors[empleado.estado] || ''}`}>
                            {estadoObj?.label || empleado.estado}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        {empleado.email && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                <Mail size={10} /> {empleado.email}
                            </span>
                        )}
                        {empleado.telefono && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                <Phone size={10} /> {empleado.telefono}
                            </span>
                        )}
                        {horarioObj && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                <Clock size={10} /> {horarioObj.label.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {(empleado.usuario || empleado.password) && (
                        <div className="flex items-center gap-3 mt-2 px-3 py-1.5 bg-slate-950/40 rounded-xl border border-white/[0.03] w-fit">
                            {empleado.usuario && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">User:</span>
                                    <span className="text-[9px] font-black text-indigo-400 select-all">{empleado.usuario}</span>
                                </div>
                            )}
                            {empleado.password && (
                                <div className="flex items-center gap-1.5 border-l border-white/5 pl-3 ml-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Pass:</span>
                                    <span className="text-[9px] font-black text-amber-500/80 select-all">{empleado.password}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <ChevronRight size={18} className="text-slate-700 group-hover:text-amber-500 transition-colors shrink-0" />
            </div>
        </div>
    );
}
