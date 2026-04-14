import React, { useState } from 'react';
import { useInventario } from '../services/InventarioContext';
import {
    Utensils,
    Plus,
    Trash2,
    AlertCircle,
    Search,
    ChevronDown,
    Save,
    X,
    Filter
} from 'lucide-react';

export default function KitchenSupplies() {
    const {
        kitchenSupplies,
        addKitchenSupply,
        updateKitchenSupply,
        removeKitchenSupply,
        reportKitchenShortage
    } = useInventario();

    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newSupply, setNewSupply] = useState({
        name: '',
        category: 'Proteínas',
        stock: 0,
        unit: 'kg',
        minStock: 5
    });

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const categories = ['Proteínas', 'Vegetales', 'Lácteos', 'Secos', 'Congelados', 'Otros'];
    const units = ['kg', 'litros', 'unidades', 'packs', 'bolsas'];

    const filteredSupplies = kitchenSupplies.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        await addKitchenSupply(newSupply);
        setNewSupply({ name: '', category: 'Proteínas', stock: 0, unit: 'kg', minStock: 5 });
        setIsAdding(false);
    };

    const handleSaveEdit = async () => {
        await updateKitchenSupply(editingId, editForm);
        setEditingId(null);
        setEditForm(null);
    };

    const handleReportShortage = async (supply) => {
        if (window.confirm(`¿Reportar falta crítica de ${supply.name}?`)) {
            await reportKitchenShortage(supply.id);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Utensils className="text-blue-400" size={32} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            Insumos de <span className="text-blue-400">Cocina</span>
                        </h1>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={18} /> AGREGAR INSUMO
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative group w-full md:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSupplies.map(supply => (
                    <div key={supply.id} className={`bg-white/5 border rounded-[32px] p-6 space-y-6 transition-all ${supply.stock <= supply.minStock ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'}`}>
                        {editingId === supply.id ? (
                            <div className="space-y-4">
                                <input
                                    className="w-full bg-slate-900 border border-blue-500/50 rounded-xl p-3 text-sm font-bold"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        className="bg-slate-900 border border-blue-500/50 rounded-xl p-3 text-sm font-bold"
                                        value={editForm.stock}
                                        onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                    />
                                    <select
                                        className="bg-slate-900 border border-blue-500/50 rounded-xl p-3 text-sm font-bold"
                                        value={editForm.unit}
                                        onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} className="flex-1 bg-green-500 text-slate-950 py-2 rounded-xl font-black text-xs uppercase"><Save size={14} className="inline mr-1" /> Guardar</button>
                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-xl font-black text-xs uppercase"><X size={14} className="inline mr-1" /> X</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black italic uppercase text-lg tracking-tight">{supply.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{supply.category}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingId(supply.id);
                                            setEditForm({ ...supply });
                                        }}
                                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        <ChevronDown size={16} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Stock Actual</p>
                                        <p className={`text-4xl font-black italic tracking-tighter ${supply.stock <= supply.minStock ? 'text-red-500' : 'text-blue-400'}`}>
                                            {supply.stock} <span className="text-sm not-italic opacity-50 uppercase">{supply.unit}</span>
                                        </p>
                                    </div>
                                    {supply.stock <= supply.minStock && (
                                        <button
                                            onClick={() => handleReportShortage(supply)}
                                            className="p-3 bg-red-500 text-white rounded-2xl animate-pulse"
                                        >
                                            <AlertCircle size={20} />
                                        </button>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
                                    <span>Mínimo: {supply.minStock} {supply.unit}</span>
                                    <button onClick={() => removeKitchenSupply(supply.id)} className="text-red-500/50 hover:text-red-500 transition-colors">Eliminar</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAdd} className="bg-slate-900 border border-blue-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Plus className="text-blue-400" /> Nuevo Insumo
                            </h2>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                required
                                placeholder="Nombre del insumo"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm"
                                value={newSupply.name}
                                onChange={e => setNewSupply({ ...newSupply, name: e.target.value })}
                            />
                            <select
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm appearance-none"
                                value={newSupply.category}
                                onChange={e => setNewSupply({ ...newSupply, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Stock inicial"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm"
                                    value={newSupply.stock}
                                    onChange={e => setNewSupply({ ...newSupply, stock: Number(e.target.value) })}
                                />
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm appearance-none"
                                    value={newSupply.unit}
                                    onChange={e => setNewSupply({ ...newSupply, unit: e.target.value })}
                                >
                                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <input
                                type="number"
                                placeholder="Aviso de stock mínimo"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold text-sm"
                                value={newSupply.minStock}
                                onChange={e => setNewSupply({ ...newSupply, minStock: Number(e.target.value) })}
                            />
                        </div>

                        <button className="w-full bg-blue-500 text-slate-950 py-4 rounded-2xl font-black uppercase text-sm italic tracking-widest shadow-lg shadow-blue-500/20">
                            Confirmar Registro
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
