import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Plus, Edit2, Trash2, Camera, Save, X, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { fetchEspacios, saveEspacio, deleteEspacio, toggleEspacioStatus, reorderEspacios } from '../services/espaciosService';

export default function EspaciosPage() {
    const { negocioId } = useParams();
    const [espacios, setEspacios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEspacio, setSelectedEspacio] = useState(null);
    const [formData, setFormData] = useState({ title: '', desc: '', img: '', capacidad: '' });
    const [imgMode, setImgMode] = useState('link'); // 'link' or 'upload'

    useEffect(() => {
        load();
        window.addEventListener('storage_espacios', load);
        return () => window.removeEventListener('storage_espacios', load);
    }, [negocioId]);

    const load = () => {
        const data = fetchEspacios(negocioId);
        setEspacios(data);
    };

    const handleEdit = (esp) => {
        setSelectedEspacio(esp);
        setFormData({ title: esp.title, desc: esp.desc, img: esp.img, capacidad: esp.capacidad || '' });
        setImgMode(esp.img?.startsWith('data:image') ? 'upload' : 'link');
        setShowModal(true);
    };

    const handleAddNew = () => {
        setSelectedEspacio(null);
        setFormData({ title: '', desc: '', img: '', capacidad: '' });
        setImgMode('link');
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveEspacio({ ...formData, id: selectedEspacio?.id });
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este espacio definitivamente?')) {
            deleteEspacio(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        GESTIÓN DE <span className="text-amber-500">ESPACIOS</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        Configuración de canchas y áreas del complejo
                    </p>
                </div>

                <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-3 bg-amber-500 text-black px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Nuevo Espacio
                </button>
            </div>

            {/* Grid de Espacios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {espacios.map((esp) => (
                    <div 
                        key={esp.id} 
                        className={`group bg-slate-900 border ${esp.active ? 'border-white/5' : 'border-red-500/20 grayscale'} rounded-[40px] overflow-hidden flex flex-col transition-all hover:border-amber-500/30 shadow-2xl`}
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img src={esp.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={esp.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button 
                                    onClick={() => toggleEspacioStatus(esp.id)}
                                    className={`p-2 rounded-xl backdrop-blur-md border ${esp.active ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}
                                >
                                    {esp.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-1 leading-none">{esp.title}</h3>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">{esp.desc}</p>
                            {esp.capacidad && (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Capacidad: {esp.capacidad} personas</p>
                            )}
                            
                            
                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => reorderEspacios(esp.id, 'up')}
                                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-amber-500 transition-all"
                                    >
                                        <MoveUp size={14} />
                                    </button>
                                    <button 
                                        onClick={() => reorderEspacios(esp.id, 'down')}
                                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-amber-500 transition-all"
                                    >
                                        <MoveDown size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(esp)}
                                        className="p-3 bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded-2xl border border-white/5 transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(esp.id)}
                                        className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl border border-white/5 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edición/Creación */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-amber-500 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-black">
                                <Layout size={24} />
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                                        {selectedEspacio ? 'Editar Espacio' : 'Nuevo Espacio'}
                                    </h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">
                                        Visualización en el Home del complejo
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-black/10 p-2 rounded-xl hover:bg-black/20 transition-all">
                                <X size={20} className="text-black" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Título del Espacio</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                    placeholder="Ej: Fútbol 5 sintético"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción corta / Equipamiento</label>
                                <input 
                                    type="text" 
                                    value={formData.desc}
                                    onChange={(e) => setFormData({...formData, desc: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                    placeholder="Ej: Cesped PRO-FIFA / Iluminación LED"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Capacidad (Cupos para Turnos - Opcional)</label>
                                <input 
                                    type="number" 
                                    value={formData.capacidad}
                                    onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                    placeholder="Ej: 50 (Déjalo vacío si es una cancha normal)"
                                    min="1"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Imagen del Espacio</label>
                                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                        <button 
                                            type="button"
                                            onClick={() => setImgMode('link')}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imgMode === 'link' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Pegar Link
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setImgMode('upload')}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imgMode === 'upload' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Subir Foto
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        {imgMode === 'link' ? (
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                                    <Camera size={18} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={formData.img}
                                                    onChange={(e) => setFormData({...formData, img: e.target.value})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                                    placeholder="https://images.unsplash.com/..."
                                                    required={imgMode === 'link'}
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                    required={imgMode === 'upload' && !formData.img}
                                                />
                                                <label 
                                                    htmlFor="file-upload"
                                                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[32px] p-8 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer group"
                                                >
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-amber-500 mb-3 transition-colors">
                                                        <Plus size={20} />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Click para seleccionar archivo</p>
                                                    <p className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tighter italic">PNG, JPG hasta 5MB</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {formData.img && (
                                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-[24px] overflow-hidden border border-white/10 shrink-0 shadow-2xl relative">
                                            <img src={formData.img} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit"
                                    className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-black rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Save size={18} /> Guardar Espacio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
