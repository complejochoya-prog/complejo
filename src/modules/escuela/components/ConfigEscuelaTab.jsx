import React, { useState, useEffect } from 'react';
import { 
    School, Save, Phone, MessageCircle, MapPin, 
    Image, FileText, CheckCircle2, ShieldCheck, 
    Sparkles, RefreshCw, AlertCircle 
} from 'lucide-react';
import { 
    subscribeEscuelaConfig, 
    saveEscuelaConfig, 
    DEFAULT_ESCUELA_CONFIG 
} from '../services/escuelaService';
import { Field, inputCls, btnPrimary } from './ui';

export default function ConfigEscuelaTab({ negocioId }) {
    const [config, setConfig] = useState(DEFAULT_ESCUELA_CONFIG);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const unsub = subscribeEscuelaConfig(negocioId, setConfig);
        return () => unsub && unsub();
    }, [negocioId]);

    const handleChange = (field, val) => {
        setConfig(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            await saveEscuelaConfig(negocioId, config);
            setSuccessMessage('¡Información de la escuela actualizada correctamente!');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            console.error(err);
            alert('Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        if (window.confirm('¿Restablecer los valores por defecto de la escuela?')) {
            setConfig(DEFAULT_ESCUELA_CONFIG);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-premium rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
                        <School size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                            Datos Generales e Identidad de la Escuela
                        </h2>
                        <p className="text-xs text-slate-400">
                            Editá el nombre, contacto, slogan y textos que verán los padres y alumnos en la web pública.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Restablecer valores predeterminados"
                    >
                        <RefreshCw size={14} /> Restaurar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={btnPrimary}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Guardar Información
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-bold animate-in fade-in">
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Bloque 1: Identidad Principal */}
            <div className="glass-premium p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Sparkles size={16} /> Identidad y Títulos Públicos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Nombre Oficial de la Escuela *" hint="Aparecerá en el encabezado principal de la landing">
                        <input
                            type="text"
                            required
                            value={config.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            className={inputCls}
                            placeholder="Ej: ESCUELA DE FÚTBOL GIOVANNI"
                        />
                    </Field>

                    <Field label="Badge / Temporada" hint="Etiqueta destacada en el banner superior">
                        <input
                            type="text"
                            value={config.badge}
                            onChange={e => handleChange('badge', e.target.value)}
                            className={inputCls}
                            placeholder="Ej: Inscripciones Abiertas 2026"
                        />
                    </Field>

                    <Field label="Lema / Slogan" className="md:col-span-2">
                        <input
                            type="text"
                            value={config.lema}
                            onChange={e => handleChange('lema', e.target.value)}
                            className={inputCls}
                            placeholder="Ej: Formamos futbolistas, educamos personas."
                        />
                    </Field>

                    <Field label="Descripción Institucional" className="md:col-span-2" hint="Explicación detallada de la propuesta pedagógica y formativa">
                        <textarea
                            rows={3}
                            value={config.descripcion}
                            onChange={e => handleChange('descripcion', e.target.value)}
                            className={inputCls}
                            placeholder="Describí los valores, la metodología de entrenamiento y las instalaciones..."
                        />
                    </Field>
                </div>
            </div>

            {/* Bloque 2: Canales de Contacto y Ubicación */}
            <div className="glass-premium p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Phone size={16} /> Contacto y Canales Directos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="WhatsApp de Contacto (con código de país sin +)" hint="Ej: 5491122334455 para Argentina">
                        <div className="relative">
                            <input
                                type="text"
                                value={config.whatsapp}
                                onChange={e => handleChange('whatsapp', e.target.value)}
                                className={inputCls}
                                placeholder="5491122334455"
                            />
                        </div>
                    </Field>

                    <Field label="Teléfono de Llamadas / Recepción">
                        <input
                            type="text"
                            value={config.telefono}
                            onChange={e => handleChange('telefono', e.target.value)}
                            className={inputCls}
                            placeholder="+54 9 11 2233-4455"
                        />
                    </Field>

                    <Field label="Email de la Escuela">
                        <input
                            type="email"
                            value={config.email}
                            onChange={e => handleChange('email', e.target.value)}
                            className={inputCls}
                            placeholder="escuela@complejo.com"
                        />
                    </Field>

                    <Field label="Predio / Canchas de Entrenamiento" className="md:col-span-2">
                        <input
                            type="text"
                            value={config.direccion}
                            onChange={e => handleChange('direccion', e.target.value)}
                            className={inputCls}
                            placeholder="Ej: Canchas Sintéticas 1 y 2 - Complejo Deportivo"
                        />
                    </Field>

                    <Field label="Costo de Matrícula Anual / Uniforme ($)">
                        <input
                            type="number"
                            min="0"
                            value={config.matricula}
                            onChange={e => handleChange('matricula', e.target.value)}
                            className={inputCls}
                            placeholder="10000"
                        />
                    </Field>
                </div>
            </div>

            {/* Bloque 3: Imagen de Portada y Beneficios */}
            <div className="glass-premium p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Image size={16} /> Imagen de Portada y Tarjetas de Beneficios
                </h3>

                <div className="space-y-6">
                    <Field label="URL de Imagen de Fondo / Banner (Unsplash o enlace directo)" hint="Se muestra en el fondo del Hero de la página pública">
                        <input
                            type="url"
                            value={config.portadaUrl}
                            onChange={e => handleChange('portadaUrl', e.target.value)}
                            className={inputCls}
                            placeholder="https://images.unsplash.com/..."
                        />
                    </Field>

                    {config.portadaUrl && (
                        <div className="h-32 rounded-2xl overflow-hidden border border-white/10 relative">
                            <img src={config.portadaUrl} alt="Portada" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white/80">
                                Previsualización de Fondo
                            </div>
                        </div>
                    )}

                    <Field label="Requisitos y Notas para Familias">
                        <textarea
                            rows={2}
                            value={config.notasPadres}
                            onChange={e => handleChange('notasPadres', e.target.value)}
                            className={inputCls}
                            placeholder="Canilleras, botella de agua, apto médico..."
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-3">
                            <Field label="Beneficio 1 - Título">
                                <input
                                    type="text"
                                    value={config.beneficio1Titulo}
                                    onChange={e => handleChange('beneficio1Titulo', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Beneficio 1 - Detalle">
                                <textarea
                                    rows={2}
                                    value={config.beneficio1Desc}
                                    onChange={e => handleChange('beneficio1Desc', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <Field label="Beneficio 2 - Título">
                                <input
                                    type="text"
                                    value={config.beneficio2Titulo}
                                    onChange={e => handleChange('beneficio2Titulo', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Beneficio 2 - Detalle">
                                <textarea
                                    rows={2}
                                    value={config.beneficio2Desc}
                                    onChange={e => handleChange('beneficio2Desc', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <Field label="Beneficio 3 - Título">
                                <input
                                    type="text"
                                    value={config.beneficio3Titulo}
                                    onChange={e => handleChange('beneficio3Titulo', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Beneficio 3 - Detalle">
                                <textarea
                                    rows={2}
                                    value={config.beneficio3Desc}
                                    onChange={e => handleChange('beneficio3Desc', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón flotante / inferior de guardado */}
            <div className="flex justify-end gap-4 p-4">
                <button
                    type="submit"
                    disabled={saving}
                    className={`${btnPrimary} px-10 py-4 text-xs`}
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    Guardar Todos los Cambios
                </button>
            </div>
        </form>
    );
}
