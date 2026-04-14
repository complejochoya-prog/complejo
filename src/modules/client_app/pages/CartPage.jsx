import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useConfig } from '../../../core/services/ConfigContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { submitOrder } from '../../bar/services/barService';
import { ArrowLeft, Send, UtensilsCrossed, ShoppingBag, Loader2 } from 'lucide-react';

export default function CartPage() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { cart, cartTotal, cartCount, updateQuantity, updateObservaciones, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderType, setOrderType] = useState('Comer en el complejo');

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        
        try {
            const orderData = {
                items: cart,
                total: cartTotal,
                type: orderType,
                estado: 'nuevo',
                cliente: orderType === 'Comer en el complejo' ? 'Cliente Local' : 'Cliente PWA',
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString()
            };
            
            const res = await submitOrder(negocioId, orderData);
            
            if (res.success) {
                clearCart();
                navigate(`/${negocioId}/app/pedido-confirmado`, { state: { order: orderData } });
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
                    <div className="grid grid-cols-2 gap-3">
                        {['Comer en el complejo', 'Para llevar'].map(type => (
                            <button
                                key={type}
                                onClick={() => setOrderType(type)}
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
                </section>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-40">
                <div className="max-w-md mx-auto">
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full bg-white text-slate-950 py-5 rounded-[24px] font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <Send size={18} />
                                Confirmar Pedido
                            </>
                        )}
                    </button>
                    <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-4">
                        Al confirmar, tu pedido aparecerá en la pantalla de cocina
                    </p>
                </div>
            </div>
        </div>
    );
}
