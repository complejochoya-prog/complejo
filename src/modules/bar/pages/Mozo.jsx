import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../core/hooks/useConfig';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useAuth } from '../../empleados/services/AuthContext';
import { useCaja } from '../../caja/services/CajaContext';
import { useUI } from '../../clientes/services/UIContext';
import LockScreen from '../../core/components/LockScreen';
import PromoCumpleModal from '../../promociones/components/PromoCumpleModal';
import {
    UtensilsCrossed,
    Truck,
    Minus,
    Plus,
    LogOut,
    CheckCircle2,
    MessageSquare,
    Send,
    ListChecks,
    Camera,
    Banknote,
    CreditCard,
    Receipt,
    ClipboardList,
    Bell,
    CheckCircle,
    Printer,
    History,
    Power,
    Search,
    X,
    Flame
} from 'lucide-react';

export default function Mozo() {
    const { businessInfo } = useConfig();
    const { 
        barProducts, addOrder, orders, updateOrder, 
        isBarOpen, isKitchenOpen, getCurrentDiscount, 
        categoryAvailability, promotions 
    } = usePedidos();
    const { users } = useAuth();
    const { currentCaja } = useCaja();
    
    const navigate = useNavigate();
    const mozoId = localStorage.getItem('userId');
    const mozoName = localStorage.getItem('userName');

    const categoryOrder = ['Cafeteria', 'Licuados', 'Tortas', 'Bebidas', 'Cervezas', 'Carnes', 'Lomos', 'Burgers', 'Pizzas', 'Pastas', 'Ensaladas', 'Papas', 'Tacos', 'Tragos', 'Combos', 'Promos'];

    // User status check & Auto-logout
    const currentUser = users.find(u => u.id === mozoId);

    useEffect(() => {
        if (currentUser && currentUser.activo === false) {
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (currentUser && currentUser.activo === false) {
        return <LockScreen userType="mozo" />;
    }

    // Main Tabs
    const [activeTab, setActiveTab] = useState('pedido'); 
    const [notifications, setNotifications] = useState([]);
    const [hasNewNotification, setHasNewNotification] = useState(false);

    // --- Shift Tracking ---
    const [shiftStart] = useState(() => {
        const saved = localStorage.getItem('mozoShiftStart');
        if (saved) return saved;
        const now = new Date().toISOString();
        localStorage.setItem('mozoShiftStart', now);
        return now;
    });

    // --- State for "Tomar Pedido" ---
    const [orderType, setOrderType] = useState('Local'); 
    const [tableNumber, setTableNumber] = useState('');
    const [cart, setCart] = useState([]);
    const [notes, setNotes] = useState('');
    const [clientName, setClientName] = useState(''); 
    const [clientPhone, setClientPhone] = useState('+54'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAddingAdditional, setIsAddingAdditional] = useState(false);

    // Combo Modal State
    const [selectedComboForModal, setSelectedComboForModal] = useState(null);
    const [isBirthdayMode, setIsBirthdayMode] = useState(false);

    const categories = categoryOrder.filter(cat => cat === 'Promos' || categoryAvailability[cat] !== false);
    const activeCatFallback = categories.length > 0 ? categories[0] : 'Bebidas';
    const [activeCategory, setActiveCategory] = useState(activeCatFallback);
    const [searchTerm, setSearchTerm] = useState('');

    const currentProducts = useMemo(() => {
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
            tipo: 'combo',
            comboItems: promo.comboItems,
            modo_evento: promo.modo_evento || ''
        }));

        const unifiedProducts = [...barProducts, ...activePromationsAsProducts];
        const baseProducts = unifiedProducts.filter(p =>
            p.disponible !== false &&
            (p.category === 'Promos' || categoryAvailability[p.category] !== false)
        );
        if (!searchTerm.trim()) {
            return baseProducts.filter(p => String(p.category).toLowerCase() === String(activeCategory).toLowerCase());
        }
        const lowerTerm = searchTerm.toLowerCase();
        return baseProducts.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.category.toLowerCase().includes(lowerTerm)
        );
    }, [barProducts, promotions, activeCategory, searchTerm, categoryAvailability]);

    // --- State for "Mesas" ---
    const [selectedTable, setSelectedTable] = useState(null); 
    const [viewMode, setViewMode] = useState('list'); 
    const [paymentMethod, setPaymentMethod] = useState(''); 
    const [receiptImage, setReceiptImage] = useState(null); 
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const myOrders = useMemo(() => {
        return orders.filter(o => o.mozoId === mozoId);
    }, [orders, mozoId]);

    const notificationAudio = useMemo(() => {
        const audio = new Audio('/sounds/notification.wav');
        audio.preload = 'auto';
        return audio;
    }, []);

    const [audioUnlocked, setAudioUnlocked] = useState(false);
    useEffect(() => {
        const unlock = () => {
            if (!audioUnlocked) {
                notificationAudio.volume = 0;
                notificationAudio.play().then(() => {
                    notificationAudio.pause();
                    notificationAudio.currentTime = 0;
                    notificationAudio.volume = 1;
                    setAudioUnlocked(true);
                }).catch(() => { });
            }
        };
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });
        return () => {
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('click', unlock);
        };
    }, [audioUnlocked, notificationAudio]);

    const playNotificationSound = () => {
        try {
            notificationAudio.currentTime = 0;
            notificationAudio.volume = 1;
            notificationAudio.play().catch(e => console.warn('Audio play failed:', e));
        } catch (e) {
            console.warn('Audio notification not available:', e);
        }
    };

    useEffect(() => {
        const lastOrderStates = JSON.parse(localStorage.getItem('orderStates') || '{}');
        const lastOrderIds = JSON.parse(localStorage.getItem('orderIds') || '[]');
        const newStates = {};
        const newOrderIds = orders.map(o => o.id);

        let shouldPlaySound = false;
        let shouldVibrate = false;
        let vibratePattern = [200, 100, 200];

        orders.forEach(order => {
            newStates[order.id] = `${order.status}|${order.kitchenStatus}`;
            const [prevStatus, prevKitchenStatus] = (lastOrderStates[order.id] || "undefined|undefined").split('|');

            if (order.origin === 'online') {
                if (order.status === 'confirmado' && !lastOrderIds.includes(order.id)) {
                    const id = Date.now() + Math.random();
                    setNotifications(prev => [{ id, message: "🔔 Nuevo pedido online recibido", isReady: false }, ...prev]);
                    setHasNewNotification(true);
                    shouldVibrate = true;
                    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
                }
                if (order.type === 'Local' && order.status === 'listo' && prevStatus && prevStatus !== 'listo') {
                    const id = Date.now() + Math.random();
                    setNotifications(prev => [{ id, message: `🔔 Pedido listo para retirar – Mesa ${order.tableNumber}`, isReady: true }, ...prev]);
                    setHasNewNotification(true);
                    shouldPlaySound = true;
                    shouldVibrate = true;
                    vibratePattern = [500, 110, 500, 110, 500];
                    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 10000);
                }
            }

            if (order.mozoId === mozoId) {
                let msg = '';
                let isReady = false;
                if (prevStatus !== order.status) {
                    if (order.status === 'preparando') {
                        msg = `🔔 Tu pedido de la Mesa ${order.tableNumber} fue confirmado por cocina`;
                        shouldVibrate = true;
                    }
                    if (order.status === 'listo' && (order.origin !== 'online' || order.type !== 'Local')) {
                        msg = `🔔 Pedido listo — Mesa ${order.tableNumber} — Retirar en cocina`;
                        isReady = true;
                        shouldPlaySound = true;
                        shouldVibrate = true;
                        vibratePattern = [500, 110, 500, 110, 500];
                    }
                }
                if (prevKitchenStatus !== order.kitchenStatus) {
                    if (order.kitchenStatus === 'Preparando') {
                        msg = `🔔 La cocina está preparando tu pedido de la Mesa ${order.tableNumber}`;
                        shouldVibrate = true;
                    }
                    if (order.kitchenStatus === 'Listo') {
                        msg = `🔔 ¡El pedido de la Mesa ${order.tableNumber} está LISTO en cocina!`;
                        isReady = true;
                        shouldPlaySound = true;
                        shouldVibrate = true;
                        vibratePattern = [500, 110, 500, 110, 500];
                    }
                }
                if (msg) {
                    const id = Date.now() + Math.random();
                    setNotifications(prev => [{ id, message: msg, isReady }, ...prev]);
                    setHasNewNotification(true);
                    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
                }
            }
        });

        if (shouldPlaySound) playNotificationSound();
        if (shouldVibrate && navigator.vibrate) navigator.vibrate(vibratePattern);
        localStorage.setItem('orderStates', JSON.stringify(newStates));
        localStorage.setItem('orderIds', JSON.stringify(newOrderIds));
    }, [orders, mozoId, notificationAudio]);

    const shiftOrders = useMemo(() => {
        const shiftDate = new Date(shiftStart);
        return orders.filter(o => {
            if (o.mozoId !== mozoId) return false;
            const orderDate = o.timestamp?.toDate ? o.timestamp.toDate() : new Date(o.timestamp);
            return orderDate >= shiftDate;
        });
    }, [orders, mozoId, shiftStart]);

    const shiftTotal = shiftOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const shiftPaidOrders = shiftOrders.filter(o => o.status === 'paid' || o.status === 'entregado');
    const shiftPaidTotal = shiftPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const handlePrintTicket = (tableNo) => {
        const tableOrders = shiftOrders.filter(o => o.tableNumber === tableNo);
        const name = mozoName || 'Mozo';
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-AR');
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const items = [];
        tableOrders.forEach(o => {
            (o.productos || o.items || []).forEach(item => {
                const existing = items.find(i => i.name === (item.nombre || item.name));
                if (existing) {
                    existing.quantity += (item.cantidad || item.quantity || 1);
                    existing.total += (item.price || 0) * (item.cantidad || item.quantity || 1);
                } else {
                    items.push({ 
                        name: item.nombre || item.name, 
                        quantity: item.cantidad || item.quantity || 1, 
                        price: item.price || 0, 
                        total: (item.price || 0) * (item.cantidad || item.quantity || 1) 
                    });
                }
            });
        });

        const total = items.reduce((sum, i) => sum + i.total, 0);
        const payMethod = tableOrders.find(o => o.paymentMethod)?.paymentMethod || 'Pendiente';

        const printWindow = window.open('', '_blank');
        const html = `<html><head><title>Ticket Mesa ${tableNo}</title><style>body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 8mm; font-size: 14px; } .center { text-align: center; } .bold { font-weight: bold; } .line { border-top: 1px dashed #000; margin: 8px 0; } .row { display: flex; justify-content: space-between; margin: 3px 0; } .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin: 8px 0; } .footer { margin-top: 15px; text-align: center; font-size: 12px; } </style></head><body><div class="center bold" style="font-size:18px;">COMPLEJO GIOVANNI</div><div class="center" style="font-size:12px;">Sports & Bar</div><div class="center" style="margin-top:5px;">Fecha: ${dateStr}</div><div class="center">Hora: ${timeStr}</div><div class="center" style="margin-top:5px;">Mozo: ${name}</div><div class="center bold" style="font-size:16px;margin-top:5px;">Mesa: ${tableNo}</div><div class="line"></div><div class="bold">Pedido:</div>${items.map(i => `<div class="row"><span>${i.quantity}x ${i.name}</span><span>$${i.total.toLocaleString()}</span></div>`).join('')}<div class="line"></div><div class="total-row"><span>TOTAL:</span><span>$${total.toLocaleString()}</span></div><div class="row"><span>Forma de pago:</span><span>${payMethod}</span></div><div class="line"></div><div class="footer">Gracias por su visita<br>GIOVANNI SPORTS & BAR</div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script></body></html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleCerrarTurno = () => {
        if (!window.confirm('¿Estás seguro de cerrar tu turno? Se limpiará el historial de tu app.')) return;
        localStorage.removeItem('mozoShiftStart');
        localStorage.removeItem('orderStates');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const activeOrdersForBilling = orders.filter(o => o.tipo === 'Local' && o.status !== 'paid');
    const activeTables = [...new Set(activeOrdersForBilling.map(o => o.tableNumber || o.mesa))].sort((a, b) => Number(a) - Number(b));
    const ordersForSelectedTable = activeOrdersForBilling.filter(o => (o.tableNumber || o.mesa) === selectedTable);
    const tableTotal = ordersForSelectedTable.reduce((sum, o) => sum + (o.total || 0), 0);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const handleAddToCart = (product, discount = 0) => {
        if (product.tipo === 'combo' || product.isPromo || (product.comboItems && product.comboItems.length > 0)) {
            setSelectedComboForModal({
                ...product,
                price: discount > 0 ? product.price * (1 - discount / 100) : product.price,
                discount
            });
            return;
        }
        const liveProduct = barProducts.find(p => p.id === product.id);
        const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
        if (liveProduct) {
            if (liveProduct.disponible === false || (liveProduct.activar_control_stock && (liveProduct.stock_actual - inCart) <= 0)) {
                alert("⚠️ Este producto no se encuentra disponible en este momento");
                return;
            }
        }
        const currentPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1, name: product.name, originalPrice: product.price, price: currentPrice, discount }];
        });
    };

    const handleConfirmCombo = (selectedItems) => {
        const comboRecord = {
            ...selectedComboForModal,
            quantity: 1,
            isPromo: true,
            comboItems: selectedItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price || 0,
                category: item.category,
                isPromoItem: true
            })),
            modo_evento: selectedComboForModal.modo_evento || ''
        };
        setCart(prev => [...prev, comboRecord]);
        setSelectedComboForModal(null);
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productId);
            if (!existing) return prev;
            if (existing.quantity === 1) return prev.filter(item => item.id !== productId);
            return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;
        if (orderType === 'Local' && !tableNumber) return alert('Por favor ingrese el número de mesa.');
        if (orderType === 'Delivery' && !clientName) return alert('Por favor ingrese el nombre del cliente.');
        if (orderType === 'Delivery' && (!clientPhone || !clientPhone.startsWith('+54') || clientPhone.length < 10)) return alert('Por favor ingrese un teléfono válido que comience con +54');

        setIsSubmitting(true);
        try {
            await addOrder({
                tipo: orderType,
                mesa: orderType === 'Local' ? tableNumber : '',
                clientName: orderType === 'Delivery' ? clientName : '',
                clientPhone: orderType === 'Delivery' ? clientPhone : '',
                productos: cart.flatMap(i => {
                    const mainProduct = {
                        id: i.id || Date.now().toString(),
                        nombre: i.name || 'Producto sin nombre',
                        cantidad: i.quantity || 1,
                        price: i.price || 0,
                        category: i.isPromo ? 'Promos' : (barProducts.find(p => p.id === i.id)?.category || ''),
                        isPromo: i.isPromo || false,
                        promoItems: i.isPromo ? (i.comboItems || []) : []
                    };
                    if (i.isPromo && i.comboItems) {
                        const subProducts = (i.comboItems || []).map(subItem => ({
                            id: subItem.id || 'unknown',
                            nombre: subItem.name || 'Producto combo',
                            cantidad: (subItem.quantity || 1) * (i.quantity || 1),
                            price: subItem.price || 0,
                            category: subItem.category || '',
                            isPromoItem: true,
                            parentId: i.id || 'unknown',
                            sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas', 'Combos', 'Promos'].includes(subItem.category) ? 'cocina' : 'barra'
                        }));
                        return [mainProduct, ...subProducts];
                    }
                    return [{
                        ...mainProduct,
                        sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas', 'Combos', 'Promos'].includes(mainProduct.category) ? 'cocina' : 'barra'
                    }];
                }),
                notes: notes,
                total: cartTotal,
                origin: 'mozo',
                mozoId: mozoId,
                mozoName: mozoName,
                prioridad: 'normal',
                estado: 'pendiente',
                modo_evento: isBirthdayMode || cart.some(i => i.modo_evento === 'cumpleaños') ? 'cumpleaños' : ''
            });

            if (isBirthdayMode || cart.some(i => i.modo_evento === 'cumpleaños')) {
                try { new Audio('/sounds/cumpleanos.mp3').play().catch(() => { }); } catch (e) { }
            }
            setCart([]);
            setNotes('');
            setClientName('');
            setClientPhone('+54');
            if (!isAddingAdditional) setTableNumber('');
            setIsAddingAdditional(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            alert(error.message || "Hubo un error al enviar el pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!currentCaja) { return alert('❌ Debe abrir caja antes de cobrar.'); }
        if (!paymentMethod) return alert('Seleccione un método de pago.');
        if (paymentMethod === 'Transferencia' && !receiptImage) return alert('Debe cargar el comprobante de transferencia.');
        setIsProcessingPayment(true);
        try {
            await Promise.all(ordersForSelectedTable.map(o => updateOrder(o.id, {
                status: 'paid',
                paymentMethod,
                receiptImage: paymentMethod === 'Transferencia' ? receiptImage : null,
                paidAt: new Date().toISOString()
            })));
            setSelectedTable(null);
            setViewMode('list');
            setPaymentMethod('');
            setReceiptImage(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            alert("Hubo un error al procesar el cobro.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="bg-slate-950 min-h-screen text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="size-24 bg-green-500 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">¡Operación Exitosa!</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-balance">
                    {activeTab === 'pedido' ? 'El pedido ha sido enviado con éxito' : 'El cobro ha sido registrado'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen text-white font-inter flex flex-col md:pb-32 pb-40">
            <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-gold rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-gold/20">
                        {activeTab === 'pedido' ? <UtensilsCrossed size={20} /> : <Receipt size={20} />}
                    </div>
                    <div>
                        <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">Mozo <span className="text-gold">App</span></h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{mozoName || 'Toma de Pedidos'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20} /></button>
            </header>

            <div className="p-4 border-b border-white/5">
                <div className="flex rounded-2xl bg-white/5 p-1">
                    <button onClick={() => { setActiveTab('pedido'); setIsAddingAdditional(false); setTableNumber(''); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pedido' ? 'bg-gold text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}><UtensilsCrossed size={16} /> Tomar</button>
                    <button onClick={() => { setActiveTab('mesas'); setViewMode('list'); setSelectedTable(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'mesas' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-white'}`}><ListChecks size={16} /> Mesas</button>
                    <button onClick={() => { setActiveTab('mis-pedidos'); setHasNewNotification(false); }} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mis-pedidos' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'} ${hasNewNotification ? 'animate-pulse ring-2 ring-gold' : ''}`}><div className="relative"><ClipboardList size={18} />{hasNewNotification && <span className="absolute -top-1 -right-1 size-2 bg-gold rounded-full border border-slate-900 animate-bounce"></span>}</div>Pedidos</button>
                    <button onClick={() => setActiveTab('historial')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'historial' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><History size={16} /> Turno</button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 space-y-6 relative">
                {activeTab === 'pedido' && (
                    <div className="space-y-6 pb-10">
                        {!isBarOpen() && (
                            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 text-center space-y-3"><div className="size-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"><Power size={32} className="text-red-500" /></div><h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">El bar se encuentra cerrado</h3></div>
                        )}
                        {isBarOpen() && !isKitchenOpen() && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3"><div className="size-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><Bell size={18} /></div><div><p className="text-sm font-black text-orange-400 uppercase italic">Cocina cerrada</p><p className="text-[10px] text-slate-400 font-bold uppercase">Solo Tragos y Bebidas disponibles.</p></div></div>
                        )}
                        {isAddingAdditional && (
                            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 flex items-center justify-between"><span className="text-xs font-black text-gold uppercase tracking-widest">Agregando a Mesa {tableNumber}</span><button onClick={() => { setIsAddingAdditional(false); setTableNumber(''); }} className="text-[10px] font-black underline uppercase text-gold/60">Cancelar</button></div>
                        )}
                        {!isAddingAdditional && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex relative h-16">
                                <div className={`absolute top-2 bottom-2 w-[calc(50%-12px)] bg-gold rounded-xl transition-all duration-300 pointer-events-none ${orderType === 'Local' ? 'left-2' : 'left-[calc(50%+4px)]'}`}></div>
                                <button className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-colors ${orderType === 'Local' ? 'text-slate-950' : 'text-slate-400'}`} onClick={() => setOrderType('Local')}><UtensilsCrossed size={18} /><span>Mesa</span></button>
                                <button className={`flex-1 flex flex-col items-center justify-center relative z-10 transition-colors ${orderType === 'Delivery' ? 'text-slate-950' : 'text-slate-400'}`} onClick={() => setOrderType('Delivery')}><Truck size={18} /><span>Delivery</span></button>
                            </div>
                        )}
                        {orderType === 'Local' && !isAddingAdditional && (
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Número de Mesa</label><input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Ej: 5" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 text-xl font-black text-center focus:border-gold outline-none" /></div>
                        )}
                        {orderType === 'Delivery' && (
                            <div className="grid gap-4"><input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del Cliente" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 text-lg font-black focus:border-gold outline-none" /><input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+54..." className="w-full bg-white/5 border border-white/10 text-white rounded-2xl p-4 text-lg font-black focus:border-gold outline-none" /></div>
                        )}
                        <div onClick={() => setIsBirthdayMode(!isBirthdayMode)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${isBirthdayMode ? 'bg-gold/20 border-gold shadow-lg shadow-gold/10' : 'bg-white/5 border-white/5'}`}><div className="flex items-center gap-4"><div className={`size-10 rounded-xl flex items-center justify-center ${isBirthdayMode ? 'bg-gold text-slate-950 scale-110' : 'bg-slate-800 text-slate-500'}`}><span>🎂</span></div><div><p className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${isBirthdayMode ? 'text-gold' : 'text-white'}`}>Modo Cumpleaños</p><p className="text-[9px] font-bold text-slate-500 uppercase">Activar celebración</p></div></div><div className={`w-12 h-6 rounded-full relative transition-all ${isBirthdayMode ? 'bg-gold' : 'bg-slate-800'}`}><div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${isBirthdayMode ? 'left-7' : 'left-1'}`}></div></div></div>
                        <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={18} className="text-slate-500" /></div><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar plato o bebida..." className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:border-gold outline-none" />{searchTerm && <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500"><X size={18} /></button>}</div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">{categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-slate-950 shadow-lg' : 'bg-white/5 border border-white/10 text-slate-400'}`}>{cat}</button>)}</div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {currentProducts.map(product => {
                                const inCart = cart.find(c => c.id === product.id)?.quantity || 0;
                                const isOutOfStock = product.disponible === false || (product.activar_control_stock && product.stock_actual <= 0);
                                const discount = getCurrentDiscount(product);
                                const currentPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
                                return (
                                    <div key={product.id} onClick={() => !isOutOfStock && handleAddToCart(product, discount)} className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col relative transition-all cursor-pointer ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>
                                        {inCart > 0 && <div className="absolute top-2 right-2 size-6 bg-gold text-slate-950 font-black text-xs rounded-full flex items-center justify-center z-10">{inCart}</div>}
                                        {discount > 0 && <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10 shadow-lg">-{discount}%</div>}
                                        <div className="h-24 bg-slate-900 relative"><img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div></div>
                                        <div className="p-3 flex-1 flex flex-col justify-between -mt-5 z-10">
                                            <div><h3 className="text-sm font-black italic leading-tight">{product.name}</h3><div className="flex justify-between items-end mt-1"><span className="text-gold font-bold text-sm">${currentPrice}</span></div></div>
                                            <div className="flex justify-between items-center gap-1 mt-3 bg-slate-900 border border-white/5 p-1 rounded-xl">
                                                <button onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(product.id); }} disabled={inCart === 0} className="p-2 bg-white/5 text-slate-400 rounded-lg"><Minus size={16} /></button>
                                                <span className="font-black text-sm">{inCart}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product, discount); }} disabled={isOutOfStock} className="p-2 bg-gold/10 text-gold rounded-lg"><Plus size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {activeTab === 'mesas' && viewMode === 'list' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        {activeTables.map(t => <button key={t} onClick={() => { setSelectedTable(t); setViewMode('detail'); }} className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col items-center gap-2"><div className="size-16 bg-slate-900 rounded-2xl flex items-center justify-center"><UtensilsCrossed size={24} className="text-gold" /></div><p className="text-3xl font-black italic text-white">{t}</p></button>)}
                    </div>
                )}
                {activeTab === 'historial' && (
                    <div className="space-y-6 pb-20"><div className="bg-purple-500/5 border border-purple-500/20 rounded-3xl p-5 flex justify-between items-center shadow-xl shadow-purple-500/10"><div><p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Turno Actual</p><p className="text-lg font-black italic text-white">${shiftTotal.toLocaleString()}</p></div><div className="text-right"><p className="text-[9px] font-black text-slate-500 uppercase">Cobrados</p><p className="text-lg font-black italic text-green-400">${shiftPaidTotal.toLocaleString()}</p></div></div>{shiftOrders.length > 0 && <button onClick={handleCerrarTurno} className="w-full py-5 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"><Power size={18} /> Cerrar Turno</button>}</div>
                )}
            </main>
            {activeTab === 'pedido' && cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-white/10 p-4 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-50">
                    <div className="flex justify-between items-center mb-3"><span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{cart.reduce((a, b) => a + b.quantity, 0)} Productos</span><span className="text-2xl font-black italic text-gold tracking-tighter">${cartTotal.toLocaleString()}</span></div>
                    <button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full py-5 bg-gold text-slate-950 text-base font-black uppercase tracking-widest italic rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(242,185,13,0.3)]">{isSubmitting ? 'Enviando...' : <>{isAddingAdditional ? 'CONFIRMAR ADICIONAL' : 'ENVIAR A COCINA'} <Send size={20} /></>}</button>
                </div>
            )}
            {selectedComboForModal && <PromoCumpleModal combo={selectedComboForModal} onClose={() => setSelectedComboForModal(null)} onConfirm={handleConfirmCombo} />}
        </div>
    );
}
