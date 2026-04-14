import { useEffect, useState } from "react";
import { Server, Cpu, HardDrive, Clock, Activity, Monitor } from "lucide-react";
import { apiRequest } from "../../../core/api/apiClient";

export default function SystemStatus() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data every 5 seconds for a "live" feel
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await apiRequest("/system/status");
            setStatus(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching system status", err);
            setError("No se pudo conectar con el servidor de métricas.");
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d == 1 ? " día, " : " días, ") : "";
        const hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " min, " : " mins, ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " seg" : " segs") : "";
        
        return dDisplay + hDisplay + mDisplay + sDisplay || "0 segs";
    };

    if (loading && !status) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                Obteniendo telemetría del servidor...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
                <Server size={32} />
                <div>
                    <h3 className="font-bold">Falla de Conexión</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in font-inter">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="text-green-500" size={32} />
                        Estado del Servidor
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium pr-4">
                        Monitor de recursos de hardware en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Actualizado: {new Date(status.fecha).toLocaleTimeString()}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Uptime Card */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Monitor size={16} className="text-cyan-400" />
                        Tiempo Activo
                    </h3>
                    <div className="text-2xl font-black italic tracking-tighter text-white">
                        {formatUptime(status.uptime)}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 font-medium">Desde el último reinicio</div>
                </div>

                {/* Memory Card */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <HardDrive size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <HardDrive size={16} className="text-purple-400" />
                        Memoria RAM
                    </h3>
                    
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-2xl font-black italic tracking-tighter text-white">
                            {status.memoria.porcentajeUso}%
                        </div>
                        <div className="text-sm font-mono text-slate-400 mb-1">
                            {formatBytes(status.memoria.enUso)} / {formatBytes(status.memoria.total)}
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-black/40 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                            className={`h-2 rounded-full ${status.memoria.porcentajeUso > 85 ? 'bg-red-500' : status.memoria.porcentajeUso > 70 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                            style={{ width: `${status.memoria.porcentajeUso}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Libre: {formatBytes(status.memoria.libre)}</span>
                    </div>
                </div>

                {/* CPU Card */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cpu size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Cpu size={16} className="text-orange-400" />
                        Carga de CPU
                    </h3>
                    <div className="flex items-end gap-2 text-2xl font-black italic tracking-tighter text-white font-mono">
                        {status.cpu[0].toFixed(2)}
                        <span className="text-sm text-slate-500 font-sans not-italic font-medium mb-1">1m</span>
                    </div>
                    <div className="mt-2 text-xs flex justify-between text-slate-500 font-medium">
                        <span>5m obj: {status.cpu[1].toFixed(2)}</span>
                        <span>15m obj: {status.cpu[2].toFixed(2)}</span>
                    </div>
                </div>

                {/* System Info Card */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Server size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Server size={16} className="text-emerald-400" />
                        Detalles del Host
                    </h3>
                    <div className="space-y-3 font-mono text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-500">Plataforma</span>
                            <span className="text-slate-300 capitalize">{status.plataforma}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-500">Arquitectura</span>
                            <span className="text-slate-300">{status.arquitectura}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Node JS</span>
                            <span className="text-slate-300">{status.nodeVersion}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
