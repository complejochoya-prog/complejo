import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, Search, Filter, 
    RefreshCw, LayoutGrid, List, SlidersHorizontal 
} from 'lucide-react';
import { useSmartCenter } from '../hooks/useSmartCenter';
import SmartDeviceCard from '../components/SmartDeviceCard';

export default function DevicesManager() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { devices, loading, handleToggle, refresh } = useSmartCenter(negocioId);
    
    const [filter, setFilter] = useState('all');

    const filteredDevices = devices.filter(d => 
        filter === 'all' || d.type === filter
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver al Dashboard Smart
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 border border-white/5 p-10 rounded-[48px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <SlidersHorizontal size={120} />
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
                        <LayoutGrid size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                            Gestión de <span className="text-indigo-400">Dispositivos</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Configuración y estado de red IoT del complejo</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 z-10">
                    <button 
                        onClick={refresh}
                        className="w-14 h-14 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                        <Plus size={18} />
                        Añadir Dispositivo
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-slate-900/50 backdrop-blur-md sticky top-20 z-30 border border-white/5 p-4 rounded-[28px] flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar dispositivo por nombre o ubicación..." 
                        className="w-full bg-slate-950 border border-white/5 rounded-[20px] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder:text-slate-600"
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
                    {['all', 'lighting', 'access', 'camera', 'climate'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                filter === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            {type === 'all' ? 'Todos' : 
                             type === 'lighting' ? 'Luces' : 
                             type === 'access' ? 'Accesos' : 
                             type === 'camera' ? 'Video' : 'Clima'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                        <LayoutGrid size={18} />
                    </button>
                    <button className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDevices.map(device => (
                    <SmartDeviceCard 
                        key={device.id} 
                        device={device} 
                        onToggle={handleToggle} 
                    />
                ))}
            </div>

            {filteredDevices.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-[32px] flex items-center justify-center text-slate-700">
                        <Filter size={40} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-white">No se encontraron dispositivos</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </div>
            )}
        </div>
    );
}
