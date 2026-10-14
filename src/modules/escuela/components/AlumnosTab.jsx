import React, { useState } from 'react';
import { UserPlus, Search, Phone, Pencil, Trash2, MessageCircle, Loader2, Download, Power } from 'lucide-react';
import {
    submitInscripcion,
    updateInscripcionStatus,
    deleteInscripcion,
    findCourseForStudent,
    formatAgeRange,
    formatDays,
    formatPrice,
    formatTime,
} from '../services/escuelaService';
import { Modal, Field, StatusBadge, EmptyState, inputCls, btnPrimary, btnIcon, PAYMENT_META } from './ui';

const EMPTY = { name: '', age: '', guardian: '', phone: '', courseId: '', payment: 'pending', status: 'active', notes: '' };

const formatDate = (iso) => {
    if (!iso) return 'Reciente';
    try {
        return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return 'Reciente'; }
};

export default function AlumnosTab({ negocioId, students, courses, enrolledByCourse }) {
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const openNew = () => { setError(''); setForm({ ...EMPTY, courseId: courses.find(c => c.status === 'active')?.id || '' }); };
    const openEdit = (s) => {
        const course = findCourseForStudent(s, courses);
        setError('');
        setForm({ ...s, courseId: course?.id || '' });
    };
    const close = () => setForm(null);

    const filtered = students.filter(s => {
        const course = findCourseForStudent(s, courses);
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            (s.name || '').toLowerCase().includes(q) ||
            (s.guardian || '').toLowerCase().includes(q) ||
            (s.phone || '').toLowerCase().includes(q) ||
            (course?.name || s.category || '').toLowerCase().includes(q);
        const matchesCourse =
            courseFilter === 'all' ||
            (courseFilter === 'none' ? !course : course?.id === courseFilter);
        const matchesPayment = paymentFilter === 'all' || s.payment === paymentFilter;
        return matchesSearch && matchesCourse && matchesPayment;
    });

    const selectedCourse = form ? courses.find(c => c.id === form.courseId) : null;
    const ageNum = form?.age === '' ? null : Number(form?.age);
    const ageOutOfRange = selectedCourse && ageNum !== null && (
        (selectedCourse.ageMin !== '' && ageNum < selectedCourse.ageMin) ||
        (selectedCourse.ageMax !== '' && ageNum > selectedCourse.ageMax)
    );
    const courseFull = selectedCourse && selectedCourse.capacity > 0 &&
        (enrolledByCourse[selectedCourse.id] || 0) >= selectedCourse.capacity &&
        findCourseForStudent(form, courses)?.id !== selectedCourse.id;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.guardian.trim() || !form.phone.trim()) {
            return setError('Completá nombre del alumno, tutor y teléfono.');
        }
        setSaving(true);
        try {
            const data = { ...form, name: form.name.trim(), category: selectedCourse?.name || '' };
            if (form.id) await updateInscripcionStatus(negocioId, form.id, data);
            else await submitInscripcion(negocioId, data);
            close();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const cyclePayment = (s) => {
        const next = s.payment === 'paid' ? 'pending' : s.payment === 'pending' ? 'overdue' : 'paid';
        return updateInscripcionStatus(negocioId, s.id, { payment: next });
    };

    const toggleActive = (s) =>
        updateInscripcionStatus(negocioId, s.id, { status: s.status === 'active' ? 'inactive' : 'active' });

    const handleDelete = async (s) => {
        if (window.confirm(`¿Eliminar a ${s.name} de la escuela?`)) await deleteInscripcion(negocioId, s.id);
    };

    const exportCsv = () => {
        const rows = [['Alumno', 'Edad', 'Curso', 'Tutor', 'Teléfono', 'Cuota', 'Pago', 'Estado', 'Notas', 'Inscripción']];
        filtered.forEach(s => {
            const c = findCourseForStudent(s, courses);
            rows.push([
                s.name, s.age, c?.name || s.category || '', s.guardian, s.phone, c ? c.price : '',
                PAYMENT_META[s.payment]?.label || s.payment, s.status === 'active' ? 'Activo' : 'Inactivo', s.notes, formatDate(s.createdAt),
            ]);
        });
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'alumnos-escuela.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="glass-premium rounded-[32px] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row gap-4 justify-between bg-white/[0.02]">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar alumno, tutor, teléfono o curso..."
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-4 py-2 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none">
                            <option value="all">Todos los cursos</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({formatAgeRange(c)})</option>)}
                            <option value="none">Sin curso asignado</option>
                        </select>
                        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-4 py-2 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none">
                            <option value="all">Todos los pagos</option>
                            <option value="paid">Al día</option>
                            <option value="pending">Pendientes</option>
                            <option value="overdue">Deuda</option>
                        </select>
                        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-white">
                            <Download size={14} /> CSV
                        </button>
                        <button className={btnPrimary} onClick={openNew}><UserPlus size={16} /> Nuevo Alumno</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                {['Alumno', 'Curso & horario', 'Tutor / WhatsApp', 'Cuota', 'Pago', 'Acciones'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(s => {
                                const course = findCourseForStudent(s, courses);
                                const pay = PAYMENT_META[s.payment] || PAYMENT_META.pending;
                                return (
                                    <tr key={s.id} className={`hover:bg-white/[0.02] transition-colors group ${s.status === 'inactive' ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => openEdit(s)} className="flex items-center gap-3 text-left">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-500/20">
                                                    {(s.name || 'A').split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{s.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                                        {s.age} años{s.status === 'inactive' ? ' · Inactivo' : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course ? (
                                                <div className="space-y-1">
                                                    <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-wider">{course.name}</span>
                                                    <p className="text-[10px] text-slate-400 font-medium">{formatDays(course.days)} • {formatTime(course)}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase text-amber-400">
                                                    Sin curso asignado{s.category ? ` (era ${s.category})` : ''}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-white/80 font-medium">{s.guardian}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Phone size={10} className="text-emerald-400" /> {s.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black italic text-white">{course ? formatPrice(course.price) : '—'}</span>
                                            <span className="block text-[8px] text-slate-500 font-bold uppercase">mensual</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => cyclePayment(s)} className="flex items-center gap-2 hover:opacity-80" title="Clic para cambiar el estado de pago">
                                                <div className={`w-2 h-2 rounded-full ${pay.dot}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${pay.text}`}>{pay.label}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(s)} className={`${btnIcon} text-blue-400 hover:text-blue-300`} title="Editar"><Pencil size={14} /></button>
                                                <a
                                                    href={`https://wa.me/${(s.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola! Te contactamos de la Escuela de Fútbol por ${s.name}`)}`}
                                                    target="_blank" rel="noreferrer" className={`${btnIcon} text-emerald-400 hover:text-emerald-300`} title="WhatsApp"
                                                ><MessageCircle size={14} /></a>
                                                <button onClick={() => toggleActive(s)} className={`${btnIcon} text-amber-400 hover:text-amber-300`} title={s.status === 'active' ? 'Dar de baja' : 'Reactivar'}><Power size={14} /></button>
                                                <button onClick={() => handleDelete(s)} className={`${btnIcon} text-rose-400 hover:text-rose-300`} title="Eliminar"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <EmptyState>No se encontraron alumnos con los filtros seleccionados</EmptyState>}
                </div>

                <div className="p-6 bg-white/[0.01] border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mostrando {filtered.length} de {students.length} alumnos</p>
                </div>
            </div>

            {form && (
                <Modal wide subtitle={form.id ? `Ficha · inscripto el ${formatDate(form.createdAt)}` : 'Nuevo alumno'} title={form.name || 'Alumno'} onClose={close}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <Field label="Nombre del alumno">
                            <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Mateo González" autoFocus />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Edad">
                                <input type="number" min="0" className={inputCls} value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Ej: 7" />
                            </Field>
                            <Field label="Curso">
                                <select className={inputCls} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                                    <option value="">Sin curso asignado</option>
                                    {courses.filter(c => c.status === 'active' || c.id === form.courseId).map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({formatAgeRange(c)}){c.status !== 'active' ? ' — inactivo' : ''}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {ageOutOfRange && (
                            <p className="text-[11px] font-bold text-amber-400">
                                ⚠ La edad ({ageNum}) está fuera del rango del curso ({formatAgeRange(selectedCourse)}). Podés guardarlo igual.
                            </p>
                        )}
                        {courseFull && (
                            <p className="text-[11px] font-bold text-amber-400">⚠ Este curso ya alcanzó su cupo máximo. Podés guardarlo igual.</p>
                        )}

                        <Field label="Tutor / Responsable">
                            <input className={inputCls} value={form.guardian} onChange={e => setForm({ ...form, guardian: e.target.value })} placeholder="Ej: Juan González" />
                        </Field>
                        <Field label="WhatsApp de contacto">
                            <input type="tel" className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 11 2233-4455" />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Estado de pago">
                                <select className={inputCls} value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })}>
                                    <option value="paid">Al día</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="overdue">Deuda</option>
                                </select>
                            </Field>
                            <Field label="Estado del alumno">
                                <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo / de baja</option>
                                </select>
                            </Field>
                        </div>

                        <Field label="Notas internas">
                            <textarea rows={3} className={inputCls} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones, ficha médica, descuentos, etc." />
                        </Field>

                        {error && <p className="text-xs font-bold text-rose-400">{error}</p>}

                        <div className="flex gap-3">
                            {form.id && <StatusBadge active={form.status === 'active'} />}
                            <button type="submit" disabled={saving} className={`${btnPrimary} flex-1 py-4`}>
                                {saving ? <Loader2 className="animate-spin" size={16} /> : form.id ? 'Guardar cambios' : 'Guardar alumno'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
