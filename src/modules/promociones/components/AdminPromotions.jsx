import React, { useState } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    Plus,
    Tag,
    Clock,
    CalendarDays,
    Settings2,
    CheckCircle2,
    Trash2,
    Edit2,
    X,
    Power,
    PowerOff,
    Gift
} from 'lucide-react';
import { db } from '../../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const DAYS_OPTIONS = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
];

const CATEGORY_OPTIONS = ['Bebidas', 'Tragos', 'Platos', 'Postres'];

export default function AdminPromotions() {
    const { negocioId } = useConfig();
    const { promotions, addPromotion, updatePromotion, removePromotion, togglePromotionStatus, barProducts } = usePedidos();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Initial Form State
    const initialFormState = {
        name: '',
        desc: '',
        price: '',
        img: '',
        active: true,
        modo_evento: '',
        comboItems: [] // Array of { productId, quantity }
    };

    const [formData, setFormData] = useState(initialFormState);

    // Products available to be added to a promotion (excluding Combos)
    const availableProducts = barProducts.filter(p => p.category !== 'Combos');

    const handleOpenModal = (promo = null) => {
        if (promo) {
            setFormData({
                name: promo.name || '',
                desc: promo.desc || '',
                price: promo.price || '',
                img: promo.img || '',
                active: promo.active !== false,
                modo_evento: promo.modo_evento || '',
                comboItems: promo.comboItems || []
            });
            setEditingId(promo.id);
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
            comboItems: [...prev.comboItems, { productId: '', quantity: 1, group: 'Pizzas', isBonus: false }]
        }));
    };

    const handleUpdateComboItem = (index, field, value) => {
        const newItems = [...formData.comboItems];
        if (field === 'quantity') {
            newItems[index][field] = Number(value);
        } else if (field === 'isBonus') {
            newItems[index][field] = value;
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
            alert('Una promoción debe tener al menos un producto válido dentro.');
            return;
        }

        const promoData = {
            ...formData,
            price: Number(formData.price),
            comboItems: validComboItems,
        };

        try {
            if (editingId) {
                await updatePromotion(editingId, promoData);
            } else {
                await addPromotion(promoData);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error guardando promoción:", error);
            alert("Error al guardar la promoción");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta promoción definitivamente?')) {
            await removePromotion(id);
        }
    };

    const handleSeedCumplePromos = async () => {
        if (!window.confirm("¿Generar PROMOS DE CUMPLEAÑOS y sus productos automáticamente?")) return;

        try {
            const genericProducts = [
                { id: 'cumple-pizza', name: 'Pizza a elección (Promo)', category: 'Pizzas', price: 12000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500' },
                { id: 'cumple-trago', name: 'Trago a elección (Promo)', category: 'Tragos', price: 6000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=500' },
                { id: 'cumple-cerveza', name: 'Cerveza a elección (Promo)', category: 'Cervezas', price: 8000, img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=500' },
                { id: 'cumple-coca', name: 'Coca Cola 1,5L', category: 'Bebidas', price: 6000, img: 'https://images.unsplash.com/photo-1629203851022-39c6f2546571?q=80&w=500' },
                { id: 'cumple-champagne', name: 'Champagne (Brindis)', category: 'Bebidas', price: 15000, img: 'https://images.unsplash.com/photo-1629203851022-39c6f2546571?q=80&w=500' },
                { id: 'cumple-empanadas', name: 'Docena de Empanadas', category: 'Carnes', price: 12000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500' },
                { id: 'cumple-papas', name: 'Porción de Papas (Promo)', category: 'Papas', price: 7000, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=500' },
                { id: 'promo-jarra', name: 'Jarra de Fernet/Cerveza', category: 'Tragos', price: 9000, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=500' },
            ];

            for (const p of genericProducts) {
                await setDoc(doc(db, 'negocios', negocioId, 'productos', p.id), {
                    ...p,
                    negocio_id: negocioId,
                    active: true,
                    disponible: true,
                    stock_actual: 9999,
                    stock_minimo: 0,
                    activar_control_stock: false
                });
            }

            const promos = [
                {
                    id: 'promo-cumple-1',
                    name: 'Cumpleaños 10 Personas Premium',
                    desc: 'Hasta 10 personas. 5 pizzas, 10 tragos, 4 cervezas (o 6 Cocas 1.5L) + Champagne de brindis',
                    price: 140000,
                    img: 'https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?q=80&w=500',
                    active: true,
                    modo_evento: 'cumpleaños',
                    comboItems: [
                        { productId: 'cumple-pizza', quantity: 5, group: 'Pizzas', isBonus: false },
                        { productId: 'cumple-trago', quantity: 10, group: 'Tragos', isBonus: false },
                        { productId: 'cumple-cerveza', quantity: 4, group: 'Bebidas', isBonus: false },
                        { productId: 'cumple-coca', quantity: 6, group: 'Bebidas', isBonus: false },
                        { productId: 'cumple-champagne', quantity: 1, group: 'Bonus', isBonus: true }
                    ]
                },
                {
                    id: 'promo-previa-6',
                    name: 'Previa 6 Personas',
                    desc: 'Combo ideal para arrancar la noche. 6 tragos + 2 cervezas 1L.',
                    price: 45000,
                    img: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=500',
                    active: true,
                    comboItems: [
                        { productId: 'cumple-trago', quantity: 6, group: 'Tragos', isBonus: false },
                        { productId: 'cumple-cerveza', quantity: 2, group: 'Bebidas', isBonus: false }
                    ]
                },
                {
                    id: 'promo-jarra-papas',
                    name: 'Jarra + Papas',
                    desc: 'Jarra de Fernet o Cerveza + Papas Fritas Grandes.',
                    price: 14000,
                    img: 'https://images.unsplash.com/photo-1518013391915-e4db03407cca?q=80&w=500',
                    active: true,
                    comboItems: [
                        { productId: 'promo-jarra', quantity: 1, group: 'Bebida', isBonus: false },
                        { productId: 'cumple-papas', quantity: 1, group: 'Comida', isBonus: true }
                    ]
                },
                {
                    id: 'promo-pizza-party',
                    name: 'Pizza Party',
                    desc: '5 Pizzas a elección + 2 Gaseosas 1.5L.',
                    price: 65000,
                    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500',
                    active: true,
                    comboItems: [
                        { productId: 'cumple-pizza', quantity: 5, group: 'Pizzas', isBonus: false },
                        { productId: 'cumple-coca', quantity: 2, group: 'Bebidas', isBonus: false }
                    ]
                }
            ];

            for (const pr of promos) {
                await setDoc(doc(db, 'negocios', negocioId, 'promotions', pr.id), { ...pr, negocio_id: negocioId });
            }

            alert("¡Promociones configuradas correctamente!");
        } catch (error) {
            console.error("Error sembrando promos:", error);
            alert("Error al crear las promociones.");
        }
    };

    const getProductName = (id) => {
        const p = barProducts.find(prod => prod.id === id);
        return p ? p.name : 'Desconocido';
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        GESTOR DE <span className="text-gold">PROMOCIONES</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Paquetes de productos con precios promocionales
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSeedCumplePromos}
                        className="px-6 py-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 hover:bg-indigo-500/30 transition-colors"
                        title="Autogenerar Todas las Promos PRO"
                    >
                        <Gift size={16} /> SETUP PROMOS
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={16} /> NUEVA PROMOCIÓN
                    </button>
                </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map(promo => (
                    <div
                        key={promo.id}
                        className={`rounded-[28px] border overflow-hidden flex flex-col transition-all duration-300 ${promo.active
                            ? 'bg-white/[0.02] border-white/10 hover:border-gold/30'
                            : 'bg-white/[0.01] border-white/5 opacity-60 grayscale'
                            }`}
                    >
                        {/* Image Header */}
                        <div className="h-32 bg-slate-900 relative">
                            {promo.img ? (
                                <img src={promo.img} alt={promo.name} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-800">
                                    <Tag size={32} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Promoción</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>

                            {/* Status Toggle */}
                            <button
                                onClick={() => togglePromotionStatus(promo.id, promo.active)}
                                className={`absolute top-3 right-3 p-2 rounded-xl transition-colors z-10 ${promo.active ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {promo.active ? <Power size={16} /> : <PowerOff size={16} />}
                            </button>

                            {/* Price Badge */}
                            <div className="absolute bottom-3 right-3 bg-gold text-slate-950 px-3 py-1 rounded-lg font-black italic shadow-lg">
                                ${promo.price}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">{promo.name}</h3>
                                {promo.desc && (
                                    <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{promo.desc}</p>
                                )}

                                {/* Contained Items */}
                                <div className="space-y-2 mb-4 bg-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Incluye:</p>
                                    {promo.comboItems?.map((ci, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <Tag size={10} className={ci.isBonus ? 'text-green-500' : 'text-gold'} />
                                                {ci.quantity}x {getProductName(ci.productId)}
                                                {ci.isBonus && <span className="text-[8px] bg-green-500/10 text-green-500 px-1 rounded">BONUS</span>}
                                            </span>
                                            <span className="text-[8px] opacity-40 uppercase tracking-widest">{ci.group}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleOpenModal(promo)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-[10px] font-black italic text-white uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[32px]">
                        <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag size={24} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">No hay promociones configuradas</p>
                        <p className="text-slate-600 text-xs font-medium">Ofrece conjuntos de productos con precios promocionales.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">
                            {editingId ? 'Editar' : 'Nueva'} <span className="text-gold">Promoción</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Promoción</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Promo Merienda"
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
                                        placeholder="Breve descripción de la promoción..."
                                        value={formData.desc}
                                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            {/* Modo Evento */}
                            <div className="pt-4 border-t border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.modo_evento === 'cumpleaños'}
                                        onChange={(e) => setFormData({ ...formData, modo_evento: e.target.checked ? 'cumpleaños' : '' })}
                                        className="sr-only peer"
                                    />
                                    <div className="size-6 rounded-lg border-2 border-white/20 peer-checked:border-gold peer-checked:bg-gold/20 flex items-center justify-center transition-all">
                                        {formData.modo_evento === 'cumpleaños' && <span className="text-gold text-sm">🎂</span>}
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-gold transition-colors">Activar modo cumpleaños</span>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Sonido festivo + alerta visual en cocina y barra</p>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2">
                                        <Tag size={14} /> Productos Incluidos
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
                                        Debes añadir al menos un producto a esta promoción.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex gap-3 px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                            <div className="flex-1">Producto</div>
                                            <div className="w-16">Cant.</div>
                                            <div className="w-24">Grupo</div>
                                            <div className="w-16">Bonus</div>
                                            <div className="w-10"></div>
                                        </div>
                                        {formData.comboItems.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-center">
                                                <div className="flex-1">
                                                    <select
                                                        required
                                                        value={item.productId}
                                                        onChange={(e) => handleUpdateComboItem(index, 'productId', e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-gold outline-none"
                                                    >
                                                        <option value="" disabled>-- Elige Producto --</option>
                                                        {availableProducts.sort((a, b) => a.name.localeCompare(b.name)).map(ap => (
                                                            <option key={ap.id} value={ap.id}>{ap.name} (${ap.price})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-16">
                                                    <input
                                                        required
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateComboItem(index, 'quantity', e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-3 text-xs text-center font-black text-white focus:border-gold outline-none"
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <select
                                                        value={item.group || 'Pizzas'}
                                                        onChange={(e) => handleUpdateComboItem(index, 'group', e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-3 text-[10px] font-bold text-white focus:border-gold outline-none"
                                                    >
                                                        <option value="Pizzas">Pizzas</option>
                                                        <option value="Tragos">Tragos</option>
                                                        <option value="Bebidas">Bebidas</option>
                                                        <option value="Comida">Comida</option>
                                                        <option value="Bonus">Bonus</option>
                                                    </select>
                                                </div>
                                                <div className="w-16 flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isBonus}
                                                        onChange={(e) => handleUpdateComboItem(index, 'isBonus', e.target.checked)}
                                                        className="size-5 accent-gold"
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
                                <CheckCircle2 size={18} /> Guardar Promoción
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
