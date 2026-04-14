import React, { useState } from 'react';
import { useConfig } from '../../core/hooks/useConfig';
import { usePedidos } from '../services/PedidosContext';
import {
    Search,
    Utensils,
    Beer,
    Wine,
    Star,
    Info,
    ShoppingBag,
    Cake,
    Plus,
    Minus,
    Send,
    X,
    UtensilsCrossed,
    Coffee
} from 'lucide-react';
import PromoCumpleModal from '../../promociones/components/PromoCumpleModal';

export default function DigitalMenu() {
    // Core config
    const { businessInfo, negocioId } = useConfig();
    const categoryOrder = ['Cafeteria', 'Licuados', 'Tortas', 'Bebidas', 'Cervezas', 'Carnes', 'Lomos', 'Burgers', 'Pizzas', 'Pastas', 'Ensaladas', 'Papas', 'Tacos', 'Tragos', 'Combos', 'Promos'];

    // Domain config
    const {
        barProducts,
        addOrder,
        isBarOpen,
        isKitchenOpen,
        getCurrentDiscount,
        categoryAvailability,
        promotions
    } = usePedidos();

    const [activeCategory, setActiveCategory] = useState('Promos');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // New Order Fields
    const [tableNumber, setTableNumber] = useState('');
    const [orderType, setOrderType] = useState('Local'); // 'Local' or 'Delivery'
    const [notes, setNotes] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('+54');

    // Combo Modal State
    const [selectedComboForModal, setSelectedComboForModal] = useState(null);

    const barOpen = isBarOpen();
    const kitchenOpen = isKitchenOpen();

    // Fullscreen block when bar is closed
    if (!barOpen) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center">
                <div className="size-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <Beer size={48} className="text-red-500" />
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-red-500 mb-3">
                    El bar se encuentra cerrado
                </h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md">
                    En este momento no estamos recibiendo pedidos. Por favor, volvé durante nuestro horario de atención.
                </p>
                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-3">Horarios habituales</p>
                    <div className="space-y-1 text-xs text-slate-400 font-bold">
                        <p>Bar: Horario de atención activo en el sistema</p>
                    </div>
                </div>
            </div>
        );
    }

    const iconMap = {
        'Cafeteria': Coffee,
        'Licuados': Wine,
        'Tortas': Cake,
        'Bebidas': Beer,
        'Cervezas': Beer,
        'Carnes': Utensils,
        'Lomos': Utensils,
        'Burgers': Utensils,
        'Pizzas': Utensils,
        'Pastas': UtensilsCrossed,
        'Ensaladas': Utensils,
        'Papas': Utensils,
        'Tacos': Utensils,
        'Tragos': Wine,
        'Combos': UtensilsCrossed,
        'Promos': Star
    };

    const categories = ['Promos', ...categoryOrder]
        .filter((item, index, self) => self.indexOf(item) === index)
        .filter(catId => catId === 'Promos' || categoryAvailability[catId] !== false)
        .map(catId => ({
            id: catId,
            icon: iconMap[catId] || Utensils
        }));

    const kitchenCategories = ['Platos', 'Postres', 'Cafeteria', 'Licuados', 'Tortas', 'Carnes', 'Lomos', 'Burgers', 'Pizzas', 'Pastas', 'Ensaladas', 'Papas', 'Tacos', 'Combos', 'Promos'];
    const isCategoryBlocked = !kitchenOpen && kitchenCategories.includes(activeCategory);

    const activePromationsAsProducts = promotions.filter(p => p.active).map(promo => ({
        id: promo.id,
        name: promo.name,
        desc: promo.desc || promo.description || '',
        price: promo.price,
        img: promo.img || promo.image || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2000&auto=format&fit=crop',
        category: 'Promos',
        disponible: true,
        activar_control_stock: false,
        stock_actual: 0,
        stock_minimo: 0,
        isPromo: true,
        comboItems: promo.comboItems,
        modo_evento: promo.modo_evento || ''
    }));

    const unifiedProducts = [...barProducts, ...activePromationsAsProducts];

    const filteredItems = unifiedProducts.filter(item =>
        String(item.category).toLowerCase() === String(activeCategory).toLowerCase() &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (item.category === 'Promos' || categoryAvailability[item.category] !== false)
    );

    const addToCart = (product, discount = 0) => {
        if (product.id === '3000' || product.id === '3001') {
            setSelectedComboForModal({ ...product, price: discount > 0 ? product.price * (1 - discount / 100) : product.price, discount });
            return;
        }

        if (product.disponible === false) {
            alert("⚠️ Este producto no se encuentra disponible en este momento");
            return;
        }
        const inCart = cart.find(item => item.id === product.id)?.quantity || 0;

        if (product.activar_control_stock && (product.stock_actual - inCart) <= 0) {
            alert("Disculpa, no queda más stock de este producto.");
            return;
        }

        const currentPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1, originalPrice: product.price, price: currentPrice, discount, note: '' }];
        });
    };

    const handleConfirmCombo = (selectedItems) => {
        const comboRecord = {
            ...selectedComboForModal,
            quantity: 1,
            isPromo: true,
            comboItems: selectedItems.map(item => ({
                id: item.id,
                name: `-> ${item.name} (Combo)`,
                quantity: item.quantity,
                price: 0,
                category: item.category
            })),
            modo_evento: selectedComboForModal.modo_evento || ''
        };

        setCart(prev => {
            const existing = prev.find(item => item.id === comboRecord.id);
            if (existing) {
                return prev.map(item => item.id === comboRecord.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, comboRecord];
        });
        setSelectedComboForModal(null);
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing.quantity > 1) {
                return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        if (!tableNumber && orderType === 'Local') {
            alert('Por favor, indica tu número de mesa');
            return;
        }

        if (!clientName && orderType === 'Delivery') {
            alert('Por favor, indica tu nombre para el delivery');
            return;
        }

        if (orderType === 'Delivery') {
            if (!clientPhone || !clientPhone.startsWith('+54') || clientPhone.length < 10) {
                alert('Por favor, ingresa un teléfono válido que comience con +54');
                return;
            }
        }

        const orderData = {
            items: cart.map(item => ({ 
                id: item.id, 
                name: item.name, 
                quantity: item.quantity, 
                price: item.price,
                isPromo: item.isPromo || false,
                comboItems: item.comboItems || []
            })),
            total: cartTotal,
            tableNumber: orderType === 'Local' ? tableNumber : 'N/A',
            clientName: orderType === 'Delivery' ? clientName : '',
            clientPhone: orderType === 'Delivery' ? clientPhone : '',
            type: orderType,
            notes: notes,
            origin: 'online',
        };

        try {
            // 1. Sync with Kitchen (Firebase)
            await addOrder(orderData);

            // 2. Format WhatsApp Message
            const message = `*Nuevo Pedido - ${businessInfo?.nombre || 'Complejo Giovanni'}*\n` +
                `📍 Tipo: ${orderType === 'Local' ? '🍽 Comer en el lugar' : '🛵 Delivery'}\n` +
                `${orderType === 'Local' ? `🪑 Mesa: ${tableNumber}\n` : `👤 Cliente: ${clientName}\n📞 Tel: ${clientPhone}\n`}` +
                `📝 Notas: ${notes || 'Sin observaciones'}\n\n` +
                cart.map(item => `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString()})`).join('\n') +
                `\n\n*Total: $${cartTotal.toLocaleString()}*` +
                `\n\n_Pedido enviado a Cocina. Por favor, confírmenme por aquí también._`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${businessInfo?.whatsapp}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            // 3. Clear State
            setCart([]);
            setTableNumber('');
            setNotes('');
            setClientName('');
            setClientPhone('+54');
            setIsCartOpen(false);
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("No se pudo enviar el pedido. Por favor intenta nuevamente.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-40 font-inter">
            <header className="px-6 py-8 space-y-4 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{businessInfo?.nombre?.split(' ')[0] || 'MENÚ'} <span className="text-gold">DIGITAL</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bar & Night Leisure</p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <ShoppingBag size={20} className="text-gold" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-4 bg-gold text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar plato o trago..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap ${isActive
                                    ? 'bg-gold border-gold text-slate-950 shadow-lg shadow-gold/20'
                                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{cat.id}</span>
                            </button>
                        )
                    })}
                </div>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-6">
                {!kitchenOpen && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
                        <div className="size-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-orange-400 uppercase italic tracking-tighter">Cocina cerrada</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Solo Bebidas y Tragos disponibles.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map(item => {
                        const inCart = cart.find(c => c.id === item.id)?.quantity || 0;
                        const isOutOfStock = item.disponible === false || (item.activar_control_stock && item.stock_actual <= 0);
                        const hasLimitedStock = item.activar_control_stock && (item.stock_actual - inCart) <= 0;
                        const discount = getCurrentDiscount(item);
                        const currentPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;

                        return (
                            <div key={item.id} className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden p-4 transition-all duration-300 ${isOutOfStock || (isCategoryBlocked && !item.isPromo) ? 'opacity-60 saturate-50 cursor-not-allowed' : 'hover:border-gold/30 hover:bg-white/[0.05]'}`}>
                                <div className="flex gap-4">
                                    <div className="relative size-28 rounded-[24px] overflow-hidden shrink-0 border border-white/5">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        {(isOutOfStock || (isCategoryBlocked && !item.isPromo)) && (
                                            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-2 text-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">No disponible</span>
                                                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mt-1">{isCategoryBlocked ? 'Cocina Cerrada' : 'Sin Stock'}</span>
                                            </div>
                                        )}
                                        {discount > 0 && !isOutOfStock && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-pulse">
                                                -{discount}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-black italic uppercase tracking-tighter leading-tight line-clamp-1">{item.name}</h3>
                                                {!isOutOfStock && <Star size={10} className="text-gold fill-gold shrink-0" />}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2 uppercase tracking-wider">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex flex-col">
                                                {discount > 0 && (
                                                    <span className="text-[9px] text-slate-700 line-through font-bold">${item.price.toLocaleString()}</span>
                                                )}
                                                <span className="text-xl font-black italic tracking-tighter text-gold">${currentPrice.toLocaleString()}</span>
                                            </div>
                                            {!isOutOfStock && (!isCategoryBlocked || item.isPromo) ? (
                                                <button
                                                    onClick={() => addToCart(item, discount)}
                                                    disabled={hasLimitedStock}
                                                    className="bg-white/5 p-2 rounded-xl text-gold hover:bg-gold hover:text-slate-950 transition-all cursor-pointer group/btn flex items-center gap-1 disabled:opacity-20"
                                                >
                                                    <Plus size={18} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/btn:block">
                                                        {hasLimitedStock ? 'Agotado' : 'Añadir'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="bg-red-500/10 p-2 rounded-xl text-red-500 flex items-center gap-1">
                                                    <Info size={16} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Agotado</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredItems.length === 0 && (
                    <div className="py-20 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[32px]">
                        <Utensils size={48} className="mx-auto text-slate-700" />
                        <div className="space-y-1">
                            <p className="text-slate-400 font-bold uppercase tracking-widest italic">No se encontraron productos</p>
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Intenta con otra búsqueda o categoría</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Shopping Cart Drawer/Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-gold" />
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">TU <span className="text-gold">PEDIDO</span></h2>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <ShoppingBag size={48} />
                                    <p className="text-xs font-bold uppercase tracking-widest">Tu bolsa está vacía</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <img src={item.img} alt={item.name} className="size-16 rounded-xl object-cover shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black uppercase tracking-tight italic">{item.name}</h4>
                                            <p className="text-xs font-black text-gold">${item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1">
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-gold transition-colors">
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="p-1 hover:text-gold transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-white/[0.02] space-y-6">
                                {/* Order Type & Table */}
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setOrderType('Local')}
                                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${orderType === 'Local' ? 'bg-gold border-gold text-slate-950 shadow-lg shadow-gold/20' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                        >
                                            🍽 Local
                                        </button>
                                        <button
                                            onClick={() => setOrderType('Delivery')}
                                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${orderType === 'Delivery' ? 'bg-gold border-gold text-slate-950 shadow-lg shadow-gold/20' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                        >
                                            🛵 Delivery
                                        </button>
                                    </div>

                                    {orderType === 'Local' ? (
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                placeholder="Número de mesa (Obligatorio)"
                                                value={tableNumber}
                                                onChange={(e) => setTableNumber(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold/50 transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in">
                                            <input
                                                type="text"
                                                placeholder="Nombre del Cliente (Obligatorio)"
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold/50 transition-all placeholder:text-slate-600"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Teléfono (+54 obligatorio)"
                                                value={clientPhone}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val.startsWith('+54') || val === '+' || val === '+5' || val === '') {
                                                        setClientPhone(val);
                                                    }
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold/50 transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <textarea
                                            placeholder="Observaciones (Ej: Sin cebolla, extra queso...)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold/50 transition-all placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Total Estimado</span>
                                    <span className="text-2xl font-black italic tracking-tighter text-gold">${cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-5 bg-gold text-slate-950 rounded-[22px] font-black uppercase tracking-[0.2em] italic text-xs shadow-xl shadow-gold/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                >
                                    <Send size={18} />
                                    Enviar Pedido por WA
                                </button>
                                <p className="text-[8px] text-center text-slate-500 font-bold uppercase tracking-widest italic">
                                    Al hacer click se enviará un mensaje a nuestro WhatsApp oficial
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer className="mt-10 px-6 max-w-4xl mx-auto">
                <div className="bg-gold/10 border border-gold/20 rounded-[32px] p-6 flex items-start gap-4">
                    <Info className="text-gold shrink-0" size={20} />
                    <div className="space-y-1">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gold italic">Aviso de Pedidos</h5>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
                            Los pedidos realizados fuera de la zona de mesas del bar pueden tener demoras adicionales. Por favor, consulta disponibilidad de mozo si estás en las canchas o piscina.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Combo Selection Modal */}
            {selectedComboForModal && (
                <PromoCumpleModal
                    combo={selectedComboForModal}
                    onClose={() => setSelectedComboForModal(null)}
                    onConfirm={handleConfirmCombo}
                />
            )}
        </div>
    );
}
