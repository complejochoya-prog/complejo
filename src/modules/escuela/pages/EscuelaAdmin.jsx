import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Calendar,
    Search,
    Filter,
    Download,
    Phone,
    CheckCircle2,
    Clock,
    X,
    Trash2,
    Loader2,
    Eye,
    Tag,
    DollarSign,
    FileText,
    MessageCircle
} from 'lucide-react';
import {
    subscribeInscripciones,
    submitInscripcion,
    updateInscripcionStatus,
    deleteInscripcion,
    CATEGORY_DETAILS
} from '../services/escuelaService';

export default function EscuelaAdmin() {
    const { negocioId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('Todos');
    const [students, setStudents] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newStudent, setNewStudent] = useState({
        alumno: '',
        edad: '',
        tutor: '',
        telefono: '',
        categoria: 'Mini-Cracks'
    });

    useEffect(() => {
        const unsubscribe = subscribeInscripciones(negocioId, (data) => {
            setStudents(data);
        });
        return () => unsubscribe && unsubscribe();
    }, [negocioId]);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        if (!newStudent.alumno || !newStudent.tutor || !newStudent.telefono) {
            alert("Completa todos los campos obligatorios.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitInscripcion(negocioId, newStudent);
            setIsAddModalOpen(false);
            setNewStudent({ alumno: '', edad: '', tutor: '', telefono: '', categoria: 'Mini-Cracks' });
        } catch (err) {
            alert("Error al registrar alumno.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePayment = async (studentId, currentPayment) => {
        const nextPayment = currentPayment === 'paid' ? 'pending' : currentPayment === 'pending' ? 'overdue' : 'paid';
        await updateInscripcionStatus(negocioId, studentId, { payment: nextPayment });
        if (selectedStudentDetail && selectedStudentDetail.id === studentId) {
            setSelectedStudentDetail(prev => ({ ...prev, payment: nextPayment }));
        }
    };

    const handleDelete = async (studentId) => {
        if (window.confirm("¿Eliminar este alumno de la lista de pre-inscripciones?")) {
            await deleteInscripcion(negocioId, studentId);
            if (selectedStudentDetail?.id === studentId) {
                setSelectedStudentDetail(null);
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            (student.name || '').toLowerCase().includes(query) ||
            (student.guardian || '').toLowerCase().includes(query) ||
            (student.phone || '').toLowerCase().includes(query) ||
            (student.category || '').toLowerCase().includes(query);

        const matchesCat = selectedCategory === 'Todas' || student.category === selectedCategory;
        const matchesPayment = selectedPaymentFilter === 'Todos' || student.payment === selectedPaymentFilter;

        return matchesSearch && matchesCat && matchesPayment;
    });

    const totalStudents = students.length;
    const paidCount = students.filter(s => s.payment === 'paid').length;
    const pendingCount = students.filter(s => s.payment === 'pending').length;
    const overdueCount = students.filter(s => s.payment === 'overdue').length;

    const formatDate = (isoStr) => {
        if (!isoStr) return 'Reciente';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Reciente';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                        Gestión <span className="text-blue-500">Escuela</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Administración de pre-inscripciones y alumnos por categoría</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <UserPlus size={16} /> Nuevo Alumno
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Inscritos', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Al Día (Pagados)', value: paidCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Cuotas Pendientes', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'En Deuda', value: overdueCount, icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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
                            placeholder="Buscar alumno, tutor, teléfono o categoría..."
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none"
                        >
                            <option value="Todas">Todas las categorías</option>
                            <option value="Mini-Cracks">Mini-Cracks (4-6 años)</option>
                            <option value="Pre-Infantil">Pre-Infantil (7-9 años)</option>
                            <option value="Infantil">Infantil (10-12 años)</option>
                            <option value="Juveniles">Juveniles (13-15 años)</option>
                        </select>
                        <select
                            value={selectedPaymentFilter}
                            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                            className="px-4 py-2 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none"
                        >
                            <option value="Todos">Todos los pagos</option>
                            <option value="paid">Al día</option>
                            <option value="pending">Pendientes</option>
                            <option value="overdue">Deuda</option>
                        </select>
                    </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Alumno</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría & Horario</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tutor / WhatsApp</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cuota</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado Pago</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.map((student) => {
                                const catMeta = CATEGORY_DETAILS[student.category] || CATEGORY_DETAILS['Mini-Cracks'];
                                const days = student.scheduleDays || catMeta.days;
                                const time = student.scheduleTime || catMeta.time;
                                const fee = student.monthlyFee || catMeta.price;

                                return (
                                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-500/20">
                                                    {(student.name || 'A').split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{student.age} años</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-wider">
                                                    {student.category}
                                                </span>
                                                <p className="text-[10px] text-slate-400 font-medium">{days} • {time}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-white/80 font-medium">{student.guardian}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <Phone size={10} className="text-emerald-400" /> {student.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black italic text-white">{fee}</span>
                                            <span className="block text-[8px] text-slate-500 font-bold uppercase">mensual</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleTogglePayment(student.id, student.payment)}
                                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                title="Haz clic para cambiar el estado de pago"
                                            >
                                                <div className={`w-2 h-2 rounded-full ${student.payment === 'paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        student.payment === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                            'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                                    }`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${student.payment === 'paid' ? 'text-emerald-500' :
                                                        student.payment === 'pending' ? 'text-amber-500' :
                                                            'text-rose-500'
                                                    }`}>
                                                    {student.payment === 'paid' ? 'Al día' :
                                                        student.payment === 'pending' ? 'Pendiente' :
                                                            'Deuda'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedStudentDetail(student)}
                                                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                                    title="Ver Ficha Completa"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <a
                                                    href={`https://wa.me/${(student.phone || '').replace(/[^0-9]/g, '')}?text=Hola! Te contactamos de la Escuela de Fútbol Giovanni por la pre-inscripción de ${student.name}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    title="Contactar por WhatsApp"
                                                >
                                                    <MessageCircle size={14} />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
                                        No se encontraron inscripciones registradas con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/[0.01] flex items-center justify-between border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Mostrando {filteredStudents.length} de {students.length} pre-inscritos
                    </p>
                </div>
            </div>

            {/* Modal Ficha Completa Alumno */}
            {selectedStudentDetail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="relative w-full max-w-lg bg-slate-900 rounded-[32px] border border-white/10 p-8 space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Ficha de Pre-Inscripción</span>
                                <h3 className="text-2xl font-black uppercase italic text-white">{selectedStudentDetail.name}</h3>
                            </div>
                            <button onClick={() => setSelectedStudentDetail(null)} className="p-2 text-slate-500 hover:text-white rounded-full"><X size={20} /></button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Edad Alumno</span>
                                    <span className="font-black text-white text-sm">{selectedStudentDetail.age} años</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Categoría Asignada</span>
                                    <span className="font-black text-blue-400 text-sm">{selectedStudentDetail.category}</span>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Días de Entrenamiento</span>
                                    <span className="font-bold text-white">{selectedStudentDetail.scheduleDays || CATEGORY_DETAILS[selectedStudentDetail.category]?.days}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Horario</span>
                                    <span className="font-bold text-white">{selectedStudentDetail.scheduleTime || CATEGORY_DETAILS[selectedStudentDetail.category]?.time}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Valor Cuota Mensual</span>
                                    <span className="font-black text-emerald-400 text-sm">{selectedStudentDetail.monthlyFee || CATEGORY_DETAILS[selectedStudentDetail.category]?.price}</span>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Tutor / Responsable</span>
                                    <span className="font-bold text-white">{selectedStudentDetail.guardian}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">WhatsApp Contacto</span>
                                    <span className="font-bold text-emerald-400">{selectedStudentDetail.phone}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Fecha Pre-Inscripción</span>
                                    <span className="text-slate-400 font-medium">{formatDate(selectedStudentDetail.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <a
                                href={`https://wa.me/${(selectedStudentDetail.phone || '').replace(/[^0-9]/g, '')}?text=Hola! Te contactamos de la Escuela de Fútbol Giovanni por la pre-inscripción de ${selectedStudentDetail.name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-black uppercase text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={16} /> WhatsApp
                            </a>
                            <button
                                onClick={() => handleTogglePayment(selectedStudentDetail.id, selectedStudentDetail.payment)}
                                className="px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/5"
                            >
                                Estado: {selectedStudentDetail.payment === 'paid' ? 'Al día' : selectedStudentDetail.payment === 'pending' ? 'Pendiente' : 'Deuda'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Alumno */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="relative w-full max-w-lg bg-slate-900 rounded-[32px] border border-white/10 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Nuevo <span className="text-blue-500">Alumno</span></h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-white rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Nombre del Alumno</label>
                                <input type="text" required value={newStudent.alumno} onChange={(e) => setNewStudent({ ...newStudent, alumno: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ej: Mateo González" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Edad</label>
                                    <input type="number" required value={newStudent.edad} onChange={(e) => setNewStudent({ ...newStudent, edad: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ej: 7" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Categoría</label>
                                    <select value={newStudent.categoria} onChange={(e) => setNewStudent({ ...newStudent, categoria: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500">
                                        <option value="Mini-Cracks">Mini-Cracks (4-6)</option>
                                        <option value="Pre-Infantil">Pre-Infantil (7-9)</option>
                                        <option value="Infantil">Infantil (10-12)</option>
                                        <option value="Juveniles">Juveniles (13-15)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Tutor / Responsable</label>
                                <input type="text" required value={newStudent.tutor} onChange={(e) => setNewStudent({ ...newStudent, tutor: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ej: Juan González" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">WhatsApp de Contacto</label>
                                <input type="tel" required value={newStudent.telefono} onChange={(e) => setNewStudent({ ...newStudent, telefono: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ej: 11 2233-4455" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Alumno'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
