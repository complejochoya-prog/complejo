import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';
import TenantCard from '../components/TenantCard';
import TenantStats from '../components/TenantStats';
import { Plus, Search, Filter, RotateCw, Loader2 } from 'lucide-react';

export default function SuperAdminTenants() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');
    const { tenants, stats, loading, toggleStatus, refresh } = useTenant();

    const filteredTenants = tenants.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
                        Gestión de <span className="text-indigo-400">Complejos</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 px-1">Plataforma SaaS Multitenant Giovanni</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={refresh}
                        className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
                    >
                        <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => navigate('/superadmin/crear-complejo')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        Nuevo Complejo
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <TenantStats stats={stats} />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o ID de complejo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-[20px] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                    />
                </div>
                <button className="bg-slate-900 border border-white/5 px-6 py-4 rounded-[20px] flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                    <Filter size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
                </button>
            </div>

            {/* Grid */}
            {loading && tenants.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cargando ecosistema...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTenants.map(tenant => (
                        <TenantCard 
                            key={tenant.id} 
                            tenant={tenant} 
                            onToggleStatus={toggleStatus}
                            onClick={() => navigate(`/superadmin/complejo/${tenant.id}`)}
                        />
                    ))}
                    {filteredTenants.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center font-black uppercase text-slate-700 tracking-[0.3em] italic">
                            No se encontraron complejos
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
