import React from 'react';
import { BrainCircuit, TrendingUp, ThermometerSnowflake, DollarSign, Package } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useAIAnalytics } from '../hooks/useAIAnalytics';
import AIInsightsCard from '../components/AIInsightsCard';
import AIAlerts from '../components/AIAlerts';
import PredictionChart from '../components/PredictionChart';

export default function AIAnalyticsDashboard() {
    const { negocioId } = useConfig();
    const { data: ai, loading, error } = useAIAnalytics(negocioId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !ai) {
        return <div className="p-8 text-center text-red-500">Error al cargar el motor de Inteligencia Artificial.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white flex items-center gap-4">
                        <BrainCircuit size={48} className="text-indigo-400 drop-shadow-lg shadow-indigo-500/20" />
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Insights</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-16">
                        Predicciones y Recomendaciones Automáticas
                    </p>
                </div>
            </div>

            {/* Smart Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AIInsightsCard 
                    title="Tendencia Reservas" 
                    icon={<TrendingUp size={20} />} 
                    mainValue={`+${ai.reservas_historico.tasaCrecimiento}%`}
                    subtext={`Sistema detecta curva ${ai.reservas_historico.tendencia}. Proyección: ${ai.reservas_historico.proyeccionProxSemana} reservas próximas.`}
                    highlightWords={[ai.reservas_historico.tendencia, ai.reservas_historico.proyeccionProxSemana.toString()]}
                    gradient="from-indigo-600 to-blue-400"
                />
                
                <AIInsightsCard 
                    title="Análisis Horario" 
                    icon={<ThermometerSnowflake size={20} />} 
                    mainValue="19hs a 21hs"
                    subtext={`Horas pico detectadas. Riesgo de horas vacías de ${ai.horarios.vacios.join(', ')}.`}
                    highlightWords={['pico', 'vacías']}
                    gradient="from-emerald-500 to-teal-400"
                />
                
                <AIInsightsCard 
                    title="Productos Estrella" 
                    icon={<Package size={20} />} 
                    mainValue="Top 3 Bar"
                    subtext={`${ai.bar.productos.top.join(', ')} lideran las ventas de la semana.`}
                    highlightWords={() => ai.bar.productos.top}
                    gradient="from-amber-500 to-orange-400"
                />

                <AIInsightsCard 
                    title="Proyección Bar" 
                    icon={<DollarSign size={20} />} 
                    mainValue={`$${ai.bar.ingresos_proyectados.toLocaleString()}`}
                    subtext="Ingreso estimado para fin de mes basado en el ritmo de consumo cruzado con reservas."
                    highlightWords={['estimado', 'reservas']}
                    gradient="from-fuchsia-600 to-purple-400"
                />
            </div>

            {/* Layout Híbrido Gráfico/IA Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-indigo-400 mb-8 border-b border-white/5 pb-4">
                        <TrendingUp size={18} />
                        Predicciones Dinámicas de Ocupación
                    </h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <PredictionChart data={ai.prediccionSemanal} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[600px] flex flex-col relative">
                    <div className="absolute -top-10 -right-10 opacity-5 blur-sm mix-blend-screen pointer-events-none">
                        <BrainCircuit size={200} className="text-indigo-400" />
                    </div>
                    
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-slate-400 mb-6 border-b border-white/5 pb-4 relative z-10">
                        <BrainCircuit size={18} /> Resumen Ejecutivo
                    </h3>
                    
                    <div className="relative z-10 flex-1">
                        <AIAlerts alertas={ai.alertas} promociones={ai.promociones_sugeridas} />
                    </div>
                </div>

            </div>
        </div>
    );
}
