import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, UserCheck, Loader2, Power } from 'lucide-react';
import {
    DAYS,
    saveCurso,
    deleteCurso,
    updateInscripcionStatus,
    formatAgeRange,
    formatDays,
    formatPrice,
    formatTime,
} from '../services/escuelaService';
import { Modal, Field, StatusBadge, EmptyState, inputCls, btnPrimary, btnIcon } from './ui';

const EMPTY = {
    name: '', ageMin: '', ageMax: '', days: [], timeStart: '', timeEnd: '',
    price: '', capacity: '', location: '', description: '', teacherIds: [], status: 'active',
};

export default function CursosTab({ negocioId, courses, teachers, students, enrolledByCourse }) {
    const [form, setForm] = useState(null); // null = cerrado
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const openNew = () => { setError(''); setForm({ ...EMPTY }); };
    const openEdit = (c) => { setError(''); setForm({ ...c }); };
    const close = () => setForm(null);

    const toggleIn = (field, value) =>
        setForm(f => ({
            ...f,
            [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
        }));

    const handleSave = async (e) => {
        e.preventDefault();
        const name = form.name.trim();
        const min = form.ageMin === '' ? null : Number(form.ageMin);
        const max = form.ageMax === '' ? null : Number(form.ageMax);

        if (!name) return setError('El curso necesita un nombre.');
        if (courses.some(c => c.id !== form.id && c.name.trim().toLowerCase() === name.toLowerCase()))
            return setError('Ya existe otro curso con ese nombre.');
        if (min !== null && max !== null && min > max)
            return setError('La edad mínima no puede ser mayor que la máxima.');
        if (Number(form.price) < 0 || Number(form.capacity) < 0)
            return setError('Cuota y cupo no pueden ser negativos.');

        setSaving(true);
        try {
            const previous = courses.find(c => c.id === form.id);
            const saved = await saveCurso(negocioId, { ...form, name });

            // Si se renombró, los alumnos mantienen el vínculo (por id) y actualizan el nombre guardado.
            if (previous && previous.name !== name) {
                const affected = students.filter(s =>
                    s.courseId === previous.id || (!s.courseId && s.category === previous.name)
                );
                await Promise.all(affected.map(s =>
                    updateInscripcionStatus(negocioId, s.id, { courseId: saved.id, category: name })
                ));
            }
            close();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar el curso. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (c) => {
        const count = enrolledByCourse[c.id] || 0;
        const msg = count > 0
            ? `"${c.name}" tiene ${count} alumno(s) inscripto(s). Si lo eliminás, esos alumnos quedan "sin curso asignado" (no se borran). ¿Eliminar el curso?`
            : `¿Eliminar el curso "${c.name}"?`;
        if (window.confirm(msg)) await deleteCurso(negocioId, c.id);
    };

    const toggleActive = (c) =>
        saveCurso(negocioId, { ...c, status: c.status === 'active' ? 'inactive' : 'active' });

    const teacherName = (id) => teachers.find(t => t.id === id)?.name;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {courses.length} curso(s) · Los cursos activos se muestran en la página pública
                </p>
                <button className={btnPrimary} onClick={openNew}><Plus size={16} /> Nuevo Curso</button>
            </div>

            {courses.length === 0 ? (
                <div className="glass-premium rounded-[32px] border border-white/5">
                    <EmptyState>Todavía no hay cursos. Creá el primero con “Nuevo Curso”.</EmptyState>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {courses.map(c => {
                        const enrolled = enrolledByCourse[c.id] || 0;
                        const full = c.capacity > 0 && enrolled >= c.capacity;
                        const pct = c.capacity > 0 ? Math.min(100, Math.round((enrolled / c.capacity) * 100)) : 0;
                        const names = c.teacherIds.map(teacherName).filter(Boolean);

                        return (
                            <div key={c.id} className={`glass-premium rounded-3xl border border-white/5 p-6 space-y-4 ${c.status !== 'active' ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic text-white">{c.name}</h3>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{formatAgeRange(c)}</p>
                                    </div>
                                    <StatusBadge active={c.status === 'active'} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                                    <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {formatDays(c.days)}</div>
                                    <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {formatTime(c)}</div>
                                    {c.location && <div className="flex items-center gap-2 col-span-2"><MapPin size={14} className="text-blue-500" /> {c.location}</div>}
                                </div>

                                {c.description && <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>}

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-2xl font-black italic text-white">{formatPrice(c.price)}</p>
                                        <p className="text-[8px] font-bold uppercase text-slate-500">cuota mensual</p>
                                    </div>
                                    <div className="w-40 space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                                            <span>Inscriptos</span>
                                            <span className={full ? 'text-rose-400' : ''}>
                                                {enrolled}{c.capacity > 0 ? ` / ${c.capacity}` : ''}
                                            </span>
                                        </div>
                                        {c.capacity > 0 && (
                                            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                <div className={`h-full ${full ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        )}
                                        {full && <p className="text-[9px] font-black uppercase text-rose-400">Cupo completo</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <UserCheck size={14} className="text-emerald-400 shrink-0" />
                                    {names.length ? names.join(', ') : <span className="text-slate-500">Sin profesor asignado</span>}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => openEdit(c)} className={`${btnIcon} text-blue-400 hover:text-blue-300 flex items-center gap-2 text-[10px] font-black uppercase`}>
                                        <Pencil size={14} /> Editar
                                    </button>
                                    <button onClick={() => toggleActive(c)} className={`${btnIcon} text-amber-400 hover:text-amber-300`} title={c.status === 'active' ? 'Desactivar' : 'Activar'}>
                                        <Power size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(c)} className={`${btnIcon} text-rose-400 hover:text-rose-300`} title="Eliminar">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {form && (
                <Modal
                    wide
                    subtitle={form.id ? 'Editar curso' : 'Nuevo curso'}
                    title={form.name || 'Curso'}
                    onClose={close}
                >
                    <form onSubmit={handleSave} className="space-y-4">
                        <Field label="Nombre del curso">
                            <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Mini-Cracks" autoFocus />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Edad mínima">
                                <input type="number" min="0" className={inputCls} value={form.ageMin} onChange={e => setForm({ ...form, ageMin: e.target.value })} placeholder="Ej: 4" />
                            </Field>
                            <Field label="Edad máxima">
                                <input type="number" min="0" className={inputCls} value={form.ageMax} onChange={e => setForm({ ...form, ageMax: e.target.value })} placeholder="Ej: 6" />
                            </Field>
                        </div>

                        <Field label="Días de entrenamiento">
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(d => (
                                    <button
                                        type="button" key={d} onClick={() => toggleIn('days', d)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                            form.days.includes(d) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                        }`}
                                    >{d}</button>
                                ))}
                            </div>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Hora de inicio">
                                <input type="time" className={inputCls} value={form.timeStart} onChange={e => setForm({ ...form, timeStart: e.target.value })} />
                            </Field>
                            <Field label="Hora de fin">
                                <input type="time" className={inputCls} value={form.timeEnd} onChange={e => setForm({ ...form, timeEnd: e.target.value })} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Cuota mensual ($)">
                                <input type="number" min="0" className={inputCls} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Ej: 15000" />
                            </Field>
                            <Field label="Cupo máximo" hint="0 o vacío = sin límite">
                                <input type="number" min="0" className={inputCls} value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="Ej: 20" />
                            </Field>
                        </div>

                        <Field label="Lugar / Cancha">
                            <input className={inputCls} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ej: Cancha 3" />
                        </Field>

                        <Field label="Descripción">
                            <textarea rows={3} className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Qué se trabaja en este curso, qué llevar, etc." />
                        </Field>

                        <Field label="Profesores a cargo" hint={teachers.length === 0 ? 'Todavía no hay profesores: agregalos en la pestaña “Profesores”.' : undefined}>
                            <div className="flex flex-wrap gap-2">
                                {teachers.filter(t => t.status === 'active' || form.teacherIds.includes(t.id)).map(t => (
                                    <button
                                        type="button" key={t.id} onClick={() => toggleIn('teacherIds', t.id)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                            form.teacherIds.includes(t.id) ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                        }`}
                                    >{t.name}</button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Estado">
                            <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="active">Activo (visible en la web y en inscripciones)</option>
                                <option value="inactive">Inactivo (oculto)</option>
                            </select>
                        </Field>

                        {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

                        <button type="submit" disabled={saving} className={`${btnPrimary} w-full py-4`}>
                            {saving ? <Loader2 className="animate-spin" size={16} /> : form.id ? 'Guardar cambios' : 'Crear curso'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
