import React, { useState } from 'react';
import { useInventario } from '../services/InventarioContext';
import {
    Truck,
    Plus,
    Calendar,
    CheckCircle2,
    Clock,
    Search,
    ChevronDown,
    X,
    FileText,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';

export default function SupplierOrders() {
    const {
        supplierOrders,
        addSupplierOrder,
        updateSupplierOrderStatus,
        kitchenSupplies
    } = useInventario();

    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');

    const [newOrder, setNewOrder] = useState({
        supplier: '',
        items: [],
        status: 'pendiente',
        expectedAt: '',
        notes: ''
    });

    const statusColors = {
        'pendiente': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'pedido': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'recibido': 'bg-green-500/10 text-green-500 border-green-500/20',
        'cancelado': 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        await addSupplierOrder(newOrder);
        setNewOrder({ supplier: '', items: [], status: 'pendiente', expectedAt: '', notes: '' });
        setIsAdding(false);
    };

    const addItem = (supply) => {
        if (newOrder.items.some(i => i.supplyId === supply.id)) return;
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { supplyId: supply.id, name: supply.name, quantity: 0, unit: supply.unit }]
        });
    };

    const updateItemQty = (id, qty) => {
        setNewOrder({
            ...newOrder,
            items: newOrder.items.map(i => i.supplyId === id ? { ...i, quantity: Number(qty) } : i)
        });
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Truck className="text-orange-400" size={32} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            Pedidos a <span className="text-orange-400">Proveedores</span>
                        </h1>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-orange-500 hover:bg-orange-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
                >
                    <Plus size={18} /> NUEVO PEDIDO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pendientes', count: supplierOrders.filter(o => o.status === 'pendiente').length, color: 'text-amber-500' },
                    { label: 'En Camino', count: supplierOrders.filter(o => o.status === 'pedido').length, color: 'text-blue-500' },
                    { label: 'Recibidos Hoy', count: supplierOrders.filter(o => o.status === 'recibido').length, color: 'text-green-500' }
                ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black italic ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por proveedor..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-orange-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['Todos', 'Pendiente', 'Pedido', 'Recibido'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${filterStatus === status ? 'bg-orange-500 border-orange-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {supplierOrders.map(order => (
                        <div key={order.id} className="p-6 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 flex items-center gap-6">
                                <div className={`size-14 rounded-2xl flex items-center justify-center border-2 ${statusColors[order.status]}`}>
                                    <Truck size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black uppercase tracking-tight italic">{order.supplier}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">
                                        {order.items.length} productos • Esperado: {order.expectedAt ? format(new Date(order.expectedAt), 'dd/MM/yyyy') : 'Sin fecha'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {order.status === 'pendiente' && (
                                    <button
                                        onClick={() => updateSupplierOrderStatus(order.id, 'pedido')}
                                        className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                        Marcar como Pedido
                                    </button>
                                )}
                                {order.status === 'pedido' && (
                                    <button
                                        onClick={() => updateSupplierOrderStatus(order.id, 'recibido')}
                                        className="bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                                    >
                                        Recibir Mercadería
                                    </button>
                                )}
                                <button className="p-4 bg-white/5 text-slate-500 rounded-2xl hover:text-white transition-colors">
                                    <FileText size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {supplierOrders.length === 0 && (
                        <div className="p-20 text-center opacity-20">
                            <ArrowUpRight size={48} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-[0.2em] text-xs">No hay pedidos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAdd} className="bg-slate-900 border border-orange-500/20 rounded-[40px] p-8 w-full max-w-2xl shadow-2xl space-y-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Plus className="text-orange-400" /> Crear Pedido a Proveedor
                            </h2>
                            <button type="button" onClick={() => setIsAdding(false)} className="bg-white/5 p-2 rounded-xl text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre del Proveedor</label>
                                    <input
                                        required
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-orange-500"
                                        placeholder="Ej: Distribuidora Norte"
                                        value={newOrder.supplier}
                                        onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fecha Estimada</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm outline-none focus:border-orange-500 h-[58px]"
                                        value={newOrder.expectedAt}
                                        onChange={e => setNewOrder({ ...newOrder, expectedAt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Insumos a Pedir</label>
                                    <div className="bg-slate-950 border border-white/10 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-2">
                                        {kitchenSupplies.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => addItem(s)}
                                                className="w-full p-3 rounded-xl border border-white/5 hover:border-orange-500/50 flex justify-between items-center text-left"
                                            >
                                                <span className="text-sm font-bold">{s.name}</span>
                                                <Plus size={16} className="text-slate-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Lista de Pedido</label>
                                <div className="bg-slate-950 border border-white/10 rounded-3xl p-4 min-h-[300px] space-y-3">
                                    {newOrder.items.map(item => (
                                        <div key={item.supplyId} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold">{item.name}</p>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Cantidad"
                                                className="w-20 bg-black border border-white/10 rounded-xl p-2 text-center text-xs font-bold"
                                                value={item.quantity}
                                                onChange={e => updateItemQty(item.supplyId, e.target.value)}
                                            />
                                            <span className="text-[10px] font-black uppercase text-slate-500 w-8">{item.unit}</span>
                                        </div>
                                    ))}
                                    {newOrder.items.length === 0 && (
                                        <div className="h-48 flex items-center justify-center text-slate-700 text-[10px] font-black uppercase text-center p-8 border-2 border-dashed border-white/5 rounded-2xl">
                                            Agrega insumos desde el panel izquierdo
                                        </div>
                                    )}
                                </div>
                                <button className="w-full bg-orange-500 text-slate-950 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                    Finalizar Pedido
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
