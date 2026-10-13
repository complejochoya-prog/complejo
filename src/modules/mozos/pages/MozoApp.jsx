import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';

// WebAudio KDS bell synthesizer
let _audioCtx = null;
export function playBeepKDS() {
    try {
        if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (_audioCtx.state === 'suspended') _audioCtx.resume();
        const now = _audioCtx.currentTime;
        const osc1 = _audioCtx.createOscillator();
        const gain1 = _audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(_audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        const osc2 = _audioCtx.createOscillator();
        const gain2 = _audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, now + 0.15);
        gain2.gain.setValueAtTime(0.3, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(_audioCtx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.55);
    } catch {
        /* AudioContext not supported */
    }
    if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200]); } catch { /* */ }
    }
}

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders } = useConfig();
    const [mozo] = useState(() => {
        const s = getMozoSession();
        return s?.id ? s : null;
    });
    const [toastVisible, setToastVisible] = useState(false);
    const [toastData, setToastData] = useState({ title: '', detail: '' });
    const toastTimerRef = useRef(null);

    // Validate Session
    useEffect(() => {
        const session = getMozoSession();
        if (!session?.id) {
            navigate(`/${negocioId}/app/mozos/login`);
        }
    }, [negocioId, navigate]);

    const handleLogout = () => {
        if ('vibrate' in navigator) navigator.vibrate(50);
        logoutMozo();
        navigate(`/${negocioId}/app/mozos/login`);
    };

    const lastNotifiedRef = useRef(new Set());

    // Notification Logic — detect ready orders for this mozo
    useEffect(() => {
        if (!mozo?.id) return;
        const readyOrders = orders?.filter(o =>
            (o.estado === 'listo' || o.estado === 'listo_para_salir') &&
            o.mozoId === mozo.id &&
            !lastNotifiedRef.current.has(o.id)
        ) || [];

        if (readyOrders.length > 0) {
            readyOrders.forEach(o => {
                lastNotifiedRef.current.add(o.id);
            });
            // Show push toast
            const last = readyOrders[readyOrders.length - 1];
            const items = (last.productos || last.items || last.products || [])
                .slice(0, 3)
                .map(p => `${p.cantidad || 1}x ${p.nombre || p.name || ''}`)
                .join(' + ');
            showPushToast(
                `🔔 ¡TICKET #${String(last.id).slice(-3)} LISTO!`,
                `Mesa ${last.mesa || last.table || '?'} · ${items || 'Retirar pedido'}`
            );
            playBeepKDS();
        }
    }, [orders, mozo]);

    const showPushToast = useCallback((title, detail) => {
        setToastData({ title, detail });
        setToastVisible(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToastVisible(false), 5000);
    }, []);

    const dismissToast = () => {
        setToastVisible(false);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };

    if (!mozo) {
        return (
            <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#FBBF24]/20 border-t-[#FBBF24] rounded-full animate-spin" />
                    <p className="text-[10px] text-[#FBBF24] font-extrabold uppercase tracking-[0.2em]">Cargando sesión...</p>
                </div>
            </div>
        );
    }

    const notifCount = orders?.filter(o =>
        (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.mozoId === mozo.id
    ).length || 0;

    const mozoInitials = (mozo?.name || mozo?.nombre || 'Mozo')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(0, 2)
        .join('') || 'MZ';

    const mozoFirstName = (mozo?.name || mozo?.nombre || 'Mozo').split(' ')[0];

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#e4e1e9] flex flex-col selection:bg-[#f59e0b] selection:text-black" style={{ fontFamily: "'Manrope', sans-serif" }}>
            
            {/* PUSH TOAST FLOTANTE */}
            <div className={`fixed top-4 inset-x-3 z-[60] transition-all duration-300 transform ${toastVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-28 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#1A202E]/95 border-2 border-[#FBBF24] text-white rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FBBF24] text-[#0A0A0F] flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-[24px]">notifications_active</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#FBBF24] font-extrabold uppercase text-[11px] tracking-[0.06em]">BARRA & COCINA KDS</span>
                            <span className="text-[10px] text-[#64748B]">· Ahora</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{toastData.title}</p>
                        <p className="text-[11px] text-[#94A3B8] truncate">{toastData.detail}</p>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-[#1f1f25] text-[#64748B] hover:text-white" onClick={dismissToast}>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            {/* HEADER FIJO PWA — Glassmorphism */}
            <header className="fixed top-0 inset-x-0 z-40 bg-[rgba(18,23,34,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="h-16 px-3.5 flex items-center justify-between gap-2">
                    {/* Info Local & Sync */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 rounded-xl bg-[#1f1f25] flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                                <span className="material-symbols-outlined text-[#FBBF24] text-[22px]">sports_soccer</span>
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#0A0A0F] animate-pulse"></span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[9px] font-extrabold uppercase tracking-[0.06em]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>Sync Activo
                                </span>
                            </div>
                            <h1 className="text-base text-white font-bold truncate">Complejo Giovanni</h1>
                        </div>
                    </div>

                    {/* Acciones de Cabecera */}
                    <div className="flex items-center gap-1.5">
                        {/* Sound / Test Push */}
                        <button
                            className="h-9 px-2.5 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] border border-[rgba(255,255,255,0.08)] flex items-center gap-1 text-[#FBBF24] active:scale-95 transition-all text-xs font-bold"
                            onClick={() => {
                                playBeepKDS();
                                showPushToast('🔔 ¡TEST ALERTA!', 'Notificación de prueba con sonido y vibración');
                            }}
                            title="Probar Alerta Push"
                        >
                            <span className="material-symbols-outlined text-[18px]">volume_up</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] hidden sm:inline">ALERTA</span>
                        </button>

                        {/* Contador de llamados */}
                        <button
                            className="relative h-9 w-9 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white active:scale-95 transition-all"
                            title="Llamadas de Clientes"
                        >
                            <span className="material-symbols-outlined text-[19px] text-[#8B5CF6]">ring_volume</span>
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[9px] font-extrabold text-white ring-2 ring-[#0A0A0F]">
                                    {notifCount}
                                </span>
                            )}
                        </button>

                        {/* Mozo en Turno */}
                        <div className="h-9 px-2 rounded-xl bg-[#2a292f] border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5" title={`Mozo: ${mozo?.name || mozo?.nombre || 'Mozo'}`}>
                            <div className="w-6 h-6 rounded-lg bg-[#f59e0b] text-[#0A0A0F] flex items-center justify-center text-[11px] font-extrabold">{mozoInitials}</div>
                            <span className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-[0.06em] hidden xs:inline">{mozoFirstName}</span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center active:scale-95 transition-all border border-red-500/20"
                            title="Cerrar Sesión"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Outlet */}
            <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-24 bg-[#0A0A0F] min-h-screen">
                <Outlet context={{ showPushToast, playBeepKDS: playBeepKDS }} />
            </main>

            {/* BARRA NAVEGACIÓN INFERIOR PERSISTENTE */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-[rgba(18,23,34,0.85)] backdrop-blur-xl border-t border-[rgba(255,255,255,0.08)] shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
                <div className="grid grid-cols-4 items-center h-16 px-2">
                    <NavLink
                        to={`/${negocioId}/app/mozos/mesas`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${isActive ? 'text-[#FBBF24] font-bold' : 'text-[#94A3B8] hover:text-[#e4e1e9]'}`
                        }
                    >
                        <div className="w-9 h-6 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px]">grid_view</span>
                        </div>
                        <span className="text-[9px] tracking-[0.06em] uppercase font-extrabold truncate">Mis Mesas</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/dashboard`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${isActive ? 'text-[#FBBF24] font-bold' : 'text-[#94A3B8] hover:text-[#e4e1e9]'}`
                        }
                    >
                        <div className="w-9 h-6 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px]">edit_note</span>
                        </div>
                        <span className="text-[9px] tracking-[0.06em] uppercase font-extrabold truncate">Comandero</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/pedidos`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all relative ${isActive ? 'text-[#FBBF24] font-bold' : 'text-[#94A3B8] hover:text-[#e4e1e9]'}`
                        }
                    >
                        <div className="w-9 h-6 rounded-full flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-[22px]">outdoor_grill</span>
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
                            )}
                        </div>
                        <span className="text-[9px] tracking-[0.06em] uppercase font-extrabold truncate">KDS Cocina</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/cobrar`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${isActive ? 'text-[#FBBF24] font-bold' : 'text-[#94A3B8] hover:text-[#e4e1e9]'}`
                        }
                    >
                        <div className="w-9 h-6 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px]">payments</span>
                        </div>
                        <span className="text-[9px] tracking-[0.06em] uppercase font-extrabold truncate">Turno & Caja</span>
                    </NavLink>
                </div>
            </nav>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                ::-webkit-scrollbar { display: none; }
                * { scrollbar-width: none; -ms-overflow-style: none; }
                @keyframes pulse-fast {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.08); }
                }
                .animate-pulse-fast { animation: pulse-fast 1.4s ease-in-out infinite; }
            `}} />
        </div>
    );
}
