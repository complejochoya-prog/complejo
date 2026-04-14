import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useConfig } from "../../core/services/ConfigContext";
import {
    Plus,
    Search,
    Filter,
    MessageCircle,
    Calendar,
    MapPin,
    Users,
    X,
    Loader2,
    Trophy,
    Target
} from 'lucide-react';

const sportIcons = {
    'Fútbol 5': 'sports_soccer',
    'Fútbol 7': 'sports_soccer',
    'Fútbol 11': 'sports_soccer',
    'Voleibol': 'sports_volleyball',
    'Pádel': 'sports_tennis',
    'Tenis': 'sports_tennis',
    'Basketball': 'sports_basketball'
};

const sportImages = {
    'Fútbol 5': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    'Fútbol 7': 'https://images.unsplash.com/photo-1529900948632-586bc501e30a?q=80&w=800&auto=format&fit=crop',
    'Voleibol': 'https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=800&auto=format&fit=crop',
    'Pádel': 'https://images.unsplash.com/photo-1626244101410-6f9175319854?q=80&w=800&auto=format&fit=crop',
    'Other': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop'
};

export default function PlayerBoard() {
    const { playerPosts, addPlayerPost, updatePlayerPost, removePlayerPost, loading, businessInfo } = useConfig();
    const [activeFilter, setActiveFilter] = useState('TODOS');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        sport: 'Fútbol 5',
        neededCount: 1,
        date: '',
        time: '',
        location: '',
        whatsapp: '',
        type: 'Amistoso'
    });

    const filters = [
        { id: 'TODOS', label: 'Todos', icon: 'grid_view' },
        { id: 'Fútbol', label: 'Fútbol', icon: 'sports_soccer' },
        { id: 'Voleibol', label: 'Voleibol', icon: 'sports_volleyball' },
        { id: 'Pádel', label: 'Pádel', icon: 'sports_tennis' },
    ];

    const filteredPosts = (playerPosts || []).filter(post => {
        if (activeFilter === 'TODOS') return true;
        return (post.sport || '').toLowerCase().includes(activeFilter.toLowerCase());
    });

    const handleWhatsApp = (post) => {
        const message = `Hola! Vi tu publicación en la Bolsa de Jugadores de Complejo Giovanni: "${post.title}" para ${post.sport}. Me interesa unirme!`;
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${post.whatsapp || businessInfo?.whatsapp}?text=${encoded}`, '_blank');
    };

    const handleEdit = (post) => {
        setEditingPostId(post.id);
        setFormData({
            title: post.title,
            sport: post.sport,
            neededCount: post.neededCount,
            date: post.date,
            time: post.time,
            location: post.location,
            whatsapp: post.whatsapp,
            type: post.type
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar esta publicación?")) {
            await removePlayerPost(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingPostId) {
                await updatePlayerPost(editingPostId, {
                    ...formData,
                    img: sportImages[formData.sport] || sportImages['Other']
                });
            } else {
                await addPlayerPost({
                    ...formData,
                    img: sportImages[formData.sport] || sportImages['Other']
                });
            }
            setIsModalOpen(false);
            setEditingPostId(null);
            setFormData({ title: '', sport: 'Fútbol 5', neededCount: 1, date: '', time: '', location: '', whatsapp: '', type: 'Amistoso' });
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Error al guardar la publicación. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="player-board-theme relative flex min-h-screen w-full flex-col bg-slate-950 font-inter text-white">
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                }
            `}</style>

            <div className="flex h-full grow flex-col">
                <header className="flex items-center justify-between px-6 md:px-20 py-6 border-b border-white/5 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl">
                    <Link to="/home" className="flex items-center gap-3 group transition-transform hover:scale-105">
                        <div className="size-10 bg-gold rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-gold/20">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-white text-lg font-black leading-none tracking-tighter italic uppercase">COMPLEJO <span className="text-gold">GIOVANNI</span></h2>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Premium Sports Center</p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link to="/home" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-gold transition-colors">Inicio</Link>
                        <Link to="/booking-flow" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-gold transition-colors">Reservas</Link>
                        <Link to="/players" className="text-[10px] font-black uppercase tracking-widest text-gold italic border-b-2 border-gold pb-1">Bolsa de Jugadores</Link>
                        <Link to="/menu" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-gold transition-colors">Menú Digital</Link>
                    </nav>

                    <button className="lg:hidden p-2 text-slate-400">
                        <Filter size={20} />
                    </button>
                    <div className="hidden lg:block">
                        <button onClick={() => setIsModalOpen(true)} className="bg-gold text-slate-950 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all">
                            Nueva Publicación
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-6 md:px-20 py-12 max-w-7xl mx-auto w-full space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">BOLSA DE <br /><span className="text-gold">JUGADORES</span></h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
                            No dejes de jugar. Encuentra equipo o completa tu partido en tiempo real.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-[22px] border transition-all duration-300 ${activeFilter === filter.id
                                    ? 'bg-gold border-gold text-slate-950 shadow-xl shadow-gold/20'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{filter.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 rounded-[32px] shimmer border border-white/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map(post => (
                                <div key={post.id} className="group glass-card rounded-[40px] overflow-hidden flex flex-col hover:border-gold/30 transition-all duration-500 hover:-translate-y-2">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={post.img || sportImages['Other']} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <div className="bg-gold text-slate-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Falta {post.neededCount}</div>
                                            <div className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">{post.type}</div>
                                        </div>
                                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-gold border border-white/10">
                                                <span className="material-symbols-outlined text-sm">{sportIcons[post.sport] || 'sports'}</span>
                                            </div>
                                            <span className="text-white text-xs font-black uppercase tracking-widest">{post.sport}</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{post.title}</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <Calendar size={14} className="text-gold" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{post.date} - {post.time}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <MapPin size={14} className="text-gold" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{post.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(post)}
                                                className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest transition-all"
                                            >
                                                <Plus size={14} className="rotate-45" /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="h-12 w-12 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleWhatsApp(post)}
                                            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-[20px] flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <MessageCircle size={18} fill="currentColor" />
                                            Postularme por WhatsApp
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredPosts.length === 0 && (
                                <div className="col-span-full py-20 text-center glass-card rounded-[48px] border-dashed border-white/10 flex flex-col items-center gap-6">
                                    <div className="p-6 bg-white/5 rounded-full text-slate-700">
                                        <Target size={64} strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-500">No hay búsquedas activas</h3>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Sé el primero en publicar una!</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(true)} className="text-gold border border-gold/30 hover:bg-gold hover:text-slate-950 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                                        Crear Publicación
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <footer className="border-t border-white/5 px-6 md:px-20 py-12 mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto w-full">
                        <div className="flex items-center gap-3 opacity-30">
                            <Trophy size={20} className="text-gold" />
                            <h2 className="text-white text-xs font-black italic tracking-tighter uppercase leading-none">COMPLEJO GIOVANNI</h2>
                        </div>
                        <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.4em]">© 2026 Reservas Deportivas Inteligentes</p>
                    </div>
                </footer>
            </div>

            {/* Create Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 transition-all animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-xl rounded-[48px] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gold/10 text-gold rounded-2xl">
                                    <Users size={20} />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{editingPostId ? 'EDITAR' : 'NUEVA'} <span className="text-gold">BÚSQUEDA</span></h3>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingPostId(null); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Título de la Búsqueda</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Partido Amistoso, Completo 1..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deporte</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white appearance-none"
                                        value={formData.sport}
                                        onChange={e => setFormData({ ...formData, sport: e.target.value })}
                                    >
                                        <option value="Fútbol 5">Fútbol 5</option>
                                        <option value="Fútbol 7">Fútbol 7</option>
                                        <option value="Fútbol 11">Fútbol 11</option>
                                        <option value="Voleibol">Voleibol</option>
                                        <option value="Pádel">Pádel</option>
                                        <option value="Basketball">Basketball</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">¿Cuántos faltan?</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.neededCount}
                                        onChange={e => setFormData({ ...formData, neededCount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Encuentro</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Amistoso">Amistoso</option>
                                        <option value="Competitivo">Competitivo</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Mixto">Mixto</option>
                                        <option value="Entrenamiento">Entrenamiento</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ubicación / Cancha</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Cancha 2, Predio Principal..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Día (Ej: Hoy, Mañana, Feb 12)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Hoy"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Hora</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: 21:00 HS"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp de Contacto (incluir código)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: 5493855374835"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-gold/50 transition-all text-white"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full bg-gold text-slate-950 h-16 rounded-[24px] font-black uppercase tracking-[0.2em] italic text-xs shadow-2xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                                {editingPostId ? 'Guardar Cambios' : 'Publicar Búsqueda'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
