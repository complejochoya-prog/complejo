import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
    X, 
    Sparkles, 
    Trophy, 
    Utensils, 
    Calendar, 
    Tag, 
    ArrowRight, 
    Flame, 
    Clock, 
    Bell,
    CheckCircle2,
    ShoppingCart
} from 'lucide-react';
import { notificacionesService, DEFAULT_NOTIFICACIONES, isNotifVigente } from '../core/services/notificacionesService';
import { useConfig } from '../core/services/ConfigContext';
import { useCart } from '../modules/bar/hooks/useCart.jsx';

export default function NotificationPopupOverlay() {
    const location = useLocation();
    const navigate = useNavigate();
    const { negocioId: paramsNegocioId } = useParams();
    const { negocioId: configNegocioId } = useConfig();
    const negocioId = paramsNegocioId || configNegocioId || 'giovanni';
    
    // Cart para agregar productos promo directamente
    let cartContext = null;
    try { cartContext = useCart(); } catch (e) { /* fuera de CartProvider */ }
    const addToCart = cartContext?.addToCart;
    
    const [addedToCart, setAddedToCart] = useState(false);

    const [notificaciones, setNotificaciones] = useState(DEFAULT_NOTIFICACIONES);
    const [currentNotif, setCurrentNotif] = useState(null);
    const [progress, setProgress] = useState(100);
    const [dismissedIds, setDismissedIds] = useState(new Set());
    const timerRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Suscribirse a las notificaciones de Firebase
    useEffect(() => {
        const unsub = notificacionesService.subscribeNotificaciones(
            negocioId,
            (data) => setNotificaciones(data || DEFAULT_NOTIFICACIONES),
            (err) => setNotificaciones(DEFAULT_NOTIFICACIONES)
        );
        return () => unsub();
    }, [negocioId]);

    // Evaluar si una notificación aplica al momento y lugar actual
    const checkNotificationMatch = (notif, path) => {
        if (!notif || !notif.activa) return false;

        // 1. Verificar vigencia (día + horario) usando helper compartido
        if (!isNotifVigente(notif)) return false;

        // 2. Espacio / Ruta
        const p = path.toLowerCase();
        const espacio = (notif.espacio || 'todos').toLowerCase();
        let matchEspacio = false;
        
        if (espacio === 'todos' || espacio === 'global') {
            matchEspacio = true;
        } else if (espacio === 'bar') {
            matchEspacio = p.includes('menu') || p.includes('bar') || p.includes('carrito');
        } else if (espacio === 'reservas') {
            matchEspacio = p.includes('reserva') || p.includes('turnos');
        } else if (espacio === 'torneos') {
            matchEspacio = p.includes('torneo');
        } else if (espacio === 'escuela') {
            matchEspacio = p.includes('escuela');
        }

        return matchEspacio;
    };

    // Cuando cambia la ruta o las notificaciones, buscar la notificación aplicable
    useEffect(() => {
        // No mostrar en panel de administración o páginas de tv
        if (location.pathname.includes('/admin') || location.pathname.includes('/pantalla')) {
            setCurrentNotif(null);
            return;
        }

        const match = notificaciones.find(n => 
            !dismissedIds.has(n.id) && checkNotificationMatch(n, location.pathname)
        );

        if (match) {
            // Iniciar notificación
            setCurrentNotif(match);
            setProgress(100);

            const durationSec = Number(match.duracion) || 5;
            const durationMs = durationSec * 1000;
            const stepMs = 50;
            const stepPercent = (stepMs / durationMs) * 100;

            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

            // Barra de progreso
            progressIntervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev <= 0) {
                        clearInterval(progressIntervalRef.current);
                        return 0;
                    }
                    return prev - stepPercent;
                });
            }, stepMs);

            // Cierre automático al finalizar duración (3 a 5 seg)
            timerRef.current = setTimeout(() => {
                handleClose(match.id);
            }, durationMs);

        } else {
            setCurrentNotif(null);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [location.pathname, notificaciones, dismissedIds]);

    const handleClose = (notifId) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setDismissedIds(prev => new Set(prev).add(notifId));
        setCurrentNotif(null);
    };

    const handleActionClick = (notif) => {
        handleClose(notif.id);
        
        // Para promos de bar con promoItem: agregar al carrito automáticamente
        if (notif.espacio === 'bar' && notif.promoItem && addToCart) {
            const promoProduct = {
                id: `promo-${notif.id}`,
                nombre: notif.promoItem.nombre || notif.titulo,
                descripcion: notif.promoItem.descripcion || notif.mensaje,
                precio: Number(notif.promoItem.precio) || 0,
                precioOriginal: Number(notif.promoItem.precioOriginal) || 0,
                categoria: '🔥 Promo',
                img: notif.promoItem.img || '',
                isPromo: true,
                promoBadge: notif.badge
            };
            addToCart(promoProduct);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
        
        // Navegar al espacio correspondiente
        if (notif.link) {
            const targetUrl = notif.link.startsWith('/') 
                ? `/${negocioId}${notif.link}` 
                : `/${negocioId}/${notif.link}`;
            navigate(targetUrl);
        }
    };

    if (!currentNotif) return null;

    const colorConfig = {
        amber: {
            border: 'border-amber-500/40',
            bgGradient: 'from-slate-900/95 via-slate-900/90 to-amber-950/40',
            badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
            buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
            glow: 'bg-amber-500/15',
            icon: Sparkles
        },
        emerald: {
            border: 'border-emerald-500/40',
            bgGradient: 'from-slate-900/95 via-slate-900/90 to-emerald-950/40',
            badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
            progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
            buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
            glow: 'bg-emerald-500/15',
            icon: Tag
        },
        indigo: {
            border: 'border-indigo-500/40',
            bgGradient: 'from-slate-900/95 via-slate-900/90 to-indigo-950/40',
            badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
            progressBar: 'bg-gradient-to-r from-indigo-500 to-violet-400',
            buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
            glow: 'bg-indigo-500/15',
            icon: Trophy
        },
        rose: {
            border: 'border-rose-500/40',
            bgGradient: 'from-slate-900/95 via-slate-900/90 to-rose-950/40',
            badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
            progressBar: 'bg-gradient-to-r from-rose-500 to-red-400',
            buttonBg: 'bg-rose-500 hover:bg-rose-400 text-white',
            glow: 'bg-rose-500/15',
            icon: Flame
        }
    };

    const theme = colorConfig[currentNotif.tema] || colorConfig.amber;
    const IconComponent = theme.icon;

    return (
        <aside 
            role="region" 
            aria-label="Notificación de promoción activa"
            className="fixed bottom-6 right-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[420px] animate-in slide-in-from-bottom-6 duration-500 ease-out"
        >
            <div className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} border ${theme.border} rounded-[32px] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl`}>
                
                {/* Glow ambiental */}
                <div className={`absolute top-0 right-0 w-36 h-36 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />

                {/* Header de la notificación emergente */}
                <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${theme.badgeBg}`}>
                            <IconComponent size={12} className="animate-pulse" />
                            {currentNotif.badge || 'PROMOCIÓN EXCLUSIVA'}
                        </span>
                    </div>

                    <button
                        onClick={() => handleClose(currentNotif.id)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 border border-white/10"
                        title="Cerrar notificación"
                        aria-label="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="space-y-2 relative z-10">
                    <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter text-white leading-tight">
                        {currentNotif.titulo}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {currentNotif.mensaje}
                    </p>
                </div>

                {/* Horario & Acción */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                    {currentNotif.horaDesde && currentNotif.horaHasta ? (
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
                            <Clock size={11} className="text-amber-400" />
                            <span>{currentNotif.horaDesde} a {currentNotif.horaHasta} hs</span>
                        </div>
                    ) : (
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            ¡Aprovechá ahora!
                        </span>
                    )}

                    <div className="flex items-center gap-2">
                        {currentNotif.link && (
                            <button
                                onClick={() => handleActionClick(currentNotif)}
                                className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${theme.buttonBg}`}
                            >
                                {addedToCart ? (
                                    <><CheckCircle2 size={13} /> <span>¡Agregado!</span></>
                                ) : (
                                    <>
                                        {currentNotif.espacio === 'bar' && currentNotif.promoItem ? (
                                            <><ShoppingCart size={13} /> <span>{currentNotif.linkTexto || 'Agregar al Pedido'}</span></>
                                        ) : (
                                            <><span>{currentNotif.linkTexto || 'Ver Ahora'}</span> <ArrowRight size={13} /></>
                                        )}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Barra de cuenta regresiva (3 a 5 seg) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                    <div 
                        className={`h-full ${theme.progressBar} transition-all duration-75 ease-linear`} 
                        style={{ width: `${progress}%` }}
                    />
                </div>

            </div>
        </aside>
    );
}
