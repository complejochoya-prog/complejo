import React, { useState, useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import TableCard from '../components/TableCard';
import ProductSelector from '../components/ProductSelector';
import MozoBadge from '../components/MozoBadge';
import { 
    LayoutGrid, 
    Users, 
    Clock, 
    Zap, 
    TrendingUp, 
    UtensilsCrossed, 
    AlertCircle, 
    Search,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import TableDetail from './TableDetail';

export default function BarDashboard() {
    const { orders, tables, barProducts, users, updateTable, updateOrder } = useConfig();
    const [selectedTable, setSelectedTable] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Mozos
    const activeMozos = users.filter(u => u.rol?.toLowerCase() === 'mozo' && (u.estado === 'activo' || u.activo === true));

    // Stats
    const stats = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'paid');
        const revenueToday = orders.filter(o => o.status === 'paid').reduce((acc, o) => acc + (o.total || 0), 0);
        return {
            occupied: tables.filter(t => t.status !== 'disponible').length,
            revenue: revenueToday,
            mozos: activeMozos.length,
            pendingOrders: activeOrders.length
        };
    }, [orders, tables, activeMozos]);

    // Group tables by state for the overview
    const filteredTables = tables.filter(t => t.tableNumber.toString().includes(searchTerm));

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Top Bar - Mozos & Stats */}
            <header className="p-8 border-b border-white/5 space-y-8 bg-slate-900/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase">Bar Central</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Control Operativo de Salon</p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                        {activeMozos.map(m => (
                            <div key={m.id} className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl border border-white/5 min-w-[150px]">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase italic tracking-tighter leading-none">{m.nombre}</p>
                                    <p className="text-[8px] font-bold text-emerald-500 uppercase mt-0.5">En Turno</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Mesas Ocupadas', val: `${stats.occupied} / ${tables.length}`, icon: LayoutGrid, color: 'amber' },
                        { label: 'Recaudación Hoy', val: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
                        { label: 'Mozos en Salon', val: stats.mozos, icon: Users, color: 'indigo' },
                        { label: 'Pedidos Activos', val: stats.pendingOrders, icon: Zap, color: 'rose' }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-5 rounded-[28px] border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className="text-xl font-black italic tracking-tighter">{s.val}</p>
                            </div>
                            <div className={`w-12 h-12 bg-${s.color}-500/10 text-${s.color}-500 rounded-xl flex items-center justify-center border border-${s.color}-500/20`}>
                                <s.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Tables Grid */}
                <main className="flex-1 p-8 overflow-y-auto border-r border-white/5 bg-slate-950/20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                                <LayoutGrid size={16} /> Salón Principal
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                <input 
                                    type="text"
                                    placeholder="Nro mesa..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold focus:outline-none focus:border-indigo-500/30 w-32"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTables.map(t => (
                            <TableCard 
                                key={t.tableNumber}
                                table={t}
                                currentOrders={orders.filter(o => o.table === t.tableNumber && o.status !== 'paid')}
                                onClick={() => setSelectedTable(t)}
                            />
                        ))}
                    </div>
                </main>

                {/* Right Side: Activity & Global Products */}
                <aside className="w-[400px] border-l border-white/5 flex flex-col bg-slate-900/30">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                             <Zap size={14} /> Última Actividad
                        </h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {[...orders].reverse().slice(0, 8).map((o, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-600">
                                    <Clock size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="text-[9px] font-black uppercase tracking-tighter text-white italic">Mesa #{o.table}</p>
                                        <p className="text-[8px] font-bold text-slate-600">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recién'}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{o.productName || (o.items?.length > 0 ? o.items[0].nombre : 'Varios productos')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[9px] font-black text-amber-500/80 uppercase">Por: {o.mozoName || 'Sistema'}</p>
                                        <ArrowUpRight size={10} className="text-slate-700" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-900/60 border-t border-white/5">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-4">
                            <UtensilsCrossed size={14} /> Lista de Productos
                        </h2>
                        <div className="h-[300px]">
                            <ProductSelector 
                                products={barProducts}
                                onSelect={(p) => {
                                    if (selectedTable) {
                                        // Auto add to selected table
                                        console.log("Add to table", selectedTable.tableNumber, p);
                                    } else {
                                        alert("Selecciona una mesa primero");
                                    }
                                }}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal Detail Overlay */}
            {selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl h-[85vh] bg-slate-950 rounded-[48px] border border-white/10 shadow-3xl overflow-hidden">
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
