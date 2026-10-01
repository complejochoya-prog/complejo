import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

/**
 * KitchenErrorBoundary
 *
 * Envuelve la pantalla de cocina. Si cualquier componente hijo lanza
 * un error durante el render (o en useEffect sincrónico), muestra
 * un fallback con botón de recarga en lugar de pantalla negra.
 *
 * USO en tu router/layout:
 *   <KitchenErrorBoundary>
 *     <KitchenBarScreen />
 *   </KitchenErrorBoundary>
 */
export default class KitchenErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[KitchenErrorBoundary] Render crash capturado:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 text-white p-8">
                    <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <AlertTriangle size={36} className="text-rose-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">
                            Error en la pantalla de cocina
                        </h2>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-xs">
                            Ocurrió un error inesperado. Podés intentar recuperar sin recargar la página.
                        </p>
                        {this.state.error && (
                            <p className="text-[9px] text-rose-400/60 font-mono mt-2">
                                {this.state.error.message}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-amber-500/20"
                        >
                            <RefreshCcw size={14} />
                            Recuperar sin recargar
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 active:scale-95"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
