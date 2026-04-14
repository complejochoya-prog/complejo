import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Globe, Palette, Sparkles, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useConfig } from '../../core/services/ConfigContext';

export default function HomeEditor() {
    const { negocioId } = useConfig();
    const [config, setConfig] = useState({
        nombre: '',
        lema: '',
        colorPrincipal: '#fbbf24',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!negocioId) return;
        const docRef = doc(db, 'negocios', negocioId, 'configuracion', 'home');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data());
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [negocioId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'negocios', negocioId, 'configuracion', 'home');
            await setDoc(docRef, config, { merge: true });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error guardando:", error);
            alert("Error al guardar la configuración.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Cargando Panel Maestro...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
            {/* Header Premium */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px] italic">
                        <Sparkles size={14} fill="currentColor" /> Identidad Corporativa
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-white">
                        CONFIGURACIÓN <span className="text-yellow-500">DEL SISTEMA</span>
                    </h1>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Personaliza el nombre y estilo global de tu complejo
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-yellow-500 text-[#070B14] px-8 py-4 rounded-2xl font-black italic uppercase tracking-tighter hover:bg-white transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-50 active:scale-95 group"
                >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </header>

            {/* Mensaje de Éxito */}
            {success && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in slide-in-from-top-4">
                    <div className="bg-green-500/20 p-1.5 rounded-lg">
                        <CheckCircle2 className="text-green-500" size={18} />
                    </div>
                    <span className="text-green-500 font-black italic uppercase tracking-tighter text-sm">Configuración actualizada correctamente</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Panel: Identidad Visual */}
                <section className="bg-[#0D121D] border border-zinc-800 rounded-[40px] p-8 space-y-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>

                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none text-white">Identidad Visual</h3>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Nombre y Slogan</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre del Complejo</label>
                            <input
                                type="text"
                                value={config.nombre}
                                onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                                placeholder="Ej: Complejo Giovanni"
                                className="w-full bg-[#161C2A] border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-black italic text-lg uppercase tracking-tighter text-white"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lema o Frase (Landing Page)</label>
                            <input
                                type="text"
                                value={config.lema}
                                onChange={(e) => setConfig({ ...config, lema: e.target.value })}
                                placeholder="Ej: Donde nace la pasión"
                                className="w-full bg-[#161C2A] border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-bold text-sm uppercase tracking-wide text-zinc-300"
                            />
                        </div>
                    </div>
                </section>

                {/* Panel: Estilo de Marca */}
                <section className="bg-[#0D121D] border border-zinc-800 rounded-[40px] p-8 space-y-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>

                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none text-white">Colores de Marca</h3>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Paleta Cromática Local</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Color Principal (Botones y Detalles)</label>
                            <div className="flex items-center gap-6 bg-[#161C2A] border border-zinc-800 p-4 rounded-3xl">
                                <div className="relative group/color">
                                    <input
                                        type="color"
                                        value={config.colorPrincipal}
                                        onChange={(e) => setConfig({ ...config, colorPrincipal: e.target.value })}
                                        className="size-14 rounded-2xl p-0 cursor-pointer bg-transparent border-none outline-none appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-xl [&::-webkit-color-swatch]:border-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black mono text-white uppercase tracking-tighter">{config.colorPrincipal}</p>
                                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Código Hexadecimal</p>
                                </div>
                            </div>
                        </div>

                        {/* Tip Informativo */}
                        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-4">
                            <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] font-medium text-blue-300 leading-relaxed">
                                Este color se utilizará como acento principal en diversos componentes de la aplicación para mantener la coherencia visual con tu marca.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Preview Hint */}
            <div className="p-8 rounded-[40px] border-2 border-dashed border-zinc-800 text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] italic">
                    Sincronización Total Activa
                </p>
                <p className="text-[11px] font-medium text-zinc-600 max-w-lg mx-auto leading-relaxed">
                    Los cambios realizados aquí se sincronizan en tiempo real con la base de datos y se reflejan instantáneamente en la pantalla de inicio y página de acceso.
                </p>
            </div>
        </div>
    );
}
