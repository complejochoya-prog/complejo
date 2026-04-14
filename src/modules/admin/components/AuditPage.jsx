import { useEffect, useState } from "react";
import { Shield, Clock, User as UserIcon, Activity, MapPin } from "lucide-react";
import { apiRequest } from "../../../core/api/apiClient";

export default function AuditPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/audit");
            setLogs(data);
        } catch (error) {
            console.error("Error fetching audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in font-inter">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-gold" size={32} />
                        Historial de Sistema
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium pr-4">
                        Registro inmutable de todas las acciones críticas realizadas por los usuarios en el sistema.
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                    Cargando registros...
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-slate-400 font-bold">
                                    <th className="p-4">Fecha y Hora</th>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Acción</th>
                                    <th className="p-4">Módulo</th>
                                    <th className="p-4">Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400">
                                            No hay registros de auditoría disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Clock size={14} className="text-gold/50" />
                                                    <span className="text-sm">
                                                        {new Date(log.fecha).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <UserIcon size={14} className="text-gold" />
                                                    {log.usuario}
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Activity size={14} className="text-blue-400" />
                                                    <span className="capitalize">{log.accion}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                    <MapPin size={14} />
                                                    <span className="uppercase tracking-widest text-[10px] bg-white/5 px-2 py-1 rounded-md">{log.modulo}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {log.detalle || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
