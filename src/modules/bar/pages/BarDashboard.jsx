import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import TableCard from '../components/TableCard';
import ProductSelector from '../components/ProductSelector';
import { 
    LayoutGrid, 
    Users, 
    Clock, 
    Zap, 
    TrendingUp, 
    UtensilsCrossed, 
    Search,
    ChevronRight,
    ArrowUpRight,
    ChefHat,
    Coffee,
    Monitor,
    Bell,
    Filter
} from 'lucide-react';
import TableDetail from './TableDetail';

import { usePedidos } from '../services/PedidosContext';
import { useMesas } from '../services/MesasContext';
import { tablasService } from '../../../core/services/tablasService';
import { Plus } from 'lucide-react';

export default function BarDashboard() {
    const { negocioId } = useParams();
    const { tables: configTables, barProducts, users, config } = useConfig();
    const { orders } = usePedidos();
    const { mesas, marcarMesaOcupada } = useMesas();
    const [selectedTable, setSelectedTable] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('todas'); // 'todas', 'ocupadas', 'limpieza'
    const [pendingQuickProduct, setPendingQuickProduct] = useState(null);

    // Filter Mozos
    const activeMozos = users.filter(u => 
        (u.rol?.toLowerCase() === 'mozo' || u.role?.toLowerCase() === 'mozo') && 
        (u.estado === 'activo' || u.active === true)
    );

    // Create 12 default tables if none exist
    const tables = useMemo(() => {
        const staticTables = (configTables && configTables.length > 0) ? configTables : Array.from({ length: 12 }, (_, i) => ({ tableNumber: i + 1, status: 'disponible' }));
        return staticTables.map(st => {
            const currentOrders = (orders || []).filter(o => (String(o.table) === String(st.tableNumber) || String(o.mesa) === String(st.tableNumber)) && o.status !== 'paid');
            const mozoAsignado = currentOrders.length > 0 ? currentOrders[0].mozoName : null;
            
            // Get state from MesasContext
            const liveMesa = (mesas || []).find(m => String(m.numero) === String(st.tableNumber));
            const baseStatus = liveMesa?.estado || 'disponible';
            
            return {
                ...st,
                status: currentOrders.length > 0 && baseStatus === 'disponible' ? 'ocupada' : baseStatus,
                currentOrders,
                mozoName: mozoAsignado
            };
        });
    }, [configTables, orders, mesas]);

    // Stats
    const stats = useMemo(() => {
        const activeOrders = (orders || []).filter(o => o.status !== 'paid');
        const revenueToday = (orders || []).filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.total || 0), 0);
        return {
            occupied: tables.filter(t => t.status === 'ocupada' || t.status === 'atendiendo').length,
            revenue: revenueToday,
            activeMozos: new Set(activeOrders.map(o => o.mozoName).filter(Boolean)).size,
            avgWaitTime: '12m'
        };
    }, [tables, orders]);

    // Group tables by state
    const filteredTables = tables.filter(t => {
        const matchesSearch = t.tableNumber.toString().includes(searchTerm);
        if (activeFilter === 'ocupadas') return matchesSearch && (t.status === 'ocupada' || t.status === 'atendiendo');
        if (activeFilter === 'limpieza') return matchesSearch && t.status === 'limpiando';
        return matchesSearch;
    });

    const handleAddTable = async () => {
        const newTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
        try {
            await tablasService.updateTabla(negocioId, newTableNumber, { status: 'disponible' });
        } catch (e) {
            console.error("Error al agregar mesa", e);
        }
    };

    const handleDeleteTable = async (tableNumber) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la mesa ${tableNumber}?`)) {
            try {
                await tablasService.deleteTabla(negocioId, tableNumber);
            } catch (e) {
                console.error("Error al eliminar mesa", e);
            }
        }
    };

    const { addOrder } = usePedidos();

    const handleTableClick = (t) => {
        if (pendingQuickProduct) {
            // Quick Order Flow
            addOrder({
                id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                table: t.tableNumber,
                mesa: t.tableNumber,
                productId: pendingQuickProduct.id,
                productName: pendingQuickProduct.nombre,
                price: pendingQuickProduct.precio,
                quantity: 1,
                total: pendingQuickProduct.precio,
                items: [{
                    id: pendingQuickProduct.id,
                    nombre: pendingQuickProduct.nombre,
                    precio: pendingQuickProduct.precio,
                    cantidad: 1,
                    sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].includes(pendingQuickProduct.categoria) ? 'cocina' : 'barra',
                }],
                productos: [{
                    id: pendingQuickProduct.id,
                    nombre: pendingQuickProduct.nombre,
                    precio: pendingQuickProduct.precio,
                    cantidad: 1,
                    sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].includes(pendingQuickProduct.categoria) ? 'cocina' : 'barra',
                }],
                mozoId: t.mozoId || '',
                mozoName: t.mozoName || 'Sistema',
                origin: "bar",
                status: "nuevo",
                estado: "nuevo",
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
            // Ocupar mesa si estaba disponible
            if (t.status === 'disponible') {
                 if (marcarMesaOcupada) marcarMesaOcupada(t.tableNumber);
            }
            setPendingQuickProduct(null);
            setSelectedTable(t); // Also open it so they can confirm
        } else {
            setSelectedTable(t);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
            {/* Header / Infobar */}
            <header className="px-6 lg:px-10 py-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-3xl sticky top-0 z-30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <ChefHat size={22} />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none">
                                    CENTRO <span className="text-emerald-500">OPERATIVO</span>
                                </h1>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Sala de Control Gastro • {config?.nombre || negocioId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Mozos En Vivo */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-3xl border border-white/5 shadow-inner">
                        <div className="px-4 py-2 border-r border-white/10 hidden sm:block">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Personal Activo</p>
                            <p className="text-xs font-black text-emerald-500 mt-1 uppercase italic tracking-tighter">Live Tracker</p>
                        </div>
                        <div className="flex -space-x-2 px-2">
                            {activeMozos.slice(0, 5).map(m => (
                                <div key={m.id} title={m.nombre} className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[11px] font-black text-white hover:-translate-y-1 transition-transform cursor-help">
                                    {(m.nombre || 'M')[0]}
                                </div>
                            ))}
                            {activeMozos.length > 5 && (
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-500">
                                    +{activeMozos.length - 5}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <button className="hidden lg:flex items-center gap-3 px-6 py-3 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-105 transition-all active:scale-95">
                            <Zap size={14} fill="currentColor" /> Nueva Orden
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                    {[
                        { label: 'Ocupación', value: `${stats.occupied}/${tables.length}`, sub: 'Mesas Activas', icon: LayoutGrid, color: 'emerald', bg: 'bg-emerald-500/10' },
                        { label: 'Productividad', value: stats.pendingOrders, sub: 'Items en Marcha', icon: Clock, color: 'blue', bg: 'bg-blue-500/10' },
                        { label: 'Caja Salon', value: `$${stats.revenue.toLocaleString()}`, sub: 'Recaudación Hoy', icon: TrendingUp, color: 'amber', bg: 'bg-amber-500/10' },
                        { label: 'Servicio', value: stats.mozos, sub: 'Mozos en Turno', icon: Users, color: 'rose', bg: 'bg-rose-500/10' },
                    ].map((s, i) => (
                        <div key={i} className="group relative bg-slate-900/40 p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-${s.color}-500 border border-${s.color}-500/20 shadow-lg`}>
                                    <s.icon size={22} />
                                </div>
                                <div className="flex items-center gap-1 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                    Live <div className={`w-1.5 h-1.5 rounded-full bg-${s.color}-500 animate-ping`} />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black italic tracking-tighter text-white">{s.value}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Content Areas */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                
                {/* Tables Navigator */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 scrollbar-hide relative">
                    
                    {/* Quick Order Banner */}
                    {pendingQuickProduct && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-top-4">
                            <span>Selecciona una mesa para cargar: {pendingQuickProduct.nombre}</span>
                            <button onClick={() => setPendingQuickProduct(null)} className="ml-2 bg-slate-950/20 rounded-full w-6 h-6 flex items-center justify-center hover:bg-slate-950/40">✕</button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                            {['todas', 'ocupadas', 'limpieza'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Buscar Mesa..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900/80 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredTables.map(t => (
                            <TableCard 
                                key={t.tableNumber}
                                table={t}
                                currentOrders={(orders || []).filter(o => (String(o.table) === String(t.tableNumber) || String(o.mesa) === String(t.tableNumber)) && o.status !== 'paid')}
                                onClick={handleTableClick}
                                onDelete={handleDeleteTable}
                            />
                        ))}
                        {/* Botón Agregar Mesa */}
                        <button 
                            onClick={handleAddTable}
                            className="w-full h-full min-h-[200px] rounded-[32px] border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-emerald-500 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center mb-4 transition-colors">
                                <Plus size={32} />
                            </div>
                            <span className="font-black uppercase tracking-widest text-xs">Agregar Mesa</span>
                        </button>
                    </div>

                    {filteredTables.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-700">
                                <Search size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-500">No hay resultados</h3>
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Intenta con otro número de mesa o filtro</p>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Analytics Sidebar */}
                <aside className="w-full lg:w-[450px] bg-slate-950/40 border-l border-white/5 flex flex-col backdrop-blur-xl">
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                                <TrendingUp size={14} /> Actividad en Tiempo Real
                            </h3>
                            <button className="text-[8px] font-black uppercase text-slate-500 hover:text-white transition-colors">Ver Todo</button>
                        </div>

                        <div className="space-y-4">
                            {[...orders].reverse().slice(0, 5).map((o, idx) => (
                                <div key={idx} className="group flex items-center gap-4 p-5 bg-slate-900/30 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-slate-900/50 cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-emerald-500 border border-white/5 group-hover:scale-110 transition-transform">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-black italic uppercase tracking-tighter text-white">Mesa #{o.table}</p>
                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+$ {o.total || 0}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 truncate mt-1">
                                            {o.items?.length > 0 ? o.items.map(i => i.nombre).join(', ') : o.productName || 'Orden sin detalle'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Coffee size={14} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Acceso Rápido Productos</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <ProductSelector 
                                products={barProducts}
                                onSelect={(p) => {
                                    if (selectedTable) {
                                        // If modal is open, shouldn't hit here due to z-index usually, but just in case
                                    } else {
                                        setPendingQuickProduct(p);
                                    }
                                }}
                                gridCols={2}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal Detail Overlay */}
            {selectedTable && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
                    onClick={() => setSelectedTable(null)}
                >
                    <div 
                        className="w-full max-w-7xl h-full max-h-[90vh] bg-[#020617] rounded-[4rem] border-2 border-white/10 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <TableDetail 
                            table={selectedTable} 
                            onClose={() => setSelectedTable(null)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
