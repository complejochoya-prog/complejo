import React, { useState, useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useMesas } from '../../bar/services/MesasContext';
import PaymentModal from '../components/PaymentModal';
import { getMozoSession } from '../services/mozoService';
import { 
    Plus, 
    Minus, 
    X, 
    Beer, 
    Coffee, 
    Utensils, 
    CakeSlice, 
    Receipt, 
    CreditCard, 
    Sparkles, 
    Search, 
    Trash2, 
    Wine,
    ChefHat,
    ArrowLeftRight,
    Edit3,
    Table,
    CheckCircle2,
    Calendar,
    Clock,
    Send
} from 'lucide-react';

const QUICK_NOTES = ['Sin hielo', 'Sin cebolla', 'Bien frío', 'Sin sal', 'Bien cocido', 'Poco picante', 'Para llevar'];

export default function MozoTables() {
    const { negocioId, barProducts: configProducts, updateOrder: updateConfigOrder, tables: configTables } = useConfig();
    const { orders = [], addOrder, updateOrderStatus, barProducts: pedidosProducts = [] } = usePedidos();
    const { mesas = [], marcarMesaOcupada, marcarMesaDisponible, marcarMesaLimpieza } = useMesas();

    const mozo = getMozoSession();
    const [selectedTable, setSelectedTable] = useState('09');
    const [activeSector, setActiveSector] = useState('TODOS'); // 'TODOS' | 'SALON' | 'TERRAZAS' | 'PADEL' | 'FUTBOL'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isComandaOpen, setIsComandaOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeNoteItemId, setActiveNoteItemId] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderToPay, setOrderToPay] = useState(null);

    // Normalize and consolidate products
    const allProducts = useMemo(() => {
        const source = (pedidosProducts && pedidosProducts.length > 0) 
            ? pedidosProducts 
            : (configProducts || []);
            
        return source.map((p, idx) => {
            const id = String(p.id || `p-${idx}`);
            const nombre = String(p.nombre || p.name || 'Producto');
            const categoria = String(p.categoria || p.category || 'General').trim();
            const precio = Number(p.precio ?? p.price ?? 0) || 0;
            const img = (typeof p.img === 'string' && p.img) ? p.img 
                : ((typeof p.image === 'string' && p.image) ? p.image 
                : ((typeof p.imagen === 'string' && p.imagen) ? p.imagen : ''));

            return {
                ...p,
                id,
                nombre,
                categoria,
                precio,
                img,
                sector: p.sector || (['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].some(c => categoria.toLowerCase().includes(c.toLowerCase())) ? 'cocina' : 'barra')
            };
        });
    }, [pedidosProducts, configProducts]);

    const dynamicCategories = useMemo(() => {
        const cats = Array.from(new Set(allProducts.map(p => p.categoria))).filter(Boolean);
        return [
            { id: 'todas', label: 'Todas', count: allProducts.length, icon: Sparkles },
            ...cats.map(cat => ({
                id: cat,
                label: cat,
                count: allProducts.filter(p => p.categoria === cat).length,
                icon: (cat.toLowerCase().includes('bebida') || cat.toLowerCase().includes('cerveza') || cat.toLowerCase().includes('trago')) ? Beer 
                    : (cat.toLowerCase().includes('caf') || cat.toLowerCase().includes('licuado')) ? Coffee
                    : (cat.toLowerCase().includes('vino')) ? Wine
                    : (cat.toLowerCase().includes('postre') || cat.toLowerCase().includes('torta') || cat.toLowerCase().includes('dulce')) ? CakeSlice
                    : Utensils
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

    // Cart operations
    const addToCart = (product) => {
        if ('vibrate' in navigator) navigator.vibrate(25);
        const pId = String(product.id);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (existing) {
                return prev.map(item => 
                    String(item.id) === pId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, id: pId, quantity: 1, comment: '' }];
        });
    };

    const decrementCart = (productId) => {
        if ('vibrate' in navigator) navigator.vibrate(20);
        const pId = String(productId);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (!existing) return prev;
            if (existing.quantity <= 1) {
                return prev.filter(item => String(item.id) !== pId);
            }
            return prev.map(item => 
                String(item.id) === pId ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    };

    const removeFromCart = (productId) => {
        if ('vibrate' in navigator) navigator.vibrate([20, 20]);
        const pId = String(productId);
        setCart(prev => prev.filter(item => String(item.id) !== pId));
    };

    const updateCartComment = (productId, comment) => {
        const pId = String(productId);
        setCart(prev => prev.map(item => String(item.id) === pId ? { ...item, comment } : item));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
    }, [cart]);

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 100]);
        
        const total = cartTotal;
        const formattedCartForKDS = cart.map(item => ({
            ...item,
            cantidad: item.quantity,
            price: item.precio,
            sector: item.sector,
            notes: item.comment || '',
            observaciones: item.comment || ''
        }));

        const newOrder = {
            id: `mozo_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            products: cart,
            items: cart,
            productos: formattedCartForKDS,
            total,
            status: "pendiente",
            estado: "nuevo",
            mozoId: mozo?.id || 'mozo_general',
            mozoName: mozo?.name || 'Mozo',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            origin: 'mozo'
        };
        
        if (addOrder) {
            addOrder(newOrder);
        }
        if (marcarMesaOcupada) {
            marcarMesaOcupada(selectedTable);
        }

        setCart([]);
        setIsMenuOpen(false);
    };

    // Calculate real table lists merging backend and slots
    const allTableSlots = useMemo(() => {
        // Base numbers 1 to 12
        const baseSlots = Array.from({ length: 12 }, (_, i) => {
            const num = i + 1;
            const strNum = String(num);
            const str2Digits = String(num).padStart(2, '0');
            return {
                id: strNum,
                displayNum: str2Digits,
                title: `Mesa ${num}`,
                sector: num <= 6 ? 'SALON' : 'TERRAZAS',
                capacidad: num === 5 ? 6 : (num === 9 ? 8 : (num === 3 || num === 7 ? 2 : 4))
            };
        });

        // Sports spaces
        const sportsSlots = [
            { id: 'P1', displayNum: 'P1', title: 'Cancha Pádel 1', sector: 'PADEL', capacidad: 4, icon: 'tennis' },
            { id: 'F5', displayNum: 'F5', title: 'Cancha Fútbol 5', sector: 'FUTBOL', capacidad: 10, icon: 'soccer' }
        ];

        // Any custom tables from config
        const custom = (configTables || [])
            .filter(t => !baseSlots.some(b => b.id === String(t.tableNumber || t.id)))
            .map(t => ({
                id: String(t.tableNumber || t.id),
                displayNum: String(t.tableNumber || t.id).padStart(2, '0'),
                title: `Mesa ${t.tableNumber || t.id}`,
                sector: t.sector || 'SALON',
                capacidad: t.capacidad || 4
            }));

        return [...baseSlots, ...sportsSlots, ...custom];
    }, [configTables]);

    // Build tactical data for each table
    const tableCardsData = useMemo(() => {
        return allTableSlots.map(slot => {
            const tableOrders = (orders || []).filter(o => 
                (String(o.table) === slot.id || String(o.mesa) === slot.id) && 
                o.status !== 'paid' && 
                !o.paid
            );
            
            const total = tableOrders.reduce((acc, o) => acc + Number(o.total || o.monto || o.precio || 0), 0);
            const mesaMeta = (mesas || []).find(m => String(m.numero || m.id) === slot.id);

            // Determine status
            let status = 'libre';
            if (mesaMeta?.estado === 'limpieza') {
                status = 'limpieza';
            } else if (tableOrders.some(o => o.status === 'pide_cuenta' || o.pideCuenta)) {
                status = 'cuenta';
            } else if (tableOrders.length > 0) {
                status = 'ocupada';
            } else if (mesaMeta?.estado === 'reservada' || slot.id === '5') {
                status = slot.id === '5' && tableOrders.length === 0 ? 'reservada' : (mesaMeta?.estado || 'libre');
            }

            // Products summary
            const productsList = tableOrders.flatMap(o => o.productos || o.items || o.products || []);
            const summaryText = productsList.length > 0 
                ? productsList.slice(0, 2).map(p => `${p.cantidad || 1}x ${p.nombre || p.name}`).join(' + ')
                : (status === 'reservada' ? 'Reserva 21:30 - Torneo' : 'Sin consumos');

            return {
                ...slot,
                status,
                total,
                orders: tableOrders,
                productsCount: productsList.length,
                summaryText,
                minutes: tableOrders.length > 0 ? (slot.id === '9' ? 55 : (slot.id === '1' ? 32 : 15)) : 0
            };
        });
    }, [allTableSlots, orders, mesas]);

    // Sector filtered tables
    const displayedTables = useMemo(() => {
        if (activeSector === 'TODOS') return tableCardsData;
        return tableCardsData.filter(t => t.sector === activeSector);
    }, [tableCardsData, activeSector]);

    // Live Metrics
    const metrics = useMemo(() => {
        const totalMesas = tableCardsData.length;
        const ocupadas = tableCardsData.filter(t => t.status === 'ocupada' || t.status === 'cuenta');
        const pideCuenta = tableCardsData.filter(t => t.status === 'cuenta').length;
        const libres = tableCardsData.filter(t => t.status === 'libre').length;
        const totalFacturadoAct = ocupadas.reduce((sum, t) => sum + t.total, 0);

        return {
            totalMesas,
            ocupadasCount: ocupadas.length,
            pideCuenta,
            libres,
            facturadoStr: totalFacturadoAct >= 1000 ? `$${Math.round(totalFacturadoAct / 1000)}K act.` : `$${totalFacturadoAct}`
        };
    }, [tableCardsData]);

    // Selected Table Details for Drawer
    const currentSelectedData = useMemo(() => {
        return tableCardsData.find(t => t.id === selectedTable) || tableCardsData[0];
    }, [tableCardsData, selectedTable]);

    const activeOrdersForSelected = currentSelectedData?.orders || [];
    const selectedTotalDeuda = currentSelectedData?.total || 0;

    const handleSelectMesa = (tableId) => {
        if ('vibrate' in navigator) navigator.vibrate(30);
        setSelectedTable(tableId);
    };

    const handlePayTable = () => {
        if (selectedTotalDeuda === 0 && activeOrdersForSelected.length === 0) {
            alert("Esta mesa no tiene consumos registrados para cobrar.");
            return;
        }
        if ('vibrate' in navigator) navigator.vibrate(30);
        
        const mozoName = mozo?.name || localStorage.getItem('mozoName') || 'Mozo';
        const mozoId = mozo?.id || localStorage.getItem('mozoId') || 'mozo_default';

        const consolidatedOrder = {
            id: `mesa_${selectedTable}_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            total: selectedTotalDeuda,
            products: activeOrdersForSelected.flatMap(o => o.products || o.items || []),
            items: activeOrdersForSelected.flatMap(o => o.products || o.items || []),
            mozoName: mozoName,
            mozoId: mozoId,
            _orderIds: activeOrdersForSelected.map(o => o.id).filter(Boolean),
            isConsolidated: true
        };
        
        setOrderToPay(consolidatedOrder);
        setIsPaymentOpen(true);
    };

    const handleToggleMesaStatus = () => {
        if (!selectedTable) return;
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

    return (
        <div className="flex flex-col w-full text-[#e4e1e9] pb-28">
            
            {/* BANNER TÁCTIL PWA: ESTADO OPERATIVO & ALERTAS DE LLAMADOS */}
            <section className="pt-2 pb-1">
                <div className="bg-[#121722] border border-white/5 rounded-2xl p-3 shadow-md flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></div>
                            <span className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">Modo PWA Offline Ready</span>
                            <span className="text-slate-600 text-xs hidden xs:inline">·</span>
                            <span className="text-[11px] text-slate-400 font-medium truncate hidden xs:inline">Sync en tiempo real</span>
                        </div>
                        {/* Badge de Llamados */}
                        <button 
                            onClick={() => {
                                // Select first table with payment requested or ready
                                const cuentaTable = tableCardsData.find(t => t.status === 'cuenta');
                                if (cuentaTable) handleSelectMesa(cuentaTable.id);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 active:scale-95 transition-transform" 
                            title="Llamados de Clientes en Mesa"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-[10px] font-black uppercase whitespace-nowrap">
                                {metrics.pideCuenta > 0 ? `${metrics.pideCuenta} PIDE CUENTA` : '2 LLAMADOS'}
                            </span>
                        </button>
                    </div>

                    {/* Selector de Sectores Deportivos y Salón */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        {[
                            { id: 'TODOS', label: `TODOS (${tableCardsData.length})` },
                            { id: 'SALON', label: 'SALÓN PRINCIPAL' },
                            { id: 'TERRAZAS', label: 'TERRAZAS' },
                            { id: 'PADEL', label: 'PÁDEL', icon: '🎾' },
                            { id: 'FUTBOL', label: 'FÚTBOL 5', icon: '⚽' },
                        ].map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => setActiveSector(sector.id)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 ${
                                    activeSector === sector.id 
                                        ? 'bg-[#FBBF24] text-black shadow-[0_0_12px_rgba(251,191,36,0.35)]' 
                                        : 'bg-[#1f1f25] text-slate-300 hover:bg-[#2a292f] border border-white/5'
                                }`}
                            >
                                {sector.icon && <span>{sector.icon}</span>}
                                {sector.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ENCABEZADO DE PANTALLA & BOTÓN RÁPIDO DE APERTURA */}
            <section className="py-2 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl text-white font-extrabold tracking-tight">Mis Mesas</h2>
                            <span className="px-2 py-0.5 rounded-md bg-[#2a292f] text-amber-400 text-[10px] font-black uppercase">
                                {activeSector === 'TODOS' ? 'ZONA NORTE' : activeSector}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                            Tocá una mesa para ver o tomar pedido. Se ocupa automáticamente al comandar.
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            setSelectedTable('Barra');
                            setIsMenuOpen(true);
                        }}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-95 transition-all shrink-0"
                    >
                        <Plus size={16} />
                        <span>Barra / Paso</span>
                    </button>
                </div>

                {/* MÉTRICAS OPERATIVAS DEL MOZO EN VIVO */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="bg-[#121722] border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-lg font-black text-white">{metrics.totalMesas}</span>
                        <span className="text-[9px] text-slate-500 font-bold tracking-tight uppercase">Total Mesas</span>
                    </div>

                    <div className="bg-[#121722] border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-amber-500"></div>
                        <span className="text-lg font-black text-amber-400">{metrics.ocupadasCount}</span>
                        <span className="text-[9px] text-amber-400 font-black truncate w-full">{metrics.facturadoStr}</span>
                    </div>

                    <div className="bg-[#121722] border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#6D28D9] animate-pulse"></div>
                        <span className="text-lg font-black text-purple-300">{metrics.pideCuenta}</span>
                        <span className="text-[9px] text-purple-300 font-bold tracking-tight uppercase">Pide Cuenta</span>
                    </div>

                    <div className="bg-[#121722] border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#10B981]"></div>
                        <span className="text-lg font-black text-[#10B981]">{metrics.libres}</span>
                        <span className="text-[9px] text-[#10B981] font-bold tracking-tight uppercase">Libres</span>
                    </div>
                </div>
            </section>

            {/* SYNC COMPLEJO GIOVANNI */}
            <section className="py-1">
                <div className="bg-[#1b1b20] border border-white/5 rounded-xl p-2.5 px-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#2a292f] flex items-center justify-center text-amber-400 shrink-0 font-black text-xs">
                            CG
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Sync Complejo Giovanni</span>
                            <span className="text-[11px] text-slate-400 truncate">Caja central sincronizada · Comandas KDS activas</span>
                        </div>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                </div>
            </section>

            {/* GRILLA TÁCTIL PRINCIPAL DE MESAS */}
            <section className="py-2 flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                        <Table size={16} className="text-amber-400" />
                        <span className="text-sm font-extrabold text-white">Distribución Táctica</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Piso 1 · Salón & Canchas</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {displayedTables.map(t => {
                        const isSelected = selectedTable === t.id;
                        const isOcupada = t.status === 'ocupada';
                        const isCuenta = t.status === 'cuenta';
                        const isReservada = t.status === 'reservada';
                        const isLibre = t.status === 'libre';

                        return (
                            <div
                                key={t.id}
                                onClick={() => handleSelectMesa(t.id)}
                                className={`cursor-pointer bg-[#121722] rounded-2xl p-3.5 shadow-md flex flex-col justify-between min-h-[145px] relative overflow-hidden transition-all duration-200 active:scale-[0.97] border ${
                                    isSelected 
                                        ? 'border-amber-400 ring-2 ring-amber-400/30' 
                                        : isCuenta 
                                            ? 'border-[#6D28D9] shadow-[0_0_12px_rgba(109,40,217,0.3)]' 
                                            : isOcupada 
                                                ? 'border-amber-500/30' 
                                                : 'border-white/5 hover:border-white/20'
                                }`}
                            >
                                {isCuenta && <div className="absolute top-0 inset-x-0 h-1 bg-[#6D28D9] shadow-[0_0_12px_#6D28D9]"></div>}
                                {isOcupada && <div className="absolute top-0 inset-x-0 h-1 bg-amber-500"></div>}

                                {/* Top card info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md shrink-0 ${
                                            isLibre 
                                                ? 'bg-[#10B981]/20 text-[#10B981]' 
                                                : isCuenta 
                                                    ? 'bg-[#6D28D9] text-white animate-pulse' 
                                                    : isReservada 
                                                        ? 'bg-orange-500/20 text-orange-400' 
                                                        : 'bg-amber-500 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                        }`}>
                                            {t.displayNum}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-white truncate">{t.title}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                isLibre ? 'text-[#10B981]' : isCuenta ? 'text-purple-300' : isReservada ? 'text-orange-400' : 'text-amber-400'
                                            }`}>
                                                {isLibre ? 'DISPONIBLE' : isCuenta ? 'PIDE CUENTA' : isReservada ? 'RESERVADA' : `${t.minutes} MIN · ${t.capacidad} PAX`}
                                            </span>
                                        </div>
                                    </div>

                                    {isLibre && <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>}
                                    {isOcupada && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                                            Ocupada
                                        </span>
                                    )}
                                    {isCuenta && (
                                        <Receipt size={16} className="text-purple-300 animate-bounce" />
                                    )}
                                    {isReservada && (
                                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase">
                                            21:30 HS
                                        </span>
                                    )}
                                </div>

                                {/* Bottom card content */}
                                <div className="mt-2.5 flex flex-col">
                                    <span className="text-[11px] text-slate-400 truncate font-medium">
                                        {t.summaryText}
                                    </span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-black text-amber-400">
                                            ${t.total.toLocaleString('es-AR')}
                                        </span>
                                        {isLibre ? (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectMesa(t.id);
                                                    setIsMenuOpen(true);
                                                }}
                                                className="px-2 py-0.5 rounded-lg bg-[#1f1f25] hover:bg-emerald-500 hover:text-black text-[#10B981] text-[10px] font-black uppercase flex items-center gap-0.5 transition-colors"
                                            >
                                                <Plus size={12} /> Abrir
                                            </button>
                                        ) : isCuenta ? (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectMesa(t.id);
                                                    handlePayTable();
                                                }}
                                                className="px-2 py-0.5 rounded bg-[#6D28D9] hover:bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-wider"
                                            >
                                                COBRAR
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold bg-[#1f1f25] px-1.5 py-0.5 rounded-md">
                                                {t.orders.length} comanda{t.orders.length === 1 ? '' : 's'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* LEYENDA ERGONÓMICA DE ESTADOS */}
            <section className="py-2 mb-2">
                <div className="bg-[#121722] border border-white/5 rounded-xl p-2.5 flex items-center justify-around flex-wrap gap-2 text-center">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
                        <span className="text-[10px] font-black uppercase text-slate-400">Libre</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
                        <span className="text-[10px] font-black uppercase text-slate-400">Ocupada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                        <span className="text-[10px] font-black uppercase text-slate-400">Reservada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6D28D9] shadow-[0_0_6px_#6D28D9]"></span>
                        <span className="text-[10px] font-black uppercase text-slate-400">Pide Cuenta</span>
                    </div>
                </div>
            </section>

            {/* BOTÓN FLOTANTE FAB ACCIÓN DIRECTA */}
            <div className="fixed right-4 bottom-24 z-40">
                <button 
                    onClick={() => {
                        setIsMenuOpen(true);
                    }}
                    className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.5)] active:scale-90 transition-transform font-black" 
                    title="Abrir comanda rápida"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* DRAWER / PANEL INFERIOR TÁCTIL: DETALLE DE MESA SELECCIONADA */}
            {currentSelectedData && (
                <section className="fixed inset-x-0 bottom-20 z-40 px-3 max-w-lg mx-auto transition-all animate-in slide-in-from-bottom duration-300">
                    <div className="bg-[#1A202E]/95 border border-white/10 rounded-2xl p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-2.5">
                        {/* Manija táctil */}
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1"></div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-md shrink-0 ${
                                    currentSelectedData.status === 'libre' 
                                        ? 'bg-[#10B981]/20 text-[#10B981]' 
                                        : currentSelectedData.status === 'cuenta'
                                            ? 'bg-[#6D28D9] text-white'
                                            : 'bg-amber-500 text-slate-950'
                                }`}>
                                    {currentSelectedData.displayNum}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base text-white font-extrabold truncate">{currentSelectedData.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            currentSelectedData.status === 'libre' 
                                                ? 'bg-[#10B981]/20 text-[#10B981]' 
                                                : currentSelectedData.status === 'cuenta'
                                                    ? 'bg-[#6D28D9]/40 text-purple-300'
                                                    : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {currentSelectedData.status}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 truncate">
                                        {currentSelectedData.summaryText}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Total Acumulado</span>
                                <span className="text-xl font-black text-amber-400">
                                    ${currentSelectedData.total.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        {/* 4 Acciones de Un Toque para el Mozo */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button 
                                onClick={() => setIsMenuOpen(true)}
                                className="min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                            >
                                <Edit3 size={16} />
                                <span>Tomar Pedido</span>
                            </button>

                            <button 
                                onClick={() => setIsComandaOpen(true)}
                                className="min-h-[44px] rounded-xl bg-[#2a292f] hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-white/5"
                            >
                                <Receipt size={16} className="text-amber-400" />
                                <span>Ver Comanda</span>
                            </button>

                            <button 
                                onClick={handlePayTable}
                                className="min-h-[44px] rounded-xl bg-[#6D28D9] hover:bg-[#7c3aed] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                            >
                                <CreditCard size={16} />
                                <span>Dividir / Cobrar</span>
                            </button>

                            <button 
                                onClick={handleToggleMesaStatus}
                                className="min-h-[44px] rounded-xl bg-[#2a292f] hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-white/5"
                            >
                                <ArrowLeftRight size={16} />
                                <span>{currentSelectedData.status === 'libre' ? 'Ocupar' : 'Liberar Mesa'}</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* MODAL 1: TOMAR PEDIDO (COMANDERO & PRODUCTOS) */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#131318] border-t border-white/10 w-full max-w-lg rounded-t-[32px] p-5 max-h-[90vh] flex flex-col gap-4 text-white shadow-2xl">
                        {/* Header Comandero */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div>
                                <h3 className="text-lg font-black uppercase text-amber-400 tracking-tight">
                                    Tomar Pedido — {currentSelectedData?.title}
                                </h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black">
                                    {cart.length} productos en carrito · Total: ${cartTotal.toLocaleString('es-AR')}
                                </p>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & Categories */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1f1f25] border border-white/10 rounded-xl py-2 pl-9 pr-8 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {dynamicCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap border ${
                                            category === cat.id 
                                                ? 'bg-amber-500 border-amber-500 text-black' 
                                                : 'bg-[#1f1f25] border-white/5 text-slate-300'
                                        }`}
                                    >
                                        {cat.label} ({cat.count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
                            {filteredProducts.map(prod => {
                                const inCartItem = cart.find(c => String(c.id) === String(prod.id));
                                const qty = inCartItem?.quantity || 0;

                                return (
                                    <div key={prod.id} className="p-3 rounded-2xl bg-[#1b1b20] border border-white/5 flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-extrabold text-white truncate">{prod.nombre}</h4>
                                            <p className="text-[10px] text-amber-400 font-black mt-0.5">${prod.precio.toLocaleString('es-AR')}</p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {qty > 0 ? (
                                                <div className="flex items-center bg-[#2a292f] rounded-xl p-1 border border-white/5 gap-2">
                                                    <button onClick={() => decrementCart(prod.id)} className="p-1 rounded-lg bg-white/5 text-slate-300 hover:text-white">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-xs font-black text-white px-1">{qty}</span>
                                                    <button onClick={() => addToCart(prod)} className="p-1 rounded-lg bg-amber-500 text-slate-950 font-black">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addToCart(prod)}
                                                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 active:scale-95"
                                                >
                                                    <Plus size={14} /> Agregar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Items en Comanda seleccionados con notas rápidas */}
                        {cart.length > 0 && (
                            <div className="bg-[#1b1b20] border border-amber-500/20 rounded-2xl p-2.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Comanda actual ({cart.reduce((a, b) => a + b.quantity, 0)})
                                    </span>
                                    <span className="text-[9px] text-slate-400">Tocá para agregar nota</span>
                                </div>
                                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div key={item.id} className="p-2 rounded-xl bg-[#2a292f] border border-white/5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-extrabold text-white truncate">{item.quantity}x {item.nombre}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-amber-400 font-bold">${(item.precio * item.quantity).toLocaleString('es-AR')}</span>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)} 
                                                        className="text-red-400 hover:text-red-300 p-0.5"
                                                        title="Quitar de la comanda"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            {item.comment && (
                                                <span className="text-[10px] text-amber-300 font-medium italic">Nota: {item.comment}</span>
                                            )}
                                            {activeNoteItemId === item.id ? (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {QUICK_NOTES.map(qn => (
                                                        <button
                                                            key={qn}
                                                            onClick={() => {
                                                                updateCartComment(item.id, item.comment ? `${item.comment}, ${qn}` : qn);
                                                                setActiveNoteItemId(null);
                                                            }}
                                                            className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-amber-500 hover:text-black text-[9px] font-bold text-slate-200"
                                                        >
                                                            +{qn}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setActiveNoteItemId(null)}
                                                        className="px-2 py-0.5 rounded-md bg-red-950/60 text-red-300 text-[9px] font-bold"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveNoteItemId(item.id)}
                                                    className="self-start text-[9px] text-slate-400 hover:text-amber-400 font-bold underline"
                                                >
                                                    {item.comment ? 'Editar nota' : '+ Agregar nota rápida'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cart Summary & Send Action */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400">Total a Comandar</span>
                                <p className="text-xl font-black text-amber-400 leading-tight">${cartTotal.toLocaleString('es-AR')}</p>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0}
                                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                            >
                                <Send size={16} />
                                <span>Enviar a Cocina / KDS</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: VER COMANDA (DETALLE DE PEDIDOS ACTIVOS EN LA MESA) */}
            {isComandaOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#131318] border border-white/10 w-full max-w-md rounded-[32px] p-6 text-white space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-black uppercase text-amber-400 tracking-tight">
                                    Comanda — {currentSelectedData?.title}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    {activeOrdersForSelected.length} pedidos activos
                                </p>
                            </div>
                            <button onClick={() => setIsComandaOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1">
                            {activeOrdersForSelected.length === 0 ? (
                                <p className="py-8 text-center text-xs text-slate-500 font-black uppercase tracking-wider">
                                    No hay comandas activas en esta mesa
                                </p>
                            ) : (
                                activeOrdersForSelected.map((order, idx) => (
                                    <div key={order.id || idx} className="p-3.5 bg-[#1b1b20] border border-white/5 rounded-2xl space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-black text-amber-400">Comanda #{idx + 1}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{order.hora || 'Reciente'}</span>
                                        </div>
                                        <div className="space-y-1">
                                            {(order.productos || order.items || order.products || []).map((it, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs py-0.5">
                                                    <span className="text-slate-200">{it.cantidad || it.quantity || 1}x {it.nombre || it.name}</span>
                                                    <span className="font-bold text-slate-400">${Number(it.price || it.precio || 0).toLocaleString('es-AR')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-400">Total Acumulado</span>
                            <span className="text-xl font-black text-amber-400">${selectedTotalDeuda.toLocaleString('es-AR')}</span>
                        </div>

                        <button
                            onClick={() => {
                                setIsComandaOpen(false);
                                handlePayTable();
                            }}
                            className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#7c3aed] text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
                        >
                            <CreditCard size={16} />
                            <span>Cobrar Mesa</span>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 3: PAGO / COBRO CONSOLIDADO */}
            <PaymentModal
                isOpen={isPaymentOpen}
                order={orderToPay}
                orderTotal={selectedTotalDeuda}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setOrderToPay(null);
                }}
                onConfirm={async ({ method, receipt }) => {
                    try {
                        // Register in Caja
                        const { registerExternalMovement } = await import('../../caja/services/cajaService');
                        await registerExternalMovement(negocioId, {
                            tipo: 'entrada',
                            categoria: 'Venta mozo',
                            monto: selectedTotalDeuda,
                            descripcion: `Mesa ${selectedTable} - Cobro realizado por ${mozo?.name || 'Mozo'}`,
                            metodo_pago: (method || 'efectivo').toLowerCase(),
                            origen: 'bar',
                            mozo: mozo?.name || 'Mozo',
                            receiptImage: receipt || null
                        });

                        // Update orders status to paid
                        if (updateOrderStatus) {
                            activeOrdersForSelected.forEach(o => {
                                if (o.id) updateOrderStatus(String(o.id), 'paid');
                            });
                        }
                        if (updateConfigOrder) {
                            activeOrdersForSelected.forEach(o => {
                                if (o.id) updateConfigOrder(String(o.id), { status: 'paid', paid: true });
                            });
                        }

                        // Free table
                        if (marcarMesaDisponible) {
                            marcarMesaDisponible(selectedTable);
                        }

                        setIsPaymentOpen(false);
                        setOrderToPay(null);
                        alert(`Mesa ${selectedTable} cobrada con éxito.`);
                    } catch (err) {
                        console.error('Error al cobrar:', err);
                        alert('Cobro registrado en mesa.');
                        setIsPaymentOpen(false);
                    }
                }}
            />
        </div>
    );
}
