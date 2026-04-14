import React, { useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import {
    Plus, Trash2, Save, Edit3, X, Check,
    Trophy, Waves, UtensilsCrossed, Activity, Dumbbell,
    Phone, CreditCard, Clock, Building2, ToggleLeft, ToggleRight,
    Ban, Sparkles, ShieldCheck, MessageCircle, Info, Sun, Moon,
    CalendarClock
} from 'lucide-react';

const ICON_MAP = {
    'Trophy': Trophy,
    'Waves': Waves,
    'UtensilsCrossed': UtensilsCrossed,
    'Activity': Activity,
    'Dumbbell': Dumbbell
};

const CATEGORIES = ['Deportes', 'Social & Relax'];

export default function Settings() {
    const {
        resources, businessInfo, timeSlots, timeSchedule,
        addResource, updateResource, removeResource, toggleResource,
        updateBusinessInfo, setTimeSlots, updateTimeSchedule, toggleBlockSlot
    } = useConfig();

    const [activeTab, setActiveTab] = useState('espacios');
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saved, setSaved] = useState(false);

    // New resource form state
    const [newRes, setNewRes] = useState({ name: '', category: 'Deportes', price: 0, priceDiurno: 0, precioNocturno: 0, capacity: 10, desc: '' });

    // Business info local state
    const [localBiz, setLocalBiz] = useState({ ...businessInfo });

    // Local copy of timeSchedule for editing
    const [localSchedule, setLocalSchedule] = useState(() =>
        timeSchedule && timeSchedule.length > 0 ? timeSchedule : []
    );
    const [scheduleSaved, setScheduleSaved] = useState(false);

    const handleSaveBiz = () => {
        updateBusinessInfo(localBiz);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // All 24 hours for availability grid
    const allHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    const handleAddResource = () => {
        if (!newRes.name.trim()) return;
        const resourceToAdd = {
            ...newRes,
            price: newRes.priceDiurno || newRes.price,
            availableHours: allHours.filter(h => { const n = parseInt(h); return n >= 8 && n <= 22; }),
        };
        addResource(resourceToAdd);
        setNewRes({ name: '', category: 'Deportes', price: 0, priceDiurno: 0, precioNocturno: 0, capacity: 10, desc: '' });
        setShowAddForm(false);
    };

    const toggleResourceHour = (resId, hour) => {
        const res = resources.find(r => r.id === resId);
        if (!res) return;
        const current = res.availableHours || allHours;
        const updated = current.includes(hour)
            ? current.filter(h => h !== hour)
            : [...current, hour].sort();
        updateResource(resId, { availableHours: updated });
    };

    const handleSaveSchedule = async () => {
        await updateTimeSchedule(localSchedule);
        setScheduleSaved(true);
        setTimeout(() => setScheduleSaved(false), 2500);
    };

    const updateSlot = (index, field, value) => {
        setLocalSchedule(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const tabs = [
        { id: 'espacios', label: 'Espacios & Precios', icon: Trophy },
        { id: 'horarios', label: 'Horarios', icon: Clock },
        { id: 'config-horarios', label: 'Config. Horarios', icon: CalendarClock },
        { id: 'pagos', label: 'Contacto & Pagos', icon: CreditCard },
        { id: 'ayuda', label: 'Centro de Ayuda', icon: ShieldCheck },
        { id: 'home', label: 'Inicio (Home)', icon: Sparkles },
        { id: 'general', label: 'General', icon: Building2 },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                    CONFIGURACIÓN <span className="text-gold">MASTER</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                    Editá precios, canchas, pagos y más. Todo en un solo lugar.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-[24px] border border-white/10 w-fit overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {/* ======================= ESPACIOS ======================= */}
                {activeTab === 'espacios' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                                Canchas y Espacios
                            </h2>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                <Plus size={14} />
                                Agregar Espacio
                            </button>
                        </div>

                        {/* Add Form */}
                        {showAddForm && (
                            <div className="bg-white/[0.03] border border-gold/30 rounded-[32px] p-8 space-y-6 animate-in slide-in-from-top duration-300">
                                <h3 className="text-sm font-black uppercase tracking-tighter italic text-gold">Nuevo Espacio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre</label>
                                        <input
                                            type="text"
                                            value={newRes.name}
                                            onChange={e => setNewRes({ ...newRes, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-gold/50 transition-all text-sm"
                                            placeholder="Ej: Pádel"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoría</label>
                                        <select
                                            value={newRes.category}
                                            onChange={e => setNewRes({ ...newRes, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-gold/50 transition-all text-sm appearance-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Sun size={10} className="text-amber-400" /> Precio Diurno ($)</label>
                                        <input
                                            type="number"
                                            value={newRes.priceDiurno}
                                            onChange={e => setNewRes({ ...newRes, priceDiurno: parseInt(e.target.value) || 0, price: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-amber-500/50 transition-all text-sm text-amber-300"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Moon size={10} className="text-indigo-400" /> Precio Nocturno ($)</label>
                                        <input
                                            type="number"
                                            value={newRes.precioNocturno}
                                            onChange={e => setNewRes({ ...newRes, precioNocturno: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500/50 transition-all text-sm text-indigo-300"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Capacidad</label>
                                        <input
                                            type="number"
                                            value={newRes.capacity}
                                            onChange={e => setNewRes({ ...newRes, capacity: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-gold/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Descripción</label>
                                    <input
                                        type="text"
                                        value={newRes.desc}
                                        onChange={e => setNewRes({ ...newRes, desc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-gold/50 transition-all text-sm"
                                        placeholder="Breve descripción del espacio..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleAddResource} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gold text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                        <Check size={14} /> Guardar
                                    </button>
                                    <button onClick={() => setShowAddForm(false)} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Resource List */}
                        <div className="space-y-4">
                            {resources.map(res => (
                                <div key={res.id} className={`bg-white/[0.03] border rounded-[32px] p-6 transition-all ${res.active ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
                                    {editingId === res.id ? (
                                        /* Editing Mode */
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                                <input
                                                    type="text"
                                                    defaultValue={res.name}
                                                    onChange={e => updateResource(res.id, { name: e.target.value })}
                                                    className="bg-white/5 border border-gold/30 rounded-2xl px-5 py-3 outline-none focus:border-gold text-sm font-bold"
                                                />
                                                <select
                                                    defaultValue={res.category}
                                                    onChange={e => updateResource(res.id, { category: e.target.value })}
                                                    className="bg-white/5 border border-gold/30 rounded-2xl px-5 py-3 outline-none focus:border-gold text-sm appearance-none"
                                                >
                                                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                                </select>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">☀$</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={res.priceDiurno || res.price}
                                                        onChange={e => updateResource(res.id, { priceDiurno: parseInt(e.target.value) || 0, price: parseInt(e.target.value) || 0 })}
                                                        className="w-full bg-white/5 border border-amber-500/30 rounded-2xl pl-10 pr-5 py-3 outline-none focus:border-amber-500 text-sm text-amber-300"
                                                        placeholder="Precio Diurno"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-xs">🌙$</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={res.precioNocturno || res.price}
                                                        onChange={e => updateResource(res.id, { precioNocturno: parseInt(e.target.value) || 0 })}
                                                        className="w-full bg-white/5 border border-indigo-500/30 rounded-2xl pl-10 pr-5 py-3 outline-none focus:border-indigo-500 text-sm text-indigo-300"
                                                        placeholder="Precio Nocturno"
                                                    />
                                                </div>
                                                <input
                                                    type="number"
                                                    defaultValue={res.capacity}
                                                    onChange={e => updateResource(res.id, { capacity: parseInt(e.target.value) || 0 })}
                                                    className="bg-white/5 border border-gold/30 rounded-2xl px-5 py-3 outline-none focus:border-gold text-sm"
                                                    placeholder="Capacidad"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                defaultValue={res.desc}
                                                onChange={e => updateResource(res.id, { desc: e.target.value })}
                                                className="w-full bg-white/5 border border-gold/30 rounded-2xl px-5 py-3 outline-none focus:border-gold text-sm"
                                                placeholder="Descripción..."
                                            />
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gold text-slate-950 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Check size={14} /> Listo
                                            </button>
                                        </div>
                                    ) : (
                                        /* Display Mode */
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className={`size-14 rounded-2xl flex items-center justify-center ${res.active ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
                                                    <Trophy size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">{res.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em]">{res.category}</span>
                                                        <span className="size-1 rounded-full bg-slate-700"></span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Cap: {res.capacity}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-1">{res.desc}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1 text-sm font-black text-amber-400"><Sun size={12} /> ${(res.priceDiurno || res.price)?.toLocaleString()}</span>
                                                        <span className="text-slate-600">/</span>
                                                        <span className="flex items-center gap-1 text-sm font-black text-indigo-400"><Moon size={12} /> ${(res.precioNocturno || res.price)?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => setEditingId(res.id)} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 transition-all">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => toggleResource(res.id)} className={`p-3 rounded-xl transition-all ${res.active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                                                    {res.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                                <button onClick={() => removeResource(res.id)} className="p-3 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================= HORARIOS ======================= */}
                {activeTab === 'horarios' && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                            Franjas Horarias Disponibles
                        </h2>
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                Hacé clic en un horario para activarlo/desactivarlo. Los inactivos no se mostrarán al público.
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(slot => {
                                    const isActive = timeSlots.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => {
                                                if (isActive) {
                                                    setTimeSlots(prev => prev.filter(s => s !== slot));
                                                } else {
                                                    setTimeSlots(prev => [...prev, slot].sort());
                                                }
                                            }}
                                            className={`py-4 rounded-2xl text-sm font-black italic tracking-tighter border transition-all ${isActive
                                                ? 'bg-gold/20 border-gold text-gold shadow-inner'
                                                : 'bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/20'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bloqueo por Recurso */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-[32px] p-8 space-y-6">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-red-400 flex items-center gap-2">
                                <Ban size={16} /> Bloqueo Manual de Franjas
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                Usá esta sección para bloquear franjas específicas por mantenimiento, lluvia o eventos privados. Los usuarios verán estos horarios como "No disponible".
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resources.filter(r => r.active).map(res => (
                                    <div key={res.id} className="bg-slate-900 rounded-2xl p-5 border border-white/5 space-y-3">
                                        <span className="text-xs font-black italic uppercase tracking-tighter">{res.name}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {timeSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => toggleBlockSlot(res.id, new Date().toISOString().split('T')[0], slot)}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/5 bg-white/5 text-slate-400 hover:border-red-500/30 hover:text-red-400 transition-all"
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Per-Space Availability Grid */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-gold flex items-center gap-2">
                                <CalendarClock size={16} />
                                Disponibilidad por Espacio
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                Configurá qué horarios están disponibles para cada espacio. Solo los horarios habilitados se mostrarán al público.
                            </p>
                            <div className="space-y-6">
                                {resources.filter(r => r.active).map(res => {
                                    const resHours = res.availableHours || allHours;
                                    return (
                                        <div key={res.id} className="bg-slate-900 rounded-2xl p-5 border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black italic uppercase tracking-tighter">{res.name}</span>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {resHours.length} / 24 horas habilitadas
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                                                {allHours.map(hour => {
                                                    const isEnabled = resHours.includes(hour);
                                                    const hourNum = parseInt(hour);
                                                    const isDiurno = hourNum >= 8 && hourNum < 19;
                                                    return (
                                                        <button
                                                            key={hour}
                                                            onClick={() => toggleResourceHour(res.id, hour)}
                                                            className={`py-2 rounded-xl text-[10px] font-black tracking-tighter border transition-all ${isEnabled
                                                                ? isDiurno
                                                                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                                                    : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                                                : 'bg-white/[0.02] border-white/5 text-slate-700 opacity-50'
                                                                }`}
                                                        >
                                                            {hour}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================= CONFIG. HORARIOS ======================= */}
                {activeTab === 'config-horarios' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                                    Configuración de Horarios
                                </h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 ml-5 italic">
                                    Definí precios, tipo de horario y disponibilidad por franja.
                                </p>
                            </div>
                            <button
                                onClick={handleSaveSchedule}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${scheduleSaved
                                    ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                    : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                    }`}
                            >
                                {scheduleSaved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar Todo</>}
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded-lg bg-amber-500/20 flex items-center justify-center"><Sun size={10} className="text-amber-400" /></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diurno (08:00–19:00)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Moon size={10} className="text-indigo-400" /></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nocturno (19:00–08:00)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">L–J = Lunes a Jueves</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">V–D = Viernes a Domingo</span>
                            </div>
                        </div>

                        {/* Column headers */}
                        <div className="hidden md:grid grid-cols-[80px_1fr_1fr_1fr_80px_80px_60px] gap-3 px-4">
                            {['Franja', 'Tipo', 'Precio Día ($)', 'Precio Noche ($)', 'L–J', 'V–D', 'Estado'].map(h => (
                                <span key={h} className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</span>
                            ))}
                        </div>

                        {/* Schedule rows */}
                        <div className="space-y-2">
                            {localSchedule.map((slot, i) => {
                                const isDiurno = slot.type === 'diurno';
                                return (
                                    <div
                                        key={slot.hour}
                                        className={`grid grid-cols-2 md:grid-cols-[80px_1fr_1fr_1fr_80px_80px_60px] gap-3 items-center p-4 rounded-2xl border transition-all ${!slot.enabled
                                            ? 'bg-slate-900/40 border-white/5 opacity-60'
                                            : isDiurno
                                                ? 'bg-amber-500/5 border-amber-500/10'
                                                : 'bg-indigo-500/5 border-indigo-500/10'
                                            }`}
                                    >
                                        {/* Hour label */}
                                        <div className="flex items-center gap-2">
                                            {isDiurno
                                                ? <Sun size={12} className="text-amber-400 shrink-0" />
                                                : <Moon size={12} className="text-indigo-400 shrink-0" />
                                            }
                                            <span className={`text-sm font-black italic tracking-tighter ${isDiurno ? 'text-amber-300' : 'text-indigo-300'}`}>
                                                {slot.hour}
                                            </span>
                                        </div>

                                        {/* Type selector */}
                                        <div className="flex gap-1.5 col-span-1">
                                            <button
                                                onClick={() => updateSlot(i, 'type', 'diurno')}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${slot.type === 'diurno'
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-white/5 text-slate-500 border border-white/5 hover:border-amber-500/20'
                                                    }`}
                                            >
                                                <Sun size={10} /> Día
                                            </button>
                                            <button
                                                onClick={() => updateSlot(i, 'type', 'nocturno')}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${slot.type === 'nocturno'
                                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'bg-white/5 text-slate-500 border border-white/5 hover:border-indigo-500/20'
                                                    }`}
                                            >
                                                <Moon size={10} /> Noche
                                            </button>
                                        </div>

                                        {/* Price Diurno */}
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-black text-xs">$</span>
                                            <input
                                                type="number"
                                                value={slot.priceDiurno}
                                                onChange={e => updateSlot(i, 'priceDiurno', parseInt(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 outline-none focus:border-amber-500/40 transition-all text-xs font-bold text-amber-300"
                                            />
                                        </div>

                                        {/* Price Nocturno */}
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-xs">$</span>
                                            <input
                                                type="number"
                                                value={slot.precioNocturno}
                                                onChange={e => updateSlot(i, 'precioNocturno', parseInt(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 outline-none focus:border-indigo-500/40 transition-all text-xs font-bold text-indigo-300"
                                            />
                                        </div>

                                        {/* Weekday toggle (L–J) */}
                                        <button
                                            onClick={() => updateSlot(i, 'weekdayEnabled', !slot.weekdayEnabled)}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${slot.weekdayEnabled
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-white/5 text-slate-600 border-white/5'
                                                }`}
                                        >
                                            {slot.weekdayEnabled ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                            L–J
                                        </button>

                                        {/* Weekend toggle (V–D) */}
                                        <button
                                            onClick={() => updateSlot(i, 'weekendEnabled', !slot.weekendEnabled)}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${slot.weekendEnabled
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : 'bg-white/5 text-slate-600 border-white/5'
                                                }`}
                                        >
                                            {slot.weekendEnabled ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                            V–D
                                        </button>

                                        {/* Enable/disable */}
                                        <button
                                            onClick={() => updateSlot(i, 'enabled', !slot.enabled)}
                                            className={`flex items-center justify-center p-2 rounded-xl border transition-all ${slot.enabled
                                                ? 'bg-gold/10 text-gold border-gold/20 hover:bg-gold/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                                }`}
                                        >
                                            {slot.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save at bottom too */}
                        <button
                            onClick={handleSaveSchedule}
                            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${scheduleSaved
                                ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                }`}
                        >
                            {scheduleSaved ? <><Check size={16} /> Guardado!</> : <><Save size={16} /> Guardar Configuración</>}
                        </button>
                    </div>
                )}

                {/* ======================= PAGO & CONTACTO ======================= */}
                {activeTab === 'pagos' && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                            Contacto & Pagos
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* WhatsApp */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter">WhatsApp Reservas</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Número de Argentina (ej: 549385...)</p>
                                    </div>
                                </div>
                                <input
                                    type="tel"
                                    value={localBiz.whatsapp}
                                    onChange={e => setLocalBiz({ ...localBiz, whatsapp: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all text-2xl font-black italic tracking-tighter text-gold text-center"
                                />
                            </div>

                            {/* Transferencia */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter">Datos Transferencia</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Visibles al cliente al pagar</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Alias</label>
                                        <input
                                            type="text"
                                            value={localBiz.alias}
                                            onChange={e => setLocalBiz({ ...localBiz, alias: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all text-lg font-black italic tracking-tighter text-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">CBU</label>
                                        <input
                                            type="text"
                                            value={localBiz.cbu}
                                            onChange={e => setLocalBiz({ ...localBiz, cbu: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all text-sm font-mono tracking-wider text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveBiz}
                            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${saved
                                ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                }`}
                        >
                            {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                )}

                {/* ======================= CENTRO DE Ayuda ======================= */}
                {activeTab === 'ayuda' && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                            Configuración Centro de Ayuda
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter">WhatsApp de Contacto</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Número para consultas directas</p>
                                    </div>
                                </div>
                                <input
                                    type="tel"
                                    value={localBiz.whatsappContact}
                                    onChange={e => setLocalBiz({ ...localBiz, whatsappContact: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-black text-gold text-center text-xl"
                                />
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter">Información General</h3>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Texto que aparece en ayuda</p>
                                    </div>
                                </div>
                                <textarea
                                    value={localBiz.helpInfo}
                                    onChange={e => setLocalBiz({ ...localBiz, helpInfo: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all text-xs font-medium text-slate-300 resize-none"
                                    placeholder="Contanos sobre el complejo..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveBiz}
                            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${saved
                                ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                }`}
                        >
                            {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                )}

                {/* ======================= INICIO (HOME) ======================= */}
                {activeTab === 'home' && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                            Editor de Contenido de Inicio
                        </h2>

                        {/* Hero Section */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-gold flex items-center gap-2">
                                <Sparkles size={16} /> Sección Principal (Hero)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Título Principal</label>
                                    <input
                                        type="text"
                                        value={localBiz.heroTitle || ''}
                                        onChange={e => setLocalBiz({ ...localBiz, heroTitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-black italic text-xl tracking-tighter uppercase text-white"
                                        placeholder="EL LUGAR DONDE NACE LA PASIÓN"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Subtítulo</label>
                                    <input
                                        type="text"
                                        value={localBiz.heroSubtitle || ''}
                                        onChange={e => setLocalBiz({ ...localBiz, heroSubtitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-bold text-sm text-slate-400"
                                        placeholder="RESERVÁ TU LUGAR Y VIVÍ LA EXPERIENCIA GIOVANNI"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resources Cards Labels */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-gold flex items-center gap-2">
                                <Trophy size={16} /> Nombres de Tarjetas de Recursos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { key: 'labelFutbol', label: 'Fútbol', default: 'CANCHA DE FÚTBOL' },
                                    { key: 'labelVoley', label: 'Vóley', default: 'CANCHA DE VÓLEY' },
                                    { key: 'labelPiscina', label: 'Piscina', default: 'PISCINA GIOVANNI' },
                                    { key: 'labelQuincho', label: 'Quincho', default: 'EL QUINCHO' },
                                    { key: 'labelEvento', label: 'Evento', default: 'TU EVENTO AQUÍ' },
                                ].map(item => (
                                    <div key={item.key} className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">{item.label}</label>
                                        <input
                                            type="text"
                                            value={localBiz[item.key] || ''}
                                            onChange={e => setLocalBiz({ ...localBiz, [item.key]: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-gold/50 transition-all font-black italic text-[10px] tracking-tighter uppercase text-white"
                                            placeholder={item.default}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSaveBiz}
                            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${saved
                                ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                }`}
                        >
                            {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                )}
                {activeTab === 'general' && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white border-l-4 border-gold pl-4">
                            Configuración General
                        </h2>
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre del Negocio</label>
                                    <input
                                        type="text"
                                        value={localBiz.businessName}
                                        onChange={e => setLocalBiz({ ...localBiz, businessName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-black italic text-xl tracking-tighter"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Apertura</label>
                                        <input
                                            type="time"
                                            value={localBiz.openTime}
                                            onChange={e => setLocalBiz({ ...localBiz, openTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Cierre</label>
                                        <input
                                            type="time"
                                            value={localBiz.closeTime}
                                            onChange={e => setLocalBiz({ ...localBiz, closeTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Dirección Física</label>
                                    <input
                                        type="text"
                                        value={localBiz.address}
                                        onChange={e => setLocalBiz({ ...localBiz, address: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-bold text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Latitud</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={localBiz.lat}
                                            onChange={e => setLocalBiz({ ...localBiz, lat: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Longitud</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={localBiz.lng}
                                            onChange={e => setLocalBiz({ ...localBiz, lng: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveBiz}
                            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${saved
                                ? 'bg-green-500 text-white shadow-xl shadow-green-500/20'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-105'
                                }`}
                        >
                            {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
