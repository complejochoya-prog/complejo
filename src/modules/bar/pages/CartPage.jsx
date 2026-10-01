import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../services/PedidosContext';
import { useMesas } from '../services/MesasContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { submitOrder } from '../services/barService';
import { 
    ArrowLeft, 
    Send, 
    UtensilsCrossed, 
    ShoppingBag, 
    Loader2, 
    Plus, 
    Zap, 
    MapPin, 
    Phone, 
    User, 
    Landmark,
    CheckCircle2,
    AlertCircle,
    XCircle,
    PlusCircle,
    Layers
} from 'lucide-react';
import { emit } from "@/core/events/eventBus";

export default function CartPage() {
    const navigate = useNavigate();
    const { negocioId: configNegocioId, config, tables: configTables } = useConfig();
    const { negocioId: paramsNegocioId } = useParams();
    const negocioId = paramsNegocioId || configNegocioId;

    const { cart, cartTotal, cartCount, updateQuantity, updateObservaciones, removeFromCart, clearCart } = useCart();
    const { orders, addOrder } = usePedidos();
    const { mesas, marcarMesaOcupada } = useMesas();
    
    const [loading, setLoading] = useState(false);
    const [orderType, setOrderType] = useState('Comer en el complejo');
    const [mesaNumero, setMesaNumero] = useState('');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    
    const [fieldErrors, setFieldErrors] = useState({});

    // Sincronización exacta con las mesas del Bar (/bar)
    const tables = useMemo(() => {
        const staticTables = (configTables && configTables.length > 0) 
            ? configTables 
            : Array.from({ length: 12 }, (_, i) => ({ tableNumber: i + 1, status: 'disponible' }));
            
        return staticTables.map(st => {
            const currentOrders = (orders || []).filter(o => 
                (String(o.table) === String(st.tableNumber) || String(o.mesa) === String(st.tableNumber)) && 
                o.status !== 'paid' && 
                o.status !== 'cancelado'
            );
            const liveMesa = (mesas || []).find(m => String(m.numero) === String(st.tableNumber));
            const baseStatus = liveMesa?.estado || st.status || 'disponible';
            
            const currentTotal = currentOrders.reduce((acc, o) => acc + (o.total || (o.price * (o.quantity || 1)) || 0), 0);
            const hasActiveOrders = currentOrders.length > 0;
            const isOccupied = hasActiveOrders || baseStatus === 'ocupada' || baseStatus === 'atendiendo' || baseStatus === 'reservada';
            const isCleaning = baseStatus === 'limpiando' || baseStatus === 'limpieza';
            
            const finalStatus = isOccupied ? 'ocupada' : isCleaning ? 'limpiando' : (baseStatus === 'disponible' || baseStatus === 'libre' ? 'disponible' : baseStatus);

            return {
                ...st,
                status: finalStatus,
                isAvailable: finalStatus === 'disponible' || finalStatus === 'libre',
                hasActiveOrders,
                currentOrders,
                currentTotal
            };
        });
    }, [configTables, orders, mesas]);

    // Comprobación de estado y disponibilidad de la mesa ingresada
    const mesaStatusCheck = useMemo(() => {
        if (!mesaNumero || !String(mesaNumero).trim()) return null;
        const num = String(mesaNumero).trim();
        const found = tables.find(t => String(t.tableNumber) === String(num));
        
        if (!found) {
            return {
                valid: false,
                exists: false,
                type: 'error',
                message: `La mesa #${num} no existe en el bar`
            };
        }

        if (found.hasActiveOrders || found.status === 'ocupada' || found.status === 'atendiendo') {
            return {
                valid: true,
                exists: true,
                isAdditional: true,
                status: 'ocupada',
                type: 'active_table',
                currentTotal: found.currentTotal,
                ordersCount: found.currentOrders.length,
                message: `Mesa #${num} con consumo activo. Este pedido se sumará como adicional a la cuenta de la mesa.`
            };
        }

        if (found.status === 'limpiando') {
            return {
                valid: true,
                exists: true,
                isAdditional: false,
                status: 'limpiando',
                type: 'warning',
                message: `Mesa #${num} en limpieza. Se procesará el pedido para tu llegada.`
            };
        }

        return {
            valid: true,
            exists: true,
            isAdditional: false,
            status: 'disponible',
            type: 'free_table',
            message: `Mesa #${num} libre. Mesa disponible para nuevo pedido.`
        };
    }, [mesaNumero, tables]);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        
        const errors = {};
        if (orderType === 'Comer en el complejo') {
            if (!mesaNumero || !String(mesaNumero).trim()) {
                errors.mesa = 'Indica el número de mesa para que podamos servirte';
            } else if (mesaStatusCheck && !mesaStatusCheck.valid) {
                errors.mesa = mesaStatusCheck.message;
            }
        }

        if (orderType === 'Delivery') {
            if (!clienteNombre.trim()) errors.nombre = true;
            if (!clienteTelefono.trim()) errors.telefono = true;
            if (!deliveryAddress.trim()) errors.direccion = true;
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            if (errors.mesa && mesaStatusCheck && !mesaStatusCheck.valid) {
                alert(`Mesa no válida: ${mesaStatusCheck.message}`);
            } else {
                alert("Por favor completa los campos requeridos correctamente.");
            }
            return;
        }
        
        setFieldErrors({});
        setLoading(true);
        try {
            const mappedItems = cart.map(item => ({
                id: item.id,
                nombre: item.nombre,
                cantidad: item.quantity,
                precio: Number(item.precio) || 0,
                observaciones: item.observaciones
            }));

            const isAdditionalOrder = mesaStatusCheck?.isAdditional;

            const orderPayload = {
                items: mappedItems,
                total: cartTotal,
                type: orderType,
                cliente: clienteNombre || (orderType === 'Comer en el complejo' ? `Mesa ${mesaNumero}${isAdditionalOrder ? ' (Adicional)' : ''}` : 'Cliente'),
                telefono: clienteTelefono,
                direccion: deliveryAddress,
                ubicacionLink: deliveryLocation,
                mesa: mesaNumero,
                table: mesaNumero, // Agregado para compatibilidad con el resto del sistema
                isAdditional: isAdditionalOrder || false,
                estado: 'nuevo',
                status: 'nuevo',
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tipo: orderType,
                createdAt: new Date().toISOString()
            };

            // 1. Guardar en Firestore
            const fbRes = await addOrder(orderPayload);
            
            // 2. Legacy Notify
            try {
                await submitOrder(negocioId, orderPayload);
            } catch (e) {
                console.warn("[CartPage] Legacy API failed.");
            }

            if (fbRes.success) {
                if (orderType === 'Comer en el complejo' && mesaNumero) {
                    marcarMesaOcupada(mesaNumero);
                }
                const finalOrder = {
                    ...orderPayload,
                    id: fbRes.orderId,
                    timestamp: Date.now()
                };

                clearCart();
                navigate(`/${negocioId}/pedido-confirmado`, {
                    state: { order: finalOrder }
                });
            } else {
                throw new Error("Error saving to Firestore");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Error al enviar el pedido.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-emerald-500/5 to-transparent" />
                </div>
                <div className="relative z-10 space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto text-slate-700 border border-white/5 shadow-2xl">
                        <ShoppingBag size={48} className="opacity-20" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">CARRITO <span className="text-slate-700">VACÍO</span></h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs mx-auto">Tu selección está esperando. Vuelve al menú para elegir algo delicioso.</p>
                    </div>
                    <button 
                        onClick={() => navigate(window.location.pathname.includes('/app/') ? `/${negocioId}/app/menu` : `/${negocioId}/menu`)}
                        className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                    >
                        Explorar Menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-44 relative overflow-x-hidden">
            
            {/* ── Background Magic ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/5 to-transparent" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] brightness-150 contrast-150" />
            </div>

            <div className="relative z-10">
                {/* ── Header ── */}
                <header className="px-6 pt-10 pb-4 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5 flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 text-white transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">MI <span className="text-indigo-400">PEDIDO</span></h1>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">{config?.nombre || 'Complejo Giovanni'}</p>
                    </div>
                </header>

                <div className="p-5 space-y-10 max-w-[600px] mx-auto animate-in slide-in-from-bottom-6 duration-500">
                    {/* Summary Row */}
                    <OrderSummary total={cartTotal} count={cartCount} />

                    {/* Items Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <h3 className="text-[10px] items-center text-slate-500 font-black uppercase tracking-[0.4em] flex gap-3">
                                <Zap size={14} className="text-amber-500" /> Detalle de Selección
                             </h3>
                             <button onClick={() => navigate(`/${negocioId}/app/menu`)} className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:underline">+ Agregar Más</button>
                        </div>
                        <div className="space-y-3">
                            {cart.map(item => (
                                <CartItem 
                                    key={item.id} 
                                    item={item} 
                                    onUpdateQty={updateQuantity}
                                    onUpdateObs={updateObservaciones}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Logistics Section */}
                    <section className="space-y-6 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                                <UtensilsCrossed size={18} className="text-emerald-500" /> ¿Cómo prefieres recibirlo?
                            </h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Selecciona una modalidad para continuar</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'Comer en el complejo', icon: Landmark, label: 'En el Bar' },
                                { id: 'Para llevar', icon: ShoppingBag, label: 'Carry' },
                                { id: 'Delivery', icon: MapPin, label: 'Envío' }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setOrderType(type.id); setFieldErrors({}); }}
                                    className={`relative p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all ${
                                        orderType === type.id 
                                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_15px_30px_rgba(16,185,129,0.2)]' 
                                        : 'bg-slate-900/50 border-white/5 text-slate-500 opacity-60'
                                    }`}
                                >
                                    <type.icon size={20} className={orderType === type.id ? 'text-slate-950' : 'text-slate-700'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${orderType === type.id ? 'text-slate-950' : 'text-slate-600'}`}>{type.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 space-y-5">
                            {orderType === 'Comer en el complejo' && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    
                                    {/* Selector rápido de mesas */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Mesas del Bar
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    {tables.filter(t => t.isAvailable).length} Libres
                                                </span>
                                                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                    {tables.filter(t => !t.isAvailable).length} Ocupadas
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                                            {tables.map(t => {
                                                const isSelected = String(mesaNumero) === String(t.tableNumber);
                                                return (
                                                    <button
                                                        key={t.tableNumber}
                                                        type="button"
                                                        onClick={() => {
                                                            setMesaNumero(String(t.tableNumber));
                                                            setFieldErrors(prev => ({ ...prev, mesa: false }));
                                                        }}
                                                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 ${
                                                            isSelected
                                                                ? t.isAvailable
                                                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105'
                                                                    : 'bg-indigo-600 border-indigo-400 text-white font-black shadow-lg shadow-indigo-500/20 scale-105'
                                                                : t.isAvailable
                                                                    ? 'bg-slate-900/80 border-emerald-500/20 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800'
                                                                    : 'bg-slate-900/80 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/50 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-black">#{t.tableNumber}</span>
                                                        <span className={`text-[8px] font-bold tracking-tighter uppercase mt-0.5 ${
                                                            isSelected 
                                                                ? (t.isAvailable ? 'text-slate-950' : 'text-white') 
                                                                : (t.isAvailable ? 'text-emerald-400' : 'text-indigo-400')
                                                        }`}>
                                                            {t.isAvailable ? 'Libre' : 'Activa'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Input de número de mesa con validación en tiempo real */}
                                    <div className="space-y-3 pt-2">
                                        <div className="relative group">
                                            <label className="absolute -top-2.5 left-5 bg-slate-950 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                Número de Mesa Seleccionado
                                            </label>
                                            <input 
                                                type="number"
                                                value={mesaNumero}
                                                onChange={(e) => { 
                                                    setMesaNumero(e.target.value); 
                                                    setFieldErrors(prev => ({...prev, mesa: false})); 
                                                }}
                                                placeholder="NÚMERO DE MESA..."
                                                className={`w-full bg-slate-950 border ${
                                                    fieldErrors.mesa || (mesaStatusCheck && !mesaStatusCheck.valid) 
                                                        ? 'border-rose-500/60 focus:border-rose-500' 
                                                        : mesaStatusCheck?.type === 'active_table'
                                                        ? 'border-indigo-500/60 focus:border-indigo-500'
                                                        : mesaStatusCheck?.type === 'free_table'
                                                        ? 'border-emerald-500/60 focus:border-emerald-500' 
                                                        : 'border-white/10 focus:border-emerald-500'
                                                } rounded-2xl p-5 text-white text-xl font-black focus:outline-none shadow-inner transition-all placeholder:text-slate-900`}
                                            />
                                        </div>

                                        {/* Feedback visual de disponibilidad / pedido adicional */}
                                        {mesaStatusCheck && (
                                            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in duration-300 ${
                                                mesaStatusCheck.type === 'free_table'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                                    : mesaStatusCheck.type === 'active_table'
                                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                            }`}>
                                                {mesaStatusCheck.type === 'free_table' ? (
                                                    <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                                                ) : mesaStatusCheck.type === 'active_table' ? (
                                                    <PlusCircle size={22} className="text-indigo-400 shrink-0" />
                                                ) : (
                                                    <XCircle size={22} className="text-rose-400 shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                        {mesaStatusCheck.type === 'free_table' && 'Mesa libre — Nuevo pedido'}
                                                        {mesaStatusCheck.type === 'active_table' && 'Mesa activa — Agregar pedido adicional'}
                                                        {mesaStatusCheck.type === 'error' && 'Mesa no encontrada'}
                                                    </p>
                                                    <p className="text-[10px] font-semibold opacity-85 mt-0.5 leading-relaxed">
                                                        {mesaStatusCheck.message}
                                                    </p>
                                                    {mesaStatusCheck.type === 'active_table' && mesaStatusCheck.currentTotal > 0 && (
                                                        <p className="text-[9px] text-indigo-300/80 font-bold uppercase tracking-widest mt-1">
                                                            Consumo actual acumulado: ${mesaStatusCheck.currentTotal.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {fieldErrors.mesa && !mesaStatusCheck && (
                                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest px-4 italic flex items-center gap-1.5">
                                                <AlertCircle size={14} />
                                                {typeof fieldErrors.mesa === 'string' ? fieldErrors.mesa : 'Indica el número de mesa para que podamos servirte'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {orderType === 'Delivery' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative group">
                                             <User size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                             <input 
                                                type="text"
                                                value={clienteNombre}
                                                onChange={(e) => { setClienteNombre(e.target.value); if(e.target.value) setFieldErrors(prev => ({...prev, nombre: false})); }}
                                                placeholder="NOMBRE..."
                                                className={`w-full bg-slate-950 border ${fieldErrors.nombre ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-800`}
                                            />
                                        </div>
                                        <div className="relative group">
                                             <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                             <input 
                                                type="tel"
                                                value={clienteTelefono}
                                                onChange={(e) => { setClienteTelefono(e.target.value); if(e.target.value) setFieldErrors(prev => ({...prev, telefono: false})); }}
                                                placeholder="TELÉFONO..."
                                                className={`w-full bg-slate-950 border ${fieldErrors.telefono ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-800`}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                         <MapPin size={14} className="absolute left-5 top-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                         <textarea 
                                            rows="2"
                                            value={deliveryAddress}
                                            onChange={(e) => { setDeliveryAddress(e.target.value); if(e.target.value) setFieldErrors(prev => ({...prev, direccion: false})); }}
                                            placeholder="DIRECCIÓN Y ENTRECALLES..."
                                            className={`w-full bg-slate-950 border ${fieldErrors.direccion ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-800 resize-none`}
                                         ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* ── Fixed Magical Action Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-[60] flex justify-center pointer-events-none">
                <div className="w-full max-w-lg flex gap-3 pointer-events-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-white/5 border border-white/10 text-white w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl active:scale-95 transition-all shrink-0 hover:bg-white/10"
                    >
                        <Plus size={24} />
                    </button>
                    
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={loading || (orderType === 'Comer en el complejo' && mesaStatusCheck && !mesaStatusCheck.valid)}
                        className={`flex-1 group relative h-16 rounded-[24px] overflow-hidden shadow-2xl transition-all active:scale-95 ${
                            orderType === 'Comer en el complejo' && mesaStatusCheck && !mesaStatusCheck.valid
                                ? 'opacity-50 cursor-not-allowed'
                                : 'disabled:opacity-30'
                        }`}
                    >
                        <div className={`absolute inset-0 transition-transform ${
                            orderType === 'Comer en el complejo' && mesaStatusCheck && !mesaStatusCheck.valid
                                ? 'bg-slate-800'
                                : mesaStatusCheck?.isAdditional
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 group-hover:scale-105'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:scale-105'
                        }`} />
                        <div className={`relative h-full flex items-center justify-center gap-4 ${
                            mesaStatusCheck?.isAdditional ? 'text-white' : 'text-slate-950'
                        }`}>
                            {loading ? <Loader2 className="animate-spin text-white" size={24} /> : (
                                <>
                                    <span className={`text-[14px] font-black uppercase tracking-[0.2em] italic ${
                                        orderType === 'Comer en el complejo' && mesaStatusCheck && !mesaStatusCheck.valid
                                            ? 'text-slate-400'
                                            : mesaStatusCheck?.isAdditional
                                            ? 'text-white'
                                            : 'text-slate-950'
                                    }`}>
                                        {orderType === 'Comer en el complejo' && mesaStatusCheck && !mesaStatusCheck.valid
                                            ? 'Mesa Inexistente'
                                            : mesaStatusCheck?.isAdditional
                                            ? `Agregar a Mesa #${mesaNumero}`
                                            : mesaNumero
                                            ? `Confirmar (Mesa #${mesaNumero})`
                                            : 'Confirmar Pedido'}
                                    </span>
                                    {(!mesaStatusCheck || mesaStatusCheck.valid) && (
                                        <Send size={20} className="stroke-[2.5px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
