import React, { useState } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { useNavigate } from 'react-router-dom';
import {
    Utensils,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Image as ImageIcon,
    Save
} from 'lucide-react';

export default function BarManagement() {
    const { barProducts, updateBarProduct, removeBarProduct, toggleBarProductStock } = useConfig();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('Platos');
    const [isEditingPrice, setIsEditingPrice] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['Platos', 'Tragos', 'Bebidas', 'Postres'];

    const handleToggleStock = async (id) => {
        await toggleBarProductStock(id);
    };

    const handleUpdatePrice = async (id, newPrice) => {
        if (!newPrice || isNaN(newPrice)) return;
        await updateBarProduct(id, { price: parseInt(newPrice) });
        setIsEditingPrice(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            await removeBarProduct(id);
        }
    };

    const filteredProducts = (barProducts || []).filter(p =>
        p.category === activeCategory &&
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        GESTIÓN DE <span className="text-gold">BAR</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Bar CRUD | Precios, Fotos y Disponibilidad</p>
                </div>
                <button
                    onClick={() => navigate('/edit-product')}
                    className="px-6 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={16} />
                    Nuevo Producto
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white/10 text-gold border border-gold/30' : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none focus:border-gold/30"
                    />
                </div>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className={`p-6 rounded-[32px] border transition-all duration-300 ${product.disponible !== false ? 'bg-white/[0.02] border-white/5 hover:border-gold/20' : 'bg-red-500/5 border-red-500/20 grayscale-[0.5]'
                        }`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                            {/* Product Info */}
                            <div className="flex items-center gap-6 w-full md:w-1/3">
                                <div className="relative size-20 rounded-[24px] overflow-hidden shrink-0 border border-white/10">
                                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                                    <button className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ImageIcon size={20} className="text-white" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter leading-tight text-white">{product.name}</h4>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{product.category}</span>
                                </div>
                            </div>

                            {/* Price Management */}
                            <div className="flex items-center gap-12">
                                <div className="text-center md:text-left">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Precio Actual</p>
                                    {isEditingPrice === product.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-24 bg-white/10 border border-gold/40 rounded-lg px-2 py-1 text-sm font-black text-gold outline-none"
                                                defaultValue={product.price}
                                                autoFocus
                                                onBlur={(e) => handleUpdatePrice(product.id, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePrice(product.id, e.target.value)}
                                            />
                                            <button className="text-action-green"><Save size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingPrice(product.id)}>
                                            <p className="text-2xl font-black italic tracking-tighter text-gold">${(product.price || 0).toLocaleString()}</p>
                                            <Edit2 size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>

                                {/* Stock Toggle */}
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Stock: {product.stock_actual ?? 0}</p>
                                    <button
                                        onClick={() => handleToggleStock(product.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${product.disponible !== false
                                            ? 'bg-action-green/10 border-action-green/30 text-action-green'
                                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                                            }`}
                                    >
                                        {product.disponible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                                        <span className="text-[8px] font-black uppercase tracking-widest">{product.disponible !== false ? 'Disponible' : 'Sin Stock'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/edit-product?id=${product.id}`)}
                                    className="size-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-gold hover:text-slate-950 transition-all text-slate-500"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="size-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-slate-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Footer */}
            <footer className="bg-gold/10 border border-gold/20 rounded-[32px] p-8 mt-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h5 className="text-lg font-black italic uppercase tracking-tighter text-white">Gestión de Proveedores</h5>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Administra tus compras y stock de forma eficiente.</p>
                    </div>
                    <button
                        onClick={() => navigate('/supplier-orders')}
                        className="px-8 py-4 bg-slate-950 text-gold border border-gold/40 rounded-2xl font-black uppercase text-[10px] tracking-widest italic hover:bg-white hover:text-slate-950 transition-all"
                    >
                        Generar Pedido Proveedor
                    </button>
                </div>
            </footer>
        </div>
    );
}
