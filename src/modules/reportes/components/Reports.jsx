import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useConfig } from '../../core/services/ConfigContext';
import {
    Calendar,
    TrendingUp,
    DollarSign,
    Users,
    ChevronRight,
    FileText,
    Download,
    Filter,
    ArrowLeft,
    Loader2
} from 'lucide-react';

export default function Reports() {
    const { negocioId } = useConfig();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!negocioId) return;
        const fetchReports = async () => {
            try {
                const q = query(collection(db, 'negocios', negocioId, 'reports'), orderBy('timestamp', 'desc'));
                const snapshot = await getDocs(q);
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
                setReports(list);
                if (list.length > 0) setSelectedReport(list[0]);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [negocioId]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-background-dark">
            <Loader2 className="animate-spin text-gold size-12" />
        </div>
    );

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-24">
            <style>{`
                .glass-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(242, 185, 13, 0.1);
                }
                .italic-caps {
                    font-style: italic;
                    text-transform: uppercase;
                    font-weight: 800;
                }
            `}</style>

            <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="bg-primary p-1.5 rounded-lg text-background-dark">
                            <ArrowLeft size={20} strokeWidth={3} />
                        </Link>
                        <h1 className="text-xl italic-caps tracking-tighter text-primary">Reportes Históricos</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-20 py-10 animate-in fade-in duration-700">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-4xl italic-caps text-slate-100 mb-2">
                            {selectedReport ? `Reporte: ${selectedReport.date}` : 'Historial de Registros'}
                        </h2>
                        <p className="text-primary font-medium tracking-widest text-sm italic-caps">Visualización de Cierres Diarios</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                onChange={(e) => setSelectedReport(reports.find(r => r.id === e.target.value))}
                                className="appearance-none bg-slate-800 text-white px-6 py-3 rounded-lg font-bold text-sm border border-slate-700 uppercase outline-none pr-10"
                            >
                                {reports.map(r => (
                                    <option key={r.id} value={r.id}>{r.date}</option>
                                ))}
                                {reports.length === 0 && <option>No hay registros</option>}
                            </select>
                            <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {selectedReport ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="glass-card rounded-lg p-8 flex flex-col justify-between min-h-[180px]">
                                <p className="text-sm italic-caps text-slate-400">Total Recaudado</p>
                                <h3 className="text-4xl font-black text-slate-100">${selectedReport.totalRevenue?.toLocaleString()}</h3>
                            </div>
                            <div className="glass-card rounded-lg p-8 flex flex-col justify-between min-h-[180px]">
                                <p className="text-sm italic-caps text-slate-400">Ventas Bar</p>
                                <h3 className="text-4xl font-black text-slate-100">${selectedReport.stats?.bar?.toLocaleString() || 0}</h3>
                            </div>
                            <div className="glass-card rounded-lg p-8 flex flex-col justify-between min-h-[180px]">
                                <p className="text-sm italic-caps text-slate-400">Alquileres</p>
                                <h3 className="text-4xl font-black text-slate-100">${selectedReport.stats?.rentals?.toLocaleString() || 0}</h3>
                            </div>
                        </div>

                        <div className="glass-card rounded-lg overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/40">
                                <h3 className="text-xl italic-caps text-slate-100">Detalle de Operaciones</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h4 className="text-gold italic-caps text-sm border-b border-gold/20 pb-2">Pedidos de Bar ({selectedReport.orderCount})</h4>
                                    <ul className="space-y-2">
                                        {selectedReport.orders?.map((o, i) => (
                                            <li key={i} className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-400">
                                                <span>Cte: {o.clientName || 'Sin nombre'}</span>
                                                <span className="text-white">${o.total}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-gold italic-caps text-sm border-b border-gold/20 pb-2">Reservas de Canchas ({selectedReport.bookingCount})</h4>
                                    <ul className="space-y-2">
                                        {selectedReport.bookings?.map((b, i) => (
                                            <li key={i} className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-400">
                                                <span>{b.resource?.name} - {b.time}</span>
                                                <span className="text-white">${b.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-500 italic-caps">No hay datos históricos para mostrar</p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-6 py-4 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link to="/reports" className="flex flex-col items-center gap-1 text-primary group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform font-bold">home</span>
                        <span className="text-[8px] font-black italic-caps tracking-widest">Inicio</span>
                    </Link>
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-500 group">
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">calendar_month</span>
                        <span className="text-[8px] font-black italic-caps tracking-widest">Agenda</span>
                    </Link>
                    <Link to="/registration-in-person" className="flex flex-col items-center gap-1 -mt-10 group">
                        <div className="bg-primary text-background-dark p-4 rounded-full shadow-2xl shadow-primary/40 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                            <span className="material-symbols-outlined text-3xl font-black">add</span>
                        </div>
                    </Link>
                    <Link to="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 group">
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">admin_panel_settings</span>
                        <span className="text-[8px] font-black italic-caps tracking-widest">Admin</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center gap-1 text-slate-500 group">
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
                        <span className="text-[8px] font-black italic-caps tracking-widest">Ajustes</span>
                    </Link>
                </div>
            </nav>

            {/* Decorative Gradients */}
            <div className="fixed top-0 left-1/4 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
            <div className="fixed bottom-0 right-1/4 -z-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        </div>
    );
}
