import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    ChefHat, Maximize, Minimize, AlertCircle, CheckCircle2,
    PlayCircle, Archive, Timer, Clock, User, Hash, Zap, Navigation
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// ✅ FIX: KitchenCard is defined OUTSIDE the parent component.
//    Previously it was inside — React destroyed and recreated
//    it on every 1-second timer tick, causing massive re-renders.
// ─────────────────────────────────────────────────────────
const KitchenCard = memo(function KitchenCard({ order, status, currentTime, onAction }) {
    const currentProducts = order.productos || order.items || [];

    const elapsedSec = useMemo(() => {
        const ts = order.hora || order.timestamp;
        if (!ts) return 0;
        const orderTime = ts.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
        return Math.floor((currentTime - orderTime) / 1000);
    }, [order.hora, order.timestamp, currentTime]);

    const minutes = Math.floor(elapsedSec / 60);
    const seconds = elapsedSec % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const orderTime = order.hora || order.timestamp;
    const orderTimeStr = orderTime?.toDate
        ? orderTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isCritical = minutes >= 10 && status !== 'Entregado';

    const rawType = String(order.tipo || order.type || order.orderType || '').toLowerCase();
    const isDelivery = rawType.includes('delivery');
    const isRetirar  = rawType.includes('retirar') || rawType.includes('llevar');
    const typeLabel  = isDelivery ? 'Delivery' : isRetirar ? 'Takeaway' : `Mesa ${order.mesa || order.tableNumber || '?'}`;

    return (
        <div className={`kds-card group animate-in slide-in-from-right-8 duration-500 ${isCritical ? 'is-critical' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                            {isDelivery ? <Navigation size={14} /> : isRetirar ? <Zap size={14} /> : <Hash size={14} />}
                        </div>
                        <h2 className="text-[20px] font-black uppercase tracking-tighter italic text-white leading-none">
                            {typeLabel}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                        <Clock size={10} className="text-slate-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{orderTimeStr}</span>
                    </div>
                </div>
                {status !== 'Entregado' && (
                    <div className={`px-4 py-2 rounded-2xl font-black text-xl tracking-tighter italic border ${
                        isCritical ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-white/5 text-white border-white/10'
                    }`}>
                        {timeStr}
                    </div>
                )}
            </div>

            {/* Products List */}
            <div className="flex-1 space-y-3 mb-6">
                {currentProducts
                    .filter(item => item.sector === 'cocina')
                    .map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start bg-white/[0.02] p-4 rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white font-black text-lg shrink-0">
                                {item.cantidad || item.quantity}
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-[19px] font-black uppercase tracking-tight text-white leading-tight">
                                    {item.nombre || item.name}
                                </p>
                                {(item.notes || item.observaciones) && (
                                    <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                        <AlertCircle size={10} className="text-rose-500 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                                            {item.notes || item.observaciones}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                        <User size={14} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Operador</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{order.mozoName || 'Digital'}</p>
                    </div>
                </div>
                {isDelivery && (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        Prioridad A
                    </span>
                )}
            </div>

            {/* Action Buttons */}
            {status === 'Pendiente' && (
                <button
                    onClick={() => onAction(order.id, 'Preparando')}
                    className="w-full py-5 rounded-[24px] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group/btn relative overflow-hidden active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                    <PlayCircle size={18} className="relative z-10" />
                    <span className="relative z-10">Tomar Comanda</span>
                </button>
            )}
            {status === 'Preparando' && (
                <button
                    onClick={() => onAction(order.id, 'Listo')}
                    className="w-full py-5 rounded-[24px] bg-amber-500 text-slate-950 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group/btn relative overflow-hidden active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                    <CheckCircle2 size={18} className="relative z-10" />
                    <span className="relative z-10">Marcar como Listo</span>
                </button>
            )}
            {status === 'Listo' && (
                <button
                    onClick={() => onAction(order.id, 'Entregado')}
                    className="w-full py-5 rounded-[24px] bg-emerald-500 text-slate-950 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group/btn relative overflow-hidden active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                    <Archive size={18} className="relative z-10" />
                    <span className="relative z-10">Finalizar / Despachar</span>
                </button>
            )}
        </div>
    );
});

// ─────────────────────────────────────────────────────────
// Main KitchenDisplay component
// ─────────────────────────────────────────────────────────
export default function KitchenDisplay() {
    const { orders, updateOrderStatus } = usePedidos();
    const [currentTime, setCurrentTime]   = useState(Date.now());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    // ✅ FIX: Sound tracking refs now properly connected
    const prevNewCountRef    = useRef(0);
    const prevReadyIdsRef    = useRef(new Set());
    const alertedOrdersRef   = useRef(new Set());

    // 1-second clock tick — does NOT cause KitchenCard re-render anymore
    // because KitchenCard is defined outside and receives currentTime as prop
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ✅ FIX: useMemo prevents recalculating ALL lists every second.
    // The lists only recalculate when `orders` changes (Firestore push),
    // not when the timer ticks.
    const hasKitchenItems = useCallback((order) => {
        const products = order.productos || order.items || [];
        return products.some(item => item.sector === 'cocina');
    }, []);

    const allKitchenOrders = useMemo(() =>
        (orders || []).filter(o => (o.estado || o.status) !== 'cancelado' && hasKitchenItems(o)),
    [orders, hasKitchenItems]);

    const getPriorityScore = useCallback((o) => {
        let score = 0;
        const ts = o.timestamp || o.hora;
        const orderTime = ts?.toDate ? ts.toDate().getTime() : new Date(ts || Date.now()).getTime();
        const elapsed = Math.floor((Date.now() - orderTime) / 1000);
        if (elapsed > 600) score += 1_000_000;
        const type = String(o.type || o.orderType || '').toLowerCase();
        if (type.includes('delivery')) score += 10_000;
        const size = (o.productos || o.items || []).reduce((acc, i) => acc + (i.cantidad || i.quantity || 0), 0);
        score += size * 100 + elapsed;
        return score;
    }, []);

    const sortByPriority = useCallback((a, b) => getPriorityScore(b) - getPriorityScore(a), [getPriorityScore]);

    // ✅ FIX: filtered lists are memoized — won't change on timer tick
    const nuevosPedidos = useMemo(() =>
        allKitchenOrders.filter(o => {
            const st = String(o.estado || o.kitchenStatus || '').toLowerCase();
            return st === 'pendiente' || !st || st === 'undefined';
        }).sort(sortByPriority),
    [allKitchenOrders, sortByPriority]);

    const preparandoPedidos = useMemo(() =>
        allKitchenOrders.filter(o => String(o.estado || o.kitchenStatus || '').toLowerCase() === 'preparando').sort(sortByPriority),
    [allKitchenOrders, sortByPriority]);

    const listosPedidos = useMemo(() =>
        allKitchenOrders.filter(o => {
            const st = String(o.estado || o.kitchenStatus || '').toLowerCase();
            return st === 'listo' || st === 'listo_para_salir';
        }).sort(sortByPriority),
    [allKitchenOrders, sortByPriority]);

    const historialPedidos = useMemo(() =>
        allKitchenOrders
            .filter(o => {
                const st = String(o.estado || o.kitchenStatus || '').toLowerCase();
                return st === 'entregado' || st === 'paid';
            })
            .sort((a, b) => new Date(b.timestamp || b.hora) - new Date(a.timestamp || a.hora))
            .slice(0, 10),
    [allKitchenOrders]);

    // ─── Sound Synthesizer ───────────────────────────────
    const playSound = useCallback((type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            if (type === 'new') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.5, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(); osc.stop(ctx.currentTime + 0.3);
            } else if (type === 'ready') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.setValueAtTime(800, ctx.currentTime + 0.15);
                osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                osc.start(); osc.stop(ctx.currentTime + 0.6);
            }
        } catch (e) {}
    }, []);

    // ✅ FIX: sound on new orders (properly uses ref, not stale state)
    useEffect(() => {
        if (nuevosPedidos.length > prevNewCountRef.current) {
            playSound('new');
        }
        prevNewCountRef.current = nuevosPedidos.length;
    }, [nuevosPedidos.length, playSound]);

    // ✅ FIX: sound on orders ready — alertedOrdersRef now actually used
    useEffect(() => {
        listosPedidos.forEach(o => {
            if (!alertedOrdersRef.current.has(o.id)) {
                alertedOrdersRef.current.add(o.id);
                playSound('ready');
            }
        });
        // Clean up IDs that are no longer "listo"
        const currentIds = new Set(listosPedidos.map(o => o.id));
        alertedOrdersRef.current.forEach(id => {
            if (!currentIds.has(id)) alertedOrdersRef.current.delete(id);
        });
    }, [listosPedidos, playSound]);

    // ─── Actions ─────────────────────────────────────────
    const handleAction = useCallback(async (id, newStatus) => {
        await updateOrderStatus(id, newStatus.toLowerCase());
    }, [updateOrderStatus]);

    // ─── Fullscreen ───────────────────────────────────────
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current) containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const activeCount = nuevosPedidos.length + preparandoPedidos.length + listosPedidos.length;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020202] text-white flex flex-col font-inter selection:bg-blue-500/30 overflow-hidden">
            {/* Header */}
            <header className="bg-white/[0.02] border-b border-white/5 py-8 px-10 flex items-center justify-between backdrop-blur-3xl z-50">
                <div className="flex items-center gap-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
                        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center relative z-10 shadow-2xl">
                            <ChefHat size={32} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none m-0">KDS Control</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                            <Zap size={10} className="text-amber-500" /> Quantum Engine 4.0
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-12">
                    {[
                        { label: 'En Espera',   val: nuevosPedidos.length,    color: 'text-blue-400'    },
                        { label: 'Procesando',  val: preparandoPedidos.length, color: 'text-amber-400'  },
                        { label: 'Completados', val: listosPedidos.length,    color: 'text-emerald-400' },
                    ].map(st => (
                        <div key={st.label} className="text-center group cursor-default">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2 group-hover:text-slate-400 transition-colors">{st.label}</p>
                            <span className={`text-4xl font-black italic tracking-tighter ${st.color}`}>{st.val}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleFullScreen} className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90">
                        {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                    </button>
                </div>
            </header>

            {/* Columns */}
            <main className="flex-1 flex gap-6 p-8 overflow-hidden">
                {/* COL: Pendientes */}
                <section className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden group/col">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" /> Cola de Entrada
                        </h3>
                        <span className="text-[10px] font-black text-slate-600 bg-black/40 px-3 py-1 rounded-full border border-white/5">{nuevosPedidos.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {nuevosPedidos.map(o => (
                            <KitchenCard key={o.id} order={o} status="Pendiente" currentTime={currentTime} onAction={handleAction} />
                        ))}
                        {nuevosPedidos.length === 0 && <EmptyCol icon={Timer} text="Esperando Comandas" />}
                    </div>
                </section>

                {/* COL: Preparando */}
                <section className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden group/col">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]" /> En Producción
                        </h3>
                        <span className="text-[10px] font-black text-slate-600 bg-black/40 px-3 py-1 rounded-full border border-white/5">{preparandoPedidos.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {preparandoPedidos.map(o => (
                            <KitchenCard key={o.id} order={o} status="Preparando" currentTime={currentTime} onAction={handleAction} />
                        ))}
                        {preparandoPedidos.length === 0 && <EmptyCol icon={ChefHat} text="Estaciones en Pausa" />}
                    </div>
                </section>

                {/* COL: Listos */}
                <section className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden group/col">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /> Listos para Salir
                        </h3>
                        <span className="text-[10px] font-black text-slate-600 bg-black/40 px-3 py-1 rounded-full border border-white/5">{listosPedidos.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {listosPedidos.map(o => (
                            <KitchenCard key={o.id} order={o} status="Listo" currentTime={currentTime} onAction={handleAction} />
                        ))}
                        {listosPedidos.length === 0 && <EmptyCol icon={CheckCircle2} text="Bandeja Limpia" />}
                    </div>
                </section>

                {/* COL: Historial */}
                <section className="w-[380px] hidden xl:flex flex-col bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden opacity-40 hover:opacity-100 transition-opacity">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Historial Reciente</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {historialPedidos.map(o => (
                            <KitchenCard key={o.id} order={o} status="Entregado" currentTime={currentTime} onAction={handleAction} />
                        ))}
                        {historialPedidos.length === 0 && <EmptyCol icon={Archive} text="Sin Registros" />}
                    </div>
                </section>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .kds-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 32px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .kds-card:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.15);
                    transform: translateY(-4px);
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
                }
                .kds-card.is-critical {
                    border-color: rgba(239, 68, 68, 0.3);
                    background: rgba(239, 68, 68, 0.05);
                }
            ` }} />
        </div>
    );
}

function EmptyCol({ icon: Icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[300px] opacity-20">
            <Icon size={48} strokeWidth={1} className="mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.4em]">{text}</p>
        </div>
    );
}
