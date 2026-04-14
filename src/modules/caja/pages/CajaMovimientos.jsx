import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAllMovements } from '../services/cajaService';
import MovimientoCard from '../components/MovimientoCard';
import { deleteMovement } from '../services/cajaService';
import {
    ArrowLeft,
    Search,
    Filter,
    X,
    Calendar,
    Loader2,
    TrendingUp,
    TrendingDown,
    Download,
} from 'lucide-react';

export default function CajaMovimientos() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        fecha: '',
        tipo: '',
        categoria: '',
        origen: '',
        metodo_pago: '',
    });

    const loadMovements = async () => {
        setLoading(true);
        try {
            const activeFilters = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) activeFilters[key] = value;
            });
            const data = await fetchAllMovements(activeFilters);
            setMovements(data);
        } catch (err) {
            console.error('Error loading all movements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMovements();
    }, [filters]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este movimiento?')) {
            await deleteMovement(id);
            await loadMovements();
        }
    };

    const clearFilters = () => {
        setFilters({ fecha: '', tipo: '', categoria: '', origen: '', metodo_pago: '' });
        setSearchTerm('');
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    const displayedMovements = movements.filter((m) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            m.categoria.toLowerCase().includes(term) ||
            m.descripcion.toLowerCase().includes(term) ||
            m.usuario.toLowerCase().includes(term) ||
            m.origen.toLowerCase().includes(term)
        );
    });

    // Stats
    const totalIngresos = displayedMovements
        .filter((m) => m.tipo === 'entrada')
        .reduce((a, b) => a + b.monto, 0);
    const totalEgresos = displayedMovements
        .filter((m) => m.tipo === 'salida')
        .reduce((a, b) => a + b.monto, 0);

    // Group movements by date
    const groupedByDate = {};
    displayedMovements.forEach((m) => {
        if (!groupedByDate[m.fecha]) groupedByDate[m.fecha] = [];
        groupedByDate[m.fecha].push(m);
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/${negocioId}/caja`)}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Todos los Movimientos
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Historial completo de transacciones
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-xl ${
                            showFilters || hasActiveFilters
                                ? 'bg-indigo-500 text-slate-950 border-indigo-500/50'
                                : 'bg-slate-900 text-white border-white/5'
                        }`}
                    >
                        <Filter size={15} /> Filtros
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                    </button>

                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-5 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Filtros Avanzados
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={filters.fecha}
                                onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                                Tipo
                            </label>
                            <select
                                value={filters.tipo}
                                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todos</option>
                                <option value="entrada">Ingresos</option>
                                <option value="salida">Egresos</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                                Origen
                            </label>
                            <select
                                value={filters.origen}
                                onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todos</option>
                                <option value="reserva">Reserva</option>
                                <option value="bar">Bar</option>
                                <option value="delivery">Delivery</option>
                                <option value="manual">Manual</option>
                                <option value="gasto">Gasto</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                                Método de Pago
                            </label>
                            <select
                                value={filters.metodo_pago}
                                onChange={(e) => setFilters({ ...filters, metodo_pago: e.target.value })}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todos</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="mercadopago">MercadoPago</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                                Categoría
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={filters.categoria}
                                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/50 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                        <Download size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Movimientos
                        </p>
                        <p className="text-lg font-black text-white italic tracking-tighter">
                            {displayedMovements.length}
                        </p>
                    </div>
                </div>
                <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Total Ingresos
                        </p>
                        <p className="text-lg font-black text-emerald-400 italic tracking-tighter">
                            ${totalIngresos.toLocaleString('es-AR')}
                        </p>
                    </div>
                </div>
                <div className="bg-rose-500/[0.04] border border-rose-500/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-rose-500/15 rounded-xl flex items-center justify-center">
                        <TrendingDown size={16} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Total Egresos
                        </p>
                        <p className="text-lg font-black text-rose-400 italic tracking-tighter">
                            ${totalEgresos.toLocaleString('es-AR')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Movements grouped by date */}
            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            ) : displayedMovements.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[32px] border border-dashed border-white/[0.06]">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
                        <Search size={24} />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        No se encontraron movimientos con los filtros aplicados
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                Object.entries(groupedByDate).map(([date, moves]) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-3 px-2">
                            <Calendar size={14} className="text-slate-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </h3>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                        {moves.map((m) => (
                            <MovimientoCard key={m.id} movimiento={m} onDelete={handleDelete} />
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}
