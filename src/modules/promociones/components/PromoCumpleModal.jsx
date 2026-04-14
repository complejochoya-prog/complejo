import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, CheckCircle2, Trash2, ChevronDown, Plus, Info } from 'lucide-react';
import { usePedidos } from '../../bar/services/PedidosContext';

export default function PromoCumpleModal({ combo, onClose, onConfirm }) {
    const { barProducts } = usePedidos();
    const scrollRef = useRef(null);

    // 1. Group items from the combo configuration
    const comboItems = combo.comboItems || [];
    const bonusItems = useMemo(() => comboItems.filter(i => i.isBonus), [comboItems]);
    const selectableItems = useMemo(() => comboItems.filter(i => !i.isBonus), [comboItems]);

    // 2. Identify unique groups for the wizard steps
    const groupNames = useMemo(() => [...new Set(selectableItems.map(i => i.group))], [selectableItems]);

    // 3. State for each group selection
    // selections[groupName] = array of { ...product, tempId }
    const [selections, setSelections] = useState(() => {
        const initial = {};
        groupNames.forEach(gn => initial[gn] = []);
        return initial;
    });

    // 4. For groups with multiple options (OR groups like Bebidas A vs B), 
    // we need to track WHICH option is active if the quantities differ.
    // By default, we'll just allow selecting any from the group until the "limit" is reached.
    // If the group has different quantities for different items, we'll use the one the user "taps" first or a toggle.
    const [activeOptionId, setActiveOptionId] = useState(() => {
        const initial = {};
        groupNames.forEach(gn => {
            const items = selectableItems.filter(i => i.group === gn);
            if (items.length > 1) initial[gn] = items[0].productId;
        });
        return initial;
    });

    // 5. Section Refs for auto-scroll
    const sectionRefs = useRef({});

    const getGroupLimit = (gn) => {
        const items = selectableItems.filter(i => i.group === gn);
        if (items.length > 1 && activeOptionId[gn]) {
            const active = items.find(i => i.productId === activeOptionId[gn]);
            return active ? active.quantity : items[0].quantity;
        }
        return items[0]?.quantity || 0;
    };

    const addItem = (groupName, product, limit, nextGroupName) => {
        const current = selections[groupName];
        if (current.length < limit) {
            const newList = [...current, { ...product, quantity: 1, tempId: Date.now() + Math.random() }];
            setSelections(prev => ({ ...prev, [groupName]: newList }));

            if (newList.length === limit && nextGroupName && sectionRefs.current[nextGroupName]) {
                sectionRefs.current[nextGroupName].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const removeItem = (groupName, tempId) => {
        setSelections(prev => ({
            ...prev,
            [groupName]: prev[groupName].filter(i => i.tempId !== tempId)
        }));
    };

    const isComplete = () => {
        return groupNames.every(gn => selections[gn].length === getGroupLimit(gn));
    };

    const handleConfirm = () => {
        const finalize = (list) => {
            const grouped = {};
            list.forEach(i => {
                if (grouped[i.id]) grouped[i.id].quantity += 1;
                else grouped[i.id] = { ...i };
            });
            return Object.values(grouped);
        };

        const finalItems = [];

        // Add user selections
        Object.values(selections).forEach(list => {
            finalItems.push(...finalize(list));
        });

        // Add bonus items
        bonusItems.forEach(bi => {
            const p = barProducts.find(prod => prod.id === bi.productId);
            if (p) finalItems.push({ ...p, quantity: bi.quantity });
        });

        onConfirm(finalItems);
    };

    const getProductName = (id) => barProducts.find(p => p.id === id)?.name || 'Producto';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-gold/20 text-gold text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Combo Wizard PRO</span>
                            {combo.modo_evento === 'cumpleaños' && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Cumpleaños</span>}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{combo.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-12">

                    {groupNames.map((gn, idx) => {
                        const itemsInGroup = selectableItems.filter(i => i.group === gn);
                        const isMultiOption = itemsInGroup.length > 1;
                        const limit = getGroupLimit(gn);
                        const currentSelections = selections[gn];
                        const nextGroupName = groupNames[idx + 1];

                        return (
                            <section
                                key={gn}
                                ref={el => sectionRefs.current[gn] = el}
                                className={`space-y-6 ${idx > 0 ? 'pt-6 border-t border-white/5' : ''}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-4">
                                        <span className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-gold italic">{idx + 1}</span>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{gn}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                {isMultiOption ? 'Elegí una opción y completá las unidades' : `Seleccioná ${limit} unidades`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isMultiOption && (
                                            <div className="flex bg-slate-800 rounded-xl p-1">
                                                {itemsInGroup.map(opt => (
                                                    <button
                                                        key={opt.productId}
                                                        onClick={() => {
                                                            if (activeOptionId[gn] !== opt.productId) {
                                                                setActiveOptionId(prev => ({ ...prev, [gn]: opt.productId }));
                                                                setSelections(prev => ({ ...prev, [gn]: [] })); // Reset if changing option
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${activeOptionId[gn] === opt.productId ? 'bg-gold text-slate-950' : 'text-slate-500'}`}
                                                    >
                                                        {getProductName(opt.productId).split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <span className={`text-sm font-black px-4 py-2 rounded-xl transition-all ${currentSelections.length === limit ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                            {currentSelections.length} / {limit}
                                        </span>
                                    </div>
                                </div>

                                {/* Slots selection */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {Array.from({ length: limit }).map((_, sIdx) => {
                                        const item = currentSelections[sIdx];
                                        return (
                                            <div key={sIdx} className={`h-12 flex-1 min-w-[120px] rounded-2xl border-2 flex items-center px-4 transition-all ${item ? 'bg-white/5 border-gold/50 text-white' : 'bg-transparent border-white/5 border-dashed text-slate-600'}`}>
                                                {item ? (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-[10px] font-black uppercase truncate max-w-[100px]">{item.name}</span>
                                                        <button onClick={() => removeItem(gn, item.tempId)} className="text-red-400 hover:text-red-300">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Slot {sIdx + 1}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {/* If it's a specific product choice (list all compatible products) */}
                                    {/* For birthday promos, if gn is 'Pizzas', we show all available pizzas */}
                                    {barProducts
                                        .filter(p => {
                                            if (gn === 'Pizzas') return p.category === 'Pizzas';
                                            if (gn === 'Tragos') return p.category === 'Tragos';
                                            if (gn === 'Bebidas') {
                                                const activeOpt = itemsInGroup.find(i => i.productId === activeOptionId[gn]);
                                                if (!activeOpt) return false;
                                                const optName = getProductName(activeOpt.productId).toLowerCase();
                                                if (optName.includes('cerveza')) return p.category === 'Cervezas';
                                                if (optName.includes('coca') || optName.includes('gaseosa')) return p.category === 'Bebidas';
                                                return p.id === activeOpt.productId;
                                            }
                                            return p.id === itemsInGroup.find(i => i.productId === activeOptionId[gn])?.productId || p.category === gn;
                                        })
                                        .filter(p => p.disponible !== false)
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => addItem(gn, p, limit, nextGroupName)}
                                                disabled={currentSelections.length >= limit}
                                                className={`group p-4 rounded-2xl border transition-all text-left flex flex-col gap-1 ${currentSelections.length < limit ? 'bg-slate-800/50 border-white/5 hover:border-gold/50 hover:bg-slate-800' : 'opacity-40 border-white/5 grayscale'}`}
                                            >
                                                <span className="text-[10px] font-black text-gold/60 uppercase tracking-widest">{p.category}</span>
                                                <span className="text-xs font-bold text-white leading-tight truncate">{p.name}</span>
                                            </button>
                                        ))}
                                </div>
                            </section>
                        );
                    })}

                    {/* Bonus Items View */}
                    {bonusItems.length > 0 && (
                        <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Info size={16} className="text-blue-400" />
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Incluido automáticamente (Bonus)</h4>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {bonusItems.map(bi => (
                                    <div key={bi.productId} className="px-4 py-2 bg-slate-950 rounded-xl border border-white/10 flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-300">{bi.quantity}x {getProductName(bi.productId)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
                    <button
                        onClick={handleConfirm}
                        disabled={!isComplete()}
                        className={`w-full py-5 rounded-3xl font-black text-base uppercase tracking-widest italic flex items-center justify-center gap-3 transition-all transform active:scale-95 ${isComplete() ? 'bg-gold text-slate-950 shadow-2xl shadow-gold/40 hover:scale-[1.02]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        {isComplete() ? <><CheckCircle2 size={24} /> Confirmar Combo</> : <><ChevronDown size={24} className="animate-bounce" /> Completar Todas las Secciones</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
