import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle, LogOut } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useEmployeeAuth } from '../hooks/useEmployeeAuth';
import EmployeeNavbar from '../components/EmployeeNavbar';

export default function EmployeeProfile() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { employeeUser, logout } = useEmployeeAuth(negocioId);

    if (!employeeUser) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <EmployeeNavbar roleName={employeeUser.name} onLogout={logout} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full mt-8">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="w-24 h-24 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-xl relative z-10 border border-indigo-500/30">
                        <UserCircle size={48} />
                    </div>

                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white z-10 mb-2">
                        {employeeUser.name}
                    </h2>
                    
                    <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest z-10 mb-8 flex items-center gap-2">
                        <ShieldCheck size={16} /> Permisos: {employeeUser.role}
                    </span>

                    <button 
                        onClick={logout}
                        className="bg-red-500/10 border border-red-500/30 text-red-500 w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 shadow-lg z-10"
                    >
                        <LogOut size={18} /> Cerrar Turno
                    </button>
                </div>
            </div>
        </div>
    );
}
