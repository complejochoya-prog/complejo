import React, { useState } from 'react';
import { 
    UserPlus, Pencil, Trash2, Phone, Mail, 
    MessageCircle, Loader2, Power, BookOpen, 
    Award, Clock, DollarSign, IdCard, FileText, User
} from 'lucide-react';
import { saveProfesor, deleteProfesor, saveCurso } from '../services/escuelaService';
import { Modal, Field, StatusBadge, EmptyState, inputCls, btnPrimary, btnIcon } from './ui';

const EMPTY = { 
    name: '', 
    dni: '',
    phone: '', 
    email: '', 
    specialty: 'Director Técnico', 
    certifications: '',
    schedule: '',
    salary: '',
    avatar: '',
    notes: '', 
    status: 'active' 
};

export default function ProfesoresTab({ negocioId, teachers, courses }) {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const openNew = () => { setError(''); setForm({ ...EMPTY }); };
    const openEdit = (t) => { setError(''); setForm({ ...t }); };
    const close = () => setForm(null);

    const coursesOf = (t) => courses.filter(c => c.teacherIds.includes(t.id));

    const handleSave = async (e) => {
        e.preventDefault();
        const name = form.name.trim();
        if (!name) return setError('El profesor necesita un nombre.');
        setSaving(true);
        try {
            await saveProfesor(negocioId, { ...form, name });
            close();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t) => {
        const assigned = coursesOf(t);
        const msg = assigned.length
            ? `${t.name} está a cargo de: ${assigned.map(c => c.name).join(', ')}. Si lo eliminás, se le quita la asignación a esos cursos. ¿Eliminar profesor?`
            : `¿Eliminar a ${t.name}?`;
        if (!window.confirm(msg)) return;
        await Promise.all(assigned.map(c =>
            saveCurso(negocioId, { ...c, teacherIds: c.teacherIds.filter(id => id !== t.id) })
        ));
        await deleteProfesor(negocioId, t.id);
        if (selectedTeacher?.id === t.id) setSelectedTeacher(null);
    };

    const toggleActive = (t) =>
        saveProfesor(negocioId, { ...t, status: t.status === 'active' ? 'inactive' : 'active' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                        Cuerpo Técnico y Docente
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {teachers.length} profesor(es) registrados · Roles, cursos asignados y contactos
                    </p>
                </div>
                <button className={btnPrimary} onClick={openNew}>
                    <UserPlus size={16} /> Agregar Profesor
                </button>
            </div>

            {teachers.length === 0 ? (
                <div className="glass-premium rounded-[32px] border border-white/5">
                    <EmptyState>No hay profesores cargados todavía. Hacé clic en "Agregar Profesor" para dar de alta al cuerpo técnico.</EmptyState>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teachers.map(t => {
                        const assigned = coursesOf(t);
                        const digits = (t.phone || '').replace(/[^0-9]/g, '');
                        return (
                            <div 
                                key={t.id} 
                                className={`glass-premium rounded-3xl border border-white/5 p-6 space-y-5 transition-all hover:border-blue-500/30 flex flex-col justify-between ${
                                    t.status !== 'active' ? 'opacity-60 bg-slate-950/40' : ''
                                }`}
                            >
                                <div className="space-y-4">
                                    {/* Cabecera de la tarjeta */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {t.avatar ? (
                                                <img 
                                                    src={t.avatar} 
                                                    alt={t.name} 
                                                    className="w-12 h-12 rounded-2xl object-cover border border-blue-500/30"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">
                                                    {t.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-base font-black text-white">{t.name}</h4>
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                    {t.specialty || 'Entrenador'}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge active={t.status === 'active'} />
                                    </div>

                                    {/* Información rápida */}
                                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                                        {t.dni && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <IdCard size={13} className="text-blue-400 shrink-0" />
                                                <span>DNI: <strong className="text-white">{t.dni}</strong></span>
                                            </div>
                                        )}
                                        {t.phone && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <Phone size={13} className="text-emerald-400 shrink-0" />
                                                <span className="text-slate-300">{t.phone}</span>
                                            </div>
                                        )}
                                        {t.email && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <Mail size={13} className="text-blue-400 shrink-0" />
                                                <span className="text-slate-400 truncate">{t.email}</span>
                                            </div>
                                        )}
                                        {t.schedule && (
                                            <div className="flex items-center gap-2 text-[11px] text-amber-300/90">
                                                <Clock size={13} className="text-amber-400 shrink-0" />
                                                <span>{t.schedule}</span>
                                            </div>
                                        )}
                                        {t.certifications && (
                                            <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
                                                <Award size={13} className="text-purple-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{t.certifications}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cursos asignados */}
                                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                                            Cursos asignados ({assigned.length})
                                        </span>
                                        {assigned.length ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {assigned.map(c => (
                                                    <span 
                                                        key={c.id} 
                                                        className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase"
                                                    >
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-500 italic">Sin cursos asignados</span>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones inferiores */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => openEdit(t)} 
                                            className={`${btnIcon} text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-[10px] font-black uppercase px-3`}
                                        >
                                            <Pencil size={13} /> Editar Ficha
                                        </button>
                                        {digits && (
                                            <a 
                                                href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hola ${t.name}, te contactamos de la administración de la Escuela de Fútbol.`)}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className={`${btnIcon} text-emerald-400 hover:text-emerald-300`} 
                                                title="WhatsApp"
                                            >
                                                <MessageCircle size={14} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => toggleActive(t)} 
                                            className={`${btnIcon} text-amber-400 hover:text-amber-300`} 
                                            title={t.status === 'active' ? 'Desactivar' : 'Activar'}
                                        >
                                            <Power size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(t)} 
                                            className={`${btnIcon} text-rose-400 hover:text-rose-300`} 
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Alta / Edición de Profesor */}
            {form && (
                <Modal 
                    wide 
                    subtitle={form.id ? 'Ficha Técnica del Docente' : 'Nuevo Profesor'} 
                    title={form.name || 'Cargar Profesor'} 
                    onClose={close}
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nombre Completo *">
                                <input 
                                    className={inputCls} 
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    placeholder="Ej: Matías Silva" 
                                    autoFocus 
                                    required 
                                />
                            </Field>
                            <Field label="DNI / Documento">
                                <input 
                                    className={inputCls} 
                                    value={form.dni} 
                                    onChange={e => setForm({ ...form, dni: e.target.value })} 
                                    placeholder="Ej: 36.890.123" 
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Rol / Especialidad Principal">
                                <select 
                                    className={inputCls} 
                                    value={form.specialty} 
                                    onChange={e => setForm({ ...form, specialty: e.target.value })}
                                >
                                    <option value="Director Técnico">Director Técnico</option>
                                    <option value="Preparador Físico">Preparador Físico</option>
                                    <option value="Entrenador de Arqueros">Entrenador de Arqueros</option>
                                    <option value="Ayudante de Campo">Ayudante de Campo</option>
                                    <option value="Coordinador General">Coordinador General</option>
                                    <option value="Kinesiólogo / Salud">Kinesiólogo / Salud</option>
                                </select>
                            </Field>
                            <Field label="Estado">
                                <select 
                                    className={inputCls} 
                                    value={form.status} 
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="active">Activo (habilitado)</option>
                                    <option value="inactive">Inactivo (licencia / baja)</option>
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Teléfono / WhatsApp">
                                <input 
                                    type="tel" 
                                    className={inputCls} 
                                    value={form.phone} 
                                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                                    placeholder="Ej: 11 4455-6677" 
                                />
                            </Field>
                            <Field label="Email de Contacto">
                                <input 
                                    type="email" 
                                    className={inputCls} 
                                    value={form.email} 
                                    onChange={e => setForm({ ...form, email: e.target.value })} 
                                    placeholder="profe@ejemplo.com" 
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Días y Horarios de Trabajo" hint="Ej: Lun, Mié y Vie de 17:00 a 20:30">
                                <input 
                                    className={inputCls} 
                                    value={form.schedule} 
                                    onChange={e => setForm({ ...form, schedule: e.target.value })} 
                                    placeholder="Lun a Vie 17 a 20hs" 
                                />
                            </Field>
                            <Field label="Honorarios / Sueldo Mensual ($)" hint="Dato privado de administración">
                                <input 
                                    className={inputCls} 
                                    value={form.salary} 
                                    onChange={e => setForm({ ...form, salary: e.target.value })} 
                                    placeholder="Ej: 150000" 
                                />
                            </Field>
                        </div>

                        <Field label="Títulos, Licencias y Certificaciones">
                            <input 
                                className={inputCls} 
                                value={form.certifications} 
                                onChange={e => setForm({ ...form, certifications: e.target.value })} 
                                placeholder="Ej: Licencia PRO ATFA, Certificado de Reanimación Cardiopulmonar (RCP)" 
                            />
                        </Field>

                        <Field label="URL de Foto de Perfil / Avatar (opcional)">
                            <input 
                                type="url" 
                                className={inputCls} 
                                value={form.avatar} 
                                onChange={e => setForm({ ...form, avatar: e.target.value })} 
                                placeholder="https://..." 
                            />
                        </Field>

                        <Field label="Notas Internas y Observaciones">
                            <textarea 
                                rows={2} 
                                className={inputCls} 
                                value={form.notes} 
                                onChange={e => setForm({ ...form, notes: e.target.value })} 
                                placeholder="Disponibilidad para viajes, torneos de fin de semana, etc." 
                            />
                        </Field>

                        {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

                        <div className="flex gap-4 pt-2">
                            <button 
                                type="button" 
                                onClick={close} 
                                className="px-6 py-4 bg-slate-950 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving} 
                                className={`${btnPrimary} flex-1 py-4`}
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : form.id ? 'Guardar Cambios' : 'Registrar Profesor'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
