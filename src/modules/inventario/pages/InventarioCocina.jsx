import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useInventario from '../hooks/useInventario';
import ProductoInventarioCard from '../components/ProductoInventarioCard';
import ProductoForm from '../components/ProductoForm';
import StockControl from '../components/StockControl';
import { ChefHat, ArrowLeft, Search, Plus, Filter, X } from 'lucide-react';

export default function InventarioCocina() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const SECTOR = 'COCINA';

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAlert, setFilterAlert] = useState(false);

    const filters = { sector: SECTOR };
    if (searchTerm) filters.buscar = searchTerm;
    if (filterCategory) filters.categoria = filterCategory;
    if (filterAlert) filters.alerta_stock = true;

    const { productos, save, addStockMovement } = useInventario(filters);
    
    const [showForm, setShowForm] = useState(false);
    const [showStockControl, setShowStockControl] = useState(false);
    const [targetProduct, setTargetProduct] = useState(null);

    const catSet = new Set(productos.map(p => p.categoria));
    const currentCategories = Array.from(catSet);

    const handleEdit = (p) => { setTargetProduct(p); setShowForm(true); };
    const handleMovement = (p) => { setTargetProduct(p); setShowStockControl(true); };
    const closeModals = () => { setShowForm(false); setShowStockControl(false); setTargetProduct(null); };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/${negocioId}/inventario`)}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <ChefHat size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Inventario Cocina
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Insumos frescos, secos y materia prima
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative min-w-[200px] hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                        <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X size={14} /></button>}
                    </div>
                    <button onClick={() => { setTargetProduct(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-950 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20">
                        <Plus size={16} /> Agregar
                    </button>
                </div>
            </header>

            {/* Mobile Search */}
            <div className="relative md:hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all" />
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-4 flex-wrap bg-slate-900/50 p-3 rounded-2xl border border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-500 ml-2" />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-slate-300 focus:outline-none uppercase tracking-widest appearance-none cursor-pointer pr-4">
                        <option value="">Todas las Categorías</option>
                        {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <button onClick={() => setFilterAlert(!filterAlert)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterAlert ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-transparent text-slate-500 hover:text-slate-300'}`}>
                    Solo Alertas de Stock
                </button>
            </div>

            {/* List */}
            {productos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productos.map(p => (
                        <ProductoInventarioCard key={p.id} producto={p} onEdit={handleEdit} onMovement={handleMovement} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[32px] border border-dashed border-white/[0.06]">
                    <Search size={32} className="mx-auto text-slate-600" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No se encontraron insumos en Cocina</p>
                </div>
            )}

            <ProductoForm isOpen={showForm} onClose={closeModals} onSave={save} initial={targetProduct} predefinedSector={SECTOR} />
            <StockControl isOpen={showStockControl} onClose={closeModals} onSave={addStockMovement} producto={targetProduct} />
        </div>
    );
}
