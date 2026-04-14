import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import InstallButton from './InstallButton';

export default function ModuleCard({ module, isInstalling, onInstall, onUninstall, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="group bg-slate-900 border border-white/5 p-6 rounded-[32px] hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-950 rounded-[20px] flex items-center justify-center text-3xl shadow-inner border border-white/5 group-hover:bg-indigo-500/10 transition-colors">
                    {module.icon}
                </div>
                {module.price === 0 ? (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Gratis</span>
                ) : (
                    <div className="text-right">
                        <span className="text-[10px] font-black text-indigo-400 italic block leading-none">${module.price.toLocaleString()}</span>
                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Pago único</span>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-2 mb-8">
                <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    {module.name}
                    {module.installed && <ShieldCheck size={14} className="text-emerald-400" />}
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                    {module.desc}
                </p>
            </div>

            <div className="pt-2">
                <InstallButton 
                    isInstalled={module.installed} 
                    isInstalling={isInstalling}
                    onClick={(e) => {
                        e.stopPropagation();
                        module.installed ? onUninstall(module.id) : onInstall(module.id);
                    }}
                />
            </div>
        </div>
    );
}
