import React, { useState, useEffect, useMemo } from 'react';
import { 
    Bell, 
    Plus, 
    Search, 
    Filter, 
    Trash2, 
    Edit2, 
    Clock, 
    Calendar, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Eye, 
    X, 
    ArrowRight, 
    Tag, 
    Utensils, 
    Trophy, 
    Flame, 
    Layers, 
    Power,
    Play
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { notificacionesService, DEFAULT_NOTIFICACIONES, isNotifVigente } from '../../../core/services/notificacionesService';

export default function NotificacionesPage() {
    const { negocioId: paramsNegocioId } = useParams();
    const { config, negocioId: configNegocioId } = useConfig();
    const negocioId = paramsNegocioId || configNegocioId || 'giovanni';

    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEspacio, setFilterEspacio] = useState('todos');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Preview simulator state
    const [previewNotif, setPreviewNotif] = useState(null);

    // Form state
    // Re-render every minute to update vigencia status
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    const initialForm = {
        titulo: '',
        mensaje: '',
        espacio: 'bar',
        dias: ['todos'],
        horaDesde: '20:00',
        horaHasta: '00:00',
        duracion: 5,
        tema: 'amber',
        badge: 'PROMO 2X1',
        link: 'menu',
        linkTexto: 'Ver Menú & Pedir',
        activa: true,
        promoItem: {
            nombre: '',
            descripcion: '',
            precio: '',
            precioOriginal: '',
            img: ''
        }
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        const unsub = notificacionesService.subscribeNotificaciones(
            negocioId,
            (data) => {
                setNotificaciones(data || DEFAULT_NOTIFICACIONES);
                setLoading(false);
            },
            (err) => {
                setNotificaciones(DEFAULT_NOTIFICACIONES);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [negocioId]);

    const diasSemana = [
        { id: 'todos', label: 'Todos los días' },
        { id: 'lunes', label: 'Lunes' },
        { id: 'martes', label: 'Martes' },
        { id: 'miercoles', label: 'Miércoles' },
        { id: 'jueves', label: 'Jueves' },
        { id: 'viernes', label: 'Viernes' },
        { id: 'sabado', label: 'Sábado' },
        { id: 'domingo', label: 'Domingo' }
    ];

    const espaciosDisponibles = [
        { id: 'bar', label: 'Bar & Gastronomía', icon: Utensils, desc: 'Aparece al entrar a Bar, Menú o Carrito' },
        { id: 'reservas', label: 'Canchas & Reservas', icon: Calendar, desc: 'Aparece al entrar a Reservar Cancha' },
        { id: 'torneos', label: 'Torneos & Ligas', icon: Trophy, desc: 'Aparece al entrar a Torneos' },
        { id: 'escuela', label: 'Escuela Deportiva', icon: Trophy, desc: 'Aparece al entrar a Escuela' },
        { id: 'todos', label: 'Global (Todo el Complejo)', icon: Layers, desc: 'Aparece en toda la aplicación cliente' }
    ];

    const temasColor = [
        { id: 'amber', label: 'Dorado / Promo', bg: 'bg-amber-500' },
        { id: 'emerald', label: 'Verde / Descuento', bg: 'bg-emerald-500' },
        { id: 'indigo', label: 'Violeta / Evento', bg: 'bg-indigo-500' },
        { id: 'rose', label: 'Rojo / Relámpago', bg: 'bg-rose-500' }
    ];

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            titulo: item.titulo || '',
            mensaje: item.mensaje || '',
            espacio: item.espacio || 'bar',
            dias: Array.isArray(item.dias) ? item.dias : ['todos'],
            horaDesde: item.horaDesde || '20:00',
            horaHasta: item.horaHasta || '00:00',
            duracion: item.duracion || 5,
            tema: item.tema || 'amber',
            badge: item.badge || 'PROMO',
            link: item.link || '',
            linkTexto: item.linkTexto || 'Ver Ahora',
            activa: item.activa !== undefined ? item.activa : true,
            promoItem: item.promoItem ? {
                nombre: item.promoItem.nombre || '',
                descripcion: item.promoItem.descripcion || '',
                precio: item.promoItem.precio || '',
                precioOriginal: item.promoItem.precioOriginal || '',
                img: item.promoItem.img || ''
            } : { nombre: '', descripcion: '', precio: '', precioOriginal: '', img: '' }
        });
        setIsModalOpen(true);
    };

    const handleToggleDia = (diaId) => {
        setFormData(prev => {
            if (diaId === 'todos') {
                return { ...prev, dias: ['todos'] };
            }
            let newDias = prev.dias.filter(d => d !== 'todos');
            if (newDias.includes(diaId)) {
                newDias = newDias.filter(d => d !== diaId);
                if (newDias.length === 0) newDias = ['todos'];
            } else {
                newDias.push(diaId);
            }
            return { ...prev, dias: newDias };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.titulo.trim()) {
            alert("Por favor ingresa un título para la notificación.");
            return;
        }

        setSaving(true);
        try {
            await notificacionesService.saveNotificacion(negocioId, {
                ...formData,
                id: editingId || `notif-${Date.now()}`
            });
            setIsModalOpen(false);
            setEditingId(null);
        } catch (error) {
            console.error("Error guardando notificación:", error);
            alert("Error al guardar la notificación.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEstado = async (id, currentEstado) => {
        try {
            await notificacionesService.toggleEstado(negocioId, id, currentEstado);
        } catch (err) {
            console.error("Error cambiando estado:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta notificación emergente?")) {
            try {
                await notificacionesService.deleteNotificacion(negocioId, id);
            } catch (err) {
                console.error("Error eliminando notificación:", err);
            }
        }
    };

    // Filtrar notificaciones
    const filteredNotificaciones = useMemo(() => {
        return notificaciones.filter(n => {
            const matchesSearch = (n.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (n.mensaje || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesEspacio = filterEspacio === 'todos' || n.espacio === filterEspacio;
            return matchesSearch && matchesEspacio;
        });
    }, [notificaciones, searchTerm, filterEspacio]);

    const stats = useMemo(() => {
        return {
            total: notificaciones.length,
            activas: notificaciones.filter(n => n.activa).length,
            bar: notificaciones.filter(n => n.espacio === 'bar').length,
            reservas: notificaciones.filter(n => n.espacio === 'reservas').length
        };
    }, [notificaciones]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* Header del módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-[0.25em] mb-1">
                        <Bell size={16} className="animate-pulse" /> Marketing & Popups Emergentes
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white">
                        Notificaciones Emergentes
                    </h1>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                        Crea promociones y avisos inteligentes (3 a 5 seg) que aparecen cuando el cliente visita el Bar, Canchas o Torneos.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 active:scale-95 transition-all shrink-0"
                >
                    <Plus size={18} />
                    Crear Notificación
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-white/5 p-6 rounded-[28px] shadow-xl backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Creadas</p>
                    <p className="text-3xl font-black italic text-white">{stats.total}</p>
                </div>
                <div className="bg-slate-900/80 border border-emerald-500/20 p-6 rounded-[28px] shadow-xl backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Activas Ahora</p>
                    <p className="text-3xl font-black italic text-emerald-400">{stats.activas}</p>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-[28px] shadow-xl backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Promos en Bar</p>
                    <p className="text-3xl font-black italic text-amber-400">{stats.bar}</p>
                </div>
                <div className="bg-slate-900/80 border border-indigo-500/20 p-6 rounded-[28px] shadow-xl backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Promos Canchas</p>
                    <p className="text-3xl font-black italic text-indigo-400">{stats.reservas}</p>
                </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-[28px] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar promoción o aviso..."
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {['todos', 'bar', 'reservas', 'torneos'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterEspacio(cat)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filterEspacio === cat 
                                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {cat === 'todos' ? 'Todos los Espacios' : cat === 'bar' ? 'Bar' : cat === 'reservas' ? 'Canchas' : 'Torneos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de Notificaciones Configuradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotificaciones.map(notif => {
                    const diasTexto = notif.dias?.includes('todos') 
                        ? 'Todos los días' 
                        : notif.dias?.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');

                    return (
                        <div 
                            key={notif.id}
                            className={`bg-slate-900 border ${notif.activa ? 'border-white/10 hover:border-amber-500/40' : 'border-white/5 opacity-60'} p-6 rounded-[32px] shadow-xl flex flex-col justify-between transition-all group relative overflow-hidden`}
                        >
                            <div className="space-y-4">
                                {/* Header card */}
                                <div className="flex items-start justify-between gap-3">
                                    <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-amber-400">
                                        {notif.badge || 'PROMO'}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleEstado(notif.id, notif.activa)}
                                            className={`p-2 rounded-xl transition-all ${
                                                notif.activa 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                            }`}
                                            title={notif.activa ? 'Notificación activa (Clic para pausar)' : 'Notificación pausada (Clic para activar)'}
                                        >
                                            <Power size={14} />
                                        </button>

                                        <button
                                            onClick={() => handleOpenEdit(notif)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={14} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white leading-tight mb-2">
                                        {notif.titulo}
                                    </h3>
                                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                                        {notif.mensaje}
                                    </p>
                                </div>

                                {/* Metadatos de visualización */}
                                <div className="space-y-2 pt-3 border-t border-white/5 text-[10px]">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                            <Utensils size={12} className="text-amber-400" /> Espacio:
                                        </span>
                                        <span className="font-black text-white uppercase">{notif.espacio}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={12} className="text-indigo-400" /> Días:
                                        </span>
                                        <span className="font-bold text-slate-300 truncate max-w-[150px]">{diasTexto}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock size={12} className="text-emerald-400" /> Horario:
                                        </span>
                                        <span className="font-bold text-slate-300">{notif.horaDesde} a {notif.horaHasta} hs</span>
                                    </div>

                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={12} className="text-rose-400" /> Duración Popup:
                                        </span>
                                        <span className="font-bold text-white">{notif.duracion || 5} Segundos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                                {/* Estado vigencia en tiempo real */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                        notif.activa 
                                            ? isNotifVigente(notif)
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-amber-500/10 text-amber-400'
                                            : 'bg-slate-800 text-slate-500'
                                    }`}>
                                        {notif.activa 
                                            ? isNotifVigente(notif) 
                                                ? '● Activa & Vigente AHORA' 
                                                : '◐ Activa (Fuera de horario)' 
                                            : '○ Pausada'
                                        }
                                    </span>

                                    <button
                                        onClick={() => setPreviewNotif(notif)}
                                        className="text-[9px] font-black uppercase tracking-widest text-amber-400 hover:underline flex items-center gap-1"
                                    >
                                        <Play size={10} /> Previsualizar
                                    </button>
                                </div>

                                {/* Indicador de producto promo si es bar */}
                                {notif.promoItem && notif.espacio === 'bar' && (
                                    <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
                                        <Tag size={11} className="text-amber-400" />
                                        <span className="text-[9px] font-bold text-slate-300">
                                            Producto: <span className="text-amber-400 font-black">{notif.promoItem.nombre}</span>
                                            {notif.promoItem.precioOriginal ? (
                                                <> — <span className="line-through text-slate-500">${Number(notif.promoItem.precioOriginal).toLocaleString()}</span> → <span className="text-emerald-400">${Number(notif.promoItem.precio).toLocaleString()}</span></>
                                            ) : notif.promoItem.precio ? (
                                                <> — <span className="text-emerald-400">${Number(notif.promoItem.precio).toLocaleString()}</span></>
                                            ) : null}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredNotificaciones.length === 0 && !loading && (
                <div className="py-20 text-center bg-slate-900/40 border border-white/5 rounded-[40px] space-y-4">
                    <Bell size={48} className="mx-auto text-slate-800 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        No hay notificaciones emergentes configuradas
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-xs inline-flex items-center gap-2"
                    >
                        <Plus size={16} /> Crear la primera notificación
                    </button>
                </div>
            )}

            {/* ── Modal de Creación / Edición ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] p-6 sm:p-8 max-w-2xl w-full my-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    {editingId ? 'Editar Notificación Emergente' : 'Nueva Notificación Emergente'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    Configura cuándo y dónde se mostrará el popup al cliente
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6 text-xs">
                            {/* Título & Badge */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título de la Promoción *</label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.titulo}
                                        onChange={(e) => setFormData(p => ({ ...p, titulo: e.target.value }))}
                                        placeholder="Ej: ¡Promo 2x1 en Cervezas en el Bar!"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Etiqueta / Badge</label>
                                    <input 
                                        type="text"
                                        value={formData.badge}
                                        onChange={(e) => setFormData(p => ({ ...p, badge: e.target.value.toUpperCase() }))}
                                        placeholder="Ej: PROMO 2X1"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 uppercase"
                                    />
                                </div>
                            </div>

                            {/* Mensaje descriptivo */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensaje / Detalle de la Promo *</label>
                                <textarea 
                                    rows="3"
                                    required
                                    value={formData.mensaje}
                                    onChange={(e) => setFormData(p => ({ ...p, mensaje: e.target.value }))}
                                    placeholder="Ej: Aprovechá 2 horas por $10.000 reservando turnos de 08:00 a 12:00 hs. ¡Cupos limitados!"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-amber-500 resize-none"
                                />
                            </div>

                            {/* Espacio / Sección objetivo */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿En qué espacio debe aparecer?</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {espaciosDisponibles.map(esp => (
                                        <button
                                            type="button"
                                            key={esp.id}
                                            onClick={() => setFormData(p => ({ ...p, espacio: esp.id, link: esp.id === 'bar' ? 'menu' : esp.id }))}
                                            className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                                                formData.espacio === esp.id 
                                                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                                                    : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <esp.icon size={14} />
                                                <span className="font-black text-[10px] uppercase">{esp.label}</span>
                                            </div>
                                            <span className="text-[8px] text-slate-500 line-clamp-1">{esp.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Días aplicables */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Días que se mostrará</label>
                                <div className="flex flex-wrap gap-2">
                                    {diasSemana.map(d => {
                                        const isSelected = formData.dias.includes(d.id);
                                        return (
                                            <button
                                                type="button"
                                                key={d.id}
                                                onClick={() => handleToggleDia(d.id)}
                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                    isSelected
                                                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {d.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Horarios (Desde / Hasta) & Duración */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hora Inicio (Desde)</label>
                                    <input 
                                        type="time"
                                        value={formData.horaDesde}
                                        onChange={(e) => setFormData(p => ({ ...p, horaDesde: e.target.value }))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hora Fin (Hasta)</label>
                                    <input 
                                        type="time"
                                        value={formData.horaHasta}
                                        onChange={(e) => setFormData(p => ({ ...p, horaHasta: e.target.value }))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duración Emergente</label>
                                    <select
                                        value={formData.duracion}
                                        onChange={(e) => setFormData(p => ({ ...p, duracion: Number(e.target.value) }))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="3">3 Segundos</option>
                                        <option value="4">4 Segundos</option>
                                        <option value="5">5 Segundos (Recomendado)</option>
                                        <option value="8">8 Segundos</option>
                                    </select>
                                </div>
                            </div>

                            {/* Color / Tema & Botón CTA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color / Estilo Visual</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {temasColor.map(tc => (
                                            <button
                                                type="button"
                                                key={tc.id}
                                                onClick={() => setFormData(p => ({ ...p, tema: tc.id }))}
                                                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                                                    formData.tema === tc.id 
                                                        ? 'bg-white/10 border-white/30 text-white font-black' 
                                                        : 'bg-slate-950 border-white/5 text-slate-400'
                                                }`}
                                            >
                                                <span className={`w-3 h-3 rounded-full ${tc.bg}`} />
                                                <span className="text-[9px] uppercase">{tc.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto del Botón Acción</label>
                                    <input 
                                        type="text"
                                        value={formData.linkTexto}
                                        onChange={(e) => setFormData(p => ({ ...p, linkTexto: e.target.value }))}
                                        placeholder="Ej: Ver Menú & Pedir"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                            {/* ── Producto Promo (solo bar) ── */}
                            {formData.espacio === 'bar' && (
                                <div className="space-y-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-[24px]">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} className="text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Producto Promo en Menú</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 -mt-2">
                                        Este producto aparecerá destacado en el menú del bar mientras la promo esté vigente.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre del Producto *</label>
                                            <input 
                                                type="text"
                                                value={formData.promoItem?.nombre || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, promoItem: { ...p.promoItem, nombre: e.target.value } }))}
                                                placeholder="Ej: Cerveza 2x1"
                                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción Corta</label>
                                            <input 
                                                type="text"
                                                value={formData.promoItem?.descripcion || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, promoItem: { ...p.promoItem, descripcion: e.target.value } }))}
                                                placeholder="Ej: 2 cervezas por el precio de 1"
                                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Precio Promo *</label>
                                            <input 
                                                type="number"
                                                value={formData.promoItem?.precio || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, promoItem: { ...p.promoItem, precio: e.target.value } }))}
                                                placeholder="1500"
                                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Precio Original (Tachado)</label>
                                            <input 
                                                type="number"
                                                value={formData.promoItem?.precioOriginal || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, promoItem: { ...p.promoItem, precioOriginal: e.target.value } }))}
                                                placeholder="3000"
                                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Imagen</label>
                                            <input 
                                                type="text"
                                                value={formData.promoItem?.img || ''}
                                                onChange={(e) => setFormData(p => ({ ...p, promoItem: { ...p.promoItem, img: e.target.value } }))}
                                                placeholder="https://..."
                                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 text-[10px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>

                            {/* Botones de acción del formulario */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold uppercase tracking-widest text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Notificación')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Previsualizador Simulator Modal ── */}
            {previewNotif && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] p-8 max-w-md w-full space-y-6 relative animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                <Eye size={14} /> Vista Previa Cliente
                            </span>
                            <button onClick={() => setPreviewNotif(null)} className="text-slate-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tarjeta idéntica a la del cliente */}
                        <div className="bg-slate-950 border border-amber-500/40 rounded-[28px] p-6 shadow-2xl space-y-3 relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    {previewNotif.badge || 'PROMO'}
                                </span>
                                <span className="text-slate-500 text-xs">✕</span>
                            </div>

                            <h4 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight">
                                {previewNotif.titulo}
                            </h4>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                {previewNotif.mensaje}
                            </p>

                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400">
                                    {previewNotif.horaDesde} a {previewNotif.horaHasta} hs
                                </span>
                                <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest">
                                    {previewNotif.linkTexto || 'Ver Ahora'} →
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                        </div>

                        <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">
                            Duración: {previewNotif.duracion || 5} segundos con cierre automático y botón 'X'
                        </p>

                        <button
                            onClick={() => setPreviewNotif(null)}
                            className="w-full py-3 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-xs"
                        >
                            Cerrar Vista Previa
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
