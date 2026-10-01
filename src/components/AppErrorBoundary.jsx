import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[AppErrorBoundary] Error capturado:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-inter select-none">
                    <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mb-6 text-rose-500 shadow-2xl">
                        <AlertTriangle size={36} strokeWidth={2} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
                        Ocurrió un inconveniente temporal
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-sm mb-8 leading-relaxed">
                        La pantalla se ha protegido automáticamente para evitar pérdidas de datos.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                        <button
                            onClick={this.handleReload}
                            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                        >
                            <RotateCcw size={16} /> Reintentar
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/10"
                        >
                            <Home size={16} /> Ir al Inicio
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
