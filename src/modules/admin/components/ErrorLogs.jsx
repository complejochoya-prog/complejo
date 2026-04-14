import { useEffect, useState } from "react";
import { AlertOctagon, Clock, MapPin, User as UserIcon, AlertCircle, FileCode2 } from "lucide-react";
import { apiRequest } from "../../../core/api/apiClient";

export default function ErrorLogs() {
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedError, setExpandedError] = useState(null);

    useEffect(() => {
        fetchErrors();
    }, []);

    const fetchErrors = async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/errors");
            setErrors(data);
        } catch (error) {
            console.error("Error fetching system errors", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in font-inter">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <AlertOctagon className="text-red-500" size={32} />
                        Monitoreo de Errores
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium pr-4 flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        Registro de fallas sistémicas y excepciones no controladas.
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                    Cargando diagnóstico...
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-slate-400 font-bold">
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">Ruta (Endpoint)</th>
                                    <th className="p-4">Mensaje de Error</th>
                                    <th className="p-4">Contexto (Usuario)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="p-3 bg-green-500/10 rounded-full">
                                                    <AlertCircle className="text-green-500" size={24} />
                                                </div>
                                                <p>Sistema estable. No se han registrado fallas recientes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    errors.map((err) => (
                                        <React.Fragment key={err._id}>
                                            <tr 
                                                className="border-b border-white/5 hover:bg-red-500/5 transition-colors cursor-pointer group"
                                                onClick={() => setExpandedError(expandedError === err._id ? null : err._id)}
                                            >
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <Clock size={14} className="text-red-400" />
                                                        <span className="text-sm">
                                                            {new Date(err.fecha).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
                                                        <MapPin size={14} />
                                                        {err.ruta}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-red-200 line-clamp-1 group-hover:line-clamp-none transition-all">
                                                        {err.mensaje}
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                        <UserIcon size={14} />
                                                        {err.usuario || "Desconocido"}
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable Stack Trace */}
                                            {expandedError === err._id && err.stack && (
                                                <tr className="bg-black/40">
                                                    <td colSpan="4" className="p-4">
                                                        <div className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre p-4 rounded-xl bg-slate-900 border border-white/5 shadow-inner flex flex-col gap-2">
                                                            <div className="flex items-center gap-2 text-red-400 font-bold mb-1 uppercase tracking-widest border-b border-white/5 pb-2">
                                                                <FileCode2 size={14} />
                                                                Stack Trace
                                                            </div>
                                                            {err.stack}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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
