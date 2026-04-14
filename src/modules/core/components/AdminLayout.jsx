import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, Settings, User, Trophy, WifiOff } from 'lucide-react';
import useOnlineStatus from '../../../hooks/useOnlineStatus';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isOnline = useOnlineStatus();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const pathSegments = location.pathname.split('/');
        const negocioId = pathSegments[1] && pathSegments[1] !== 'admin' ? pathSegments[1] : 'giovanni';

        if (role === 'mozo') {
            if (!location.pathname.endsWith('/mozo')) {
                navigate(`/${negocioId}/mozo`, { replace: true });
            }
        } else if (role === 'delivery') {
            if (!location.pathname.endsWith('/delivery')) {
                navigate(`/${negocioId}/delivery`, { replace: true });
            }
        } else if (role === 'cocina' || role === 'encargado_cocina') {
            const allowedKeywords = ['cocina', 'comandas', 'kitchen-supplies', 'recipes', 'supplier-orders'];
            const isAllowed = allowedKeywords.some(kw => location.pathname.includes(kw));
            if (!isAllowed) {
                navigate(`/${negocioId}/admin/cocina`, { replace: true });
            }
        }
    }, [navigate, location.pathname]);

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col font-inter">
            {!isOnline && (
                <div className="bg-red-500/90 w-full text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 sticky z-[200] top-0 backdrop-blur-md">
                    <WifiOff size={14} />
                    Sin conexión — Operando en modo offline. Los cambios se sincronizarán al reconectar.
                </div>
            )}
            
            {/* Master Admin Header */}
            <header className={`${isOnline ? 'sticky top-0' : 'relative'} z-[100] w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-6 py-4`}>
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
                    <div className="flex items-center gap-10">
                        <Link to="/home" className="flex items-center gap-2">
                            <div className="bg-gold p-1 rounded-lg">
                                <Trophy size={18} className="text-slate-950 fill-slate-950" />
                            </div>
                            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                                GIOVANNI <span className="text-gold not-italic font-normal opacity-80">MASTER</span>
                            </h2>
                        </Link>

                        <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2 focus-within:border-gold/50 transition-all w-80 group">
                            <Search size={16} className="text-slate-500 group-focus-within:text-gold transition-colors" />
                            <input
                                className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-slate-600 pl-3 outline-none"
                                placeholder="Buscar reservas, stocks..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                        </button>
                        <Link to="/settings" className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 transition-all">
                            <Settings size={20} />
                        </Link>
                        <div className="h-8 w-[1px] bg-white/10 mx-2 invisible md:visible"></div>
                        <Link to="/profile" className="flex items-center gap-3 pl-2 group">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">Admin Giovanni</p>
                                <p className="text-[8px] text-gold/60 font-bold uppercase tracking-widest leading-none">Dueño / Master</p>
                            </div>
                            <div className="size-10 rounded-2xl border-2 border-gold/30 p-0.5 group-hover:border-gold transition-colors">
                                <img
                                    alt="Admin"
                                    className="w-full h-full object-cover rounded-[14px]"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1J3X5g-DaouuCrsDDFAtQJvE5kOGUiwznaKvwlIQJT0kKmoPukAQ44jCm2Ulfv9nS7enYDMm-7ic72Fc6_UEu4CgHmWyFBOzGfdcXd48hA06kAY4RlDeeks2Hr7tmDQ6IrLxCKIQJF-6FVyRsRvTTp6WwRHPZBJfLcjFyJU4gOCef0KMa_oHfDBFniwgGO5WcoadcbqMlhoXL6isOgTfQ9y_aunOjmrl8jr5zE0v2F9Kmd-FXTBiH5M0atA5WJoS77tWScHBfNDM"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex max-w-[1600px] mx-auto w-full relative">
                <Sidebar />
                <main className="flex-1 lg:ml-72 p-6 lg:p-10 min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
