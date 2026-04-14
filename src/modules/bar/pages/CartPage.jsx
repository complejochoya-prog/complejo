import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
import { useConfig } from '../../../core/services/ConfigContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { submitOrder } from '../services/barService';
import { ArrowLeft, Send, UtensilsCrossed, ShoppingBag, Loader2, Plus } from 'lucide-react';
import { emit } from "@/core/events/eventBus";

export default function CartPage() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { cart, cartTotal, cartCount, updateQuantity, updateObservaciones, removeFromCart, clearCart } = useCart();
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

            const res = await submitOrder(negocioId, {
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
                tipo: orderType
            });
            if (res.success) {
                const newOrder = {
                    id: Date.now(),
                    items: mappedItems,
                    total: cartTotal,
                    status: 'nuevo',
                    estado: 'nuevo',
                    timestamp: Date.now(),
                    tipo: orderType,
                    mesa: mesaNumero,
                    cliente: clienteNombre || (orderType === 'Comer en el complejo' ? 'Mesa ' + mesaNumero : 'Cliente')
                };

                // 🔥 ENVÍA EL PEDIDO A TODO EL SISTEMA
                emit('pedido_creado', newOrder);

                clearCart();

                navigate(`/${negocioId}/app/pedido-confirmado`, {
                    state: { order: newOrder }
                });
            }
        } catch (error) {
            alert("Error al enviar el pedido.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-700">
                    <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-2">Tu carrito está vacío</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Parece que aún no has agregado nada del menú</p>
                <button 
                    onClick={() => navigate(`/${negocioId}/app/bar`)}
                    className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    Ver el Menú
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-40 animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <header className="px-5 pt-8 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 py-4 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 active:scale-95 text-slate-300">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black uppercase tracking-tighter italic text-white leading-none">Mi Carrito</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{config?.nombre || 'Complejo Giovanni'}</p>
                </div>
            </header>

            <div className="p-5 space-y-8">
                {/* Order Summary Card */}
                <OrderSummary total={cartTotal} count={cartCount} />

                {/* Items List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Productos seleccionados</h3>
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

                {/* Order Type Selector */}
                <section className="space-y-4">
                    <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-2 flex gap-2">
                        <UtensilsCrossed size={14} className="text-emerald-500" /> Tipo de Pedido
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['Comer en el complejo', 'Para llevar', 'Delivery'].map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    setOrderType(type);
                                    setFieldErrors({});
                                }}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                    orderType === type 
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xl shadow-emerald-500/20 scale-105' 
                                    : 'bg-slate-900 border-white/5 text-slate-400 opacity-60'
                                }`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest text-center`}>{type}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4">
                        {orderType === 'Comer en el complejo' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Número de Mesa <span className="text-red-500">*</span></label>
                                <input 
                                    type="number"
                                    value={mesaNumero}
                                    onChange={(e) => {
                                        setMesaNumero(e.target.value);
                                        if(e.target.value) setFieldErrors(prev => ({...prev, mesa: false}));
                                    }}
                                    placeholder="Ej: 12"
                                    className={`w-full bg-slate-900 border ${fieldErrors.mesa ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-white/5'} rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors`}
                                />
                                {fieldErrors.mesa && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">El número de mesa es obligatorio para esta opción</p>}
                            </div>
                        )}
                        {orderType === 'Para llevar' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tu Nombre (Opcional)</label>
                                <input 
                                    type="text"
                                    value={clienteNombre}
                                    onChange={(e) => setClienteNombre(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        )}
                        {orderType === 'Delivery' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre y Apellido <span className="text-emerald-500">*</span></label>
                                        <input 
                                            type="text"
                                            value={clienteNombre}
                                            onChange={(e) => {
                                                setClienteNombre(e.target.value);
                                                if(e.target.value) setFieldErrors(prev => ({...prev, nombre: false}));
                                            }}
                                            placeholder="Nombre completo"
                                            className={`w-full bg-slate-900 border ${fieldErrors.nombre ? 'border-red-500' : 'border-white/5'} rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Número de Teléfono <span className="text-emerald-500">*</span></label>
                                        <input 
                                            type="tel"
                                            value={clienteTelefono}
                                            onChange={(e) => {
                                                setClienteTelefono(e.target.value);
                                                if(e.target.value) setFieldErrors(prev => ({...prev, telefono: false}));
                                            }}
                                            placeholder="Ej: 11 2345-6789"
                                            className={`w-full bg-slate-900 border ${fieldErrors.telefono ? 'border-red-500' : 'border-white/5'} rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dirección de Entrega (Detallada) <span className="text-emerald-500">*</span></label>
                                    <textarea 
                                        rows="2"
                                        value={deliveryAddress}
                                        onChange={(e) => {
                                            setDeliveryAddress(e.target.value);
                                            if(e.target.value) setFieldErrors(prev => ({...prev, direccion: false}));
                                        }}
                                        placeholder="Calle, número, depto, timbre, entre calles..."
                                        className={`w-full bg-slate-900 border ${fieldErrors.direccion ? 'border-red-500' : 'border-white/5'} rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors resize-none`}
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                                        <span>Link de Ubicación (Opcional)</span>
                                        <span className="text-emerald-500/50">Google Maps / WhatsApp</span>
                                    </label>
                                    <input 
                                        type="url"
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        placeholder="Pega el link de tu ubicación aquí"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest ml-1 italic">* Esto ayudará al repartidor a encontrarte más rápido</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Action Bar elevated to not crash into bottom navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-5 pb-24 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-40">
                <div className="max-w-md mx-auto space-y-3">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate(`/${negocioId}/app/menu`)}
                            className="bg-slate-900 border border-white/10 text-slate-300 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-all shrink-0"
                            title="Agregar más productos"
                        >
                            <Plus size={24} />
                        </button>
                        
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="flex-1 bg-emerald-500 text-slate-950 h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-[13px] flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 hover:bg-emerald-400"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Send size={16} className="mb-0.5" />
                                    Confirmar Pedido
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Al confirmar, tu pedido aparecerá en la pantalla de cocina
                    </p>
                </div>
            </div>
        </div>
    );
}
