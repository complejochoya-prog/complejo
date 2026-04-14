import React from 'react';
import { Lightbulb, Lock, Unlock, Zap, Thermometer, Settings } from 'lucide-react';

export default function SmartDeviceCard({ device, onToggle }) {
    const isOn = device.status === 'on' || device.status === 'open' || device.status === 'streaming';
    
    const getIcon = () => {
        switch (device.type) {
            case 'lighting': return <Lightbulb size={24} />;
            case 'access': return isOn ? <Unlock size={24} /> : <Lock size={24} />;
            case 'climate': return <Thermometer size={24} />;
            default: return <Zap size={24} />;
        }
    };

    return (
        <div className={`p-6 rounded-[32px] border transition-all duration-300 ${
            isOn 
            ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20 text-white' 
            : 'bg-slate-900 border-white/5 text-slate-400 group hover:border-white/10'
        }`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isOn ? 'bg-white/20' : 'bg-slate-950 text-slate-500 group-hover:text-indigo-400'
                }`}>
                    {getIcon()}
                </div>
                <button className={`p-2 rounded-xl transition-colors ${isOn ? 'hover:bg-white/10' : 'hover:bg-white/5'}`}>
                    <Settings size={16} />
                </button>
            </div>

            <div className="space-y-1 mb-6">
                <h3 className={`text-sm font-black uppercase tracking-tight leading-none ${isOn ? 'text-white' : 'text-slate-200'}`}>
                    {device.name}
                </h3>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isOn ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {device.location}
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isOn ? 'text-indigo-200' : 'text-slate-600'}`}>
                        Estado
                    </span>
                    <span className="text-xs font-black uppercase italic tracking-tighter">
                        {device.status === 'on' ? 'Encendido' : 
                         device.status === 'off' ? 'Apagado' : 
                         device.status === 'closed' ? 'Bloqueado' : 
                         device.status === 'open' ? 'Abierto' : device.status}
                    </span>
                </div>

                <button 
                    onClick={() => onToggle(device.id, device.status)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        isOn ? 'bg-indigo-400' : 'bg-slate-800'
                    }`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                        isOn ? 'left-7' : 'left-1'
                    }`} />
                </button>
            </div>

            {device.autoMode && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isOn ? 'text-indigo-200' : 'text-indigo-400'}`}>
                        Automatización Activa
                    </span>
                </div>
            )}
        </div>
    );
}
