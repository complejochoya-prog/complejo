import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Plus, Minus, Send, ShoppingBag } from 'lucide-react';

const ResumenPedido = ({ carrito, setCarrito, setIsOpen, nombreComplejo, whatsappNumber, addOrder }) => {
    const [logistica, setLogistica] = useState('mesa'); // 'mesa' o 'delivery'
    const [numMesa, setNumMesa] = useState('');
    const [notasGenerales, setNotasGenerales] = useState('');

    // 1. CÁLCULO DEL TOTAL
    const totalPedido = carrito.reduce((acc, item) => acc + (Number(item.precio || item.price || 0) * Number(item.quantity || item.cantidad || 0)), 0);

    // 2. LÓGICA DE ENVÍO
    const finalizarPedido = async () => {
        if (logistica === 'mesa' && !numMesa) {
            alert("Por favor, ingresa el número de mesa");
            return;
        }

        // Mapping for KDS Compatibility
        const productosKDS = carrito.flatMap(item => {
            const qty = item.quantity || item.cantidad || 0;
            const mainProduct = {
                id: item.id,
                nombre: item.nombre || item.name,
                cantidad: qty,
                price: item.precio || item.price,
                category: item.category || '',
                isPromo: item.isPromo || false,
                promoItems: item.isPromo ? (item.comboItems || []) : [],
                notes: item.nota || item.note || ''
            };

            // Determine sector for KDS
            const sector = ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas', 'Combos', 'Promos'].includes(mainProduct.category) ? 'cocina' : 'barra';

            if (item.isPromo && item.comboItems) {
                const subProducts = item.comboItems.map(subItem => ({
                    id: subItem.id,
                    nombre: subItem.name,
                    cantidad: subItem.quantity * qty,
                    price: subItem.price || 0,
                    category: subItem.category || '',
                    isPromoItem: true,
                    parentId: item.id,
                    sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas', 'Combos', 'Promos'].includes(subItem.category) ? 'cocina' : 'barra'
                }));
                return [{ ...mainProduct, sector }, ...subProducts];
            }
            return [{ ...mainProduct, sector }];
        });

        const detallePedido = {
            productos: productosKDS, // Used for KDS
            total: totalPedido,
            tipo: logistica === 'mesa' ? 'Local' : 'Delivery',
            mesa: logistica === 'mesa' ? numMesa : 'N/A',
            notes: notasGenerales, // Field name used in context
            estado: 'pendiente',
            origin: 'online',
            timestamp: new Date()
        };

        if (logistica === 'mesa') {
            try {
                // addOrder from ConfigContext handles ID generation, negocioId scoping, and standardized fields
                await addOrder(detallePedido, 'pedidos_bar');
                alert("¡Pedido enviado con éxito!");
                setCarrito([]);
                setIsOpen(false);
            } catch (error) {
                console.error("Error al enviar a cocina:", error);
                alert("Hubo un error al enviar el pedido. Intente nuevamente.");
            }
        } else {
            const mensaje = `*NUEVO PEDIDO - ${nombreComplejo}*\n\n` +
                carrito.map(i => `- ${(i.quantity || i.cantidad)}x ${i.nombre || i.name} (${i.nota || i.note || 'Sin notas'})`).join('\n') +
                `\n\n*Total:* $${totalPedido.toLocaleString()}\n*Tipo:* Delivery\n*Notas:* ${notasGenerales}`;

            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#070B14] z-[200] flex flex-col h-screen overflow-y-auto animate-in fade-in duration-300">

            {/* Cabecera */}
            <div className="p-4 bg-[#0D121D] flex items-center gap-4 sticky top-0 z-10 border-b border-zinc-800">
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-yellow-400 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-white font-bold uppercase tracking-widest text-sm italic">Resumen de mi pedido</h2>
            </div>

            <div className="p-4 space-y-6 pb-20">
                {/* Selector Mesa / Delivery */}
                <div className="grid grid-cols-2 bg-zinc-900/50 p-1.5 rounded-[22px] border border-zinc-800">
                    <button
                        onClick={() => setLogistica('mesa')}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${logistica === 'mesa' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        🍽 En la Mesa
                    </button>
                    <button
                        onClick={() => setLogistica('delivery')}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${logistica === 'delivery' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        🛵 Delivery
                    </button>
                </div>

                {logistica === 'mesa' && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <input
                            type="number"
                            placeholder="NÚMERO DE MESA"
                            value={numMesa}
                            onChange={(e) => setNumMesa(e.target.value)}
                            className="w-full bg-[#0D121D] border border-zinc-800 p-5 rounded-3xl text-white font-black text-center text-2xl focus:border-yellow-400/50 outline-none transition-all placeholder:text-zinc-800 placeholder:text-xs"
                        />
                    </div>
                )}

                {/* Listado de Productos */}
                <div className="space-y-4">
                    {carrito.length === 0 ? (
                        <div className="py-20 text-center opacity-20">
                            <ShoppingBag size={48} className="mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Tu carrito está vacío</p>
                        </div>
                    ) : (
                        carrito.map((item) => (
                            <div key={item.id} className="bg-[#0D121D] p-4 rounded-3xl border border-zinc-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">{item.category}</span>
                                        <span className="text-white font-black uppercase text-xs italic tracking-tighter">{item.nombre || item.name} <span className="text-yellow-400 ml-1">x{item.quantity || item.cantidad}</span></span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-yellow-400 font-black italic text-sm">${(Number(item.precio || item.price || 0) * Number(item.quantity || item.cantidad || 0)).toLocaleString()}</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => {
                                                const newCart = carrito.map(i => {
                                                    if (i.id === item.id) {
                                                        const q = (i.quantity || i.cantidad) - 1;
                                                        return q > 0 ? { ...i, quantity: q, cantidad: q } : null;
                                                    }
                                                    return i;
                                                }).filter(Boolean);
                                                setCarrito(newCart);
                                            }} className="size-6 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-zinc-800">
                                                <Minus size={12} />
                                            </button>
                                            <button onClick={() => {
                                                const newCart = carrito.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || i.cantidad) + 1, cantidad: (i.quantity || i.cantidad) + 1 } : i);
                                                setCarrito(newCart);
                                            }} className="size-6 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-zinc-800">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-[#070B14] p-3 rounded-2xl border border-zinc-800 group focus-within:border-yellow-400/30 transition-all">
                                    <MessageSquare size={14} className="text-zinc-500 group-focus-within:text-yellow-400" />
                                    <input
                                        placeholder="Ej: Sin cebolla, bien cocido..."
                                        className="w-full bg-transparent p-1 rounded-lg text-[10px] text-zinc-300 outline-none font-bold italic placeholder:text-zinc-800"
                                        value={item.nota || item.note || ''}
                                        onChange={(e) => {
                                            const newCart = carrito.map(i => i.id === item.id ? { ...i, nota: e.target.value, note: e.target.value } : i);
                                            setCarrito(newCart);
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* TOTAL */}
                <div className="flex justify-between items-center py-6 border-t border-dashed border-zinc-800 mt-4">
                    <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">Total Pedido</span>
                    <span className="text-yellow-400 font-black text-3xl italic tracking-tighter">${totalPedido.toLocaleString()}</span>
                </div>

                {/* Notas generales */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic px-2">Notas generales</h3>
                    <textarea
                        placeholder="¿Alguna otra instrucción para tu pedido completo?"
                        className="w-full bg-[#0D121D] p-5 rounded-[32px] text-white text-xs h-32 outline-none border border-zinc-800 focus:border-yellow-400/30 transition-all font-bold uppercase tracking-widest placeholder:text-zinc-800 resize-none"
                        value={notasGenerales}
                        onChange={(e) => setNotasGenerales(e.target.value)}
                    />
                </div>

                {/* BOTÓN FINAL */}
                <div className="pb-10 pt-4">
                    <button
                        onClick={finalizarPedido}
                        disabled={carrito.length === 0}
                        className="w-full bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-6 rounded-[28px] uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-yellow-400/20 active:scale-95 transition-all italic"
                    >
                        {logistica === 'mesa' ? <Send size={18} /> : null}
                        {logistica === 'mesa' ? 'Enviar a Cocina' : 'Pedir por WhatsApp'}
                    </button>
                    <p className="text-[8px] text-center text-zinc-600 font-bold uppercase tracking-[0.2em] mt-4 italic">
                        {logistica === 'mesa' ? 'Recibirás el pedido en tu mesa' : 'Se abrirá WhatsApp para confirmar'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResumenPedido;
