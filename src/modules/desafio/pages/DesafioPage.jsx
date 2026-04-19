import React, { useState, useEffect } from 'react';
import { 
    Swords, UserPlus, Users, Calendar, Clock, Send, X, 
    MapPin, MessageCircle, Flame, Shield, Trash2,
    User, Phone, Trophy, Zap
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { useDesafio } from '../services/DesafioContext';
import { useClientAuth } from '../../client_app/hooks/useClientAuth';
import ClientNavbar from '../../client_app/components/ClientNavbar';
import { fetchEspacios } from '../../admin/services/espaciosService';

function DesafioCard({ desafio, onContact, isOwner, onDelete, espacios }) {
    const isEquipo = desafio.tipo === 'equipo';
    const fechaDisplay = desafio.fecha 
        ? new Date(desafio.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
        : 'Flexible';
    
    // Find the matching espacio for its image
    const espacio = espacios.find(e => e.id === desafio.espacioId);
    
    return (
        <div className={`relative rounded-[32px] border transition-all group overflow-hidden ${
            desafio.estado === 'cerrado'
                ? 'bg-white/[0.01] border-white/5 opacity-50'
                : 'bg-white/[0.03] border-white/5 hover:border-amber-500/30'
        }`}>
            {/* Espacio image banner */}
            {espacio?.img && (
                <div className="relative h-28 overflow-hidden">
                    <img src={espacio.img} alt={espacio.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                    <div className="absolute bottom-3 left-5 flex items-center gap-2">
                        <MapPin size={12} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{espacio.name}</span>
                    </div>
                </div>
            )}

            <div className="relative z-10 p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                            isEquipo 
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                            {isEquipo ? <Users size={22} /> : <User size={22} />}
                        </div>
                        <div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                                isEquipo ? 'text-indigo-400' : 'text-amber-400'
                            }`}>
                                {isEquipo ? 'Equipo Disponible' : 'Jugador Disponible'}
                            </span>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none mt-0.5">
                                {desafio.nombre}
                            </h3>
                        </div>
                    </div>

                    {desafio.estado === 'cerrado' && (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                            Cerrado
                        </span>
                    )}

                    {isOwner && desafio.estado !== 'cerrado' && (
                        <button 
                            onClick={() => onDelete(desafio.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Sport + Players badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    {!espacio?.img && (
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                            <MapPin size={12} className="text-amber-500" />
                            {desafio.espacioNombre || 'Sin espacio'}
                        </span>
                    )}
                    {isEquipo && desafio.cantJugadores && (
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {desafio.cantJugadores} jugadores
                        </span>
                    )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Calendar size={10} /> Fecha
                        </span>
                        <p className="text-xs font-black text-white uppercase">{fechaDisplay}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Clock size={10} /> Horario
                        </span>
                        <p className="text-xs font-black text-white">
                            {desafio.horaDesde && desafio.horaHasta 
                                ? `${desafio.horaDesde} - ${desafio.horaHasta}` 
                                : 'A convenir'}
                        </p>
                    </div>
                </div>

                {/* Message */}
                {desafio.mensaje && (
                    <p className="text-xs text-slate-400 font-medium leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-4 italic">
                        "{desafio.mensaje}"
                    </p>
                )}

                {/* Contact Button */}
                {desafio.estado !== 'cerrado' && !isOwner && (
                    <button
                        onClick={() => onContact(desafio)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <MessageCircle size={14} />
                        Contactar por WhatsApp
                    </button>
                )}
            </div>
        </div>
    );
}

export default function DesafioPage() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { desafios, loading, addDesafio, removeDesafio } = useDesafio();
    const { clientUser } = useClientAuth();

    const [espacios, setEspacios] = useState([]);
    const [loadingEspacios, setLoadingEspacios] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('todos'); // todos | jugador | equipo
    const [formData, setFormData] = useState({
        tipo: 'jugador',
        nombre: '',
        espacioId: '',
        espacioNombre: '',
        mensaje: '',
        fecha: '',
        horaDesde: '',
        horaHasta: '',
        contacto: '',
        cantJugadores: ''
    });

    // Load espacios from Firestore
    useEffect(() => {
        const loadEspacios = async () => {
            try {
                const data = await fetchEspacios(negocioId);
                // Only show active, non-bar spaces
                const activeEspacios = data.filter(e => {
                    const isBar = (e.name || '').toLowerCase().includes('bar') || 
                                  (e.desc || '').toLowerCase().includes('bar') ||
                                  (e.tipo || '').toLowerCase().includes('bar');
                    return e.active !== false && !isBar;
                });
                setEspacios(activeEspacios);
                if (activeEspacios.length > 0 && !formData.espacioId) {
                    setFormData(prev => ({ 
                        ...prev, 
                        espacioId: activeEspacios[0].id, 
                        espacioNombre: activeEspacios[0].name 
                    }));
                }
            } catch (err) {
                console.error('Error loading espacios:', err);
            } finally {
                setLoadingEspacios(false);
            }
        };
        if (negocioId) loadEspacios();
    }, [negocioId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDesafio({
                ...formData,
                cantJugadores: formData.tipo === 'equipo' ? parseInt(formData.cantJugadores) || 0 : null,
                userId: clientUser?.id || null,
                userName: clientUser?.name || formData.nombre
            });
            setFormData({
                tipo: 'jugador', nombre: '', 
                espacioId: espacios[0]?.id || '', 
                espacioNombre: espacios[0]?.name || '',
                mensaje: '', fecha: '', horaDesde: '', horaHasta: '', contacto: '', cantJugadores: ''
            });
            setShowForm(false);
        } catch (err) {
            console.error('Error al publicar desafío:', err);
        }
    };

    const handleContact = (desafio) => {
        const msg = `Hola ${desafio.nombre}! Vi tu publicación en Desafío de ${config?.nombre || 'Giovanni'}. Me interesa ${desafio.tipo === 'equipo' ? 'jugar contra tu equipo' : 'sumarte para jugar'} en ${desafio.espacioNombre || 'el complejo'}. ¿Charlamos?`;
        const phone = desafio.contacto?.replace(/\D/g, '') || '';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta publicación?')) {
            await removeDesafio(id);
        }
    };

    const handleSelectEspacio = (esp) => {
        setFormData({ ...formData, espacioId: esp.id, espacioNombre: esp.name });
    };

    const filteredDesafios = desafios.filter(d => {
        if (filter === 'todos') return true;
        return d.tipo === filter;
    });

    const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300 min-h-screen bg-slate-950 pb-32">
            <ClientNavbar config={config} user={clientUser} />

            <div className="px-5 py-8 space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <header className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-amber-500 leading-none mb-2 flex items-center gap-3">
                                <Swords size={32} className="lg:w-10 lg:h-10" />
                                Desafío
                            </h1>
                            <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">
                                Ofrecete como jugador o equipo disponible — Comunidad Giovanni
                            </p>
                        </div>
                        
                        <div className="hidden lg:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                            {[
                                { key: 'todos', label: 'Todos', icon: Flame },
                                { key: 'jugador', label: 'Jugadores', icon: User },
                                { key: 'equipo', label: 'Equipos', icon: Shield },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        filter === tab.key 
                                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA Banner - Redesigned for Desktop */}
                    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <Swords size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="text-center lg:text-left">
                                <h3 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                                    ¿Buscás rival<br/>o completar equipo?
                                </h3>
                                <p className="text-[10px] lg:text-xs text-amber-100 font-bold uppercase tracking-[0.2em] mt-3">
                                    Publicá tu disponibilidad y conectá con la comunidad
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-white text-orange-600 px-10 py-5 rounded-2xl flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all w-full lg:w-auto justify-center"
                            >
                                <UserPlus size={20} />
                                Publicar Disponibilidad
                            </button>
                        </div>
                    </div>
                </header>

                {/* Filter Tabs (Mobile Only) */}
                <div className="lg:hidden flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    {[
                        { key: 'todos', label: 'Todos', icon: Flame },
                        { key: 'jugador', label: 'Jugadores', icon: User },
                        { key: 'equipo', label: 'Equipos', icon: Shield },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                                filter === tab.key 
                                    ? 'bg-amber-500 text-black shadow-lg' 
                                    : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Desafíos List - GRID for Desktop */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Flame size={16} className="text-amber-500" />
                            {filter === 'todos' ? 'Todos los Desafíos' : filter === 'jugador' ? 'Jugadores Disponibles' : 'Equipos Disponibles'}
                        </h2>
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] text-slate-500 font-black">{filteredDesafios.length} RESULTADOS</span>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sincronizando con el servidor...</p>
                        </div>
                    ) : filteredDesafios.length === 0 ? (
                        <div className="py-24 bg-slate-900/50 border border-white/5 rounded-[48px] text-center space-y-6">
                            <Swords size={60} className="mx-auto text-slate-800 opacity-20" />
                            <div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm lg:text-base">No hay desafíos publicados</p>
                                <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-2 font-bold">¡Sé el primero en publicar tu disponibilidad!</p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mx-auto bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-3"
                            >
                                <UserPlus size={16} /> Publicar Ahora
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDesafios.map(d => (
                                <DesafioCard
                                    key={d.id}
                                    desafio={d}
                                    espacios={espacios}
                                    onContact={handleContact}
                                    isOwner={clientUser?.id && d.userId === clientUser.id}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ──── Create Desafío Modal ──── */}
            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-500">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                                    <Swords size={24} className="text-amber-500" />
                                    Nuevo Desafío
                                </h3>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                                    Publicá tu disponibilidad
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form id="desafio-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
                            {/* Tipo Toggle */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">¿Cómo te ofrecés?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, tipo: 'jugador'})}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                            formData.tipo === 'jugador' 
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                                                : 'border-white/10 bg-white/[0.02] text-slate-500'
                                        }`}
                                    >
                                        <User size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Jugador Solo</span>
                                        <span className="text-[8px] text-slate-500">Me sumo a un equipo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, tipo: 'equipo'})}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                            formData.tipo === 'equipo' 
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                                                : 'border-white/10 bg-white/[0.02] text-slate-500'
                                        }`}
                                    >
                                        <Users size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Con Equipo</span>
                                        <span className="text-[8px] text-slate-500">Buscamos rival</span>
                                    </button>
                                </div>
                            </div>

                            {/* Nombre */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                    {formData.tipo === 'equipo' ? 'Nombre del Equipo' : 'Tu Nombre / Apodo'}
                                </label>
                                <input
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm"
                                    placeholder={formData.tipo === 'equipo' ? 'Ej: Los Cracks FC' : 'Ej: Juan Pérez'}
                                />
                            </div>

                            {/* Espacio Selection (from admin data) */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                                    <MapPin size={10} /> Espacio / Cancha
                                </label>
                                {loadingEspacios ? (
                                    <div className="flex items-center gap-2 p-4 text-slate-500">
                                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Cargando espacios...</span>
                                    </div>
                                ) : espacios.length === 0 ? (
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No hay espacios configurados</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {espacios.map(esp => (
                                            <button
                                                key={esp.id}
                                                type="button"
                                                onClick={() => handleSelectEspacio(esp)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                                                    formData.espacioId === esp.id
                                                        ? 'border-amber-500 bg-amber-500/10'
                                                        : 'border-white/5 bg-white/[0.02] hover:border-amber-500/30'
                                                }`}
                                            >
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                                    <img src={esp.img} alt={esp.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-black uppercase tracking-tight leading-tight truncate ${
                                                        formData.espacioId === esp.id ? 'text-amber-400' : 'text-white'
                                                    }`}>
                                                        {esp.name}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{esp.desc}</p>
                                                </div>
                                                {esp.category && (
                                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest text-slate-400 shrink-0 hidden sm:block">
                                                        {esp.category}
                                                    </span>
                                                )}
                                                {formData.espacioId === esp.id && (
                                                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                                                        <Zap size={10} className="text-black" fill="currentColor" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cant Jugadores (solo equipo) */}
                            {formData.tipo === 'equipo' && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Cantidad de Jugadores</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="30"
                                        value={formData.cantJugadores}
                                        onChange={e => setFormData({...formData, cantJugadores: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm"
                                        placeholder="Ej: 5"
                                    />
                                </div>
                            )}

                            {/* Fecha */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Fecha Disponible</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={e => setFormData({...formData, fecha: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm [color-scheme:dark]"
                                />
                            </div>

                            {/* Horarios */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Desde</label>
                                    <select
                                        value={formData.horaDesde}
                                        onChange={e => setFormData({...formData, horaDesde: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm appearance-none [color-scheme:dark]"
                                    >
                                        <option value="">Hora</option>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Hasta</label>
                                    <select
                                        value={formData.horaHasta}
                                        onChange={e => setFormData({...formData, horaHasta: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm appearance-none [color-scheme:dark]"
                                    >
                                        <option value="">Hora</option>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                                    <Phone size={10} /> WhatsApp de Contacto
                                </label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.contacto}
                                    onChange={e => setFormData({...formData, contacto: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm"
                                    placeholder="+54 9 11 1234-5678"
                                />
                            </div>

                            {/* Mensaje */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Mensaje (opcional)</label>
                                <textarea
                                    value={formData.mensaje}
                                    onChange={e => setFormData({...formData, mensaje: e.target.value})}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/50 text-white font-bold text-sm resize-none"
                                    placeholder="Ej: Buscamos rival para un amistoso este sábado..."
                                />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3.5 rounded-2xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                form="desafio-form"
                                type="submit"
                                className="px-8 py-3.5 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Send size={14} />
                                Publicar Desafío
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
