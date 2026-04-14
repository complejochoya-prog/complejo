import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Clock, Sun, Moon, CalendarOff, Plus, Trash2, Save, X, Shield,
    CheckCircle2, XCircle, CalendarDays, Lock, AlertTriangle, MapPin, Timer
} from 'lucide-react';
import {
    fetchHorariosConfig,
    updateHorariosConfig,
    updateEspacioHorarios,
    fetchBloqueos,
    addBloqueo,
    removeBloqueo,
    getHorasDisponibles
} from '../services/horariosService';
import { fetchEspacios } from '../services/espaciosService';

const DIAS_SEMANA = [
    { key: 'lun', label: 'Lunes', short: 'LUN' },
    { key: 'mar', label: 'Martes', short: 'MAR' },
    { key: 'mie', label: 'Miércoles', short: 'MIÉ' },
    { key: 'jue', label: 'Jueves', short: 'JUE' },
    { key: 'vie', label: 'Viernes', short: 'VIE' },
    { key: 'sab', label: 'Sábado', short: 'SÁB' },
    { key: 'dom', label: 'Domingo', short: 'DOM' },
];

export default function HorariosPage() {
    const { negocioId } = useParams();
    const [config, setConfig] = useState(null);
    const [espacios, setEspacios] = useState([]);
    const [bloqueos, setBloqueos] = useState([]);
    const [showBloqueoModal, setShowBloqueoModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [tab, setTab] = useState('horarios'); // 'horarios' | 'bloqueos'

    // Bloqueo form
    const [bloqueoForm, setBloqueoForm] = useState({
        espacioId: '',
        fecha: '',
        tipo: 'evento_privado',
        modo: 'dia_completo',
        horaInicio: '08:00',
        horaFin: '23:00',
        motivo: ''
    });

    const horas = useMemo(() => getHorasDisponibles(), []);

    useEffect(() => {
        loadData();
        window.addEventListener('storage_horarios', loadData);
        return () => window.removeEventListener('storage_horarios', loadData);
    }, [negocioId]);

    const loadData = () => {
        const cfg = fetchHorariosConfig();
        setConfig(cfg);
        setEspacios(fetchEspacios(negocioId));
        setBloqueos(fetchBloqueos());
    };

    const handleSaveConfig = () => {
        updateHorariosConfig(config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const handleEspacioHorarioChange = (espacioId, field, value) => {
        setConfig(prev => ({
            ...prev,
            espaciosHorarios: {
                ...(prev.espaciosHorarios || {}),
                [espacioId]: {
                    ...(prev.espaciosHorarios?.[espacioId] || { horaApertura: prev.horaApertura, horaCierre: prev.horaCierre }),
                    [field]: value
                }
            }
        }));
    };

    const handleResetEspacioHorario = (espacioId) => {
        setConfig(prev => {
            const newEspaciosHorarios = { ...(prev.espaciosHorarios || {}) };
            delete newEspaciosHorarios[espacioId];
            return { ...prev, espaciosHorarios: newEspaciosHorarios };
        });
    };

    const handleToggleDia = (diaKey) => {
        setConfig(prev => ({
            ...prev,
            diasOperativos: {
                ...prev.diasOperativos,
                [diaKey]: !prev.diasOperativos[diaKey]
            }
        }));
    };

    const handleAddBloqueo = (e) => {
        e.preventDefault();
        if (!bloqueoForm.espacioId || !bloqueoForm.fecha) {
            alert('Seleccioná un espacio y una fecha');
            return;
        }
        addBloqueo(bloqueoForm);
        setShowBloqueoModal(false);
        setBloqueoForm({
            espacioId: '',
            fecha: '',
            tipo: 'evento_privado',
            modo: 'dia_completo',
            horaInicio: '08:00',
            horaFin: '23:00',
            motivo: ''
        });
        loadData();
    };

    const handleRemoveBloqueo = (id) => {
        if (window.confirm('¿Eliminar este bloqueo?')) {
            removeBloqueo(id);
            loadData();
        }
    };

    const getEspacioNombre = (id) => {
        const e = espacios.find(esp => esp.id === id);
        return e ? e.title : id;
    };

    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case 'evento_privado': return 'Evento Privado';
            case 'mantenimiento': return 'Mantenimiento';
            case 'cerrado': return 'Cerrado';
            default: return tipo;
        }
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'evento_privado': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'mantenimiento': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cerrado': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (!config) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        HORARIOS Y <span className="text-emerald-500">DISPONIBILIDAD</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        Gestión de apertura, cierre y bloqueos por espacio
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBloqueoModal(true)}
                        className="flex items-center gap-2 bg-purple-500 text-white px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <CalendarOff size={18} /> Nuevo Bloqueo
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 max-w-md">
                <button
                    onClick={() => setTab('horarios')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === 'horarios' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Clock size={14} /> Horarios
                </button>
                <button
                    onClick={() => setTab('bloqueos')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === 'bloqueos' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <CalendarOff size={14} /> Bloqueos
                    {bloqueos.length > 0 && (
                        <span className="bg-white/20 text-[8px] font-black px-2 py-0.5 rounded-full">{bloqueos.length}</span>
                    )}
                </button>
            </div>

            {/* ═══════════════ TAB: HORARIOS ═══════════════ */}
            {tab === 'horarios' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Horario de Apertura y Cierre */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Horario del Complejo</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Apertura y cierre general</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Sun size={14} /> Hora Apertura
                                </label>
                                <select
                                    value={config.horaApertura}
                                    onChange={(e) => setConfig(prev => ({ ...prev, horaApertura: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black italic text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                >
                                    {horas.map(h => (
                                        <option key={h} value={h} className="bg-slate-900">{h} hs</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    <Moon size={14} /> Hora Cierre
                                </label>
                                <select
                                    value={config.horaCierre}
                                    onChange={(e) => setConfig(prev => ({ ...prev, horaCierre: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black italic text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                >
                                    {horas.map(h => (
                                        <option key={h} value={h} className="bg-slate-900">{h} hs</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3">
                            <Timer size={16} className="text-emerald-500 mt-0.5 flex-none" />
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                Los horarios de apertura y cierre definen la franja en la que los clientes pueden reservar turnos.
                                Si el cierre es menor que la apertura (ej: cierre 03:00), se interpreta como madrugada del día siguiente.
                            </p>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
                                saveSuccess
                                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                                    : 'bg-white text-black hover:bg-emerald-500 hover:text-black shadow-white/10 hover:shadow-emerald-500/20'
                            }`}
                        >
                            {saveSuccess ? (
                                <><CheckCircle2 size={18} /> GUARDADO CORRECTAMENTE</>
                            ) : (
                                <><Save size={18} /> GUARDAR HORARIOS</>
                            )}
                        </button>
                    </div>

                    {/* Días Operativos */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                <CalendarDays size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Días Operativos</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Días que el complejo está abierto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {DIAS_SEMANA.map(dia => {
                                const isActive = config.diasOperativos?.[dia.key] ?? true;
                                return (
                                    <button
                                        key={dia.key}
                                        onClick={() => handleToggleDia(dia.key)}
                                        className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 group ${
                                            isActive
                                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                                                : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                                isActive
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-red-500/10 text-red-500'
                                            }`}>
                                                {dia.short}
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-tight text-white">{dia.label}</span>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full relative transition-all ${
                                            isActive ? 'bg-emerald-500' : 'bg-slate-700'
                                        }`}>
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${
                                                isActive ? 'left-6' : 'left-1'
                                            }`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                        >
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </div>

                    {/* Horarios por Espacio */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Horarios por Espacio</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Cada espacio puede tener su propio horario de apertura y cierre</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {espacios.map(esp => {
                                const espH = config.espaciosHorarios?.[esp.id];
                                const tieneHorarioPropio = !!espH;
                                const apertura = espH?.horaApertura || config.horaApertura;
                                const cierre = espH?.horaCierre || config.horaCierre;

                                return (
                                    <div key={esp.id} className={`p-6 rounded-[28px] border transition-all ${
                                        tieneHorarioPropio
                                            ? 'bg-cyan-500/5 border-cyan-500/20'
                                            : 'bg-white/[0.02] border-white/5'
                                    }`}>
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex items-center gap-3 md:w-48 flex-none">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-none">
                                                    {esp.img ? (
                                                        <img src={esp.img} alt={esp.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-600"><MapPin size={16} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black italic uppercase tracking-tighter text-white truncate">{esp.title}</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{esp.desc}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Sun size={14} className="text-emerald-500 flex-none" />
                                                    <select
                                                        value={apertura}
                                                        onChange={(e) => handleEspacioHorarioChange(esp.id, 'horaApertura', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-black italic text-white focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                                                    >
                                                        {horas.map(h => (
                                                            <option key={h} value={h} className="bg-slate-900">{h}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <span className="text-slate-600 text-xs font-black">→</span>

                                                <div className="flex items-center gap-2 flex-1">
                                                    <Moon size={14} className="text-indigo-400 flex-none" />
                                                    <select
                                                        value={cierre}
                                                        onChange={(e) => handleEspacioHorarioChange(esp.id, 'horaCierre', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-black italic text-white focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                                                    >
                                                        {horas.map(h => (
                                                            <option key={h} value={h} className="bg-slate-900">{h}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-none">
                                                {tieneHorarioPropio ? (
                                                    <button
                                                        onClick={() => handleResetEspacioHorario(esp.id)}
                                                        className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                                                    >
                                                        Usar General
                                                    </button>
                                                ) : (
                                                    <span className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-600 border border-white/5">
                                                        Horario General
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-cyan-500 text-black text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                        >
                            <Save size={18} /> Guardar Horarios de Espacios
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════ TAB: BLOQUEOS ═══════════════ */}
            {tab === 'bloqueos' && (
                <div className="space-y-6">
                    {/* Info */}
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-[32px] p-6 flex items-start gap-4">
                        <AlertTriangle size={20} className="text-purple-400 mt-0.5 flex-none" />
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight mb-1">Bloqueos por Espacio</p>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                Los bloqueos permiten cerrar un espacio específico por <strong className="text-purple-400">evento privado</strong>,
                                <strong className="text-amber-400"> mantenimiento</strong> o <strong className="text-red-400">cierre temporal</strong>.
                                Podés bloquear el día completo o solo una franja horaria. Cada espacio se maneja de forma independiente.
                            </p>
                        </div>
                    </div>

                    {/* Bloqueos Grid */}
                    {bloqueos.length === 0 ? (
                        <div className="bg-slate-900/50 border border-white/5 rounded-[40px] py-20 flex flex-col items-center gap-4">
                            <CalendarOff size={48} className="text-slate-700" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-600">No hay bloqueos configurados</p>
                            <button
                                onClick={() => setShowBloqueoModal(true)}
                                className="mt-4 flex items-center gap-2 bg-purple-500/10 text-purple-400 px-6 py-3 rounded-2xl border border-purple-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all"
                            >
                                <Plus size={14} /> Crear primer bloqueo
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bloqueos.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(bloqueo => (
                                <div key={bloqueo.id} className="bg-slate-900/50 border border-white/5 rounded-[32px] p-6 space-y-4 hover:border-purple-500/20 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getTipoColor(bloqueo.tipo)}`}>
                                            <Lock size={10} /> {getTipoLabel(bloqueo.tipo)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveBloqueo(bloqueo.id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-white">
                                            <MapPin size={14} className="text-purple-400" />
                                            <span className="text-sm font-black italic uppercase tracking-tighter">{getEspacioNombre(bloqueo.espacioId)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-bold uppercase tracking-tight">{bloqueo.fecha}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                {bloqueo.modo === 'dia_completo' ? 'Todo el día' : `${bloqueo.horaInicio} - ${bloqueo.horaFin}`}
                                            </span>
                                        </div>
                                    </div>

                                    {bloqueo.motivo && (
                                        <p className="text-[10px] text-slate-500 font-bold bg-white/5 rounded-xl px-4 py-2 italic">
                                            "{bloqueo.motivo}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════ MODAL: NUEVO BLOQUEO ═══════════════ */}
            {showBloqueoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-purple-500 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-white">
                                <CalendarOff size={24} />
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Nuevo Bloqueo</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">Cerrar espacio por evento o mantenimiento</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBloqueoModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleAddBloqueo} className="p-8 space-y-6">
                            {/* Espacio */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Espacio</label>
                                <select
                                    value={bloqueoForm.espacioId}
                                    onChange={(e) => setBloqueoForm(prev => ({ ...prev, espacioId: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-purple-500 transition-all appearance-none text-white"
                                    required
                                >
                                    <option value="" className="bg-slate-900">Seleccionar espacio...</option>
                                    {espacios.map(esp => (
                                        <option key={esp.id} value={esp.id} className="bg-slate-900">{esp.title} — {esp.desc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha del bloqueo</label>
                                <input
                                    type="date"
                                    value={bloqueoForm.fecha}
                                    onChange={(e) => setBloqueoForm(prev => ({ ...prev, fecha: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-purple-500 transition-all text-white"
                                    required
                                />
                            </div>

                            {/* Tipo */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Motivo del cierre</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'evento_privado', label: 'Evento Privado', color: 'purple' },
                                        { key: 'mantenimiento', label: 'Mantenimiento', color: 'amber' },
                                        { key: 'cerrado', label: 'Cerrado', color: 'red' },
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => setBloqueoForm(prev => ({ ...prev, tipo: t.key }))}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                bloqueoForm.tipo === t.key
                                                    ? `bg-${t.color}-500/20 border-${t.color}-500/40 text-${t.color}-400`
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modo */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de bloqueo</label>
                                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setBloqueoForm(prev => ({ ...prev, modo: 'dia_completo' }))}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            bloqueoForm.modo === 'dia_completo' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500'
                                        }`}
                                    >
                                        Día Completo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBloqueoForm(prev => ({ ...prev, modo: 'franja' }))}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            bloqueoForm.modo === 'franja' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500'
                                        }`}
                                    >
                                        Franja Horaria
                                    </button>
                                </div>
                            </div>

                            {/* Franja horaria */}
                            {bloqueoForm.modo === 'franja' && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Desde</label>
                                        <select
                                            value={bloqueoForm.horaInicio}
                                            onChange={(e) => setBloqueoForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-purple-500 transition-all appearance-none text-white"
                                        >
                                            {horas.map(h => (
                                                <option key={h} value={h} className="bg-slate-900">{h} hs</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Hasta</label>
                                        <select
                                            value={bloqueoForm.horaFin}
                                            onChange={(e) => setBloqueoForm(prev => ({ ...prev, horaFin: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-purple-500 transition-all appearance-none text-white"
                                        >
                                            {horas.map(h => (
                                                <option key={h} value={h} className="bg-slate-900">{h} hs</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Motivo */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción (opcional)</label>
                                <input
                                    type="text"
                                    value={bloqueoForm.motivo}
                                    onChange={(e) => setBloqueoForm(prev => ({ ...prev, motivo: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-purple-500 transition-all text-white"
                                    placeholder="Ej: Torneo relámpago de la liga..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 py-5 bg-purple-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                            >
                                <Lock size={18} /> Crear Bloqueo
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}
