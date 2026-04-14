import React, { useState } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    Plus,
    UtensilsCrossed,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    Power,
    PowerOff,
    Image as ImageIcon
} from 'lucide-react';

export default function AdminCombos() {
    const { barProducts, addBarProduct, updateBarProduct, removeBarProduct } = usePedidos();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Initial Form State
    const initialFormState = {
        name: '',
        desc: '',
        price: '',
        img: '',
        disponible: true,
        comboItems: [] // Array of { productId, quantity }
    };

    const [formData, setFormData] = useState(initialFormState);

    // Products available to be added to a combo (excluding other combos)
    const availableProducts = barProducts.filter(p => p.category !== 'Combos');
    const combos = barProducts.filter(p => p.category === 'Combos');

    const handleOpenModal = (combo = null) => {
        if (combo) {
            setFormData({
                name: combo.name || '',
                desc: combo.desc || '',
                price: combo.price || '',
                img: combo.img || '',
                disponible: combo.disponible !== false,
                comboItems: combo.comboItems || []
            });
            setEditingId(combo.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
    };

    const handleAddComboItem = () => {
        setFormData(prev => ({
            ...prev,
            comboItems: [...prev.comboItems, { productId: '', quantity: 1 }]
        }));
    };

    const handleUpdateComboItem = (index, field, value) => {
        const newItems = [...formData.comboItems];
        if (field === 'quantity') {
            newItems[index][field] = Number(value);
        } else {
            newItems[index][field] = value;
        }
        setFormData(prev => ({ ...prev, comboItems: newItems }));
    };

    const handleRemoveComboItem = (index) => {
        setFormData(prev => ({
            ...prev,
            comboItems: prev.comboItems.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.price) {
            alert('Por favor complete todos los campos requeridos.');
            return;
        }

        const validComboItems = formData.comboItems.filter(item => item.productId && item.quantity > 0);
        if (validComboItems.length === 0) {
            alert('Un combo debe tener al menos un producto válido dentro.');
            return;
        }

        const comboData = {
            ...formData,
            category: 'Combos',
            price: Number(formData.price),
            comboItems: validComboItems,
            stock: true, // Legacy field
            disponible: formData.disponible
        };

        try {
            if (editingId) {
                await updateBarProduct(editingId, comboData);
            } else {
                await addBarProduct(comboData);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving combo:', error);
            alert('Hubo un error al guardar el combo.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este combo definitivamente?')) {
            await removeBarProduct(id);
        }
    };

    const getProductName = (id) => {
        const p = barProducts.find(prod => prod.id === id);
        return p ? p.name : 'Desconocido';
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        GESTOR DE <span className="text-gold">COMBOS</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Crea agrupaciones de productos con precio promocional
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={16} /> NUEVO COMBO
                </button>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combos.map(combo => (
                    <div
                        key={combo.id}
                        className={`rounded-[28px] border overflow-hidden flex flex-col transition-all duration-300 ${combo.disponible !== false
                            ? 'bg-white/[0.02] border-white/10 hover:border-gold/30'
                            : 'bg-white/[0.01] border-white/5 opacity-60 grayscale'
                            }`}
                    >
                        {/* Image Header */}
                        <div className="h-32 bg-slate-900 relative">
                            {combo.img ? (
                                <img src={combo.img} alt={combo.name} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sin Imagen</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>

                            {/* Status Toggle */}
                            <button
                                onClick={() => updateBarProduct(combo.id, { disponible: combo.disponible === false ? true : false })}
                                className={`absolute top-3 right-3 p-2 rounded-xl transition-colors z-10 ${combo.disponible !== false ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {combo.disponible !== false ? <Power size={16} /> : <PowerOff size={16} />}
                            </button>

                            {/* Price Badge */}
                            <div className="absolute bottom-3 right-3 bg-gold text-slate-950 px-3 py-1 rounded-lg font-black italic shadow-lg">
                                ${combo.price}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">{combo.name}</h3>
                                {combo.desc && (
                                    <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{combo.desc}</p>
                                )}

                                {/* Contained Items */}
                                <div className="space-y-2 mb-4 bg-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Incluye:</p>
                                    {combo.comboItems?.map((ci, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <UtensilsCrossed size={10} className="text-gold" />
                                                {ci.quantity}x {getProductName(ci.productId)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleOpenModal(combo)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-[10px] font-black italic text-white uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(combo.id)}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {combos.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[32px]">
                        <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UtensilsCrossed size={24} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">No hay combos configurados</p>
                        <p className="text-slate-600 text-xs font-medium">Ofrece promociones agrupadas para aumentar tus ventas.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">
                            {editingId ? 'Editar' : 'Nuevo'} <span className="text-gold">Combo</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Combo</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Promo Hamburguesa + Pinta"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precio Final ($)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">URL de Imagén (Opcional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.img}
                                        onChange={e => setFormData({ ...formData, img: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción (Opcional)</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Breve descripción del combo..."
                                        value={formData.desc}
                                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2">
                                        <UtensilsCrossed size={14} /> Productos Incluidos
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddComboItem}
                                        className="text-[10px] font-black uppercase text-slate-950 bg-white px-3 py-1.5 rounded-lg hover:bg-gold transition-colors"
                                    >
                                        + Agregar Fila
                                    </button>
                                </div>

                                {formData.comboItems.length === 0 ? (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold text-center">
                                        Debes añadir al menos un producto a este combo.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.comboItems.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-center">
                                                <div className="flex-1">
                                                    <select
                                                        required
                                                        value={item.productId}
                                                        onChange={(e) => handleUpdateComboItem(index, 'productId', e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-gold outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:20px] bg-[right_16px_center] bg-no-repeat"
                                                    >
                                                        <option value="" disabled>-- Elige Producto --</option>
                                                        {availableProducts.sort((a, b) => a.name.localeCompare(b.name)).map(ap => (
                                                            <option key={ap.id} value={ap.id}>{ap.name} (${ap.price})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        required
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateComboItem(index, 'quantity', e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-center font-black text-white focus:border-gold outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveComboItem(index)}
                                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-8 rounded-xl bg-gold text-slate-950 font-black text-xs uppercase tracking-widest italic hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
                            >
                                <CheckCircle2 size={18} /> Guardar Combo
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
