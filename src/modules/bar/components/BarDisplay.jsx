import React, { useState, useEffect, useRef } from 'react';
import { usePedidos } from '../services/PedidosContext';
import { Wine, Maximize, Minimize, AlertCircle, CheckCircle2, PlayCircle, Archive, PartyPopper } from 'lucide-react';

export default function BarDisplay() {
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

    const hasBarItems = (order) => {
        const products = order?.productos || order?.items || [];
        return products.some(item => item?.sector === 'barra');
    };

    // Filter relevant orders
    const allBarOrders = (orders || []).filter(o => (o?.estado || o?.status) !== 'cancelado' && hasBarItems(o));

    const getElapsedSeconds = (timestamp) => {
        if (!timestamp) return 0;
        const orderTime = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
        return Math.floor((currentTime - orderTime) / 1000);
    };

    const getPriorityScore = (o) => {
        let score = 0;
        const elapsedSec = getElapsedSeconds(o.timestamp);
        if (elapsedSec > 300) score += 1000000; // >5 min is critical for drinks

        const type = (o.type || o.orderType || '').toLowerCase();
        if (type.includes('delivery')) score += 10000;

        const size = o.items ? o.items.reduce((acc, i) => acc + i.quantity, 0) : 0;
        score += size * 100;

        score += elapsedSec;
        return score;
    };

    const sortByPriority = (a, b) => getPriorityScore(b) - getPriorityScore(a);
    const sortHistorial = (a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
    };

    const nuevosPedidos = allBarOrders.filter(o => (o.barStatus === 'pendiente' || !o.barStatus) && (o.estado !== 'entregado')).sort(sortByPriority);
    const preparandoPedidos = allBarOrders.filter(o => o.barStatus === 'preparando').sort(sortByPriority);
    const listosPedidos = allBarOrders.filter(o => o.barStatus === 'listo').sort(sortByPriority);
    const historialPedidos = allBarOrders.filter(o => o.barStatus === 'entregado').sort(sortHistorial).slice(0, 15);

    const playSound = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            if (type === 'new') {
                osc.type = 'sine'; osc.frequency.setValueAtTime(1000, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                osc.start(); osc.stop(ctx.currentTime + 0.2);
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (nuevosPedidos.length > prevNewCount) playSound('new');
        setPrevNewCount(nuevosPedidos.length);

        // Birthday event sound
        const birthdayOrders = nuevosPedidos.filter(o => o.modo_evento === 'cumpleaños');
        birthdayOrders.forEach(o => {
            if (!alertedOrdersRef.current.has('bday-bar-' + o.id)) {
                alertedOrdersRef.current.add('bday-bar-' + o.id);
                try {
                    const audio = new Audio('/sounds/cumpleanos.mp3');
                    audio.play().catch(() => { });
                } catch (e) { }
            }
        });
    }, [nuevosPedidos.length]);

    const handleAction = async (id, newStatus) => {
        await updateOrder(id, { barStatus: newStatus.toLowerCase() });
    };

    const BarCard = ({ order, status }) => {
        const currentProducts = order?.productos || order?.items || [];
        const elapsedSec = getElapsedSeconds(order?.hora || order?.timestamp);
        const timeStr = `${Math.floor(elapsedSec / 60).toString().padStart(2, '0')}:${(elapsedSec % 60).toString().padStart(2, '0')}`;

        const isBirthday = order.modo_evento === 'cumpleaños';
        const typeColor = order.tipo === 'Delivery' ? '#10b981' : '#3b82f6';

        return (
            <div className={`bar-card ${isBirthday ? 'birthday-card' : ''}`} style={{ borderLeft: `8px solid ${isBirthday ? '#f2b90d' : '#3b82f6'}` }}>
                {isBirthday && (
                    <div className="birthday-banner">
                        <PartyPopper size={20} className="text-gold" />
                        <span className="text-[10px] font-black uppercase text-gold tracking-[0.2em]">CUMPLEAÑOS — SERVIR CHAMPAGNE 🍾</span>
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: typeColor }}>
                        {order.mesa ? `Mesa ${order.mesa}` : order.tipo}
                    </h2>
                    <div className="text-xl font-black text-slate-500">{timeStr}</div>
                </div>
                <div className="flex-1 mb-4">
                    <ul className="space-y-2">
                        {currentProducts
                            .filter(item => item.sector === 'barra')
                            .map((item, idx) => (
                                <li key={idx} className="flex gap-2 text-lg font-bold">
                                    <span className="text-blue-400">{item.cantidad || item.quantity}x</span>
                                    <span className="text-white uppercase">{item.nombre || item.name}</span>
                                </li>
                            ))}
                    </ul>
                </div>
                <div className="flex gap-2 mt-auto">
                    {status === 'pendiente' && (
                        <button onClick={() => handleAction(order.id, 'preparando')} className="flex-1 py-3 bg-blue-600 rounded-xl font-black text-xs uppercase tracking-widest text-white">TOMAR</button>
                    )}
                    {status === 'preparando' && (
                        <button onClick={() => handleAction(order.id, 'listo')} className="flex-1 py-3 bg-green-600 rounded-xl font-black text-xs uppercase tracking-widest text-white">LISTO</button>
                    )}
                    {status === 'listo' && (
                        <button onClick={() => handleAction(order.id, 'entregado')} className="flex-1 py-3 bg-slate-700 rounded-xl font-black text-xs uppercase tracking-widest text-white">ENTREGAR</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="bar-container">
            <div className="bar-header">
                <div className="flex items-center gap-4">
                    <Wine size={32} className="text-blue-400" />
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Pantalla de Barra</h1>
                </div>
                <div className="flex gap-8">
                    <div className="text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Nuevos</p><p className="text-xl font-black text-white">{nuevosPedidos.length}</p></div>
                    <div className="text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Preparando</p><p className="text-xl font-black text-blue-400">{preparandoPedidos.length}</p></div>
                </div>
            </div>
            <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                <div className="flex-1 flex flex-col bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-blue-600/10 text-blue-400 text-center font-black uppercase text-sm tracking-widest border-b border-blue-600/20">Pendientes</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {nuevosPedidos.map(o => <BarCard key={o.id} order={o} status="pendiente" />)}
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-yellow-600/10 text-yellow-500 text-center font-black uppercase text-sm tracking-widest border-b border-yellow-600/20">En Barra</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {preparandoPedidos.map(o => <BarCard key={o.id} order={o} status="preparando" />)}
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-green-600/10 text-green-500 text-center font-black uppercase text-sm tracking-widest border-b border-green-600/20">Listos</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {listosPedidos.map(o => <BarCard key={o.id} order={o} status="listo" />)}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .bar-container { height: 100vh; background: #020617; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; }
                .bar-header { background: #0f172a; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; }
                .bar-card { background: #1e293b; padding: 20px; border-radius: 20px; border: 1px solid #334155; }
                .birthday-card { border: 2px solid #f2b90d !important; box-shadow: 0 0 20px rgba(242, 185, 13, 0.15); position: relative; overflow: hidden; }
                .birthday-banner { display: flex; align-items: center; gap: 8px; margin: -20px -20px 15px -20px; padding: 10px; background: rgba(242, 185, 13, 0.1); border-bottom: 1px solid rgba(242, 185, 13, 0.2); justify-content: center; }
            `}} />
        </div>
    );
}
