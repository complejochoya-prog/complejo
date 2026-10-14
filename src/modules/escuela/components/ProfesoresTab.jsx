import React, { useState } from 'react';
import { UserPlus, Pencil, Trash2, Phone, Mail, MessageCircle, Loader2, Power, BookOpen } from 'lucide-react';
import { saveProfesor, deleteProfesor, saveCurso } from '../services/escuelaService';
import { Modal, Field, StatusBadge, EmptyState, inputCls, btnPrimary, btnIcon } from './ui';

const EMPTY = { name: '', phone: '', email: '', specialty: '', notes: '', status: 'active' };

export default function ProfesoresTab({ negocioId, teachers, courses }) {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
        // Quitarlo de los cursos para no dejar referencias rotas
        await Promise.all(assigned.map(c =>
            saveCurso(negocioId, { ...c, teacherIds: c.teacherIds.filter(id => id !== t.id) })
        ));
        await deleteProfesor(negocioId, t.id);
    };

    const toggleActive = (t) =>
        saveProfesor(negocioId, { ...t, status: t.status === 'active' ? 'inactive' : 'active' });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{teachers.length} profesor(es)</p>
                <button className={btnPrimary} onClick={openNew}><UserPlus size={16} /> Nuevo Profesor</button>
            </div>

            {teachers.length === 0 ? (
                <div className="glass-premium rounded-[32px] border border-white/5">
                    <EmptyState>No hay profesores cargados todavía.</EmptyState>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teachers.map(t => {
                        const assigned = coursesOf(t);
                        const digits = (t.phone || '').replace(/[^0-9]/g, '');
                        return (
                            <div key={t.id} className={`glass-premium rounded-3xl border border-white/5 p-6 space-y-4 ${t.status !== 'active' ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                                            {t.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">{t.name}</h3>
                                            {t.specialty && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.specialty}</p>}
                                        </div>
                                    </div>
                                    <StatusBadge active={t.status === 'active'} />
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-300">
                                    {t.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-emerald-400" /> {t.phone}</div>}
                                    {t.email && <div className="flex items-center gap-2"><Mail size={12} className="text-blue-400" /> {t.email}</div>}
                                </div>

                                <div className="flex items-start gap-2 text-xs">
                                    <BookOpen size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                    {assigned.length
                                        ? <div className="flex flex-wrap gap-1.5">{assigned.map(c => (
                                            <span key={c.id} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase">{c.name}</span>
                                        ))}</div>
                                        : <span className="text-slate-500">Sin cursos asignados</span>}
                                </div>

                                {t.notes && <p className="text-xs text-slate-400 border-t border-white/5 pt-3">{t.notes}</p>}

                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(t)} className={`${btnIcon} text-blue-400 hover:text-blue-300 flex items-center gap-2 text-[10px] font-black uppercase`}>
                                        <Pencil size={14} /> Editar
                                    </button>
                                    {digits && (
                                        <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={`${btnIcon} text-emerald-400 hover:text-emerald-300`} title="WhatsApp">
                                            <MessageCircle size={14} />
                                        </a>
                                    )}
                                    <button onClick={() => toggleActive(t)} className={`${btnIcon} text-amber-400 hover:text-amber-300`} title={t.status === 'active' ? 'Desactivar' : 'Activar'}>
                                        <Power size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(t)} className={`${btnIcon} text-rose-400 hover:text-rose-300`} title="Eliminar">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {form && (
                <Modal subtitle={form.id ? 'Editar profesor' : 'Nuevo profesor'} title={form.name || 'Profesor'} onClose={close}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <Field label="Nombre completo">
                            <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Carlos Méndez" autoFocus />
                        </Field>
                        <Field label="Especialidad / Rol">
                            <input className={inputCls} value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="Ej: Director técnico, Preparador físico" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Teléfono / WhatsApp">
                                <input type="tel" className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 11 2233-4455" />
                            </Field>
                            <Field label="Email">
                                <input type="email" className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="profe@mail.com" />
                            </Field>
                        </div>
                        <Field label="Notas internas">
                            <textarea rows={3} className={inputCls} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Disponibilidad, certificaciones, observaciones..." />
                        </Field>
                        <Field label="Estado">
                            <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </Field>

                        {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

                        <button type="submit" disabled={saving} className={`${btnPrimary} w-full py-4`}>
                            {saving ? <Loader2 className="animate-spin" size={16} /> : form.id ? 'Guardar cambios' : 'Agregar profesor'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
