import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Users, Calendar, Beer, TrendingUp, Package,
    ChevronRight, Zap, Target, ArrowUpRight, Clock,
    CreditCard, ShoppingBag, Activity, Star, Flame,
    Search, Filter, CheckCircle2, AlertCircle, X,
    Phone, MessageCircle, DollarSign, UtensilsCrossed,
    MapPin, FileText, ArrowDownRight, ExternalLink,
    Receipt, UserCheck, Sparkles, RefreshCw
} from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { db } from '../../../firebase/config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

/** Helper to convert any timestamp/date format safely */
function toSafeDate(val) {
    if (!val) return new Date();
    try {
        if (val instanceof Date) return val;
        if (typeof val.toDate === 'function') return val.toDate();
        if (typeof val === 'number') return new Date(val);
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
}

/** Formatter for time display */
function formatActivityTime(date) {
    if (!date) return '';
    try {
        const d = toSafeDate(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        
        if (isToday) {
            return `Hoy ${hours}:${mins} hs`;
        }
        const day = d.getDate();
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${day} ${monthNames[d.getMonth()]} • ${hours}:${mins} hs`;
    } catch {
        return '';
    }
}

export default function Dashboard() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    const businessName = config?.nombre || negocioId?.toUpperCase() || 'NEGOCIO';
    const basePath = `/${negocioId}`;

    // Live raw data states
    const [rawReservas, setRawReservas] = useState([]);
    const [rawPedidos, setRawPedidos] = useState([]);
    const [rawCajaMovements, setRawCajaMovements] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Filters and search
    const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'reservas' | 'bar' | 'mozos' | 'caja'
    const [searchQuery, setSearchQuery] = useState('');

    // Selected item for Detail Modal
    const [selectedActivity, setSelectedActivity] = useState(null);

    // ── Real-time Listeners across all business activities ───────────
    useEffect(() => {
        if (!negocioId) return;
        setLoadingData(true);

        const unsubs = [];

        // 1. Reservas
        try {
            const qRes = query(collection(db, 'negocios', negocioId, 'reservas'));
            const unsubRes = onSnapshot(qRes, (snap) => {
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRawReservas(list);
            }, (err) => {
                console.warn("[Dashboard] Error listening to reservas:", err);
            });
            unsubs.push(unsubRes);
        } catch (e) {
            console.warn("[Dashboard] Could not setup reservas listener:", e);
        }

        // 2. Pedidos / Ventas Bar & Mozos
        try {
            const qPed = query(
                collection(db, 'negocios', negocioId, 'pedidos'),
                orderBy('timestamp', 'desc'),
                limit(80)
            );
            const unsubPed = onSnapshot(qPed, (snap) => {
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRawPedidos(list);
            }, (err) => {
                console.warn("[Dashboard] Error listening to pedidos:", err);
            });
            unsubs.push(unsubPed);
        } catch (e) {
            console.warn("[Dashboard] Could not setup pedidos listener:", e);
        }

        // 3. Movimientos de Caja
        try {
            const qCaja = query(
                collection(db, 'negocios', negocioId, 'caja_movements'),
                orderBy('timestamp', 'desc'),
                limit(60)
            );
            const unsubCaja = onSnapshot(qCaja, (snap) => {
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRawCajaMovements(list);
                setLoadingData(false);
            }, (err) => {
                console.warn("[Dashboard] Error listening to caja movements:", err);
                setLoadingData(false);
            });
            unsubs.push(unsubCaja);
        } catch (e) {
            console.warn("[Dashboard] Could not setup caja listener:", e);
            setLoadingData(false);
        }

        return () => {
            unsubs.forEach(u => typeof u === 'function' && u());
        };
    }, [negocioId]);

    // ── Unified and Normalized Activity List ─────────────────────────
    const unifiedActivities = useMemo(() => {
        const list = [];
        const seenIds = new Set();

        // A. Reservas
        rawReservas.forEach(r => {
            const id = `res_${r.id || r.timestamp || Math.random()}`;
            if (seenIds.has(id)) return;
            seenIds.add(id);

            const dateObj = toSafeDate(r.timestamp || r.createdAt || r.fecha);
            const clientName = `${r.cliente?.nombre || r.nombre || 'Cliente'} ${r.cliente?.apellido || r.apellido || ''}`.trim();
            const spaceName = r.canchaNombre || r.resource?.name || 'Espacio Deportivo';
            const price = Number(r.precio || r.price || 0);
            const sena = Number(r.montoSena || 0);
            const resta = Math.max(0, price - sena);

            list.push({
                id,
                sourceType: 'reserva',
                title: `Reserva - ${spaceName}`,
                subtitle: `${clientName} • ${r.hora || 'Horario'} hs`,
                actor: clientName,
                actorRole: 'Cliente Online',
                phone: r.cliente?.telefono || r.telefono || '',
                amount: price,
                sena,
                resta,
                paymentMethod: r.pago || r.metodoPago || 'Transferencia',
                status: r.status || 'Confirmada',
                timestamp: dateObj,
                formattedTime: formatActivityTime(dateObj),
                dateStr: r.fecha || r.fullDate || '',
                space: spaceName,
                persons: r.cantidadPersonas || 1,
                items: [],
                comprobante: r.comprobanteAdjunto || r.comprobantePreview || null,
                icon: Calendar,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                badgeText: 'Reserva',
                raw: r
            });
        });

        // B. Pedidos (Mozos / Bar / Takeaway)
        rawPedidos.forEach(p => {
            const id = `ped_${p.id || p.timestamp || Math.random()}`;
            if (seenIds.has(id)) return;
            seenIds.add(id);

            const dateObj = toSafeDate(p.timestamp || p.createdAt);
            const isMozo = !!(p.mozoId || p.mozoName || p.mozo || p.source === 'mozo');
            const mozoName = p.mozoName || p.mozo || p.waiter || (isMozo ? 'Mozo' : null);
            const clientName = p.cliente?.nombre || p.nombreCliente || p.clientName || 'Cliente';
            const tableNum = p.tableNumber || p.mesa || p.tableId || null;
            const total = Number(p.total || p.totalAmount || p.precio || 0);
            const items = Array.isArray(p.items) ? p.items : [];

            let title = 'Venta Bar / Cocina';
            if (tableNum) {
                title = `Mesa ${tableNum} - ${isMozo ? 'Pedido Mozo' : 'Consumo Mesa'}`;
            } else if (p.type === 'takeaway') {
                title = 'Venta Take Away';
            }

            list.push({
                id,
                sourceType: isMozo ? 'mozo' : 'bar',
                title,
                subtitle: `${isMozo ? `Mozo: ${mozoName}` : clientName} • ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
                actor: isMozo ? mozoName : clientName,
                actorRole: isMozo ? 'Mozo / Camarero' : 'Cliente Bar',
                phone: p.cliente?.telefono || p.telefono || '',
                amount: total,
                sena: 0,
                resta: 0,
                paymentMethod: p.metodoPago || p.paymentMethod || p.pago || 'Efectivo',
                status: p.status || p.estado || 'cobrado',
                timestamp: dateObj,
                formattedTime: formatActivityTime(dateObj),
                table: tableNum,
                items,
                comprobante: null,
                icon: isMozo ? Users : Beer,
                color: isMozo ? 'text-sky-400' : 'text-emerald-400',
                bg: isMozo ? 'bg-sky-500/10 border-sky-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
                badgeText: isMozo ? 'Mozo' : 'Bar',
                raw: p
            });
        });

        // C. Movimientos de Caja
        rawCajaMovements.forEach(m => {
            const id = `caja_${m.id || m.timestamp || Math.random()}`;
            if (seenIds.has(id)) return;
            seenIds.add(id);

            const dateObj = toSafeDate(m.timestamp || m.createdAt || m.fecha);
            const isEgreso = m.type === 'out' || m.type === 'egreso';
            const userName = m.usuario || m.user || m.mozo || 'Cajero';
            const amount = Number(m.amount || m.monto || 0);

            list.push({
                id,
                sourceType: 'caja',
                title: m.concepto || m.description || (isEgreso ? 'Egreso de Caja' : 'Ingreso de Caja'),
                subtitle: `${userName} • ${m.category || m.categoria || 'Operación Caja'}`,
                actor: userName,
                actorRole: m.userRole || (m.mozo ? 'Mozo' : 'Cajero / Operador'),
                phone: '',
                amount: isEgreso ? -amount : amount,
                isEgreso,
                paymentMethod: m.method || m.metodo || 'Efectivo',
                status: 'Registrado',
                timestamp: dateObj,
                formattedTime: formatActivityTime(dateObj),
                category: m.category || m.categoria || 'General',
                items: [],
                comprobante: null,
                icon: CreditCard,
                color: isEgreso ? 'text-rose-400' : 'text-purple-400',
                bg: isEgreso ? 'bg-rose-500/10 border-rose-500/20' : 'bg-purple-500/10 border-purple-500/20',
                badgeText: isEgreso ? 'Egreso' : 'Caja',
                raw: m
            });
        });

        // Sort descending by timestamp
        list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return list;
    }, [rawReservas, rawPedidos, rawCajaMovements]);

    // ── Filtered Activities for the Feed ─────────────────────────────
    const filteredActivities = useMemo(() => {
        return unifiedActivities.filter(act => {
            // Tab filter
            if (activeTab === 'reservas' && act.sourceType !== 'reserva') return false;
            if (activeTab === 'bar' && act.sourceType !== 'bar') return false;
            if (activeTab === 'mozos' && act.sourceType !== 'mozo') return false;
            if (activeTab === 'caja' && act.sourceType !== 'caja') return false;

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = act.title?.toLowerCase().includes(q);
                const matchSub = act.subtitle?.toLowerCase().includes(q);
                const matchActor = act.actor?.toLowerCase().includes(q);
                const matchPhone = act.phone?.toLowerCase().includes(q);
                const matchSpace = act.space?.toLowerCase().includes(q);
                const matchMethod = act.paymentMethod?.toLowerCase().includes(q);
                return matchTitle || matchSub || matchActor || matchPhone || matchSpace || matchMethod;
            }

            return true;
        });
    }, [unifiedActivities, activeTab, searchQuery]);

    // ── Dynamic Live Stats ───────────────────────────────────────────
    const todayStats = useMemo(() => {
        const todayStr = new Date().toDateString();
        let revenueToday = 0;
        let reservasTodayCount = 0;
        let pedidosTodayCount = 0;
        let mozosOrdersCount = 0;

        unifiedActivities.forEach(act => {
            if (act.timestamp.toDateString() === todayStr) {
                if (act.sourceType === 'reserva') {
                    revenueToday += (act.sena || act.amount || 0);
                    reservasTodayCount++;
                } else if (act.sourceType === 'bar' || act.sourceType === 'mozo') {
                    revenueToday += act.amount;
                    pedidosTodayCount++;
                    if (act.sourceType === 'mozo') mozosOrdersCount++;
                } else if (act.sourceType === 'caja') {
                    if (!act.isEgreso) revenueToday += act.amount;
                }
            }
        });

        return {
            revenueToday,
            reservasTodayCount,
            pedidosTodayCount,
            mozosOrdersCount,
            totalTodayActivities: unifiedActivities.filter(a => a.timestamp.toDateString() === todayStr).length
        };
    }, [unifiedActivities]);

    const stats = [
        { 
            label: 'Ingresos Hoy', 
            value: `$${todayStats.revenueToday.toLocaleString('es-AR')}`, 
            change: 'En tiempo real', 
            icon: TrendingUp, 
            color: 'text-emerald-400', 
            bg: 'from-emerald-500/20 to-emerald-500/5', 
            border: 'border-emerald-500/20', 
            path: `${basePath}/caja` 
        },
        { 
            label: 'Reservas Hoy', 
            value: `${todayStats.reservasTodayCount}`, 
            change: `${rawReservas.length} Totales`, 
            icon: Calendar, 
            color: 'text-amber-400', 
            bg: 'from-amber-500/20 to-amber-500/5', 
            border: 'border-amber-500/20', 
            path: `${basePath}/admin/reservas` 
        },
        { 
            label: 'Ventas Bar / Mozos', 
            value: `${todayStats.pedidosTodayCount}`, 
            change: `${todayStats.mozosOrdersCount} por Mozos`, 
            icon: Beer, 
            color: 'text-sky-400', 
            bg: 'from-sky-500/20 to-sky-500/5', 
            border: 'border-sky-500/20', 
            path: `${basePath}/bar` 
        },
        { 
            label: 'Operaciones Hoy', 
            value: `${todayStats.totalTodayActivities}`, 
            change: 'Activas', 
            icon: Activity, 
            color: 'text-purple-400', 
            bg: 'from-purple-500/20 to-purple-500/5', 
            border: 'border-purple-500/20', 
            path: `${basePath}/caja` 
        },
    ];

    const quickActions = [
        { label: 'Reservas', icon: Calendar, path: `${basePath}/admin/reservas`, color: 'bg-amber-500' },
        { label: 'Bar & Mesas', icon: Beer, path: `${basePath}/bar`, color: 'bg-emerald-500' },
        { label: 'Caja', icon: CreditCard, path: `${basePath}/admin/caja`, color: 'bg-blue-500' },
        { label: 'Empleados / Mozos', icon: Users, path: `${basePath}/empleados`, color: 'bg-purple-500' },
    ];

    return (
        <div className={`space-y-6 lg:space-y-10 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-[2px] w-6 bg-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60"><span>Panel de Administración</span></span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.85]">
                        <span>CENTRAL </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">CONTROL</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <span>{businessName} • {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 shadow-lg shadow-emerald-500/5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-400"><span>Actividad en Tiempo Real</span></span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {stats.map((stat, i) => (
                    <Link
                        key={i}
                        to={stat.path}
                        className={`block relative bg-gradient-to-br ${stat.bg} border ${stat.border} p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] group hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden cursor-pointer shadow-xl`}
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center">
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                                <span className={`text-[8px] lg:text-[10px] font-black ${stat.color} px-2 py-1 rounded-lg bg-white/5`}><span>{stat.change}</span></span>
                            </div>
                            <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1"><span>{stat.label}</span></p>
                            <p className="text-xl lg:text-3xl font-black italic tracking-tighter"><span>{stat.value}</span></p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions - Mobile */}
            <div className="lg:hidden">
                <h3 className="text-sm font-black uppercase tracking-tight italic mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> <span>Acciones Rápidas</span>
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            to={action.path}
                            className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl active:scale-90 transition-transform text-center"
                        >
                            <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center text-black shadow-lg`}>
                                <action.icon size={20} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400"><span>{action.label}</span></span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content: Activity Feed & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* ── CENTRAL ACTIVITY FEED ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-premium rounded-[28px] lg:rounded-[40px] p-5 lg:p-8 space-y-6 border border-white/10 shadow-2xl">
                        
                        {/* Feed Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight italic flex items-center gap-2.5">
                                    <Activity size={20} className="text-amber-500" />
                                    <span>Actividad </span><span className="text-amber-500">Reciente</span>
                                </h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    <span>Reservas, ventas, cobros de mozos y pagos en vivo</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <span>{filteredActivities.length} registradas</span>
                                </span>
                            </div>
                        </div>

                        {/* Search and Tabs Bar */}
                        <div className="space-y-3">
                            {/* Search bar */}
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por cliente, mozo, espacio, teléfono o método..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900/90 border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {[
                                    { id: 'todos', label: 'Todos' },
                                    { id: 'reservas', label: '📅 Reservas' },
                                    { id: 'mozos', label: '🧑‍🍳 Mozos' },
                                    { id: 'bar', label: '🍹 Bar & Ventas' },
                                    { id: 'caja', label: '💵 Caja & Pagos' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                            activeTab === tab.id
                                                ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activity Items List */}
                        <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                            {filteredActivities.map((act) => {
                                const IconComponent = act.icon || Activity;
                                return (
                                    <div
                                        key={act.id}
                                        onClick={() => setSelectedActivity(act)}
                                        className="flex items-center gap-3 lg:gap-4 p-3.5 lg:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 transition-all duration-200 cursor-pointer group"
                                    >
                                        {/* Icon badge */}
                                        <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-2xl ${act.bg} flex items-center justify-center shrink-0 shadow-lg`}>
                                            <IconComponent size={18} className={act.color} />
                                        </div>

                                        {/* Main info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[11px] lg:text-xs font-black uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors truncate">
                                                    <span>{act.title}</span>
                                                </h4>
                                                <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${act.bg} ${act.color} shrink-0`}>
                                                    <span>{act.badgeText}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-medium truncate">
                                                <span className="font-bold text-slate-300">👤 {act.actor}</span>
                                                <span>•</span>
                                                <span className="text-slate-500">{act.formattedTime}</span>
                                                {act.paymentMethod && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-slate-400">{act.paymentMethod}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price & Arrow */}
                                        <div className="text-right shrink-0">
                                            <p className={`text-xs lg:text-sm font-black italic tracking-tight ${act.isEgreso ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                <span>{act.isEgreso ? '-' : '+'}${Math.abs(act.amount).toLocaleString('es-AR')}</span>
                                            </p>
                                            {act.sena > 0 && (
                                                <p className="text-[8px] font-bold text-amber-400/80 uppercase tracking-widest mt-0.5">
                                                    <span>Seña: ${act.sena.toLocaleString('es-AR')}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-1.5 rounded-xl bg-white/5 text-slate-600 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all shrink-0">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredActivities.length === 0 && (
                                <div className="py-14 text-center space-y-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                        <Search size={24} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">
                                        <span>No se encontraron actividades con ese criterio</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── SIDEBAR STATS & ACCESOS ────────────────────────────── */}
                <div className="space-y-6">
                    
                    {/* Live Operations Panel */}
                    <div className="bg-gradient-to-br from-[#0e1726] to-[#0b1020] border border-amber-500/20 rounded-[28px] lg:rounded-[40px] p-6 lg:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400"><span>Resumen Operativo</span></span>
                            </div>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300"><span>Reservas Registradas</span></span>
                                </div>
                                <span className="text-sm font-black italic text-amber-400"><span>{rawReservas.length}</span></span>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Beer size={16} className="text-sky-400" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300"><span>Pedidos Bar / Mozos</span></span>
                                </div>
                                <span className="text-sm font-black italic text-sky-400"><span>{rawPedidos.length}</span></span>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={16} className="text-purple-400" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300"><span>Movimientos Caja</span></span>
                                </div>
                                <span className="text-sm font-black italic text-purple-400"><span>{rawCajaMovements.length}</span></span>
                            </div>
                        </div>

                        <Link
                            to={`${basePath}/admin/reservas`}
                            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                        >
                            <span>Gestionar Reservas</span>
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    {/* Quick Access Desktop */}
                    <div className="hidden lg:block glass-premium rounded-[40px] p-8 space-y-4 border border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-tight italic flex items-center gap-2">
                            <Flame size={14} className="text-amber-500" /> <span>Accesos Directos</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.path}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-white/10 transition-all group text-center"
                                >
                                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-black shadow-lg group-hover:rotate-6 transition-transform`}>
                                        <action.icon size={18} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400"><span>{action.label}</span></span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL DETALLE DE ACTIVIDAD ────────────────────────────── */}
            {selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-[#0b1329] border border-amber-500/30 w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white my-8 space-y-6">
                        {/* Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={() => setSelectedActivity(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20"
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl ${selectedActivity.bg} flex items-center justify-center shadow-xl shrink-0`}>
                                {(() => {
                                    const IconC = selectedActivity.icon || Activity;
                                    return <IconC size={26} className={selectedActivity.color} />;
                                })()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${selectedActivity.bg} ${selectedActivity.color}`}>
                                    <span>{selectedActivity.badgeText}</span>
                                </span>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-white mt-1 truncate">
                                    <span>{selectedActivity.title}</span>
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    <span>{selectedActivity.formattedTime}</span>
                                </p>
                            </div>
                        </div>

                        {/* Section 1: Quién realizó / Responsable */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs relative z-10">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <UserCheck size={14} className="text-amber-400" />
                                <span>Información del Responsable</span>
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold"><span>Persona / Mozo:</span></p>
                                    <p className="text-sm font-black text-white mt-0.5"><span>{selectedActivity.actor}</span></p>
                                </div>
                                <div>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold"><span>Rol / Origen:</span></p>
                                    <p className="text-xs font-bold text-slate-300 mt-0.5"><span>{selectedActivity.actorRole}</span></p>
                                </div>
                            </div>

                            {selectedActivity.phone && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] text-slate-500 uppercase font-bold"><span>Teléfono:</span></p>
                                        <p className="text-xs font-bold text-slate-200 mt-0.5"><span>{selectedActivity.phone}</span></p>
                                    </div>
                                    <a
                                        href={`https://wa.me/${selectedActivity.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                    >
                                        <MessageCircle size={13} />
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Detalle de la Operación */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs relative z-10">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Receipt size={14} className="text-emerald-400" />
                                <span>Detalle de la Operación</span>
                            </h4>

                            {/* Reservas info */}
                            {selectedActivity.sourceType === 'reserva' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400"><span>Espacio Deportivo:</span></span>
                                        <span className="font-bold text-amber-400"><span>{selectedActivity.space}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400"><span>Fecha:</span></span>
                                        <span className="font-medium text-slate-200"><span>{selectedActivity.dateStr}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400"><span>Horario:</span></span>
                                        <span className="font-bold text-slate-100"><span>{selectedActivity.raw?.hora || 'Horario pactado'} hs</span></span>
                                    </div>
                                    {selectedActivity.sena > 0 && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400"><span>Seña Abonada:</span></span>
                                            <span className="font-black text-emerald-400"><span>${selectedActivity.sena.toLocaleString('es-AR')}</span></span>
                                        </div>
                                    )}
                                    {selectedActivity.sena > 0 && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400"><span>Resta Abonar en Complejo:</span></span>
                                            <span className="font-bold text-orange-400"><span>${selectedActivity.resta.toLocaleString('es-AR')}</span></span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Items breakdown for Bar / Mozo */}
                            {(selectedActivity.sourceType === 'bar' || selectedActivity.sourceType === 'mozo') && (
                                <div className="space-y-2">
                                    {selectedActivity.table && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400"><span>Mesa asignada:</span></span>
                                            <span className="font-bold text-amber-400"><span>Mesa #{selectedActivity.table}</span></span>
                                        </div>
                                    )}

                                    {selectedActivity.items && selectedActivity.items.length > 0 ? (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold"><span>Productos incluidos:</span></p>
                                            {selectedActivity.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
                                                    <span className="text-slate-200"><span>{item.quantity || item.qty || 1}x {item.name || item.title || 'Producto'}</span></span>
                                                    <span className="font-bold text-slate-300"><span>${Number(item.price || item.precio || 0).toLocaleString('es-AR')}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-[11px] italic"><span>Consumo general registrado</span></p>
                                    )}
                                </div>
                            )}

                            {/* Caja details */}
                            {selectedActivity.sourceType === 'caja' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400"><span>Categoría:</span></span>
                                        <span className="font-bold text-slate-200"><span>{selectedActivity.category}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400"><span>Tipo de Movimiento:</span></span>
                                        <span className={`font-bold ${selectedActivity.isEgreso ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            <span>{selectedActivity.isEgreso ? 'Egreso (Gasto / Salida)' : 'Ingreso (Entrada de dinero)'}</span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Total and Payment */}
                            <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10">
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block"><span>Forma de Pago</span></span>
                                    <span className="text-xs font-bold text-slate-200"><span>{selectedActivity.paymentMethod}</span></span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block"><span>Monto Total</span></span>
                                    <span className={`text-xl font-black italic ${selectedActivity.isEgreso ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        <span>{selectedActivity.isEgreso ? '-' : ''}${Math.abs(selectedActivity.amount).toLocaleString('es-AR')}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2 pt-2 relative z-10">
                            {selectedActivity.sourceType === 'reserva' && (
                                <Link
                                    to={`${basePath}/admin/reservas`}
                                    className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                                >
                                    <span>Ir al Módulo de Reservas</span>
                                    <ExternalLink size={16} />
                                </Link>
                            )}

                            {(selectedActivity.sourceType === 'bar' || selectedActivity.sourceType === 'mozo') && (
                                <Link
                                    to={`${basePath}/bar`}
                                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    <span>Ir al Módulo de Bar & Mesas</span>
                                    <ExternalLink size={16} />
                                </Link>
                            )}

                            {selectedActivity.sourceType === 'caja' && (
                                <Link
                                    to={`${basePath}/caja`}
                                    className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                                >
                                    <span>Ir al Módulo de Caja</span>
                                    <ExternalLink size={16} />
                                </Link>
                            )}

                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                                <span>Cerrar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
