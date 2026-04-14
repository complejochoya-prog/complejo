import React, { useState, useEffect } from 'react';
import { ROLES, ESTADOS, HORARIOS, PERMISOS } from '../services/empleadosService';
import { X, Check, Shield } from 'lucide-react';

const INITIAL = {
    nombre: '', apellido: '', dni: '', telefono: '', email: '',
    rol: '', estado: 'activo', horario: '', salario: '',
    permisos: [], notas: '', usuario: '', password: '',
};

export default function EmpleadoForm({ isOpen, onClose, onSave, initial = null, title = 'Nuevo Empleado' }) {
    const [form, setForm] = useState({ ...INITIAL });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initial) {
            setForm({ ...INITIAL, ...initial, salario: String(initial.salario || '') });
        } else {
            setForm({ ...INITIAL });
        }
    }, [initial, isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const togglePermiso = (pid) => {
        setForm(prev => ({
            ...prev,
            permisos: prev.permisos.includes(pid)
                ? prev.permisos.filter(p => p !== pid)
                : [...prev.permisos, pid]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({ ...form, salario: Number(form.salario) || 0 });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 w-full sm:max-w-lg sm:rounded-[32px] rounded-t-[32px] border border-white/[0.08] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">{title}</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Gestión de personal</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} required />
                        <Field label="Apellido" value={form.apellido} onChange={v => set('apellido', v)} required />
                    </div>

                    {/* DNI y Teléfono */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="DNI" value={form.dni} onChange={v => set('dni', v)} />
                        <Field label="Teléfono" value={form.telefono} onChange={v => set('telefono', v)} />
                    </div>

                    {/* Email */}
                    <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" />

                    {/* Usuario y Contraseña */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-1">Credenciales de Acceso</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Usuario" value={form.usuario} onChange={v => set('usuario', v)} placeholder="Nombre de usuario" />
                            <Field label="Contraseña" value={form.password} onChange={v => set('password', v)} type="text" placeholder="******" />
                        </div>
                    </div>

                    {/* Rol y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Rol" value={form.rol} onChange={v => set('rol', v)} options={ROLES.map(r => ({ value: r.id, label: r.label }))} required />
                        <SelectField label="Estado" value={form.estado} onChange={v => set('estado', v)} options={ESTADOS.map(s => ({ value: s.id, label: s.label }))} />
                    </div>

                    {/* Horario y Salario */}
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Horario" value={form.horario} onChange={v => set('horario', v)} options={HORARIOS.map(h => ({ value: h.id, label: h.label }))} required />
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Salario</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">$</span>
                                <input type="number" min="0" value={form.salario} onChange={e => set('salario', e.target.value)}
                                    className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl pl-9 pr-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Fecha Ingreso */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Fecha de Ingreso</label>
                        <input type="date" value={form.fecha_ingreso || ''} onChange={e => set('fecha_ingreso', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                    </div>

                    {/* Permisos */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1 flex items-center gap-1.5">
                            <Shield size={12} /> Permisos
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {PERMISOS.map(p => (
                                <button key={p.id} type="button" onClick={() => togglePermiso(p.id)}
                                    className={`text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                        form.permisos.includes(p.id)
                                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            : 'bg-slate-950 text-slate-600 border-white/[0.04] hover:text-slate-400'
                                    }`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Notas <span className="text-slate-700">(opcional)</span></label>
                        <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all h-20 resize-none" placeholder="Observaciones..." />
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        <Check size={18} /> {saving ? 'Guardando...' : 'Confirmar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder={label} />
        </div>
    );
}

function SelectField({ label, value, onChange, options, required = false }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} required={required}
                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                <option value="" disabled>Seleccionar...</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}
