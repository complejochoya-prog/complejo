import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Key, Code, Copy, 
    RefreshCw, ShieldCheck, Globe, Database,
    Server, ExternalLink, Check
} from 'lucide-react';

export default function ApiManagement() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('sk_live_51M4jGhH4p2Lp8t9Q...');
    const [copied, setCopied] = useState(false);

    const endpoints = [
        { path: '/api/reservas', method: 'GET', desc: 'Listar y filtrar reservas en tiempo real' },
        { path: '/api/clientes', method: 'POST', desc: 'Registrar o consultar base de datos de clientes' },
        { path: '/api/torneos', method: 'GET', desc: 'Obtener fixtures, tablas y resultados' },
        { path: '/api/pagos', method: 'POST', desc: 'Sincronizar cobros externos con la caja' },
        { path: '/api/canchas', method: 'GET', desc: 'Disponibilidad instantánea de campos' }
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver al Marketplace
            </button>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-4">
                        <Key size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                            Developer Gateway
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                        API <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Pública</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 px-1">Conecta tus propias apps y automatizaciones externas</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                        <Code size={18} />
                        Documentación SDK
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: API Key & Security */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck size={100} />
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-widest text-white mb-2">Tu API Key</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Usa esta clave para autenticar peticiones desde tus servidores.</p>
                        </div>

                        <div className="relative group/key">
                            <div className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 font-mono text-[10px] text-indigo-300 break-all pr-12">
                                {apiKey}
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white"
                            >
                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                        </div>

                        <button className="w-full py-4 bg-slate-950 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                            <RefreshCw size={14} /> Regenerar Key
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white space-y-4">
                        <Server size={32} />
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Webhooks</h4>
                        <p className="text-[10px] font-bold uppercase opacity-80 leading-relaxed">Recibe notificaciones automáticas cuando se reserve una cancha o se pague una cuenta.</p>
                        <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Configurar Webhooks
                        </button>
                    </div>
                </div>

                {/* Right: Endpoints Doc */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[48px] overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none">Endpoints Disponibles</h3>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Base URL: https://api.giovanni.com/v1</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {endpoints.map((ep, i) => (
                            <div key={i} className="bg-slate-950 border border-white/5 p-6 rounded-[32px] flex flex-col sm:flex-row sm:items-center gap-6 group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4 sm:w-48 shrink-0">
                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${
                                        ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {ep.method}
                                    </span>
                                    <span className="text-[11px] font-black text-white font-mono">{ep.path}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{ep.desc}</p>
                                </div>
                                <button className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Database size={20} className="text-slate-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Límite de peticiones: 10,000 / mes</span>
                        </div>
                        <button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                            Upgrade Plan API
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
