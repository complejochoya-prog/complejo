import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Sparkles, PartyPopper } from 'lucide-react';
import { fetchPromos, savePromo, deletePromo, togglePromoStatus } from '../services/promosService';

export default function PromosPage() {
    const [promos, setPromos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [formData, setFormData] = useState({ title: '', desc: '', price: '', type: 'promo', img: '', link: '' });

    useEffect(() => {
        load();
        window.addEventListener('storage_promos', load);
        return () => window.removeEventListener('storage_promos', load);
    }, []);

    const load = () => {
        setPromos(fetchPromos());
    };

    const handleEdit = (prm) => {
        setSelectedPromo(prm);
        setFormData({ 
            title: prm.title, 
            desc: prm.desc, 
            price: prm.price, 
            type: prm.type || 'promo',
            img: prm.img || '',
            link: prm.link || '' 
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setSelectedPromo(null);
        setFormData({ title: '', desc: '', price: '', type: 'promo', img: '', link: '' });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        savePromo({ ...formData, id: selectedPromo?.id });
        setShowModal(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        GESTIÓN DE <span className="text-amber-500">PROMOS & EVENTOS</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        Configura las ofertas y paquetes de tu negocio
                    </p>
                </div>

                <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-3 bg-amber-500 text-black px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Nueva Promo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.map((prm) => (
                    <div 
                        key={prm.id} 
                        className={`group bg-slate-900 border ${prm.active ? 'border-white/5' : 'border-red-500/20 grayscale'} rounded-[40px] p-8 flex flex-col transition-all hover:border-amber-500/30 shadow-2xl relative overflow-hidden`}
                    >
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                        
                        {prm.img && (
                            <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
                                <img src={prm.img} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${prm.type === 'evento' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-amber-500/20 text-amber-500'} flex items-center justify-center`}>
                                {prm.type === 'evento' ? <PartyPopper size={24} /> : <Sparkles size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">{prm.title}</h3>
                                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${prm.type === 'evento' ? 'text-indigo-400' : 'text-amber-500'}`}>
                                    {prm.type === 'evento' ? 'Pack Evento' : 'Promoción'}
                                </p>
                            </div>
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">
                            {prm.desc}
                        </p>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
                                <span className="text-xs font-black italic tracking-tighter text-amber-500">
                                    {prm.price === '0' || prm.price.toLowerCase() === 'gratis' ? 'GRATIS' : `$${prm.price}`}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => togglePromoStatus(prm.id)}
                                    className={`p-3 rounded-2xl border transition-all ${prm.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                                >
                                    {prm.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button 
                                    onClick={() => handleEdit(prm)}
                                    className="p-3 bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded-2xl border border-white/5 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => deletePromo(prm.id)}
                                    className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl border border-white/5 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-amber-500 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-black">
                                <Tag size={24} />
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                                        {selectedPromo ? 'Editar Promo' : 'Nueva Promo'}
                                    </h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">
                                        Se mostrará en el Home del complejo
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-black/10 p-2 rounded-xl hover:bg-black/20 transition-all">
                                <X size={20} className="text-black" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'promo'})}
                                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.type === 'promo' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Promoción
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'evento'})}
                                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.type === 'evento' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Pack Evento
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Título de la Oferta</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                    placeholder="Ej: Promo Lunes 2x1"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción detallada</label>
                                <textarea 
                                    value={formData.desc}
                                    onChange={(e) => setFormData({...formData, desc: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all min-h-[100px] resize-none"
                                    placeholder="Explica qué incluye la promo..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio (o escribe 'Gratis')</label>
                                <input 
                                    type="text" 
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all text-amber-500"
                                    placeholder="Ej: 15000"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Imagen de la Promo</label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                value={formData.img}
                                                onChange={(e) => setFormData({...formData, img: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-bold focus:outline-none focus:border-amber-500 transition-all pr-12"
                                                placeholder="Pegar URL de imagen..."
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                                                <Eye size={14} />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="file"
                                                id="promo-img-upload"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({...formData, img: reader.result});
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <label 
                                                htmlFor="promo-img-upload"
                                                className="flex items-center justify-center gap-2 w-full bg-white/5 border border-dashed border-white/20 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-amber-500/50 cursor-pointer transition-all hover:bg-white/[0.02]"
                                            >
                                                <Plus size={14} /> Subir desde el equipo
                                            </label>
                                        </div>
                                    </div>

                                    <div className="relative aspect-video rounded-3xl bg-black/40 border border-white/5 overflow-hidden group">
                                        {formData.img ? (
                                            <>
                                                <img 
                                                    src={formData.img} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    onError={(e) => e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Error+de+imagen'}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData({...formData, img: ''})}
                                                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
                                                <EyeOff size={24} className="opacity-20" />
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Sin Vista Previa</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Link de Redirección (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={formData.link}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all text-indigo-400"
                                    placeholder="https://wa.me/... o /giovanni/menu"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit"
                                    className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-black rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
