import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { ChefHat, Maximize, Minimize, AlertCircle, CheckCircle2, PlayCircle, Archive, PartyPopper } from 'lucide-react';

export default function KitchenDisplay() {
    const { orders, updateOrder } = usePedidos();
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    // Tracking for sounds
    const [prevNewCount, setPrevNewCount] = useState(0);
    const prevReadyIdsRef = useRef(new Set());
    const alertedOrdersRef = useRef(new Set());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const kitchenCategories = [
        'Carnes', 'Lomos', 'Burgers', 'Pizzas', 'Pastas',
        'Ensaladas', 'Papas', 'Tacos', 'Platos', 'Postres',
        'Combos', 'Cafeteria', 'Licuados', 'Tortas'
    ];
    const hasKitchenItems = (order) => {
        const products = order.productos || order.items || [];
        return products.some(item => item.sector === 'cocina');
    };

    // Filter relevant orders
    const allKitchenOrders = (orders || []).filter(o => (o.estado || o.status) !== 'cancelado' && hasKitchenItems(o));

    // Calculate time stats exactly
    const getElapsedSeconds = (timestamp) => {
        if (!timestamp) return 0;
        const orderTime = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
        return Math.floor((currentTime - orderTime) / 1000);
    };

    const getPriorityScore = (o) => {
        let score = 0;
        const elapsedSec = getElapsedSeconds(o.timestamp);
        if (elapsedSec > 600) score += 1000000; // >10 min is critical

        const type = (o.type || o.orderType || '').toLowerCase();
        if (type.includes('delivery')) score += 10000; // delivery priority

        const size = (o.productos || o.items) ? (o.productos || o.items).reduce((acc, i) => acc + (i.cantidad || i.quantity || 0), 0) : 0;
        score += size * 100; // order size priority

        score += elapsedSec; // delay priority
        return score;
    };

    const sortByPriority = (a, b) => getPriorityScore(b) - getPriorityScore(a);
    const sortHistorial = (a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA; // newest first for history
    };

    const nuevosPedidos = allKitchenOrders.filter(o => (o.estado || o.kitchenStatus) === 'pendiente' || (o.estado || o.kitchenStatus) === 'Pendiente' || !o.estado).sort(sortByPriority);
    const preparandoPedidos = allKitchenOrders.filter(o => (o.estado || o.kitchenStatus) === 'preparando' || (o.estado || o.kitchenStatus) === 'Preparando').sort(sortByPriority);
    const listosPedidos = allKitchenOrders.filter(o => (o.estado || o.kitchenStatus) === 'listo' || (o.estado || o.kitchenStatus) === 'Listo').sort(sortByPriority);
    const historialPedidos = allKitchenOrders.filter(o => (o.estado || o.kitchenStatus) === 'entregado' || (o.estado || o.kitchenStatus) === 'Entregado').sort(sortHistorial).slice(0, 20); // Last 20

    // Sound Synthesizer Functions
    const playSound = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            if (type === 'new') {
                // Short beep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else if (type === 'ready') {
                // iPhone style message sound (3 tones)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.setValueAtTime(800, ctx.currentTime + 0.15);
                osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                osc.start();
                osc.stop(ctx.currentTime + 0.6);
            } else if (type === 'critical') {
                // Alert siren
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
                osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.4);
                osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                osc.start();
                osc.stop(ctx.currentTime + 0.8);
            }
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    // Trigger sounds
    useEffect(() => {
        // New order sound/vibration
        if (nuevosPedidos.length > prevNewCount) {
            playSound('new');
            // Notify via vibration if supported (Mobile App)
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }
        setPrevNewCount(nuevosPedidos.length);

        // Ready order sound
        let playedReady = false;
        const currentReadyIds = new Set(listosPedidos.map(o => o.id));
        currentReadyIds.forEach(id => {
            if (!prevReadyIdsRef.current.has(id)) {
                playedReady = true;
            }
        });
        if (playedReady) {
            playSound('ready');
            if ('vibrate' in navigator) navigator.vibrate(500);
        }
        prevReadyIdsRef.current = currentReadyIds;

        // Birthday event sound
        const birthdayOrders = nuevosPedidos.filter(o => o.modo_evento === 'cumpleaños');
        birthdayOrders.forEach(o => {
            if (!alertedOrdersRef.current.has('bday-' + o.id)) {
                alertedOrdersRef.current.add('bday-' + o.id);
                try {
                    const audio = new Audio('/sounds/cumpleanos.mp3');
                    audio.volume = 1;
                    audio.play().catch(() => playSound('ready'));
                } catch (e) {
                    playSound('ready');
                }
            }
        });

        // Critical delay sound
        const activeOrders = [...nuevosPedidos, ...preparandoPedidos];
        activeOrders.forEach(o => {
            if (getElapsedSeconds(o.timestamp || o.hora) > 600 && !alertedOrdersRef.current.has(o.id)) {
                playSound('critical');
                alertedOrdersRef.current.add(o.id);
            }
        });
    }, [nuevosPedidos.length, listosPedidos, currentTime]);

    // Top Panel Stats
    const activeCount = nuevosPedidos.length + preparandoPedidos.length + listosPedidos.length;
    let avgTime = 0;

    if (activeCount > 0) {
        let totalMin = 0;
        const activeList = [...nuevosPedidos, ...preparandoPedidos, ...listosPedidos];
        activeList.forEach(o => {
            totalMin += Math.floor(getElapsedSeconds(o.timestamp) / 60);
        });
        avgTime = Math.floor(totalMin / activeCount);
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current) {
                containerRef.current.requestFullscreen().catch(err => console.log(err));
            }
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleAction = async (id, newStatus) => {
        const unifiedStatus = newStatus.toLowerCase();
        await updateOrder(id, {
            estado: unifiedStatus,
            kitchenStatus: newStatus // Keep for compatibility
        });
    };

    const KitchenCard = ({ order, status }) => {
        const currentProducts = order.productos || order.items || [];
        const elapsedSec = getElapsedSeconds(order.hora || order.timestamp);
        const minutes = Math.floor(elapsedSec / 60);
        const seconds = elapsedSec % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const orderTime = order.hora || order.timestamp;
        const orderTimeStr = orderTime?.toDate ? orderTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let colorObj = { border: '#10b981', text: '#10b981' }; // green
        let isCritical = false;

        if (status !== 'Entregado') {
            if (minutes >= 10) {
                colorObj = { border: '#ef4444', text: '#ef4444' }; // red
                isCritical = true;
            } else if (minutes >= 5) {
                colorObj = { border: '#eab308', text: '#eab308' }; // yellow
            }
        } else {
            colorObj = { border: '#64748b', text: '#64748b' }; // slate for history
        }

        const isDelivery = String(order.tipo || order.type || order.orderType).toLowerCase().includes('delivery');
        const isRetirar = String(order.tipo || order.type || order.orderType).toLowerCase().includes('retirar') || String(order.tipo || order.type || order.orderType).toLowerCase().includes('llevar');

        const typeLabel = isDelivery ? 'Delivery' : isRetirar ? 'Para Retirar' : `Mesa ${order.mesa || order.tableNumber || '?'}`;
        const typeColor = isDelivery ? '#10b981' : isRetirar ? '#eab308' : '#3b82f6';

        const isBirthday = order.modo_evento === 'cumpleaños';

        return (
            <div className={`kds-card card-enter ${isCritical ? 'blink-critical' : ''} ${isBirthday ? 'birthday-card' : ''}`} style={{ borderLeft: `8px solid ${isBirthday ? '#f2b90d' : colorObj.border}` }}>

                {/* Birthday Event Banner */}
                {isBirthday && (
                    <div className="birthday-banner">
                        <span className="text-2xl">🎉</span>
                        <div>
                            <p className="text-base font-black uppercase tracking-widest italic text-gold">EVENTO ESPECIAL</p>
                            <p className="text-xs font-bold text-yellow-200/80 uppercase tracking-widest">🎂 CUMPLEAÑOS — Preparar Champagne 🍾</p>
                        </div>
                        <span className="text-2xl">🎉</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-[26px] font-black uppercase tracking-tighter" style={{ color: typeColor }}>
                            {typeLabel}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 opacity-80">
                            <span className="text-sm font-bold uppercase tracking-widest">
                                🕒 {orderTimeStr}
                            </span>
                        </div>
                    </div>
                    {status !== 'Entregado' && (
                        <div className="kds-timer" style={{ color: colorObj.text, border: `1px solid ${colorObj.border}40`, backgroundColor: `${colorObj.border}15` }}>
                            {timeStr}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 mb-[15px]">
                    <ul className="space-y-3">
                        {currentProducts
                            .filter(item => item.sector === 'cocina')
                            .map((item, idx) => (
                                <li key={idx} className="flex gap-[10px] items-start text-[22px] font-bold leading-tight">
                                    <span style={{ color: '#eab308' }}>{item.cantidad || item.quantity}x</span>
                                    <span className="text-white break-words w-full">
                                        {item.nombre || item.name}
                                        {item.notes && (
                                            <span className="block text-sm text-[#f87171] uppercase font-black" style={{ background: 'rgba(248,113,113,0.1)', padding: '6px', borderRadius: '6px', marginTop: '6px' }}>
                                                * {item.notes}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="text-[14px] font-black uppercase tracking-widest text-[#94a3b8] border-t border-[#333] pt-3 pb-4">
                    MOZO: {order.mozoName || 'Online'}
                </div>

                {/* Actions */}
                {status === 'Pendiente' && (
                    <button onClick={() => handleAction(order.id, 'Preparando')} className="kds-btn bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <PlayCircle size={24} /> TOMAR PEDIDO
                    </button>
                )}
                {status === 'Preparando' && (
                    <button onClick={() => handleAction(order.id, 'Listo')} className="kds-btn bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]">
                        <CheckCircle2 size={24} /> MARCAR LISTO
                    </button>
                )}
                {status === 'Listo' && (
                    <button onClick={() => handleAction(order.id, 'Entregado')} className="kds-btn bg-slate-700 hover:bg-slate-600 border border-slate-600">
                        <Archive size={24} /> ARCHIVAR / ENTREGADO
                    </button>
                )}
            </div>
        );
    };


    return (
        <div ref={containerRef} className="kds-container">
            {/* Top Bar */}
            <div className="kds-header">
                <div className="flex items-center gap-6">
                    <ChefHat size={36} color="#eab308" />
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white m-0 leading-none">Pantalla de Cocina</h1>
                        <span className="text-[#94a3b8] text-[12px] font-bold uppercase tracking-widest">KDS Pro System</span>
                    </div>
                </div>

                <div className="flex items-center gap-[40px] text-[15px] font-black uppercase tracking-widest text-[#cbd5e1]">
                    <div className="flex flex-col items-center">
                        <span className="text-[#64748b] text-[11px]">Activos</span>
                        <span className="text-2xl">{activeCount}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[#64748b] text-[11px]">Preparando</span>
                        <span className="text-2xl text-[#eab308]">{preparandoPedidos.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[#64748b] text-[11px]">Listos</span>
                        <span className="text-2xl text-[#10b981]">{listosPedidos.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[#64748b] text-[11px]">T. Promedio</span>
                        <span className="text-2xl text-white">{avgTime} <span className="text-base text-[#64748b]">min</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={toggleFullScreen} className="p-4 bg-[#1e293b] hover:bg-[#334155] rounded-2xl transition-all border border-[#334155]">
                        {isFullscreen ? <Minimize size={26} color="white" /> : <Maximize size={26} color="white" />}
                    </button>
                </div>
            </div>

            {/* Columns Container */}
            <div className="flex flex-1 gap-4 overflow-hidden p-4">

                {/* COL 1 */}
                <div className="kds-col">
                    <div className="kds-col-header" style={{ borderBottom: '4px solid #3b82f6' }}>
                        NUEVOS PEDIDOS <span className="text-[14px]">({nuevosPedidos.length})</span>
                    </div>
                    <div className="kds-col-body">
                        {nuevosPedidos.map(o => <KitchenCard key={o.id} order={o} status="Pendiente" />)}
                        {nuevosPedidos.length === 0 && <div className="kds-empty"><AlertCircle size={40} />NO HAY PEDIDOS EN COCINA</div>}
                    </div>
                </div>

                {/* COL 2 */}
                <div className="kds-col">
                    <div className="kds-col-header" style={{ borderBottom: '4px solid #eab308' }}>
                        EN PREPARACIÓN <span className="text-[14px]">({preparandoPedidos.length})</span>
                    </div>
                    <div className="kds-col-body">
                        {preparandoPedidos.map(o => <KitchenCard key={o.id} order={o} status="Preparando" />)}
                        {preparandoPedidos.length === 0 && <div className="kds-empty"><ChefHat size={40} />Cocina libre</div>}
                    </div>
                </div>

                {/* COL 3 */}
                <div className="kds-col">
                    <div className="kds-col-header" style={{ borderBottom: '4px solid #10b981' }}>
                        LISTOS PARA ENTREGAR <span className="text-[14px]">({listosPedidos.length})</span>
                    </div>
                    <div className="kds-col-body">
                        {listosPedidos.map(o => <KitchenCard key={o.id} order={o} status="Listo" />)}
                        {listosPedidos.length === 0 && <div className="kds-empty"><CheckCircle2 size={40} />Sin entregas pendientes</div>}
                    </div>
                </div>

                {/* COL 4 */}
                <div className="kds-col" style={{ opacity: 0.8 }}>
                    <div className="kds-col-header" style={{ borderBottom: '4px solid #64748b', background: '#0f172a' }}>
                        HISTORIAL RECIENTE
                    </div>
                    <div className="kds-col-body">
                        {historialPedidos.map(o => <KitchenCard key={o.id} order={o} status="Entregado" />)}
                        {historialPedidos.length === 0 && <div className="kds-empty"><Archive size={40} />Historial vacío</div>}
                    </div>
                </div>

            </div>

            {/* KDS Specific Styles appended directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .kds-container {
                    min-height: 100vh;
                    height: 100vh;
                    background: #0f0f0f;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                }
                .kds-header {
                    background: #1c1c1c;
                    padding: 20px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #2a2a2a;
                }
                .kds-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #141414;
                    border-radius: 16px;
                    border: 2px solid #222;
                    overflow: hidden;
                }
                .kds-col-header {
                    background: #1c1c1c;
                    padding: 18px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    color: white;
                }
                .kds-col-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    padding-right: 6px;
                }
                .kds-col-body::-webkit-scrollbar { width: 6px; }
                .kds-col-body::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                
                .kds-card {
                    padding: 20px;
                    margin-bottom: 15px;
                    background: #1c1c1c;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }
                .kds-timer {
                    font-size: 32px;
                    font-weight: 900;
                    padding: 4px 12px;
                    border-radius: 10px;
                    letter-spacing: 1px;
                }
                .kds-btn {
                    width: 100%;
                    padding: 16px;
                    font-size: 18px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }
                
                .kds-empty {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    gap: 15px;
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .card-enter {
                    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes blinkCritical {
                    0%, 100% { border-color: #ef4444; }
                    50% { border-color: #7f1d1d; background-color: rgba(239, 68, 68, 0.05); }
                }
                .blink-critical {
                    animation: blinkCritical 1s infinite;
                }

                .birthday-card {
                    border: 2px solid #f2b90d !important;
                    box-shadow: 0 0 30px rgba(242, 185, 13, 0.25), inset 0 0 60px rgba(242, 185, 13, 0.03) !important;
                    position: relative;
                    overflow: hidden;
                }
                .birthday-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #f2b90d, #ff6b6b, #f2b90d, #ff6b6b, #f2b90d);
                    background-size: 200% 100%;
                    animation: shimmer 2s linear infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .birthday-banner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 12px;
                    margin: -20px -20px 16px -20px;
                    background: linear-gradient(135deg, rgba(242,185,13,0.15), rgba(255,107,107,0.1));
                    border-bottom: 2px solid rgba(242,185,13,0.3);
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: inset 0 0 10px rgba(242,185,13,0.1); }
                    50% { box-shadow: inset 0 0 20px rgba(242,185,13,0.2); }
                }
                `}} />

        </div>
    );
}
