import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useConfig } from '../../../core/services/ConfigContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { submitOrder } from '../../bar/services/barService';
import { ArrowLeft, Send, UtensilsCrossed, ShoppingBag, Loader2, MapPin, Bike, Package, Info } from 'lucide-react';

export default function CartPage() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { cart, cartTotal, cartCount, updateQuantity, updateObservaciones, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    
    // Order Types: 'LOCAL' (Mesa), 'TAKEAWAY' (Para llevar), 'DELIVERY' (A domicilio)
    const [orderType, setOrderType] = useState('LOCAL');
    const [address, setAddress] = useState('');
    const [extraInfo, setExtraInfo] = useState('');

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (orderType === 'DELIVERY' && !address) {
            alert("Por favor ingresa una dirección para el delivery.");
            return;
        }
        
        setLoading(true);
        
        try {
            const orderData = {
                items: cart,
                total: cartTotal + (orderType === 'DELIVERY' ? 1000 : 0), // Mock delivery fee
                type: orderType,
                deliveryAddress: orderType === 'DELIVERY' ? address : null,
                deliveryNote: orderType === 'DELIVERY' ? extraInfo : null,
                estado: 'nuevo',
                cliente: 'Cliente PWA',
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString()
            };
            
            const res = await submitOrder(negocioId, orderData);
            
            if (res.success) {
                clearCart();
                navigate(`/${negocioId}/pedido-confirmado`, { state: { order: orderData } });
            }
        } catch (err) {
            console.error(err);
            alert("Error al enviar el pedido.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center relative z-10 text-slate-600 shadow-2xl">
                        <ShoppingBag size={48} />
                    </div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white mb-3">Tu carrito está vacío</h2>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] mb-10 max-w-[200px] leading-relaxed">
                    Parece que aún no has elegido nada delicioso
                </p>
                <button 
                    onClick={() => navigate(`/${negocioId}/app/bar`)}
                    className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-[28px] font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-emerald-500/30 active:scale-95 hover:scale-[1.05] transition-all"
                >
                    Ver el Menú
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pb-44 animate-in slide-in-from-right-8 duration-500 selection:bg-emerald-500/30">
            {/* Premium Header */}
            <header className="px-6 pt-10 pb-6 bg-[#020617]/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all text-slate-300">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">Mi Carrito</h1>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">Complejo Giovanni</p>
                    </div>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <ShoppingBag size={22} />
                </div>
            </header>

            <div className="p-6 space-y-10 max-w-lg mx-auto">
                {/* Order Summary Widget */}
                <OrderSummary total={cartTotal} count={cartCount} />

                {/* Items List */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Tu Selección</h3>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{cartCount} items</span>
                    </div>
                    <div className="space-y-4">
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
                </section>

                {/* Order Type & Address */}
                <section className="space-y-6">
                    <h3 className="text-[11px] items-center text-slate-400 font-black uppercase tracking-[0.4em] mb-4 flex gap-3 px-2">
                        <UtensilsCrossed size={14} className="text-emerald-500" /> Entrega
                    </h3>
                    
                    {/* Mode Selector */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'LOCAL', label: 'Mesa', icon: Package },
                            { id: 'TAKEAWAY', label: 'Retiro', icon: ShoppingBag },
                            { id: 'DELIVERY', label: 'Delivery', icon: Bike }
                        ].map(mode => {
                            const Icon = mode.icon;
                            const active = orderType === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setOrderType(mode.id)}
                                    className={`p-4 rounded-[28px] border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                                        active 
                                        ? 'bg-emerald-500 border-white/20 text-slate-950 shadow-2xl shadow-emerald-500/20 scale-105 z-10' 
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 opacity-70'
                                    }`}
                                >
                                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest text-center`}>{mode.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Delivery Details */}
                    {orderType === 'DELIVERY' && (
                        <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <MapPin size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="CALLE Y NÚMERO..." 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value.toUpperCase())}
                                    className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Info size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="DPTO, TIMBRE, INFO EXTRA..." 
                                    value={extraInfo}
                                    onChange={(e) => setExtraInfo(e.target.value.toUpperCase())}
                                    className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all text-white"
                                />
                            </div>
                            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Costo de Envío</span>
                                <span className="text-xs font-black text-emerald-400">$1.000</span>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Premium Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-50">
                <div className="max-w-lg mx-auto">
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full relative group"
                    >
                        <div className="absolute inset-0 bg-white blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="relative w-full bg-white text-slate-950 h-18 py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-[14px] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] hover:scale-[1.01] transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <Send size={20} className="stroke-[3px]" />
                                    Confirmar Pedido
                                </>
                            )}
                        </div>
                    </button>
                    <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest mt-6 bg-white/5 py-3 rounded-full border border-white/5 backdrop-blur-md">
                        Cocina recibe tu pedido al instante
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .h-18 { height: 4.5rem; }
            ` }} />
        </div>
    );
}
