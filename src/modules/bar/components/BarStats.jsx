import React, { useState, useMemo } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../services/PedidosContext';
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    ShoppingBag,
    Calendar,
    ArrowUpRight,
    UtensilsCrossed
} from 'lucide-react';

export default function BarStats() {
    const { orders, barProducts } = usePedidos();
    const [dateFilter, setDateFilter] = useState('hoy'); // 'hoy', 'semana', 'mes', 'todo'

    // Filter orders based on selected date range and valid status (paid or delivered)
    const validOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter(o => {
            // Only consider completed/paid orders for revenue stats
            if (o.status !== 'paid' && o.status !== 'entregado') return false;

            const orderDate = o.timestamp?.toDate ? o.timestamp.toDate() : new Date(o.timestamp);

            switch (dateFilter) {
                case 'hoy': return orderDate >= startOfToday;
                case 'semana': return orderDate >= startOfWeek;
                case 'mes': return orderDate >= startOfMonth;
                case 'todo': return true;
                default: return true;
            }
        });
    }, [orders, dateFilter]);

    // 1. Total Sales
    const totalSales = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrdersCount = validOrders.length;

    // 2. Sales by Payment Method
    const salesByMethod = useMemo(() => {
        const methods = {};
        validOrders.forEach(o => {
            const method = o.paymentMethod || 'Efectivo';
            methods[method] = (methods[method] || 0) + (o.total || 0);
        });
        return Object.entries(methods).sort((a, b) => b[1] - a[1]);
    }, [validOrders]);

    // 3. Top Selling Products
    const topProducts = useMemo(() => {
        const productCounts = {};
        validOrders.forEach(o => {
            if (o.items) {
                o.items.forEach(item => {
                    if (!productCounts[item.id]) {
                        productCounts[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                    }
                    productCounts[item.id].quantity += item.quantity;
                    // Try to use item price or fallback to current product price
                    const price = item.price || (barProducts.find(p => p.id === item.id)?.price || 0);
                    productCounts[item.id].revenue += item.quantity * price;
                });
            }
        });
        return Object.values(productCounts)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10); // Top 10
    }, [validOrders, barProducts]);

    // 4. Sales by Mozo
    const salesByMozo = useMemo(() => {
        const mozos = {};
        validOrders.forEach(o => {
            const mozoName = o.mozoName || 'Online / Barra';
            if (!mozos[mozoName]) mozos[mozoName] = { count: 0, revenue: 0 };
            mozos[mozoName].count += 1;
            mozos[mozoName].revenue += (o.total || 0);
        });
        return Object.entries(mozos).sort((a, b) => b[1].revenue - a[1].revenue);
    }, [validOrders]);

    // 5. Sales by Hour (for chart)
    const salesByHour = useMemo(() => {
        const hours = Array(24).fill(0);
        validOrders.forEach(o => {
            const orderDate = o.timestamp?.toDate ? o.timestamp.toDate() : new Date(o.timestamp);
            const hour = orderDate.getHours();
            hours[hour] += (o.total || 0);
        });

        // Find max for scaling
        const max = Math.max(...hours) || 1;

        return hours.map((val, i) => ({
            hour: i,
            value: val,
            height: `${(val / max) * 100}%`
        }));
    }, [validOrders]);

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter pb-24">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <BarChart3 className="text-gold" size={32} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            ESTADÍSTICAS DEL <span className="text-gold">BAR</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Análisis de rendimiento y ventas
                    </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl">
                    {[
                        { id: 'hoy', label: 'Hoy' },
                        { id: 'semana', label: 'Semana' },
                        { id: 'mes', label: 'Mes' },
                        { id: 'todo', label: 'Todo' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setDateFilter(filter.id)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === filter.id
                                ? 'bg-white text-slate-950 shadow-lg'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-gold/20 rounded-2xl">
                            <TrendingUp className="text-gold" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} /> INGRESOS
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ventas Totales</p>
                        <p className="text-4xl font-black italic tracking-tighter text-gold">
                            ${totalSales.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Orders Count */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <ShoppingBag className="text-slate-400" size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pedidos Realizados</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            {totalOrdersCount}
                        </p>
                    </div>
                </div>

                {/* Avg Ticket */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <CreditCard className="text-slate-400" size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Promedio</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            ${totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount).toLocaleString() : 0}
                        </p>
                    </div>
                </div>

                {/* Products Sold */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <UtensilsCrossed className="text-slate-400" size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Productos Vendidos</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            {topProducts.reduce((acc, p) => acc + p.quantity, 0)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hourly Chart Box */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[32px] p-8 flex flex-col">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Ventas por Hora</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distribución de ingresos en el día</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-2 h-64 mt-auto">
                        {salesByHour.map((stat, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="w-full relative flex items-end justify-center h-full rounded-t-sm overflow-hidden bg-white/[0.02]">
                                    <div
                                        className="w-full bg-gold/50 group-hover:bg-gold transition-all duration-500"
                                        style={{ height: stat.value > 0 ? stat.height : '2px' }}
                                    ></div>
                                    {stat.value > 0 && (
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-xs font-black text-white px-2 py-1 rounded-md z-10 pointer-events-none">
                                            ${stat.value.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[8px] font-black text-slate-500 mt-2">{stat.hour}hs</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">Métodos de Pago</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Distribución de cobranzas</p>

                    <div className="space-y-4">
                        {salesByMethod.length === 0 ? (
                            <p className="text-center text-sm font-bold text-slate-500 uppercase py-10">Sin datos</p>
                        ) : salesByMethod.map(([method, amount], i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                <span className="font-black text-sm uppercase text-slate-300">{method}</span>
                                <span className="font-black italic text-gold">${amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Products */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden">
                    <div className="p-8 border-b border-white/10">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">Ranking de Productos</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Los 10 más vendidos</p>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Producto</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Cantidad</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Ingresos Generados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-10 text-center text-sm font-bold text-slate-500 uppercase">Sin datos</td>
                                </tr>
                            ) : topProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gold font-black italic">#{i + 1}</span>
                                            <span className="font-black text-sm uppercase text-white">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-black text-lg">{p.quantity}</td>
                                    <td className="px-8 py-5 text-right font-black italic text-gold">${p.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sales by Mozo */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden">
                    <div className="p-8 border-b border-white/10">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">Rendimiento por Mozo</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ventas agrupadas por personal</p>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Mozo / Origen</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Pedidos</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Total Facturado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {salesByMozo.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-10 text-center text-sm font-bold text-slate-500 uppercase">Sin datos</td>
                                </tr>
                            ) : salesByMozo.map(([name, stats], i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5 flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-full"><Users size={16} className="text-slate-400" /></div>
                                        <span className="font-black text-sm uppercase text-white">{name}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center font-black text-lg">{stats.count}</td>
                                    <td className="px-8 py-5 text-right font-black italic text-gold">${stats.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
