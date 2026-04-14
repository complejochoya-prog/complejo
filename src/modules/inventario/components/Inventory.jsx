import React, { useState, useEffect } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    Package,
    AlertTriangle,
    History,
    PlusCircle,
    Search,
    Edit3,
    Save,
    X,
    TrendingDown,
    TrendingUp,
    RefreshCw,
    Filter
} from 'lucide-react';
import { doc, updateDoc, increment, addDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export default function Inventory() {
    const { negocioId } = useConfig();
    const { barProducts, updateBarProduct } = usePedidos();
    const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'alertas' | 'historial' | 'cargar'
    const [searchTerm, setSearchTerm] = useState('');
    const [movements, setMovements] = useState([]);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);

    // Editing states
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ stock_actual: 0, stock_minimo: 0, activar_control_stock: true });

    // Manual load states
    const [selectedProduct, setSelectedProduct] = useState('');
    const [loadAmount, setLoadAmount] = useState('');
    const [loadReason, setLoadReason] = useState('Compra Proveedor');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch movements in real-time
    useEffect(() => {
        if (!negocioId) return;
        setIsLoadingMovements(true);
        const q = query(collection(db, 'negocios', negocioId, 'inventory_movements'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const movs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMovements(movs);
            setIsLoadingMovements(false);
        });
        return () => unsubscribe();
    }, [negocioId]);

    const filteredProducts = barProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const productsWithAlert = barProducts.filter(p =>
        p.activar_control_stock && p.stock_actual <= p.stock_minimo
    );

    const handleStartEdit = (p) => {
        setEditingId(p.id);
        setEditForm({
            stock_actual: p.stock_actual || 0,
            stock_minimo: p.stock_minimo || 5,
            activar_control_stock: p.activar_control_stock !== false
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateBarProduct(id, {
                stock_actual: Number(editForm.stock_actual),
                stock_minimo: Number(editForm.stock_minimo),
                activar_control_stock: editForm.activar_control_stock
            });

            // Log adjustment
            const p = barProducts.find(prod => prod.id === id);
            await addDoc(collection(db, 'negocios', negocioId, 'inventory_movements'), {
                productId: id,
                productName: p.name,
                quantity: Number(editForm.stock_actual) - (p.stock_actual || 0),
                type: 'ajuste',
                reason: 'Ajuste manual de stock',
                userId: localStorage.getItem('userId') || 'admin',
                userName: localStorage.getItem('userName') || 'Admin',
                timestamp: new Date()
            });

            setEditingId(null);
        } catch (err) {
            console.error("Error saving stock:", err);
            alert("Error al guardar cambios");
        }
    };

    const handleManualLoad = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !loadAmount || Number(loadAmount) <= 0) return;

        setIsSubmitting(true);
        try {
            const product = barProducts.find(p => p.id === selectedProduct);
            const newStock = (product.stock_actual || 0) + Number(loadAmount);
            await updateBarProduct(selectedProduct, {
                stock_actual: newStock
            });

            await addDoc(collection(db, 'negocios', negocioId, 'inventory_movements'), {
                productId: selectedProduct,
                productName: product.name,
                quantity: Number(loadAmount),
                type: 'carga',
                reason: loadReason,
                userId: localStorage.getItem('userId') || 'admin',
                userName: localStorage.getItem('userName') || 'Admin',
                timestamp: new Date()
            });

            alert(`¡Carga exitosa! +${loadAmount} ${product.name}`);
            setLoadAmount('');
            setSelectedProduct('');
        } catch (err) {
            console.error("Error loading stock:", err);
            alert("Error al cargar stock");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Package className="text-gold" size={32} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            Control de <span className="text-gold">Inventario</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gestión centralizada de stock y movimientos</p>
                </div>

                <div className="flex gap-2">
                    {productsWithAlert.length > 0 && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl animate-pulse">
                            <AlertTriangle className="text-red-500" size={18} />
                            <span className="text-xs font-black text-red-500 uppercase">{productsWithAlert.length} ALERTAS</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Total Productos</p>
                    <p className="text-3xl font-black italic text-white">{barProducts.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Control Activo</p>
                    <p className="text-3xl font-black italic text-green-500">{barProducts.filter(p => p.activar_control_stock).length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Stock Crítico</p>
                    <p className="text-3xl font-black italic text-red-500">{productsWithAlert.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Movimientos Hoy</p>
                    <p className="text-3xl font-black italic text-gold">
                        {movements.filter(m => m.timestamp?.toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-2 rounded-3xl border border-white/5 overflow-x-auto scrollbar-none">
                {[
                    { id: 'productos', label: 'Productos', icon: Package },
                    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
                    { id: 'historial', label: 'Historial', icon: History },
                    { id: 'cargar', label: 'Cargar Stock', icon: PlusCircle },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white text-slate-950 shadow-xl'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: PRODUCTOS */}
            {activeTab === 'productos' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="relative group max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-500 group-focus-within:text-gold transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o categoría..."
                            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-gold outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Producto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Stock Actual</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Mínimo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Control</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <img src={p.img} className="size-10 rounded-xl object-cover" alt="" />
                                                <div>
                                                    <p className="font-black italic uppercase text-sm tracking-tight">{p.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{p.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {editingId === p.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.stock_actual}
                                                    onChange={e => setEditForm({ ...editForm, stock_actual: e.target.value })}
                                                    className="w-20 bg-slate-900 border border-gold/50 rounded-lg py-2 px-3 text-center text-sm font-black focus:outline-none"
                                                />
                                            ) : (
                                                <span className={`text-xl font-black italic ${p.activar_control_stock
                                                    ? (p.stock_actual <= 0 ? 'text-red-500' : (p.stock_actual <= p.stock_minimo ? 'text-amber-500' : 'text-green-500'))
                                                    : 'text-slate-500'
                                                    }`}>
                                                    {p.stock_actual || 0}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {editingId === p.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.stock_minimo}
                                                    onChange={e => setEditForm({ ...editForm, stock_minimo: e.target.value })}
                                                    className="w-20 bg-slate-900 border border-gold/50 rounded-lg py-2 px-3 text-center text-sm font-black focus:outline-none"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-slate-400">{p.stock_minimo || 5}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {editingId === p.id ? (
                                                <button
                                                    onClick={() => setEditForm({ ...editForm, activar_control_stock: !editForm.activar_control_stock })}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editForm.activar_control_stock ? 'bg-green-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                                                >
                                                    {editForm.activar_control_stock ? 'Activo' : 'Off'}
                                                </button>
                                            ) : (
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${p.activar_control_stock ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                                                    {p.activar_control_stock ? 'SI' : 'NO'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {editingId === p.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveEdit(p.id)} className="p-2 bg-green-500 text-slate-950 rounded-xl hover:scale-105 transition-transform"><Save size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:scale-105 transition-transform"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleStartEdit(p)} className="p-3 bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 rounded-2xl transition-all">
                                                    <Edit3 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: ALERTAS */}
            {activeTab === 'alertas' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {productsWithAlert.length === 0 ? (
                        <div className="py-20 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]">
                            <Filter size={48} className="mx-auto text-slate-800" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">No hay alertas de stock bajo</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productsWithAlert.map(p => (
                                <div key={p.id} className={`bg-white/5 border p-6 rounded-[32px] space-y-6 ${p.stock_actual <= 0 ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30'}`}>
                                    <div className="flex items-center gap-4">
                                        <img src={p.img} className="size-16 rounded-2xl object-cover" alt="" />
                                        <div className="flex-1">
                                            <h3 className="font-black italic uppercase text-lg tracking-tighter leading-none">{p.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{p.category}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Stock Actual</span>
                                            <span className={`text-4xl font-black italic ${p.stock_actual <= 0 ? 'text-red-500' : 'text-amber-500 underline underline-offset-8 decoration-amber-500/20'}`}>
                                                {p.stock_actual}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                                            <span>Mínimo definido: {p.stock_minimo}</span>
                                            <span>Diferencia: {p.stock_actual - p.stock_minimo}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setActiveTab('cargar');
                                            setSelectedProduct(p.id);
                                        }}
                                        className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest italic text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        Reponer Stock
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: HISTORIAL */}
            {activeTab === 'historial' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Fecha / Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Producto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Tipo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-center">Cant.</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Motivo / Pedido</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-inter">
                                {isLoadingMovements ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <RefreshCw className="animate-spin mx-auto text-gold mb-4" size={32} />
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cargando movimientos...</p>
                                        </td>
                                    </tr>
                                ) : movements.map(mov => (
                                    <tr key={mov.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-white uppercase">{mov.timestamp?.toLocaleDateString('es-AR')}</p>
                                            <p className="text-[10px] font-bold text-slate-500">{mov.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-5 font-black italic uppercase text-xs tracking-tight">{mov.productName}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${mov.type === 'venta' ? 'bg-amber-500/10 text-amber-500' :
                                                mov.type === 'carga' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {mov.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-sm font-black italic ${mov.quantity < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-400 text-xs font-medium uppercase">{mov.reason}</td>
                                        <td className="px-6 py-5 text-right font-bold text-[10px] uppercase text-slate-500">{mov.userName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: CARGAR STOCK */}
            {activeTab === 'cargar' && (
                <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleManualLoad} className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-8">
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Carga <span className="text-gold">Manual</span> de Stock</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registra ingresos de mercadería al sistema</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Seleccionar Producto</label>
                                <select
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 font-bold text-white focus:border-gold outline-none appearance-none transition-all uppercase text-xs bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:20px] bg-[right_20px_center] bg-no-repeat"
                                    required
                                >
                                    <option value="">-- Elige un producto --</option>
                                    {barProducts.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_actual || 0})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Cantidad a Agregar</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <TrendingUp size={18} className="text-green-500" />
                                        </div>
                                        <input
                                            type="number"
                                            value={loadAmount}
                                            onChange={e => setLoadAmount(e.target.value)}
                                            placeholder="Ej: 24"
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-12 pr-6 font-black text-xl text-white focus:border-gold outline-none transition-all placeholder:text-white/10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Motivo / Nota</label>
                                    <select
                                        value={loadReason}
                                        onChange={e => setLoadReason(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 font-bold text-white focus:border-gold outline-none appearance-none transition-all uppercase text-[10px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:20px] bg-[right_20px_center] bg-no-repeat"
                                    >
                                        <option value="Compra Proveedor">Compra Proveedor</option>
                                        <option value="Ajuste Positivo">Ajuste Positivo</option>
                                        <option value="Devolución">Devolución</option>
                                        <option value="Producción">Producción</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 bg-gold text-slate-950 rounded-3xl font-black uppercase tracking-widest italic text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin" /> : <TrendingUp />}
                                Procesar Ingreso de Stock
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
