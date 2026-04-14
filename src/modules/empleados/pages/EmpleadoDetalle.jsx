import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEmpleado, updateEmpleado, deleteEmpleado, ROLES, ESTADOS, HORARIOS, PERMISOS } from '../services/empleadosService';
import EmpleadoForm from '../components/EmpleadoForm';
import {
    ArrowLeft, Edit3, Trash2, Loader2, Mail, Phone, IdCard, Clock, Calendar,
    DollarSign, Shield, FileText, Activity, UserCheck,
} from 'lucide-react';

const roleColors = {
    admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    encargado: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    recepcion: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    mozo: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    cocina: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    mantenimiento: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    limpieza: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
};

const estadoColors = {
    activo: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    inactivo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    suspendido: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    licencia: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export default function EmpleadoDetalle() {
    const { negocioId, empleadoId } = useParams();
    const navigate = useNavigate();
    const [emp, setEmp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    const load = async () => {
        setLoading(true);
        const data = await fetchEmpleado(empleadoId);
        setEmp(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, [empleadoId]);

    const handleUpdate = async (data) => {
        await updateEmpleado(empleadoId, data);
        await load();
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Eliminar a ${emp.nombre} ${emp.apellido}? Esta acción no se puede deshacer.`)) {
            await deleteEmpleado(empleadoId);
            navigate(`/${negocioId}/empleados/lista`);
        }
    };

    if (loading) return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
    );

    if (!emp) return (
        <div className="py-24 text-center space-y-4">
            <p className="text-2xl font-black text-white uppercase italic">Empleado no encontrado</p>
            <button onClick={() => navigate(`/${negocioId}/empleados`)} className="text-amber-500 text-[10px] font-black uppercase tracking-widest">← Volver</button>
        </div>
    );

    const rolObj = ROLES.find(r => r.id === emp.rol);
    const estadoObj = ESTADOS.find(s => s.id === emp.estado);
    const horarioObj = HORARIOS.find(h => h.id === emp.horario);
    const initials = `${emp.nombre.charAt(0)}${emp.apellido.charAt(0)}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/${negocioId}/empleados/lista`)}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black italic border ${roleColors[emp.rol] || 'bg-slate-800 text-white'}`}>
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                                {emp.nombre} {emp.apellido}
                            </h1>
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${roleColors[emp.rol]}`}>
                                {rolObj?.label}
                            </span>
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${estadoColors[emp.estado]}`}>
                                {estadoObj?.label}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Ficha del empleado</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowEdit(true)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5">
                        <Edit3 size={16} /> Editar
                    </button>
                    <button onClick={handleDelete}
                        className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-rose-500/20">
                        <Trash2 size={16} /> Eliminar
                    </button>
                </div>
            </header>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={IdCard} label="DNI" value={emp.dni || '-'} />
                <InfoCard icon={Mail} label="Email" value={emp.email || '-'} />
                <InfoCard icon={Phone} label="Teléfono" value={emp.telefono || '-'} />
                <InfoCard icon={Clock} label="Horario" value={horarioObj?.label || '-'} />
                <InfoCard icon={Calendar} label="Fecha de Ingreso" value={emp.fecha_ingreso || '-'} />
                <InfoCard icon={DollarSign} label="Salario Mensual" value={`$${(emp.salario || 0).toLocaleString('es-AR')}`} highlight />
            </div>

            {/* Permisos */}
            <div className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 flex items-center gap-2">
                    <Shield size={12} /> Permisos Asignados
                </h3>
                <div className="flex flex-wrap gap-2">
                    {emp.permisos && emp.permisos.length > 0 ? (
                        emp.permisos.map(pid => {
                            const p = PERMISOS.find(x => x.id === pid);
                            return (
                                <span key={pid} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest">
                                    {p?.label || pid}
                                </span>
                            );
                        })
                    ) : (
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sin permisos asignados</p>
                    )}
                </div>
            </div>

            {/* Notas */}
            {emp.notas && (
                <div className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                        <FileText size={12} /> Notas
                    </h3>
                    <p className="text-sm text-slate-300 font-medium">{emp.notas}</p>
                </div>
            )}

            {/* Actividad Reciente */}
            <div className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 flex items-center gap-2">
                    <Activity size={12} /> Actividad Reciente
                </h3>
                {emp.actividad && emp.actividad.length > 0 ? (
                    <div className="space-y-2">
                        {emp.actividad.map((act, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-950/50 rounded-xl p-3 border border-white/[0.03]">
                                <UserCheck size={14} className="text-slate-600 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">{act.accion}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{act.fecha} — {act.hora}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sin actividad registrada</p>
                )}
            </div>

            <EmpleadoForm isOpen={showEdit} onClose={() => setShowEdit(false)} onSave={handleUpdate} initial={emp} title="Editar Empleado" />
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className="bg-slate-900/60 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3 hover:border-white/[0.08] transition-all">
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className={highlight ? 'text-emerald-500' : 'text-slate-500'} />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                <p className={`text-sm font-black tracking-tight ${highlight ? 'text-emerald-400 italic' : 'text-white'}`}>{value}</p>
            </div>
        </div>
    );
}
