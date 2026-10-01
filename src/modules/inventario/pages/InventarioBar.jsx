import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import useInventario from '../hooks/useInventario';
import ProductoInventarioCard from '../components/ProductoInventarioCard';
import ProductoForm from '../components/ProductoForm';
import StockControl from '../components/StockControl';
import { buildProductAIImageUrl, preloadAIImage } from '../utils/iaPromptHelper';
import { 
    Coffee, 
    ArrowLeft, 
    Search, 
    Plus, 
    Filter, 
    X, 
    Users, 
    LayoutGrid, 
    ClipboardList,
    TrendingUp,
    Clock,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Package,
    DollarSign,
    ListPlus,
    FileText,
    Settings2,
    ArrowRight,
    Sparkles,
    Tag,
    Power,
    Loader2,
    Wand2
} from 'lucide-react';

export default function InventarioBar() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders = [], users = [] } = useConfig();
    const SECTOR = 'BAR';

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all'); // 'all' | 'available' | 'low' | 'outofstock' | 'off'
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'tables', 'mozos'

    // Batch AI Generation State
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentName: '' });

    const filters = { sector: SECTOR };
    if (searchTerm) filters.buscar = searchTerm;
    if (filterCategory) filters.categoria = filterCategory;

    const { productos, loading, save, addStockMovement } = useInventario(filters);
    
    // UI state for Modals
    const [showForm, setShowForm] = useState(false);
    const [showStockControl, setShowStockControl] = useState(false);
    const [targetProduct, setTargetProduct] = useState(null);
    const [detailProduct, setDetailProduct] = useState(null);

    // Helpers
    const mozos = users.filter(u => u.rol?.toLowerCase() === 'mozo');
    const occupiedTables = Array.from(new Set(orders.filter(o => o.status !== 'paid').map(o => o.table || o.tableNumber)));
    const totalVentasHoy = orders.filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.total || o.totalAmount || 0), 0);

    const catSet = new Set(productos.map(p => p.categoria).filter(Boolean));
    const currentCategories = Array.from(catSet);

    // Filtered by availability
    const filteredProductos = productos.filter(p => {
        const isOff = p.disponible === false;
        const stock = Number(p.stock !== undefined ? p.stock : (p.stock_actual || 0));
        const stockMin = Number(p.stock_minimo || 5);
        if (filterAvailability === 'off') return isOff;
        if (filterAvailability === 'available') return !isOff && stock > 0;
        if (filterAvailability === 'low') return !isOff && stock > 0 && stock <= stockMin;
        if (filterAvailability === 'outofstock') return !isOff && stock <= 0;
        return true;
    });

    const handleEdit = (p) => { 
        setTargetProduct(p); 
        setShowForm(true); 
    };

    const handleMovement = (p) => { 
        setTargetProduct(p); 
        setShowStockControl(true); 
    };

    const handleViewDetail = (p) => {
        setDetailProduct(p);
    };

    const handleToggleDisponible = async (p) => {
        const nextState = p.disponible === false ? true : false;
        await save({ ...p, disponible: nextState });
        if (detailProduct && detailProduct.id === p.id) {
            setDetailProduct(prev => ({ ...prev, disponible: nextState }));
        }
    };

    const closeModals = () => { 
        setShowForm(false); 
        setShowStockControl(false); 
        setTargetProduct(null); 
    };

    const handleGenerateAI = async (p) => {
        try {
            const aiUrl = buildProductAIImageUrl(p.nombre, p.categoria);
            await preloadAIImage(aiUrl);
            await save({ ...p, img: aiUrl });
            if (detailProduct && detailProduct.id === p.id) {
                setDetailProduct(prev => ({ ...prev, img: aiUrl }));
            }
        } catch (e) {
            console.error('Error generando foto IA:', e);
        }
    };

    const handleBatchGenerateAI = async () => {
        const targets = productos.filter(p => !p.img);
        if (targets.length === 0) {
            alert('✅ ¡Todos los productos del bar ya tienen foto asignada!');
            return;
        }

        const confirmGen = window.confirm(`🤖 ¿Deseas auto-generar imágenes con IA para ${targets.length} productos sin foto analizando el nombre de cada uno?`);
        if (!confirmGen) return;

        setIsBatchGenerating(true);
        setBatchProgress({ current: 0, total: targets.length, currentName: targets[0]?.nombre || '' });

        try {
            for (let i = 0; i < targets.length; i++) {
                const prod = targets[i];
                setBatchProgress({ current: i + 1, total: targets.length, currentName: prod.nombre });
                const aiUrl = buildProductAIImageUrl(prod.nombre, prod.categoria);
                await preloadAIImage(aiUrl);
                await save({ ...prod, img: aiUrl });
            }
            alert('🎉 ¡Imágenes con IA generadas y guardadas exitosamente!');
        } catch (err) {
            console.error('Error en generación por lote:', err);
            alert('Hubo un error en algunas imágenes, pero las generadas fueron guardadas.');
        } finally {
            setIsBatchGenerating(false);
        }
    };

    const countDisponibles = productos.filter(p => p.disponible !== false && Number(p.stock || 0) > 0).length;
    const countSinStock = productos.filter(p => p.disponible !== false && Number(p.stock || 0) <= 0).length;
    const countBajoStock = productos.filter(p => p.disponible !== false && Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.stock_minimo || 5)).length;
    const countApagados = productos.filter(p => p.disponible === false).length;
    const countSinFoto = productos.filter(p => !p.img).length;

    return (
        <div className="min-h-screen bg-slate-950 text-white space-y-8 animate-in fade-in duration-500 pb-16">
            
            {/* Header Management Style */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[32px] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate(`/${negocioId}/inventario`)}
                        className="w-11 h-11 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500"><span>Control de Stock y Recetas</span></span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white leading-none mt-1">
                            <span>Gestión Integral del Bar</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                            <span>Disponibilidad por stock, apagado de productos, fotos IA y recetas</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ClipboardList size={14} /> <span>Inventario ({productos.length})</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('tables')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tables' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <LayoutGrid size={14} /> <span>Mesas</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('mozos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mozos' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users size={14} /> <span>Mozos</span>
                    </button>
                </div>
            </header>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>Disponibles</span></span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400 italic tracking-tighter"><span>{countDisponibles}</span></p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20">
                            <AlertCircle size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>Sin Stock</span></span>
                    </div>
                    <p className="text-2xl font-black text-rose-400 italic tracking-tighter"><span>{countSinStock}</span></p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                            <AlertCircle size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>Stock Bajo</span></span>
                    </div>
                    <p className="text-2xl font-black text-amber-400 italic tracking-tighter"><span>{countBajoStock}</span></p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20">
                            <Power size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>Apagados</span></span>
                    </div>
                    <p className="text-2xl font-black text-rose-400 italic tracking-tighter"><span>{countApagados}</span></p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/20">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>Ventas Hoy</span></span>
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter"><span>${totalVentasHoy.toLocaleString('es-AR')}</span></p>
                </div>
            </div>

            {/* Modal de Progreso de IA por Lote */}
            {isBatchGenerating && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-slate-900 border border-amber-500/40 rounded-[32px] p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-amber-500/10">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mx-auto border border-amber-500/20">
                            <Sparkles size={32} className="animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                <span>Generando Imágenes con IA</span>
                            </h3>
                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">
                                <span>Procesando producto {batchProgress.current} de {batchProgress.total}</span>
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block"><span>Leyendo Producto:</span></span>
                            <span className="text-sm font-black text-white italic truncate block"><span>{batchProgress.currentName}</span></span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                            <div 
                                className="bg-amber-500 h-full transition-all duration-300"
                                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            <span>Creando prompts gastronómicos ultra-realistas en vivo...</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-slate-900/30 rounded-[40px] border border-white/5 p-6 lg:p-8">
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Search, Categories, Availability Filters and New Product */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-wrap flex-1">
                                {/* Search input */}
                                <div className="relative min-w-[220px] flex-1 max-w-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre, código o receta..." 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner" 
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Category dropdown */}
                                <select 
                                    value={filterCategory} 
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="bg-slate-950 border border-white/10 text-xs font-bold text-slate-300 rounded-2xl px-4 py-3.5 focus:outline-none uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="">Todas las Categorías</option>
                                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>

                                {/* Availability filter pill buttons */}
                                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/5 flex-wrap">
                                    {[
                                        { id: 'all', label: `Todos (${productos.length})` },
                                        { id: 'available', label: `Disponibles (${countDisponibles})` },
                                        { id: 'low', label: `Bajo Stock (${countBajoStock})` },
                                        { id: 'outofstock', label: `Sin Stock (${countSinStock})` },
                                        { id: 'off', label: `Apagados (${countApagados})` }
                                    ].map(btn => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setFilterAvailability(btn.id)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                                                filterAvailability === btn.id
                                                    ? 'bg-white/15 text-white shadow'
                                                    : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            <span>{btn.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons: Batch AI + New Product */}
                            <div className="flex items-center gap-2.5">
                                {countSinFoto > 0 && (
                                    <button 
                                        onClick={handleBatchGenerateAI}
                                        disabled={isBatchGenerating}
                                        title="Generar fotos con IA para los productos que no tienen imagen"
                                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 active:scale-95 shrink-0"
                                    >
                                        <Sparkles size={16} className="text-amber-400" />
                                        <span>Fotos IA ({countSinFoto} pendientes)</span>
                                    </button>
                                )}

                                <button 
                                    onClick={() => { setTargetProduct(null); setShowForm(true); }}
                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 active:scale-95 shrink-0"
                                >
                                    <Plus size={18} />
                                    <span>Crear Producto</span>
                                </button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredProductos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProductos.map(p => (
                                    <ProductoInventarioCard 
                                        key={p.id} 
                                        producto={p} 
                                        onEdit={handleEdit} 
                                        onMovement={handleMovement} 
                                        onGenerateAI={handleGenerateAI} 
                                        onViewDetail={handleViewDetail}
                                        onToggleDisponible={handleToggleDisponible}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-3">
                                <Search size={44} className="mx-auto text-slate-700 mb-2" />
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <span>No se encontraron productos con esos filtros</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tables' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => {
                                const isOccupied = occupiedTables.includes(n);
                                const tableOrders = orders.filter(o => (o.table === n || o.tableNumber === n) && o.status !== 'paid');
                                const total = tableOrders.reduce((acc, o) => acc + (o.total || o.totalAmount || 0), 0);

                                return (
                                    <div key={n} className={`relative p-6 rounded-[32px] border transition-all ${isOccupied ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20 shadow-xl shadow-amber-500/5' : 'bg-slate-950 border-white/5 opacity-50'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="text-3xl font-black italic tracking-tighter text-white">#0{n}</span>
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${isOccupied ? 'bg-amber-500' : 'bg-slate-800'}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{isOccupied ? 'Ocupada' : 'Libre'}</p>
                                            {isOccupied && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-lg font-black text-white italic tracking-tighter">${total.toLocaleString()}</p>
                                                    <p className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">Mesa Activa</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'mozos' && (
                    <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-slate-950">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-white/5">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mozo / Usuario</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ventas del Día</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Última Actividad</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Turno</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {mozos.length > 0 ? mozos.map(m => {
                                    const mozoVentas = orders.filter(o => o.mozoId === m.id && o.status === 'paid')
                                                            .reduce((acc, o) => acc + (o.total || o.totalAmount || 0), 0);
                                    const isActive = m.estado === 'activo';

                                    return (
                                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                        <UserCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase italic tracking-tighter text-sm">{m.nombre} {m.apellido}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">@{m.usuario}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                    {isActive ? 'En Turno' : 'Fuera de Turno'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-white italic tracking-tighter">${mozoVentas.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={14} className="text-slate-600" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Hace 15 min</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.horario || 'SIN ASIGNAR'}</p>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
                                            No hay mozos registrados en el sistema
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── MODAL DETALLE DEL PRODUCTO ───────────────────────────── */}
            {detailProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-[#0b1329] border border-amber-500/30 w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white my-8 space-y-6">
                        {/* Glow effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={() => setDetailProduct(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20"
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>

                        {/* Top: Image & Header */}
                        <div className="relative z-10 space-y-4">
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner">
                                {detailProduct.img ? (
                                    <img src={detailProduct.img} alt={detailProduct.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <Coffee size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white bg-black/70 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                                        <span>{detailProduct.codigo || 'S/C'}</span>
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-900/80 px-2.5 py-1 rounded-xl border border-indigo-500/30 backdrop-blur-md">
                                        <span>{detailProduct.categoria || 'BAR'}</span>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                                            <span>{detailProduct.nombre}</span>
                                        </h2>
                                        <p className="text-xl font-black italic text-emerald-400 mt-0.5">
                                            <span>${Number(detailProduct.precio || 0).toLocaleString('es-AR')}</span>
                                        </p>
                                    </div>

                                    {/* Availability pill */}
                                    {detailProduct.disponible === false ? (
                                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1.5 shrink-0">
                                            <Power size={12} /> <span>Apagado (Pausado)</span>
                                        </span>
                                    ) : Number(detailProduct.stock || 0) > 0 ? (
                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                                            <CheckCircle2 size={12} /> <span>Disponible ({detailProduct.stock} ud)</span>
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1.5 shrink-0">
                                            <AlertCircle size={12} /> <span>Sin Stock (Agotado)</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Cards */}
                        <div className="space-y-3 relative z-10 text-xs">
                            {/* Ingredientes / Receta */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                    <ListPlus size={14} />
                                    <span>Ingredientes / Receta</span>
                                </h4>
                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                    <span>{detailProduct.ingredientes || 'No se registraron ingredientes específicos para este producto.'}</span>
                                </p>
                            </div>

                            {/* Descripción comercial */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                                    <FileText size={14} />
                                    <span>Descripción / Detalle</span>
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <span>{detailProduct.descripcion || 'Sin descripción adicional cargada.'}</span>
                                </p>
                            </div>

                            {/* Stock & Métricas */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block"><span>Stock Actual</span></span>
                                    <span className={`text-lg font-black italic tracking-tight ${Number(detailProduct.stock || 0) <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        <span>{detailProduct.stock || 0} unidades</span>
                                    </span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block"><span>Stock Mínimo (Alerta)</span></span>
                                    <span className="text-lg font-black italic tracking-tight text-amber-400">
                                        <span>{detailProduct.stock_minimo || 5} unidades</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2 pt-2 relative z-10">
                            {/* Toggle Estado Button */}
                            <button
                                onClick={() => handleToggleDisponible(detailProduct)}
                                className={`w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all border ${
                                    detailProduct.disponible === false
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border-emerald-500/30'
                                        : 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border-rose-500/30'
                                }`}
                            >
                                <Power size={16} />
                                <span>{detailProduct.disponible === false ? 'Encender / Habilitar Producto' : 'Apagar / Pausar Producto'}</span>
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const p = detailProduct;
                                        setDetailProduct(null);
                                        handleEdit(p);
                                    }}
                                    className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                >
                                    <Settings2 size={16} />
                                    <span>Editar Todo</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const p = detailProduct;
                                        setDetailProduct(null);
                                        handleMovement(p);
                                    }}
                                    className="py-3.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                >
                                    <ArrowRight size={16} />
                                    <span>Stock</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setDetailProduct(null)}
                                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                                <span>Cerrar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forms and Control Modals */}
            <ProductoForm 
                isOpen={showForm} 
                onClose={closeModals} 
                onSave={save} 
                initial={targetProduct} 
                predefinedSector={SECTOR} 
                existingCategories={currentCategories}
            />
            
            <StockControl 
                isOpen={showStockControl} 
                onClose={closeModals} 
                onSave={addStockMovement} 
                producto={targetProduct} 
            />
        </div>
    );
}
