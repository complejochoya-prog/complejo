import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useCaja from '../hooks/useCaja';
import CajaResumen from '../components/CajaResumen';
import MovimientoCard from '../components/MovimientoCard';
import MovimientoForm from '../components/MovimientoForm';
import TransferGallery from '../components/TransferGallery';
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
    Zap,
    LayoutGrid,
    Eye,
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
    const [filterType, setFilterType] = useState('all'); 
    const [isAperturando, setIsAperturando] = useState(false);
    const [montoInicial, setMontoInicial] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    if (loading)
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                <div className="absolute inset-0 animate-pulse opacity-10 bg-gradient-to-br from-indigo-500 via-transparent to-rose-500" />
                <div className="relative">
                    <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
                        <Loader2 className="animate-spin text-white opacity-40" size={40} />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
                    </div>
                    <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl animate-pulse" />
                </div>
                <div className="space-y-2 text-center relative z-10">
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/50">
                        Cargando Bóveda
                    </p>
                    <div className="flex gap-1 justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    </div>
                </div>
            </div>
        );

    const filteredMovements = (movements || []).filter((m) => {
        const matchSearch =
            (m.categoria || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.origen || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || m.tipo === filterType;
        return matchSearch && matchType;
    });

    const handleOpenBox = () => setIsAperturando(true);

    const handleConfirmOpen = () => {
        const amount = parseFloat(montoInicial) || 0;
        startSession(amount);
        setIsAperturando(false);
        setMontoInicial('');
    };

    const handleCloseBox = () => {
        if (window.confirm('¿Deseas cerrar la caja actual? Se generará un registro histórico.')) {
            endSession();
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Confirmas la eliminación de este registro?')) {
            removeMovement(id);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 pb-20 overflow-hidden">
            
            {/* ── Background Magic ── */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 pointer-events-none" />
            </div>

            <div className="relative z-10 space-y-10 max-w-[1400px] mx-auto px-6 pt-10">
                {/* ── Header ── */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="relative group">
                            <div className={`absolute -inset-1 rounded-[28px] blur-xl transition-all duration-500 opacity-50 ${
                                session?.isOpen ? 'bg-emerald-500 group-hover:opacity-80' : 'bg-rose-500'
                            }`} />
                            <div className={`relative w-20 h-20 rounded-[28px] flex items-center justify-center border shadow-2xl transition-all transform group-hover:scale-105 active:scale-95 ${
                                session?.isOpen 
                                ? 'bg-slate-900 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-900 text-rose-400 border-rose-500/30'
                            }`}>
                                {session?.isOpen ? <Unlock size={40} className="stroke-[2.5px]" /> : <Lock size={40} className="stroke-[2.5px]" />}
                            </div>
                        </div>
                        <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
                                    CAJA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">MÁGICA</span>
                                </h1>
                                <div className="hidden sm:block">
                                    {session?.isOpen ? (
                                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                            En Línea
                                        </div>
                                    ) : (
                                        <div className="bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-rose-500/20">
                                            Fuera de Servicio
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                                <Zap size={10} className="text-amber-500" />
                                Sistema Central de Movimientos Giovanni
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex p-1 gap-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                            <button onClick={refresh} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all active:rotate-180 duration-700">
                                <RefreshCcw size={20} />
                            </button>
                            <button onClick={() => navigate(`/${negocioId}/caja/historial`)} className="px-6 h-12 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                <History size={20} /> Historial
                            </button>
                        </div>

                        {session?.isOpen ? (
                            <button onClick={handleCloseBox} className="h-14 px-8 rounded-2xl bg-rose-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_20px_40px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <Lock size={18} /> Cerrar Turno
                            </button>
                        ) : (
                            <button onClick={handleOpenBox} className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <Unlock size={18} /> Abrir Turno
                            </button>
                        )}
                    </div>
                </header>

                {/* ── Dashboard Grid ── */}
                {session?.isOpen ? (
                    <div className="space-y-12">
                        {/* Summary Section */}
                        <CajaResumen stats={stats} />

                        {/* Middle Action Bar & Stats */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            
                            {/* Distribution */}
                            <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Reservas */}
                                <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.05] transition-all">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <CalendarCheck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Canchas & Turnos</p>
                                            <h4 className="text-3xl font-black text-white italic tracking-tighter">${(stats.reservasVentas || 0).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-tl-full blur-2xl" />
                                </div>
                                {/* Bar */}
                                <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.05] transition-all">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Utensils size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Consumo de Bar</p>
                                            <h4 className="text-3xl font-black text-white italic tracking-tighter">${(stats.barVentas || 0).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 rounded-tl-full blur-2xl" />
                                </div>
                                {/* Delivery */}
                                <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.05] transition-all">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Delivery App</p>
                                            <h4 className="text-3xl font-black text-white italic tracking-tighter">${(stats.deliveryVentas || 0).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-sky-500/5 rounded-tl-full blur-2xl" />
                                </div>
                            </div>

                            {/* Payment Methods Compact */}
                            <div className="xl:col-span-4 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                                    <CreditCard size={14} className="text-indigo-400" /> Métodos de Cobro
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Banknote, label: 'Efectivo', val: stats.porEfectivo, color: 'text-emerald-400' },
                                        { icon: CreditCard, label: 'Transferencia', val: stats.porTransferencia, color: 'text-blue-400' },
                                        { icon: Smartphone, label: 'MercadoPago', val: stats.porMercadopago, color: 'text-sky-400' }
                                    ].map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-3">
                                                <m.icon size={18} className={m.color} />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">{m.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {m.label === 'Transferencia' && (
                                                    <button 
                                                        onClick={() => setIsGalleryOpen(true)}
                                                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all group/btn"
                                                        title="Ver Comprobantes"
                                                    >
                                                        <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                                <span className="text-lg font-black text-white italic tracking-tighter">${(m.val || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Movements Section */}
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Transacciones Recientes</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Últimos movimientos sincronizados hoy</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    {/* Search */}
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="CATEGORÍA O REF..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-black text-white focus:outline-none focus:border-indigo-500/50 focus:w-72 transition-all w-56 placeholder:text-slate-600"
                                        />
                                    </div>

                                    {/* Filter Pills */}
                                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                                        {['all', 'entrada', 'salida'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setFilterType(t)}
                                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                                                    filterType === t ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                            >
                                                {t === 'all' ? 'Ver Todos' : t === 'entrada' ? 'Ingresos' : 'Egresos'}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={() => setIsFormOpen(true)} className="h-14 w-14 sm:w-auto sm:px-8 rounded-2xl bg-white text-slate-950 shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3">
                                        <Plus size={20} className="stroke-[3px]" />
                                        <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest">Registrar</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMovements.length > 0 ? (
                                    filteredMovements.map((m) => (
                                        <MovimientoCard key={m.id} movimiento={m} onDelete={handleDelete} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 flex flex-col items-center gap-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
                                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 shadow-inner">
                                            <Search size={32} />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">Sin movimientos que mostrar</p>
                                            <button onClick={() => setIsFormOpen(true)} className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:underline">Registrar el primero ahora</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Off State ── */
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-all duration-1000" />
                            <div className="relative w-48 h-48 bg-slate-900 rounded-[56px] flex items-center justify-center text-slate-700 border border-white/5 shadow-2xl">
                                <Lock size={80} className="stroke-[1px] opacity-20" />
                                <div className="absolute p-4 bg-rose-500/10 rounded-3xl border border-rose-500/30">
                                    <X size={32} className="text-rose-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-white leading-none">Caja <span className="opacity-30">Inactiva</span></h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] px-10 max-w-lg mx-auto">Debes realizar la apertura del turno financiero para comenzar a sincronizar ventas y gastos.</p>
                        </div>
                        <button onClick={handleOpenBox} className="group bg-indigo-500 text-slate-950 px-12 py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-[13px] shadow-[0_30px_60px_rgba(99,102,241,0.4)] hover:scale-105 hover:bg-white active:scale-95 transition-all flex items-center gap-4">
                            <Unlock size={24} className="group-hover:rotate-12 transition-transform" />
                            Comenzar Jornada
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <MovimientoForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={recordMovement}
            />

            {/* ── Open Caja Modal ── */}
            {isAperturando && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="relative bg-slate-900 w-full max-w-lg rounded-[48px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white flex items-center gap-4">
                                    <Unlock className="text-emerald-500" size={32} /> Apertura
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 italic">Declara el saldo inicial para continuar</p>
                            </div>
                            <button onClick={() => setIsAperturando(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 px-2 flex items-center gap-2">
                                    <Banknote size={14} /> Efectivo Inicial
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 font-black text-4xl group-focus-within:text-emerald-400 transition-colors">$</span>
                                    <input
                                        type="number"
                                        value={montoInicial}
                                        onChange={(e) => setMontoInicial(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-[32px] pl-20 pr-8 py-8 text-5xl font-black text-white focus:outline-none focus:border-emerald-500/50 shadow-inner placeholder:text-slate-900 transition-all"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button onClick={handleConfirmOpen} className="w-full h-20 rounded-[32px] bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[14px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Confirmar y Abrir Turno
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <TransferGallery 
                isOpen={isGalleryOpen} 
                onClose={() => setIsGalleryOpen(false)} 
                movements={movements} 
            />
        </div>
    );
}
