import React, { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useMesas } from '../../bar/services/MesasContext';
import PaymentModal from '../components/PaymentModal';
import { getMozoSession } from '../services/mozoService';
import { playBeepKDS } from './MozoApp';

/* ───── QUICK NOTES FOR KITCHEN MODIFIERS ───── */
const QUICK_NOTES = ['Sin cebolla', 'Punto jugoso', 'Hielo extra', 'Papas bien crocantes', 'Sin sal agregada', 'Bien cocido', 'Sin picante'];

/* ───── STATUS CONFIG MAP ───── */
const STATUS_CONFIG = {
    libre:     { label: 'DISPONIBLE',  color: '#10B981', borderClass: 'border-[#10B981]/40', badgeBg: 'bg-[#10B981]/20', badgeText: 'text-[#10B981]', numBg: 'bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981]' },
    ocupada:   { label: 'OCUPADA',     color: '#f59e0b', borderClass: 'border-[#f59e0b]',    badgeBg: 'bg-[#f59e0b]/20', badgeText: 'text-[#FBBF24]', numBg: 'bg-[#f59e0b] text-[#0A0A0F] shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
    cocina:    { label: 'EN COCINA',   color: '#06B6D4', borderClass: 'border-[#06B6D4]/60', badgeBg: 'bg-[#06B6D4]/20', badgeText: 'text-[#06B6D4]', numBg: 'bg-[#06B6D4] text-[#0A0A0F] shadow-[0_0_12px_rgba(6,182,212,0.5)]' },
    cuenta:    { label: 'PIDE CUENTA', color: '#8B5CF6', borderClass: 'border-[#8B5CF6]',    badgeBg: 'bg-[#8B5CF6]/30', badgeText: 'text-purple-300', numBg: 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]' },
    reservada: { label: 'RESERVADA',   color: '#4F46E5', borderClass: 'border-[#4F46E5]/50', badgeBg: 'bg-[#4F46E5]/30', badgeText: 'text-indigo-200', numBg: 'bg-[#4F46E5] text-white' },
    limpieza:  { label: 'LIMPIEZA',    color: '#EAB308', borderClass: 'border-[#EAB308]/60', badgeBg: 'bg-[#EAB308]/20', badgeText: 'text-yellow-400', numBg: 'bg-[#EAB308] text-[#0A0A0F]' },
};

export default function MozoTables() {
    const { negocioId, barProducts: configProducts, tables: configTables } = useConfig();
    const { orders = [], addOrder, barProducts: pedidosProducts = [] } = usePedidos();
    const { mesas = [], marcarMesaOcupada, marcarMesaDisponible, marcarMesaLimpieza } = useMesas();
    const outletCtx = useOutletContext() || {};

    const mozo = getMozoSession();

    /* ───── UI STATE ───── */
    const [selectedTable, setSelectedTable] = useState(null);
    const [activeFilter, setActiveFilter] = useState('todos');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isComandaOpen, setIsComandaOpen] = useState(false);
    const [modalTab, setModalTab] = useState('comandar'); // 'comandar' | 'kds'
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModifiers, setActiveModifiers] = useState(new Set());
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderToPay, setOrderToPay] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackTime, setFeedbackTime] = useState('');
    const [showPWABanner, setShowPWABanner] = useState(true);

    /* ───── PRODUCTS NORMALIZATION ───── */
    const allProducts = useMemo(() => {
        const source = (pedidosProducts?.length > 0) ? pedidosProducts : (configProducts || []);
        return source.map((p, idx) => {
            const id = String(p.id || `p-${idx}`);
            const nombre = String(p.nombre || p.name || 'Producto');
            const categoria = String(p.categoria || p.category || 'General').trim();
            const precio = Number(p.precio ?? p.price ?? 0) || 0;
            const stock = p.stock ?? p.cantidad_stock ?? null;
            return {
                ...p, id, nombre, categoria, precio, stock,
                sector: p.sector || (['Pizzas','Empanadas','Papas','Platos','Pastas','Burgers','Ensaladas','Lomos','Carnes','Tacos','Postres','Tortas'].some(c => categoria.toLowerCase().includes(c.toLowerCase())) ? 'cocina' : 'barra')
            };
        });
    }, [pedidosProducts, configProducts]);

    const dynamicCategories = useMemo(() => {
        const cats = Array.from(new Set(allProducts.map(p => p.categoria))).filter(Boolean);
        return [
            { id: 'todas', label: 'TODOS', count: allProducts.length },
            ...cats.map(cat => ({
                id: cat,
                label: cat.toUpperCase(),
                count: allProducts.filter(p => p.categoria === cat).length
            }))
        ];
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return allProducts.filter(p => {
            const matchCat = category === 'todas' || !category || p.categoria === category;
            const matchSearch = !term || p.nombre.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }, [allProducts, category, searchTerm]);

    /* ───── CART OPERATIONS ───── */
    const addToCart = useCallback((product) => {
        if ('vibrate' in navigator) navigator.vibrate(25);
        const pId = String(product.id);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (existing) return prev.map(item => String(item.id) === pId ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, id: pId, quantity: 1, comment: '' }];
        });
    }, []);

    const decrementCart = useCallback((productId) => {
        if ('vibrate' in navigator) navigator.vibrate(20);
        const pId = String(productId);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (!existing) return prev;
            if (existing.quantity <= 1) return prev.filter(item => String(item.id) !== pId);
            return prev.map(item => String(item.id) === pId ? { ...item, quantity: item.quantity - 1 } : item);
        });
    }, []);

    const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0), [cart]);
    const cartItemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    /* ───── PLACE ORDER TO KITCHEN / KDS ───── */
    const handlePlaceOrder = useCallback(() => {
        if (cart.length === 0 || !selectedTable) return;
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 100]);
        playBeepKDS();

        const modNotes = Array.from(activeModifiers).join(', ');
        const formattedCart = cart.map(item => ({
            ...item, cantidad: item.quantity, price: item.precio, sector: item.sector,
            notes: [item.comment, modNotes].filter(Boolean).join(' | '),
            observaciones: [item.comment, modNotes].filter(Boolean).join(' | ')
        }));

        const newOrder = {
            id: `mozo_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            products: cart,
            items: cart,
            productos: formattedCart,
            total: cartTotal,
            status: "pendiente",
            estado: "nuevo",
            mozoId: mozo?.id || 'mozo_general',
            mozoName: mozo?.name || mozo?.nombre || 'Mozo',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            origin: 'mozo'
        };

        if (addOrder) addOrder(newOrder);
        if (marcarMesaOcupada) marcarMesaOcupada(selectedTable);

        setCart([]);
        setActiveModifiers(new Set());
        setIsMenuOpen(false);
        setFeedbackTime(new Date().toLocaleTimeString());
        setShowFeedback(true);
    }, [cart, selectedTable, cartTotal, mozo, addOrder, marcarMesaOcupada, activeModifiers]);

    /* ───── TABLE SLOTS ───── */
    const allTableSlots = useMemo(() => {
        const baseSlots = Array.from({ length: 12 }, (_, i) => {
            const num = i + 1;
            return {
                id: String(num),
                displayNum: String(num).padStart(2, '0'),
                title: num <= 10 ? `Mesa ${String(num).padStart(2, '0')}` : (num === 11 ? 'Pádel 01' : 'Cancha F5'),
                sector: num <= 6 ? 'SALON' : (num <= 10 ? 'TERRAZAS' : (num === 11 ? 'PADEL' : 'FUTBOL')),
                capacidad: num === 5 ? 6 : (num === 9 ? 8 : (num === 3 || num === 7 ? 2 : (num === 12 ? 10 : 4))),
                isSport: num >= 11,
                sportIcon: num === 11 ? 'sports_tennis' : (num === 12 ? 'sports_soccer' : null),
                salonName: num <= 3 ? 'Salón Principal' : (num <= 6 ? 'Salón Terraza' : (num <= 10 ? 'Salón Quincho' : (num === 11 ? 'Pista Central Vidrio' : 'Césped Sintético 1')))
            };
        });
        const custom = (configTables || [])
            .filter(t => !baseSlots.some(b => b.id === String(t.tableNumber || t.id)))
            .map(t => ({
                id: String(t.tableNumber || t.id),
                displayNum: String(t.tableNumber || t.id).padStart(2, '0'),
                title: `Mesa ${t.tableNumber || t.id}`,
                sector: t.sector || 'SALON',
                capacidad: t.capacidad || 4,
                salonName: 'Salón'
            }));
        return [...baseSlots, ...custom];
    }, [configTables]);

    /* ───── TABLE CARD DATA (merge with orders/mesas) ───── */
    const tableCardsData = useMemo(() => {
        return allTableSlots.map(slot => {
            const tableOrders = (orders || []).filter(o =>
                (String(o.table) === slot.id || String(o.mesa) === slot.id) &&
                o.status !== 'paid' && !o.paid
            );
            const total = tableOrders.reduce((acc, o) => acc + Number(o.total || o.monto || o.precio || 0), 0);
            const mesaMeta = (mesas || []).find(m => String(m.numero || m.id) === slot.id);

            let status = 'libre';
            if (mesaMeta?.estado === 'limpieza') status = 'limpieza';
            else if (tableOrders.some(o => o.status === 'pide_cuenta' || o.pideCuenta)) status = 'cuenta';
            else if (tableOrders.some(o => o.estado === 'en_cocina' || o.estado === 'preparando')) status = 'cocina';
            else if (tableOrders.length > 0) status = 'ocupada';
            else if (mesaMeta?.estado === 'reservada') status = 'reservada';

            const productsList = tableOrders.flatMap(o => o.productos || o.items || o.products || []);
            const summaryText = productsList.length > 0
                ? productsList.slice(0, 2).map(p => `${p.cantidad || 1}x ${p.nombre || p.name}`).join(' + ')
                : (status === 'reservada' ? 'Reserva 21:30 - Torneo' : '');

            const minutes = tableOrders.length > 0 ? Math.round((Date.now() - new Date(tableOrders[0].createdAt || tableOrders[0].timestamp || Date.now()).getTime()) / 60000) || 0 : 0;

            return { ...slot, status, total, orders: tableOrders, productsCount: productsList.length, summaryText, minutes };
        });
    }, [allTableSlots, orders, mesas]);

    /* ───── FILTERS ───── */
    const statusCounts = useMemo(() => ({
        todos: tableCardsData.length,
        ocupada: tableCardsData.filter(t => t.status === 'ocupada').length,
        cocina: tableCardsData.filter(t => t.status === 'cocina').length,
        cuenta: tableCardsData.filter(t => t.status === 'cuenta').length,
        libre: tableCardsData.filter(t => t.status === 'libre').length,
    }), [tableCardsData]);

    const displayedTables = useMemo(() => {
        if (activeFilter === 'todos') return tableCardsData;
        return tableCardsData.filter(t => t.status === activeFilter);
    }, [tableCardsData, activeFilter]);

    /* ───── METRICS ───── */
    const facturacion = useMemo(() => {
        const total = tableCardsData
            .filter(t => t.status === 'ocupada' || t.status === 'cuenta' || t.status === 'cocina')
            .reduce((sum, t) => sum + t.total, 0);
        return total >= 1000 ? `$${Math.round(total / 1000)}.${String(total % 1000).padStart(3, '0').slice(0,3)}` : `$${total.toLocaleString('es-AR')}`;
    }, [tableCardsData]);

    /* ───── SELECTED TABLE DATA ───── */
    const currentSelectedData = useMemo(() => {
        if (!selectedTable) return null;
        return tableCardsData.find(t => t.id === selectedTable) || null;
    }, [tableCardsData, selectedTable]);

    const activeOrdersForSelected = currentSelectedData?.orders || [];
    const selectedTotalDeuda = currentSelectedData?.total || 0;

    /* ───── HANDLERS ───── */
    const handleSelectMesa = (tableId) => {
        if ('vibrate' in navigator) navigator.vibrate(30);
        setSelectedTable(prev => prev === tableId ? null : tableId);
    };

    const handlePayTable = () => {
        if (selectedTotalDeuda === 0 && activeOrdersForSelected.length === 0) {
            alert("Esta mesa no tiene consumos registrados para cobrar.");
            return;
        }
        if ('vibrate' in navigator) navigator.vibrate(30);
        playBeepKDS();
        const consolidatedOrder = {
            id: `mesa_${selectedTable}_${Date.now()}`,
            table: selectedTable, mesa: selectedTable, total: selectedTotalDeuda,
            products: activeOrdersForSelected.flatMap(o => o.products || o.items || []),
            items: activeOrdersForSelected.flatMap(o => o.products || o.items || []),
            mozoName: mozo?.name || mozo?.nombre || 'Mozo',
            mozoId: mozo?.id || 'mozo_default',
            _orderIds: activeOrdersForSelected.map(o => o.id).filter(Boolean),
            isConsolidated: true
        };
        setOrderToPay(consolidatedOrder);
        setIsPaymentOpen(true);
    };

    const handleMarcarLimpia = (tableId) => {
        playBeepKDS();
        if (marcarMesaDisponible) marcarMesaDisponible(tableId);
        setSelectedTable(null);
    };

    const handleToggleMesaStatus = () => {
        if (!selectedTable || !currentSelectedData) return;
        if (currentSelectedData.status === 'ocupada' || currentSelectedData.status === 'cuenta') {
            if (window.confirm(`¿Liberar y marcar ${currentSelectedData.title} para limpieza?`)) {
                if (marcarMesaLimpieza) marcarMesaLimpieza(selectedTable);
                else if (marcarMesaDisponible) marcarMesaDisponible(selectedTable);
            }
        } else if (currentSelectedData.status === 'libre') {
            if (marcarMesaOcupada) marcarMesaOcupada(selectedTable);
        } else if (currentSelectedData.status === 'limpieza') {
            if (marcarMesaDisponible) marcarMesaDisponible(selectedTable);
        }
    };

    const openComandero = (tableId) => {
        setSelectedTable(tableId);
        setModalTab('comandar');
        setIsMenuOpen(true);
    };

    const toggleModifier = (mod) => {
        setActiveModifiers(prev => {
            const next = new Set(prev);
            if (next.has(mod)) next.delete(mod);
            else next.add(mod);
            return next;
        });
    };

    /* ───── STATUS HELPERS ───── */
    const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.libre;

    /* ═══════════════════════════════════════════════════════ */
    /*                        RENDER                          */
    /* ═══════════════════════════════════════════════════════ */
    return (
        <div className="flex flex-col w-full text-[#e4e1e9] pb-8" style={{ fontFamily: "'Manrope', sans-serif" }}>

            {/* ── PWA INSTALL BANNER ── */}
            {showPWABanner && (
                <section className="px-3.5 pt-2 pb-1">
                    <div className="bg-gradient-to-r from-[#121722] via-[#1A202E] to-[#121722] border border-[rgba(255,255,255,0.08)] rounded-2xl p-2.5 shadow-sm flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[#FBBF24] text-[20px]">install_mobile</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-extrabold text-[#FBBF24] uppercase tracking-[0.06em]">PWA Modo Mozo Offline Ready</span>
                                <span className="text-[11px] text-[#94A3B8] truncate">Agregá la App al celular para comandar sin latencia</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button className="px-3 py-1.5 rounded-xl bg-[#FBBF24] text-[#0A0A0F] text-[10px] font-extrabold uppercase tracking-[0.06em] active:scale-95 transition-all shadow-sm">INSTALAR</button>
                            <button className="p-1 text-[#64748B] hover:text-white" onClick={() => setShowPWABanner(false)}>
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ── AUTO-SYNC BAR ── */}
            <section className="px-3.5 py-1.5">
                <div className="flex items-center justify-between bg-[#121722] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></div>
                        <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-[0.06em]">Auto-Sync Activo</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-[#64748B] font-normal">Facturación:</span>
                        <span className="font-extrabold text-[#FBBF24]">{facturacion}</span>
                    </div>
                </div>
            </section>

            {/* ── FILTROS DE ESTADO RÁPIDOS ── */}
            <section className="px-3.5 py-1">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                    {[
                        { key: 'todos', label: `TODOS (${statusCounts.todos})`, color: null },
                        { key: 'ocupada', label: `OCUPADAS (${statusCounts.ocupada})`, color: '#f59e0b' },
                        { key: 'cocina', label: `EN COCINA (${statusCounts.cocina})`, color: '#06B6D4' },
                        { key: 'cuenta', label: `PIDE CUENTA (${statusCounts.cuenta})`, color: '#8B5CF6' },
                        { key: 'libre', label: `LIBRES (${statusCounts.libre})`, color: '#10B981' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.06em] whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all ${
                                activeFilter === f.key
                                    ? 'bg-[#FBBF24] text-[#0A0A0F] shadow-sm'
                                    : 'bg-[#1f1f25] hover:bg-[#2a292f] text-[#94A3B8]'
                            } ${f.color ? `border border-[${f.color}]/30` : ''}`}
                        >
                            {f.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }}></span>}
                            {f.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── GRID TITLE ── */}
            <section className="px-3.5 py-1.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#FBBF24] text-[18px]">table_restaurant</span>
                        <h2 className="text-sm font-bold text-white">Distribución Táctica de Mesas</h2>
                    </div>
                    <span className="text-[10px] text-[#64748B] uppercase font-extrabold tracking-[0.06em]">Piso 1 · Salón & Canchas</span>
                </div>

                {/* ── GRID 2 COLUMNAS ── */}
                <div className="grid grid-cols-2 gap-2.5">
                    {displayedTables.map(table => {
                        const sc = getStatusConfig(table.status);
                        const isSelected = selectedTable === table.id;

                        return (
                            <div
                                key={table.id}
                                onClick={() => table.status === 'limpieza' ? null : handleSelectMesa(table.id)}
                                className={`mesa-card cursor-pointer bg-[#121722] border-2 ${sc.borderClass} rounded-2xl p-3 shadow-md flex flex-col justify-between min-h-[145px] relative overflow-hidden active:scale-95 transition-all ${isSelected ? 'ring-2 ring-[#FBBF24]/60' : ''}`}
                            >
                                {/* Ambient glow for occupied */}
                                {(table.status === 'ocupada' || table.status === 'cuenta') && (
                                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: `${sc.color}15` }}></div>
                                )}
                                {/* Top accent bar for pide cuenta */}
                                {table.status === 'cuenta' && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-[#8B5CF6] shadow-[0_0_12px_#8B5CF6]"></div>
                                )}

                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${sc.numBg}`}>
                                            {table.sportIcon
                                                ? <span className="material-symbols-outlined text-[20px]">{table.sportIcon}</span>
                                                : table.displayNum
                                            }
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{table.title}</span>
                                            {table.status === 'libre' && (
                                                <span className="text-[9px] text-[#10B981] font-extrabold uppercase tracking-[0.06em]">DISPONIBLE</span>
                                            )}
                                            {table.status === 'ocupada' && table.minutes > 0 && (
                                                <span className="text-[9px] text-[#FBBF24] font-bold">{table.minutes} min · {table.capacidad} PAX</span>
                                            )}
                                            {table.status === 'cocina' && (
                                                <span className="text-[9px] text-[#64748B]">{table.capacidad} PAX</span>
                                            )}
                                            {table.status === 'cuenta' && (
                                                <span className="text-[9px] text-purple-300 font-extrabold">PIDE CUENTA</span>
                                            )}
                                            {table.status === 'reservada' && (
                                                <span className="text-[9px] text-indigo-300 font-bold">RESERVADA</span>
                                            )}
                                            {table.status === 'limpieza' && (
                                                <span className="text-[9px] text-yellow-400 font-bold">LIMPIEZA</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Status badge or dot */}
                                    {(table.status === 'cocina') && (
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${sc.badgeBg} border border-[${sc.color}]/40 ${sc.badgeText} text-[9px] font-extrabold uppercase tracking-[0.06em] animate-pulse`}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.color }}></span>Cocina
                                        </span>
                                    )}
                                    {(table.status === 'ocupada') && (
                                        <span className={`px-2 py-0.5 rounded-full ${sc.badgeBg} ${sc.badgeText} text-[9px] font-extrabold uppercase`}>Ocupada</span>
                                    )}
                                    {table.status === 'libre' && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
                                    )}
                                    {table.status === 'limpieza' && (
                                        <span className="material-symbols-outlined text-yellow-400 text-[18px] animate-bounce">cleaning_services</span>
                                    )}
                                    {table.status === 'cuenta' && (
                                        <span className="material-symbols-outlined text-[#8B5CF6] text-[20px] animate-bounce">receipt_long</span>
                                    )}
                                    {table.status === 'reservada' && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-[#4F46E5]/30 text-indigo-200 text-[9px] font-extrabold">21:30 HS</span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="mt-auto pt-2 flex flex-col">
                                    {/* Cocina: marchando timer */}
                                    {table.status === 'cocina' && (
                                        <div className="flex items-center gap-1 text-[11px] text-[#06B6D4] font-semibold">
                                            <span className="material-symbols-outlined text-[13px] animate-spin">soup_kitchen</span>
                                            <span>Marchando: {table.minutes || '?'} min</span>
                                        </div>
                                    )}
                                    {/* Summary text */}
                                    {table.summaryText && (table.status === 'ocupada' || table.status === 'cocina' || table.status === 'cuenta') && (
                                        <span className="text-[11px] text-[#94A3B8] truncate">{table.summaryText}</span>
                                    )}
                                    {table.status === 'reservada' && (
                                        <>
                                            <span className="text-[11px] text-[#94A3B8] truncate">{table.summaryText}</span>
                                            <div className="flex items-center justify-between mt-1 text-[11px] text-[#64748B]">
                                                <span>{table.capacidad} Comensales</span>
                                                <span className="material-symbols-outlined text-[16px] text-indigo-300">event_seat</span>
                                            </div>
                                        </>
                                    )}
                                    {/* Price row */}
                                    {(table.status === 'ocupada' || table.status === 'cocina') && (
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm font-extrabold text-[#FBBF24]">${table.total.toLocaleString('es-AR')}</span>
                                            {table.status === 'ocupada' && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/30 font-extrabold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>En vivo
                                                </span>
                                            )}
                                            {table.status === 'cocina' && (
                                                <span className="text-[9px] text-[#94A3B8] bg-[#1f1f25] px-1.5 py-0.5 rounded font-extrabold">{table.productsCount} platos</span>
                                            )}
                                        </div>
                                    )}
                                    {/* Cuenta: cobrar action */}
                                    {table.status === 'cuenta' && (
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm font-extrabold text-[#8B5CF6]">${table.total.toLocaleString('es-AR')}</span>
                                            <button
                                                className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] text-white text-[10px] font-extrabold active:scale-95 transition-all uppercase tracking-[0.06em]"
                                                onClick={(e) => { e.stopPropagation(); setSelectedTable(table.id); setTimeout(handlePayTable, 50); }}
                                            >
                                                COBRAR
                                            </button>
                                        </div>
                                    )}
                                    {/* Libre: Abrir button */}
                                    {table.status === 'libre' && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-[#64748B]">Cap. {table.capacidad} pers.</span>
                                            <button
                                                className="px-2.5 py-1 rounded-xl bg-[#10B981] text-[#0A0A0F] text-[10px] font-extrabold flex items-center gap-0.5 shadow-sm active:scale-95 transition-all"
                                                onClick={(e) => { e.stopPropagation(); openComandero(table.id); }}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">add</span> Abrir
                                            </button>
                                        </div>
                                    )}
                                    {/* Limpieza: Marcar limpia */}
                                    {table.status === 'limpieza' && (
                                        <>
                                            <span className="text-[11px] text-[#94A3B8]">Desocupada recientemente</span>
                                            <button
                                                className="mt-2 w-full py-1.5 rounded-xl bg-[#EAB308] text-[#0A0A0F] text-[10px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all"
                                                onClick={(e) => { e.stopPropagation(); handleMarcarLimpia(table.id); }}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">check</span> Marcar Limpia
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── LEYENDA SEMÁFORO ── */}
            <section className="px-3.5 py-2">
                <div className="bg-[#121722] border border-[rgba(255,255,255,0.08)] rounded-2xl p-2.5 flex items-center justify-around flex-wrap gap-2 text-center">
                    {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sc.color, boxShadow: `0 0 6px ${sc.color}` }}></span>
                            <span className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-[0.06em]">{key === 'cuenta' ? 'Pide Cuenta' : sc.label.charAt(0) + sc.label.slice(1).toLowerCase()}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODAL / DRAWER: COMANDERO TÁCTIL & KDS TRACKER       */}
            {/* ══════════════════════════════════════════════════════ */}
            {isMenuOpen && currentSelectedData && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end transition-all duration-300">
                    <div className="bg-[#1A202E] border-t-2 border-[rgba(255,255,255,0.08)] rounded-t-3xl max-h-[92vh] flex flex-col w-full max-w-lg mx-auto shadow-[0_-16px_48px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="px-4 pt-3 pb-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[#121722] shrink-0">
                            <div className="w-12 h-1 bg-[#35343a] rounded-full mx-auto mb-2"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl font-extrabold flex items-center justify-center ${getStatusConfig(currentSelectedData.status).numBg}`}>
                                        {currentSelectedData.displayNum}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-base font-extrabold text-white truncate">{currentSelectedData.title} · {currentSelectedData.salonName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full ${getStatusConfig(currentSelectedData.status).badgeBg} ${getStatusConfig(currentSelectedData.status).badgeText} text-[9px] font-extrabold uppercase`}>
                                                {getStatusConfig(currentSelectedData.status).label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                                            <span>Mozo: <strong className="text-white">{mozo?.name || mozo?.nombre || 'Mozo'}</strong></span>
                                            <span>·</span>
                                            <span>{currentSelectedData.capacidad} Comensales</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-9 h-9 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] flex items-center justify-center text-[#64748B] hover:text-white" onClick={() => setIsMenuOpen(false)}>
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                            {/* Tabs */}
                            <div className="grid grid-cols-2 gap-1.5 mt-3 bg-[#0A0A0F]/80 p-1 rounded-xl">
                                <button
                                    className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 ${modalTab === 'comandar' ? 'bg-[#FBBF24] text-[#0A0A0F]' : 'text-[#94A3B8] hover:text-white'}`}
                                    onClick={() => setModalTab('comandar')}
                                >
                                    <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                                    COMANDAR
                                </button>
                                <button
                                    className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 ${modalTab === 'kds' ? 'bg-[#FBBF24] text-[#0A0A0F]' : 'text-[#94A3B8] hover:text-white'}`}
                                    onClick={() => setModalTab('kds')}
                                >
                                    <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                                    SEGUIMIENTO KDS
                                </button>
                            </div>
                        </div>

                        {/* ── TAB 1: COMANDAR ── */}
                        {modalTab === 'comandar' && (
                            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
                                {/* Categories */}
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                    {dynamicCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap uppercase tracking-[0.06em] active:scale-95 transition-all ${
                                                category === cat.id ? 'bg-[#FBBF24] text-[#0A0A0F]' : 'bg-[#1f1f25] text-[#94A3B8]'
                                            }`}
                                        >
                                            {cat.label} ({cat.count})
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[16px]">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#1f1f25] border border-[rgba(255,255,255,0.08)] rounded-xl py-2 pl-9 pr-8 text-xs font-bold text-white focus:outline-none focus:border-[#FBBF24] placeholder-[#64748B]"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B]">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    )}
                                </div>

                                {/* Products List */}
                                <div className="space-y-2">
                                    {filteredProducts.map(prod => {
                                        const inCartItem = cart.find(c => String(c.id) === String(prod.id));
                                        const qty = inCartItem?.quantity || 0;
                                        const isOutOfStock = prod.stock !== null && prod.stock !== undefined && prod.stock <= 0;
                                        const isLowStock = prod.stock !== null && prod.stock !== undefined && prod.stock > 0 && prod.stock <= 5;

                                        return (
                                            <div key={prod.id} className={`bg-[#121722] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 flex items-center justify-between gap-2.5 ${isOutOfStock ? 'opacity-60' : ''}`}>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-xs font-bold ${isOutOfStock ? 'text-[#64748B]' : 'text-white'}`}>{prod.nombre}</span>
                                                        {prod.stock !== null && prod.stock !== undefined && (
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                                                                isOutOfStock ? 'bg-red-500/20 text-red-400' :
                                                                isLowStock ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-[#10B981]/20 text-[#10B981]'
                                                            }`}>
                                                                {isOutOfStock ? 'AGOTADO' : `Stock: ${prod.stock} u.`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {prod.descripcion && <span className="text-[11px] text-[#94A3B8] truncate">{prod.descripcion}</span>}
                                                    <span className={`text-xs font-bold mt-0.5 ${isOutOfStock ? 'text-[#64748B]' : 'text-[#FBBF24]'}`}>${prod.precio.toLocaleString('es-AR')}</span>
                                                </div>
                                                {isOutOfStock ? (
                                                    <div className="px-3 py-1.5 rounded-xl bg-[#1f1f25] text-[#64748B] text-[9px] font-bold uppercase tracking-[0.06em]">SIN STOCK</div>
                                                ) : (
                                                    <div className="flex items-center gap-2 shrink-0 bg-[#0A0A0F] px-2 py-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
                                                        <button className="w-8 h-8 rounded-lg bg-[#1f1f25] hover:bg-[#2a292f] text-white flex items-center justify-center font-bold text-lg active:scale-90 transition-all" onClick={() => decrementCart(prod.id)}>-</button>
                                                        <span className="w-6 text-center text-sm font-extrabold text-[#FBBF24]">{qty}</span>
                                                        <button className="w-8 h-8 rounded-lg bg-[#FBBF24] text-[#0A0A0F] flex items-center justify-center font-bold text-lg active:scale-90 transition-all" onClick={() => addToCart(prod)}>+</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Kitchen Modifiers */}
                                <div className="bg-[#121722] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-[#94A3B8] uppercase font-extrabold tracking-[0.06em]">MODIFICADORES RÁPIDOS DE COCINA</span>
                                        <span className="text-[10px] text-[#FBBF24]">Toque para tildar</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_NOTES.map(mod => (
                                            <button
                                                key={mod}
                                                onClick={() => toggleModifier(mod)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition-all uppercase tracking-[0.06em] ${
                                                    activeModifiers.has(mod) ? 'bg-[#FBBF24] text-[#0A0A0F]' : 'bg-[#1f1f25] text-[#94A3B8]'
                                                }`}
                                            >
                                                {mod}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 2: KDS TRACKING ── */}
                        {modalTab === 'kds' && (
                            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
                                <div className="bg-[#121722] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[#06B6D4] text-[20px]">monitor_heart</span>
                                            <span className="text-xs font-bold text-white">Estado Comanda Cocina & Barra</span>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="relative pt-2 pb-1">
                                        <div className="h-2 w-full bg-[#1f1f25] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#FBBF24] w-2/3 transition-all duration-500"></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-center mt-2.5 text-[10px]">
                                            <div className="flex flex-col items-center">
                                                <span className="w-4 h-4 rounded-full bg-[#10B981] text-[#0A0A0F] flex items-center justify-center font-bold text-[9px]">✓</span>
                                                <span className="font-bold text-[#10B981] mt-1">Recibido</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="w-4 h-4 rounded-full bg-[#06B6D4] text-[#0A0A0F] flex items-center justify-center font-bold text-[9px] animate-pulse">2</span>
                                                <span className="font-bold text-[#06B6D4] mt-1">En Horno / Bar</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="w-4 h-4 rounded-full bg-[#1f1f25] text-[#64748B] flex items-center justify-center font-bold text-[9px]">3</span>
                                                <span className="font-bold text-[#64748B] mt-1">¡Listo Retirar!</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Items in process */}
                                    <div className="border-t border-[rgba(255,255,255,0.08)] pt-2.5 space-y-2">
                                        <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-[0.06em]">DETALLE EN PANTALLA BARRA/COCINA</span>
                                        {activeOrdersForSelected.length > 0 ? (
                                            activeOrdersForSelected.flatMap(o => o.productos || o.items || o.products || []).map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs">
                                                    <span className="text-white">{item.cantidad || 1}x {item.nombre || item.name}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                                        (item.estado === 'listo' || item.estado === 'entregado') ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#06B6D4]/20 text-[#06B6D4] animate-pulse'
                                                    }`}>
                                                        {item.estado === 'listo' ? '¡LISTO!' : 'EN PREPARACIÓN'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-[#64748B]">Sin items en proceso para esta mesa.</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="w-full py-2.5 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] border border-[rgba(255,255,255,0.08)] text-[#FBBF24] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-[0.06em]"
                                    onClick={() => playBeepKDS()}
                                >
                                    <span className="material-symbols-outlined text-[18px]">ring_volume</span>
                                    SIMULAR ALERTA DE BARRA LISTA
                                </button>
                            </div>
                        )}

                        {/* Footer: Subtotal & Send */}
                        <div className="p-3.5 border-t border-[rgba(255,255,255,0.08)] bg-[#121722] shrink-0 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-[#64748B] uppercase font-extrabold tracking-[0.06em]">NUEVO CONSUMO A ENVIAR</span>
                                    <span className="text-[11px] text-[#94A3B8]">{cartItemCount} items seleccionados</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-[#64748B] uppercase font-extrabold tracking-[0.06em]">SUBTOTAL ACTUAL</span>
                                    <span className="text-lg font-extrabold text-[#FBBF24]">${cartTotal.toLocaleString('es-AR')}</span>
                                </div>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0}
                                className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-[#f59e0b] via-[#FBBF24] to-[#f59e0b] text-[#0A0A0F] text-xs font-extrabold uppercase tracking-[0.1em] flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(245,158,11,0.4)] active:scale-95 transition-all disabled:opacity-40"
                            >
                                <span className="material-symbols-outlined text-[22px]">send</span>
                                ENVIAR COMANDA A COCINA & BARRA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FEEDBACK OVERLAY ── */}
            {showFeedback && (
                <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-[#1A202E] border-2 border-[#10B981] rounded-3xl p-6 text-center max-w-xs w-full shadow-[0_0_40px_rgba(16,185,129,0.5)] flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-3xl font-extrabold ring-4 ring-[#10B981]/30 animate-pulse-fast">
                            <span className="material-symbols-outlined text-[38px]">check_circle</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-base font-extrabold text-white">¡Comanda Disparada!</h4>
                            <p className="text-xs text-[#10B981] font-semibold">Sincronizada con KDS Cocina & Barra</p>
                            <p className="text-[9px] text-[#64748B] mt-1">Timestamp: {feedbackTime} · WebSocket /{negocioId}/pantalla/bar</p>
                        </div>
                        <div className="w-full bg-[#1f1f25] rounded-xl p-2 text-[11px] text-[#94A3B8]">
                            Comanda táctil enviada exitosamente al sistema.
                        </div>
                        <button
                            className="w-full py-2.5 rounded-xl bg-[#10B981] text-[#0A0A0F] text-xs font-extrabold active:scale-95 transition-all uppercase tracking-[0.06em]"
                            onClick={() => setShowFeedback(false)}
                        >
                            VOLVER A LAS MESAS
                        </button>
                    </div>
                </div>
            )}

            {/* ── PAYMENT MODAL ── */}
            {isPaymentOpen && orderToPay && (
                <PaymentModal
                    order={orderToPay}
                    onClose={() => { setIsPaymentOpen(false); setOrderToPay(null); }}
                    negocioId={negocioId}
                />
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
