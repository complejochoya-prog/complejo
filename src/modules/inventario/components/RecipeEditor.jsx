import React, { useState } from 'react';
import { useInventario } from '../services/InventarioContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    BookOpen,
    Plus,
    Trash2,
    Save,
    X,
    Search,
    ChevronRight,
    UtensilsCrossed,
    Beaker
} from 'lucide-react';

export default function RecipeEditor() {
    const { kitchenSupplies } = useInventario();
    const { barProducts, updateProductRecipe } = usePedidos();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Local state for the recipe being edited
    const [tempRecipe, setTempRecipe] = useState([]);

    const filteredProducts = barProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setTempRecipe(product.recipe || []);
        setIsEditing(true);
    };

    const addIngredient = (supply) => {
        if (tempRecipe.some(i => i.supplyId === supply.id)) return;
        setTempRecipe([...tempRecipe, {
            supplyId: supply.id,
            name: supply.name,
            amount: 0,
            unit: supply.unit
        }]);
    };

    const removeIngredient = (supplyId) => {
        setTempRecipe(tempRecipe.filter(i => i.supplyId !== supplyId));
    };

    const updateIngredientAmount = (supplyId, amount) => {
        setTempRecipe(tempRecipe.map(i =>
            i.supplyId === supplyId ? { ...i, amount: Number(amount) } : i
        ));
    };

    const handleSave = async () => {
        await updateProductRecipe(selectedProduct.id, tempRecipe);
        setIsEditing(false);
        setSelectedProduct(null);
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter pb-24">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl">
                    <BookOpen className="text-purple-400" size={32} />
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                    Editor de <span className="text-purple-400">Recetas</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-purple-500 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                        <div className="p-4 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Productos del Bar
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelectProduct(product)}
                                    className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${selectedProduct?.id === product.id ? 'bg-purple-500/10' : ''}`}
                                >
                                    <div className="text-left">
                                        <p className="font-bold text-sm">{product.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">
                                            {product.recipe?.length || 0} Insumos
                                        </p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recipe Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {isEditing ? (
                        <div className="bg-white/5 border border-purple-500/20 rounded-[40px] p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Editando Receta</p>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedProduct.name}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="bg-purple-500 text-slate-950 px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
                                        <Save size={16} /> Guardar Cambios
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="bg-white/5 text-slate-400 p-3 rounded-2xl">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Ingredients in Recipe */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <UtensilsCrossed size={14} /> Ingredientes requeridos
                                    </h3>
                                    <div className="space-y-3">
                                        {tempRecipe.map(ing => (
                                            <div key={ing.supplyId} className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{ing.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={ing.amount}
                                                        onChange={e => updateIngredientAmount(ing.supplyId, e.target.value)}
                                                        className="w-20 bg-black border border-white/10 rounded-xl p-2 text-center font-bold text-sm"
                                                    />
                                                    <span className="text-[10px] font-black uppercase text-slate-500 w-8">{ing.unit}</span>
                                                </div>
                                                <button onClick={() => removeIngredient(ing.supplyId)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {tempRecipe.length === 0 && (
                                            <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl text-center text-slate-600">
                                                <p className="text-xs font-bold uppercase tracking-widest">No hay ingredientes aún</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Available Supplies */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Beaker size={14} /> Seleccionar Insumos
                                    </h3>
                                    <div className="bg-slate-900/50 rounded-3xl p-4 max-h-[400px] overflow-y-auto space-y-2">
                                        {kitchenSupplies.map(supply => (
                                            <button
                                                key={supply.id}
                                                disabled={tempRecipe.some(i => i.supplyId === supply.id)}
                                                onClick={() => addIngredient(supply)}
                                                className="w-full p-3 rounded-xl border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left flex justify-between items-center group disabled:opacity-30 disabled:grayscale"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold">{supply.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{supply.category}</p>
                                                </div>
                                                <Plus size={16} className="text-slate-500 group-hover:text-purple-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center text-slate-600">
                            <UtensilsCrossed size={48} className="mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-xs">Selecciona un producto para editar su receta</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
