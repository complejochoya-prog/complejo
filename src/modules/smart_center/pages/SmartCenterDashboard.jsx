import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Zap, Activity, LayoutGrid, Settings, 
    RefreshCw, ShieldCheck, AlertCircle, Sparkles,
    ChevronRight, Power
} from 'lucide-react';
import { useSmartCenter } from '../hooks/useSmartCenter';
import SmartDeviceCard from '../components/SmartDeviceCard';
import EnergyUsageCard from '../components/EnergyUsageCard';
import CameraStatus from '../components/CameraStatus';

export default function SmartCenterDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { devices, energyStats, loading, handleToggle, refresh } = useSmartCenter(negocioId);

    const cameras = devices.filter(d => d.type === 'camera');
    const controls = devices.filter(d => d.type !== 'camera').slice(0, 4);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-4">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                            Smart & Automation Hub
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Center</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 max-w-md">
                        Monitoreo IoT y automatización basada en reservaciones
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={refresh}
                        className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => navigate(`/admin/smart-center/devices`)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <LayoutGrid size={18} />
                        Gestionar Dispositivos
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Controls & Energy */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Seguridad</span>
                                <span className="text-sm font-black italic text-white uppercase">Activa</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
                                <Activity size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Automatización</span>
                                <span className="text-sm font-black italic text-white uppercase">84% Eficiente</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Alertas</span>
                                <span className="text-sm font-black italic text-white uppercase">Sin Fallos</span>
                            </div>
                        </div>
                    </div>

                    {/* Energy usage card */}
                    <EnergyUsageCard stats={energyStats} />

                    {/* Quick Device Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Controles Rápidos</h3>
                            <button 
                                onClick={() => navigate('/admin/smart-center/devices')}
                                className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Ver Todos Dispositivos
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {controls.map(device => (
                                <SmartDeviceCard 
                                    key={device.id} 
                                    device={device} 
                                    onToggle={handleToggle} 
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Camera Overview & Automation Log */}
                <div className="space-y-8">
                    {/* Cameras list */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white italic px-2">Vigilancia Directa</h3>
                        {cameras.map(cam => (
                            <CameraStatus key={cam.id} camera={cam} />
                        ))}
                    </div>

                    {/* Master Switches */}
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Acciones Globales</h3>
                        <button className="w-full bg-slate-950 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                                    <Power size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white">Apagar Todo</p>
                                    <p className="text-[8px] text-slate-500 uppercase font-black">Cierre de Complejo</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-700" />
                        </button>
                        <button className="w-full bg-slate-950 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white">Modo Nocturno</p>
                                    <p className="text-[8px] text-slate-500 uppercase font-black">Ahorro Máximo</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-700" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
