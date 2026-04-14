import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useCaja from '../hooks/useCaja';
import CajaResumen from '../components/CajaResumen';
import MovimientoCard from '../components/MovimientoCard';
import MovimientoForm from '../components/MovimientoForm';
import {
    Plus,
    Lock,
    Unlock,
    RefreshCcw,
    Search,
    History,
    Loader2,
    CalendarCheck,
    Coffee,
    Truck,
    Banknote,
    CreditCard,
    Smartphone,
    TrendingUp,
    X,
    Utensils,
    ChevronRight,
} from 'lucide-react';

export default function CajaDashboard() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const {
        session,
        stats,
        movements,
        loading,
        recordMovement,
        removeMovement,
        startSession,
        endSession,
        refresh,
    } = useCaja();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all | entrada | salida
    const [isAperturando, setIsAperturando] = useState(false);
    const [montoInicial, setMontoInicial] = useState('');

    if (loading)
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-ping" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Cargando caja...
                </p>
            </div>
        );

    const filteredMovements = (movements || []).filter((m) => {
        const matchSearch =
            m.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.origen.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || m.tipo === filterType;
        return matchSearch && matchType;
    });

    const handleOpenBox = () => {
        setIsAperturando(true);
    };

    const handleConfirmOpen = () => {
        const amount = parseFloat(montoInicial) || 0;
        startSession(amount);
        setIsAperturando(false);
        setMontoInicial('');
    };

    const handleCloseBox = () => {
        if (
            window.confirm(
                '¿Estás seguro de cerrar la caja actual?\n\nSe generará un reporte de cierre con todos los movimientos del turno.'
            )
        ) {
            endSession();
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este movimiento?')) {
            removeMovement(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-all ${
                            session?.isOpen
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/10'
                        }`}
                    >
                        {session?.isOpen ? <Unlock size={28} /> : <Lock size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                                Gestión de Caja
                            </h1>
                            {session?.isOpen ? (
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                                    Caja Abierta
                                </span>
                            ) : (
                                <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/20">
                                    Caja Cerrada
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Centro financiero — Control de movimientos y arqueos
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={refresh}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 shadow-xl transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCcw size={18} />
                    </button>

                    <button
                        onClick={() => navigate(`/${negocioId}/caja/historial`)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl"
                    >
                        <History size={16} /> Historial
                    </button>

                    <button
                        onClick={() => navigate(`/${negocioId}/caja/movimientos`)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl"
                    >
                        <TrendingUp size={16} /> Todos
                    </button>

                    {session?.isOpen ? (
                        <button
                            onClick={handleCloseBox}
                            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-slate-950 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20"
                        >
                            <Lock size={16} /> Cerrar Caja
                        </button>
                    ) : (
                        <button
                            onClick={handleOpenBox}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                        >
                            <Unlock size={16} /> Abrir Caja
                        </button>
                    )}
                </div>
            </header>

            {/* ── Main Content ── */}
            {session?.isOpen ? (
                <>
                    {/* Summary Cards */}
                    <CajaResumen stats={stats} />

                    {/* Origin Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/[0.04] border border-emerald-500/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-emerald-500/[0.07] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500">
                                    <CalendarCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Cobros Reservas
                                    </p>
                                    <p className="text-2xl font-black text-white italic tracking-tighter">
                                        ${(stats.reservasVentas || 0).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-500/[0.04] border border-indigo-500/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-indigo-500/[0.07] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center text-indigo-500">
                                    <Coffee size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Ventas del Bar
                                    </p>
                                    <p className="text-2xl font-black text-white italic tracking-tighter">
                                        ${(stats.barVentas || 0).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link 
                            to={`/${negocioId}/caja/movimientos`}
                            className="bg-sky-500/[0.04] border border-sky-500/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-sky-500/[0.07] transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-sky-500/15 rounded-xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Cobros Delivery
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-black text-white italic tracking-tighter">
                                            ${(stats.deliveryVentas || 0).toLocaleString('es-AR')}
                                        </p>
                                        <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 rounded">
                                            {stats.deliveryCount || 0} envíos
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                        </Link>
                    </div>

                    {/* Payment Methods Breakdown */}
                    <div className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-1">
                            Desglose por Método de Pago
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 bg-slate-950/50 rounded-2xl p-4 border border-white/[0.03]">
                                <Banknote size={18} className="text-emerald-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        Efectivo
                                    </p>
                                    <p className="text-lg font-black text-emerald-400 italic tracking-tighter">
                                        ${(stats.porEfectivo || 0).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-950/50 rounded-2xl p-4 border border-white/[0.03]">
                                <CreditCard size={18} className="text-blue-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        Transferencia
                                    </p>
                                    <p className="text-lg font-black text-blue-400 italic tracking-tighter">
                                        ${(stats.porTransferencia || 0).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-950/50 rounded-2xl p-4 border border-white/[0.03]">
                                <Smartphone size={18} className="text-sky-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        MercadoPago
                                    </p>
                                    <p className="text-lg font-black text-sky-400 italic tracking-tighter">
                                        ${(stats.porMercadopago || 0).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Movements List ── */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">
                                Movimientos del Turno
                            </h2>

                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Filter Type Pills */}
                                <div className="flex bg-slate-900 rounded-xl border border-white/5 p-1">
                                    {['all', 'entrada', 'salida'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setFilterType(t)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                filterType === t
                                                    ? t === 'entrada'
                                                        ? 'bg-emerald-500 text-slate-950'
                                                        : t === 'salida'
                                                        ? 'bg-rose-500 text-slate-950'
                                                        : 'bg-white text-slate-950'
                                                    : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            {t === 'all' ? 'Todos' : t === 'entrada' ? 'Ingresos' : 'Egresos'}
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="relative flex-1 md:w-56">
                                    <Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                                        size={15}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* New Movement Button */}
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-slate-200"
                                >
                                    <Plus size={16} /> Nuevo
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredMovements.length > 0 ? (
                                filteredMovements.map((m) => (
                                    <MovimientoCard
                                        key={m.id}
                                        movimiento={m}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[32px] border border-dashed border-white/[0.06]">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                        <Search size={24} />
                                    </div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        No se encontraron movimientos
                                    </p>
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
                                    >
                                        + Registrar el primero
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                /* ── Caja Cerrada State ── */
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative">
                        <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center text-slate-700 border border-white/5 shadow-inner">
                            <Lock size={56} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30">
                            <X size={16} className="text-rose-500" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white">
                            Caja Cerrada
                        </h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest px-10 max-w-md">
                            Debes abrir el turno para comenzar a registrar movimientos de dinero
                        </p>
                    </div>
                    <button
                        onClick={handleOpenBox}
                        className="group bg-indigo-500 text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Unlock size={20} className="group-hover:rotate-12 transition-transform" />
                        Abrir Turno de Caja
                    </button>
                </div>
            )}

            {/* ── Movement Form Modal ── */}
            <MovimientoForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={recordMovement}
            />

            {/* ── Open Caja Modal ── */}
            {isAperturando && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAperturando(false)} />
                    <div className="relative bg-slate-900 w-full max-w-md rounded-[32px] border border-emerald-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                                    <Unlock className="text-emerald-500" size={22} /> Abrir Caja
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                                    Iniciar turno de trabajo
                                </p>
                            </div>
                            <button onClick={() => setIsAperturando(false)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                    Monto inicial en caja (efectivo)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={montoInicial}
                                        onChange={(e) => setMontoInicial(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl pl-12 pr-5 py-5 text-2xl font-black text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="50000"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleConfirmOpen}
                                className="w-full py-5 rounded-2xl bg-emerald-500 text-slate-950 text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                            >
                                <Unlock size={18} /> Confirmar Apertura
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
