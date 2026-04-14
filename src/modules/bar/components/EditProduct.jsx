import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useConfig } from "../../core/services/ConfigContext";
import { usePedidos } from "../services/PedidosContext";
import { ArrowLeft, Save, Upload, Trash2, CheckCircle } from "lucide-react";

export default function EditProduct() {
    const { barProducts, addBarProduct, updateBarProduct } = usePedidos();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;

    const [formData, setFormData] = useState({
        name: '',
        category: 'Platos',
        desc: '',
        price: '',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop',
        stock_actual: 0,
        stock_minimo: 5,
        activar_control_stock: true
    });

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditMode && barProducts.length > 0) {
            const product = barProducts.find(p => p.id === productId);
            if (product) {
                setFormData({
                    name: product.name,
                    category: product.category,
                    desc: product.desc || '',
                    price: product.price,
                    img: product.img,
                    stock_actual: product.stock_actual || 0,
                    stock_minimo: product.stock_minimo || 5,
                    activar_control_stock: product.activar_control_stock ?? true
                });
            }
        }
    }, [productId, barProducts, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const productData = {
                ...formData,
                price: Number(formData.price),
                stock_actual: Number(formData.stock_actual),
                stock_minimo: Number(formData.stock_minimo)
            };

            if (isEditMode) {
                await updateBarProduct(productId, productData);
            } else {
                await addBarProduct(productData);
            }
            setSuccess(true);
            setTimeout(() => navigate('/bar-management'), 1500);
        } catch (error) {
            console.error("Error saving product:", error);
            alert(`Error al guardar el producto: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/bar-management')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Volver al Bar</span>
                    </button>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter">
                        {isEditMode ? 'EDITAR' : 'NUEVO'} <span className="text-gold">PRODUCTO</span>
                    </h1>
                    <div className="size-10" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 mt-8">
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Nombre del Producto</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Ej: Hamburguesa Master"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Categoría</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all appearance-none"
                                >
                                    <option value="Platos">Platos</option>
                                    <option value="Tragos">Tragos</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Postres">Postres</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Precio ($)</label>
                                <input
                                    required
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Stock Actual</label>
                                    <input
                                        required
                                        name="stock_actual"
                                        value={formData.stock_actual}
                                        onChange={handleChange}
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Stock Mínimo</label>
                                    <input
                                        required
                                        name="stock_minimo"
                                        value={formData.stock_minimo}
                                        onChange={handleChange}
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Descripción Corta</label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Detalles sobre el producto..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all resize-none"
                                />
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic block">Estado de Stock</span>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Visible en el menú digital</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="activar_control_stock"
                                        checked={formData.activar_control_stock}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-slate-950"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview / URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Imagen del Producto (URL)</label>
                        <div className="flex gap-4">
                            <input
                                name="img"
                                value={formData.img}
                                onChange={handleChange}
                                type="text"
                                placeholder="https://..."
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-gold/50 transition-all"
                            />
                            <div className="size-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-10 flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] italic text-xs transition-all flex items-center justify-center gap-3 ${success
                                ? 'bg-action-green text-white'
                                : 'bg-gold text-slate-950 shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            {saving ? 'Guardando...' : success ? (
                                <>
                                    <CheckCircle size={18} />
                                    ✅ Producto actualizado correctamente
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Confirmar {isEditMode ? 'Cambios' : 'Producto'}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/bar-management')}
                            className="w-full py-5 rounded-[24px] border border-white/10 text-slate-500 font-black uppercase tracking-[0.2em] italic text-[10px] hover:text-white hover:bg-white/5 transition-all text-center"
                        >
                            Cancelar Operación
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
