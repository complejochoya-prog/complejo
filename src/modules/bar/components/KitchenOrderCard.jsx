import React from 'react';
import { ChevronRight, CheckCircle2, Play, PackageCheck, AlertCircle } from 'lucide-react';
import OrderTimer from './OrderTimer';
import PrintTicketButton from './PrintTicketButton';

/**
 * KITCHEN ORDER CARD - VERSIÓN HARDENED v3.0
 * Implementa la Máquina de Estados para evitar saltos de flujo (Pendiente -> Preparando -> Listo).
 */
export default function KitchenOrderCard({ order, onStatusChange }) {
    // Definición de estados y transiciones permitidas
    const statusConfig = {
        nuevo: { 
            color: 'border-blue-500 bg-blue-500/5', 
            icon: Play, 
            btnText: 'Iniciar preparación',
            nextStatus: 'preparando',
            badge: 'PUESTO NUEVO',
            badgeColor: 'bg-blue-500',
            allowed: true
        },
        pendiente: { 
            color: 'border-slate-500 bg-slate-500/5', 
            icon: Play, 
            btnText: 'Verificar y Preparar',
            nextStatus: 'preparando',
            badge: 'PENDIENTE',
            badgeColor: 'bg-slate-500',
            allowed: true
        },
        preparando: { 
            color: 'border-orange-500 bg-orange-500/10', 
            icon: CheckCircle2, 
            btnText: 'Finalizar Cocina',
            nextStatus: order.tipo === 'Delivery' ? 'listo_para_salir' : 'listo',
            badge: 'EN FOGONES',
            badgeColor: 'bg-orange-500',
            allowed: true
        },
        listo: { 
            color: 'border-emerald-500 bg-emerald-500/5', 
            icon: PackageCheck, 
            btnText: 'Marcar Entregado',
            nextStatus: 'entregado',
            badge: 'LISTO EN BARRA',
            badgeColor: 'bg-emerald-500',
            allowed: true
        },
        listo_para_salir: {
            color: 'border-cyan-500 bg-cyan-500/5',
            icon: PackageCheck,
            btnText: 'Despachar Delivery',
            nextStatus: 'en_camino',
            badge: 'LISTO PARA SALIR',
            badgeColor: 'bg-cyan-500',
            allowed: true
        }
    };

    const currentStatus = order.status || order.estado || 'nuevo';
    const config = statusConfig[currentStatus];
    
    // Si el estado no está en el mapa, o es un estado final, ocultamos el botón
    if (!config) return null;

    const Icon = config.icon;

    // Lógica visual: No permitimos saltar de 'nuevo' o 'pendiente' a 'listo' directamente
    // (Esta lógica se aplica al botón de acción principal)
    
    return (
        <div className={`border-l-4 p-5 rounded-[24px] shadow-2xl transition-all ${config.color} animate-in slide-in-from-bottom-4 border-r border-white/5`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full ${config.badgeColor} shadow-lg shadow-black/20`}>
                            {config.badge}
                        </span>
                        {/* Indicador visual de bloqueo si el pedido es muy viejo */}
                        {currentStatus === 'nuevo' && (
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 group">
                                <AlertCircle size={10} className="text-blue-400" /> Requiere Inicio
                             </span>
                        )}
                    </div>

                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                        #{String(order.id).slice(-6)} 
                        <span className="text-[10px] not-italic text-slate-500 font-bold tracking-widest border-l border-white/10 pl-2">
                            {order.tipo === 'Delivery' ? 'DELIVERY' : order.tipo === 'Para llevar' ? 'TAKEAWAY' : `MESA ${order.mesa}`}
                        </span>
                    </h4>

                    {order.cliente && order.cliente !== "Cliente" && (
                        <div className="space-y-0.5 mt-2 bg-black/20 p-2 rounded-xl border border-white/5">
                            <p className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5 leading-none">
                                <span className="text-emerald-500 font-black uppercase text-[7px] tracking-tighter">CLIENTE:</span> {order.cliente}
                            </p>
                            {order.direccion && (
                                <p className="text-[9px] text-orange-400 font-black uppercase italic mt-1 leading-tight">
                                    📍 {order.direccion}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <PrintTicketButton order={order} />
                </div>
            </div>

            {/* Listado de Productos con checkboxes visuales */}
            <div className="space-y-2 mb-6">
                {(order.items || order.productos || []).map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                        <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center text-emerald-500 bg-white/5">
                             <CheckCircle2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white leading-none tracking-tight">
                                    {item.cantidad || item.quantity}x {item.nombre}
                                </span>
                            </div>
                            {item.observaciones && (
                                <p className="text-[9px] text-slate-400 mt-1 italic font-bold leading-none uppercase tracking-widest">
                                    ⚠️ {item.observaciones}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer de acción con Máquina de Estados */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Cronómetro Cocina</span>
                    <OrderTimer 
                        startTime={order.timestamp} 
                        label=""
                        active={!['entregado', 'pagado', 'listo', 'listo_para_salir'].includes(currentStatus)} 
                    />
                </div>
                
                <button 
                    onClick={() => onStatusChange(order.id, config.nextStatus)}
                    className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-slate-950 shadow-2xl overflow-hidden ${config.badgeColor} hover:brightness-110`}
                >
                    <Icon size={14} className="group-hover:translate-x-1 transition-transform" />
                    {config.btnText}
                </button>
            </div>
        </div>
    );
}
