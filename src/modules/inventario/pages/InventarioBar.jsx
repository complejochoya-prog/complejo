import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import useInventario from '../hooks/useInventario';
import ProductoInventarioCard from '../components/ProductoInventarioCard';
import ProductoForm from '../components/ProductoForm';
import StockControl from '../components/StockControl';
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
    AlertCircle
} from 'lucide-react';

export default function InventarioBar() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders, users } = useConfig();
    const SECTOR = 'BAR';

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAlert, setFilterAlert] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'tables', 'mozos'

    const filters = { sector: SECTOR };
    if (searchTerm) filters.buscar = searchTerm;
    if (filterCategory) filters.categoria = filterCategory;
    if (filterAlert) filters.alerta_stock = true;

    const { productos, loading, save, addStockMovement } = useInventario(filters);
    
    // UI state
    const [showForm, setShowForm] = useState(false);
    const [showStockControl, setShowStockControl] = useState(false);
    const [targetProduct, setTargetProduct] = useState(null);

    // Helpers
    const mozos = users.filter(u => u.rol?.toLowerCase() === 'mozo');
    const occupiedTables = Array.from(new Set(orders.filter(o => o.status !== 'paid').map(o => o.table)));
    const totalVentasHoy = orders.filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.total || 0), 0);

    const catSet = new Set(productos.map(p => p.categoria));
    const currentCategories = Array.from(catSet);

    const handleEdit = (p) => { setTargetProduct(p); setShowForm(true); };
    const handleMovement = (p) => { setTargetProduct(p); setShowStockControl(true); };
    const closeModals = () => { setShowForm(false); setShowStockControl(false); setTargetProduct(null); };

    const handleGenerateAI = async (p) => {
        const prompt = `ultra realistic food photography, studio lighting, dark modern background, restaurant menu style, highly detailed: ${p.nombre}`;
        const randomSeed = Math.floor(Math.random() * 100000);
        const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${randomSeed}`;
        
        // Verifica si carga bien
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = async () => {
                await save({ ...p, img: aiUrl });
                resolve();
            };
            img.onerror = resolve; // Fallback silently
            img.src = aiUrl;
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white space-y-8 animate-in fade-in duration-500">
            {/* Header Management Style */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[32px] border border-white/5">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(`/${negocioId}/inventario`)}
                        className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Gestión Integral del Bar
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Panel administrativo: Mesas, Empleados e Inventario
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                        <ClipboardList size={14} /> Inventario
                    </button>
                    <button 
                        onClick={() => setActiveTab('tables')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tables' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                        <LayoutGrid size={14} /> Mesas
                    </button>
                    <button 
                        onClick={() => setActiveTab('mozos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mozos' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Users size={14} /> Mozos
                    </button>
                </div>
            </header>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recaudación Hoy</span>
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter font-mono">${totalVentasHoy.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center">
                            <LayoutGrid size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mesas Ocupadas</span>
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter font-mono">{occupiedTables.length} / 12</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                            <Users size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mozos Activos</span>
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter font-mono">{mozos.filter(m => m.estado === 'activo').length}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center">
                            <AlertCircle size={16} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alertas Stock</span>
                    </div>
                    <p className="text-2xl font-black text-white italic tracking-tighter font-mono">{productos.filter(p => p.stock <= p.stock_minimo).length}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-slate-900/20 rounded-[40px] border border-white/5 min-h-[60vh] p-8">
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative min-w-[250px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar producto..." 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner" 
                                    />
                                </div>
                                <select 
                                    value={filterCategory} 
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="bg-slate-950 border border-white/5 text-xs font-bold text-slate-300 rounded-2xl px-5 py-3.5 focus:outline-none uppercase tracking-widest cursor-pointer"
                                >
                                    <option value="">Todas las Categorías</option>
                                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={() => { setTargetProduct(null); setShowForm(true); }}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/10 flex items-center gap-3 active:scale-95"
                            >
                                <Plus size={18} /> Crear Nuevo Producto
                            </button>
                        </div>

                        {productos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productos.map(p => (
                                    <ProductoInventarioCard key={p.id} producto={p} onEdit={handleEdit} onMovement={handleMovement} onGenerateAI={handleGenerateAI} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-40">
                                <Search size={48} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sin resultados en el inventario</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tables' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => {
                                const isOccupied = occupiedTables.includes(n);
                                const tableOrders = orders.filter(o => o.table === n && o.status !== 'paid');
                                const total = tableOrders.reduce((acc, o) => acc + (o.total || 0), 0);

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
                                                            .reduce((acc, o) => acc + (o.total || 0), 0);
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

            <ProductoForm isOpen={showForm} onClose={closeModals} onSave={save} initial={targetProduct} predefinedSector={SECTOR} />
            <StockControl isOpen={showStockControl} onClose={closeModals} onSave={addStockMovement} producto={targetProduct} />
        </div>
    );
}
