import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';
import {
    BellRing,
    Volume2,
    LogOut,
    LayoutGrid,
    FileText,
    Flame,
    Wallet,
    X,
    Activity,
    Bell
} from 'lucide-react';

// WebAudio KDS bell synthesizer
let _audioCtx = null;
export function playBeepKDS() {
    try {
        if (!_audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) _audioCtx = new AudioContextClass();
        }
        if (_audioCtx && _audioCtx.state === 'suspended') {
            _audioCtx.resume();
        }
        if (_audioCtx) {
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
        }
    } catch {
        /* WebAudio safe fallback */
    }
    if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200]); } catch { /* */ }
    }
}

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders } = useConfig();
    const [mozo, setMozo] = useState(() => {
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
        } else {
            setMozo(session);
        }
    }, [negocioId, navigate]);

    const handleLogout = () => {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(50); } catch { /* */ }
        }
        logoutMozo();
        setMozo(null);
        navigate(`/${negocioId}/app/mozos/login`);
    };

    const lastNotifiedRef = useRef(new Set());

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
    }, [orders, mozo, showPushToast]);

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
        <div className="min-h-screen bg-[#0A0A0F] text-[#e4e1e9] flex flex-col selection:bg-[#f59e0b] selection:text-black notranslate" translate="no" style={{ fontFamily: "'Manrope', sans-serif" }}>
            
            {/* PUSH TOAST FLOTANTE */}
            <div className={`fixed top-4 inset-x-0 z-[60] flex justify-center px-3 transition-all duration-300 transform pointer-events-none ${toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-28 opacity-0'}`}>
                <div className="w-full max-w-xl bg-[#1A202E]/95 border-2 border-[#FBBF24] text-white rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-between gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl bg-[#FBBF24] text-[#0A0A0F] flex items-center justify-center shrink-0 shadow-md">
                        <BellRing size={22} className="stroke-[2.5]" />
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
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* HEADER FIJO PWA */}
            <header className="fixed top-0 inset-x-0 z-40 bg-[rgba(18,23,34,0.92)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between gap-2">
                    {/* Info Local & Sync */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex items-center justify-center shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-[#1f1f25] flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[#FBBF24]">
                                <Activity size={20} className="stroke-[2.5]" />
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
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Sound / Test Push */}
                        <button
                            className="h-9 px-2.5 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] border border-[rgba(255,255,255,0.08)] flex items-center gap-1 text-[#FBBF24] active:scale-95 transition-all text-xs font-bold"
                            onClick={() => {
                                playBeepKDS();
                                showPushToast('🔔 ¡TEST ALERTA!', 'Notificación de prueba con sonido y vibración');
                            }}
                            title="Probar Alerta Push"
                        >
                            <Volume2 size={16} />
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] hidden sm:inline">ALERTA</span>
                        </button>

                        {/* Contador de llamados */}
                        <NavLink
                            to={`/${negocioId}/app/mozos/pedidos`}
                            className="relative h-9 w-9 rounded-xl bg-[#1f1f25] hover:bg-[#2a292f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#8B5CF6] active:scale-95 transition-all"
                            title="Llamadas y KDS"
                        >
                            <Bell size={18} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[9px] font-extrabold text-white ring-2 ring-[#0A0A0F]">
                                    {notifCount}
                                </span>
                            )}
                        </NavLink>

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
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Outlet */}
            <main className="flex-1 w-full max-w-2xl mx-auto pt-20 pb-24 bg-[#0A0A0F] min-h-screen px-3">
                <Outlet context={{ showPushToast, playBeepKDS }} />
            </main>

            {/* BARRA NAVEGACIÓN INFERIOR PERSISTENTE */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-[rgba(18,23,34,0.92)] backdrop-blur-xl border-t border-[rgba(255,255,255,0.08)] shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
                <div className="max-w-2xl mx-auto grid grid-cols-4 items-center h-16 px-2">
                    <NavLink
                        to={`/${negocioId}/app/mozos/mesas`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${isActive ? 'text-[#FBBF24] font-bold' : 'text-[#94A3B8] hover:text-[#e4e1e9]'}`
                        }
                    >
                        <div className="w-9 h-6 rounded-full flex items-center justify-center">
                            <LayoutGrid size={20} />
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
                            <FileText size={20} />
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
                            <Flame size={20} />
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
                            <Wallet size={20} />
                        </div>
                        <span className="text-[9px] tracking-[0.06em] uppercase font-extrabold truncate">Turno & Caja</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
