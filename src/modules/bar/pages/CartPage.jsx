import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../services/PedidosContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { submitOrder } from '../services/barService';
import { ArrowLeft, Send, UtensilsCrossed, ShoppingBag, Loader2, Plus, Zap, MapPin, Phone, User, Landmark } from 'lucide-react';
import { emit } from "@/core/events/eventBus";

export default function CartPage() {
    const navigate = useNavigate();
    const { negocioId: configNegocioId, config } = useConfig();
    const { negocioId: paramsNegocioId } = useParams();
    const negocioId = paramsNegocioId || configNegocioId;

    const { cart, cartTotal, cartCount, updateQuantity, updateObservaciones, removeFromCart, clearCart } = useCart();
    const { addOrder } = usePedidos();
    
    const [loading, setLoading] = useState(false);
    const [orderType, setOrderType] = useState('Comer en el complejo');
    const [mesaNumero, setMesaNumero] = useState('');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    
    const [fieldErrors, setFieldErrors] = useState({});

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        
        const errors = {};
        if (orderType === 'Comer en el complejo' && !mesaNumero.trim()) {
            errors.mesa = true;
        }

        if (orderType === 'Delivery') {
            if (!clienteNombre.trim()) errors.nombre = true;
            if (!clienteTelefono.trim()) errors.telefono = true;
            if (!deliveryAddress.trim()) errors.direccion = true;
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            alert("Por favor completa los campos obligatorios");
            return;
        }
        
        setFieldErrors({});
        setLoading(true);
        try {
            const mappedItems = cart.map(item => ({
                id: item.id,
                nombre: item.nombre,
                cantidad: item.quantity,
                precio: item.precio,
                observaciones: item.observaciones
            }));

            const orderPayload = {
                items: mappedItems,
                total: cartTotal,
                type: orderType,
                cliente: clienteNombre || (orderType === 'Comer en el complejo' ? 'Mesa ' + mesaNumero : 'Cliente'),
                telefono: clienteTelefono,
                direccion: deliveryAddress,
                ubicacionLink: deliveryLocation,
                mesa: mesaNumero,
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
                const finalOrder = {
                    ...orderPayload,
                    id: fbRes.orderId,
                    timestamp: Date.now()
                };

                clearCart();
                navigate(`/${negocioId}/app/pedido-confirmado`, {
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
                        onClick={() => navigate(`/${negocioId}/app/menu`)}
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
                                { id: 'Comer en el complejo', icon: Landmark, label: 'Lugar' },
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
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative group">
                                         <label className="absolute -top-2.5 left-5 bg-slate-950 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Mesa</label>
                                         <input 
                                            type="number"
                                            value={mesaNumero}
                                            onChange={(e) => { setMesaNumero(e.target.value); if(e.target.value) setFieldErrors(prev => ({...prev, mesa: false})); }}
                                            placeholder="NÚMERO DE MESA..."
                                            className={`w-full bg-slate-950 border ${fieldErrors.mesa ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl p-5 text-white text-xl font-black focus:outline-none focus:border-emerald-500 shadow-inner transition-all placeholder:text-slate-900`}
                                        />
                                    </div>
                                    {fieldErrors.mesa && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest px-4 italic">Indica el número de mesa para que podamos servirte</p>}
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
                        disabled={loading}
                        className="flex-1 group relative h-16 rounded-[24px] overflow-hidden shadow-2xl transition-all active:scale-95 disabled:opacity-30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:scale-105 transition-transform" />
                        <div className="relative h-full flex items-center justify-center gap-4 text-slate-950">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <span className="text-[14px] font-black uppercase tracking-[0.2em] italic">Confirmar Pedido</span>
                                    <Send size={20} className="stroke-[2.5px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
