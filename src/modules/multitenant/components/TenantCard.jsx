import React from 'react';
import { 
    LayoutDashboard, 
    Shield, 
    Activity, 
    MoreVertical, 
    AlertCircle, 
    MapPin,
    Users
} from 'lucide-react';

export default function TenantCard({ tenant, onToggleStatus, onClick }) {
    const isSuspended = tenant.estado === 'suspendido';

    return (
        <div 
            onClick={onClick}
            className={`group bg-slate-900 border ${isSuspended ? 'border-red-500/20 shadow-red-500/5' : 'border-white/5 hover:border-indigo-500/30'} rounded-[32px] p-6 transition-all cursor-pointer relative overflow-hidden active:scale-95`}
        >
            {/* Status light */}
            <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${isSuspended ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSuspended ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400 shadow-inner'}`}>
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
                            {tenant.nombre}
                            {isSuspended && <AlertCircle size={14} className="text-red-500" />}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <MapPin size={10} />
                            slug: <span className="text-indigo-400/70">{tenant.id}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Plan SaaS</span>
                        <div className="flex items-center gap-2">
                            <Shield size={12} className="text-amber-500" />
                            <span className="text-sm font-black italic text-white">{tenant.plan}</span>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Usuarios</span>
                        <div className="flex items-center gap-2">
                            <Users size={12} className="text-indigo-400" />
                            <span className="text-sm font-black italic text-white">{tenant.inscritos}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-500">Ingresos Mes</span>
                        <span className="text-base font-black italic text-emerald-400">${tenant.ingresos.toLocaleString()}</span>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(tenant.id, tenant.estado);
                        }}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                            isSuspended 
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                    >
                        {isSuspended ? 'Reactivar' : 'Suspender'}
                    </button>
                </div>
            </div>
        </div>
    );
}
