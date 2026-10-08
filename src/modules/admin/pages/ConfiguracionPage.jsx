import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { 
    Phone, 
    MessageCircle, 
    Building2, 
    CreditCard, 
    Layers, 
    Check, 
    Save, 
    Sparkles, 
    ShieldCheck, 
    MapPin, 
    Mail, 
    Instagram, 
    Trophy, 
    Utensils, 
    Calculator, 
    Users, 
    Zap, 
    Package, 
    Truck, 
    Share2 
} from 'lucide-react';

const AVAILABLE_MODULES = [
    { id: 'reservas', name: 'Reservas & Canchas', desc: 'Sistema de reservas online y presenciales', icon: Trophy },
    { id: 'bar', name: 'Bar & Gastronomía', desc: 'Menú digital, comandas y mozos', icon: Utensils },
    { id: 'caja', name: 'Caja & Facturación', desc: 'Arqueos de caja, ingresos y egresos diarios', icon: Calculator },
    { id: 'escuela', name: 'Escuela de Fútbol', desc: 'Formación, alumnos e inscripciones', icon: Users },
    { id: 'torneos', name: 'Torneos & Desafíos', desc: 'Campeonatos y bolsa de jugadores', icon: Zap },
    { id: 'delivery', name: 'Delivery App', desc: 'Pedidos y repartidores en tiempo real', icon: Truck },
    { id: 'finanzas', name: 'Finanzas & Gastos', desc: 'Control de egresos, balances y facturas', icon: CreditCard },
    { id: 'inventario', name: 'Inventario & Stock', desc: 'Control de stock bar y almacén', icon: Package },
];

export default function ConfiguracionPage() {
    const { negocioId } = useParams();
    const { config, activeModules = [], updateConfig } = useConfig();

    const [formData, setFormData] = useState({
        nombre: '',
        whatsapp: '5493855374835',
        telefono: '3855374835',
        email: '',
        direccion: '',
        instagram: '',
        alias: '',
        cbu: '',
        titular: '',
        slogan: '',
        activeModules: []
    });

    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (config) {
            setFormData({
                nombre: config.nombre || negocioId.toUpperCase(),
                whatsapp: config.whatsapp || config.telefono || '5493855374835',
                telefono: config.telefono || config.whatsapp || '3855374835',
                email: config.email || '',
                direccion: config.direccion || '',
                instagram: config.instagram || '',
                alias: config.alias || '',
                cbu: config.cbu || '',
                titular: config.titular || '',
                slogan: config.slogan || '',
                activeModules: config.activeModules || activeModules || ['reservas', 'bar', 'caja']
            });
        }
    }, [config, negocioId]);

    const handleModuleToggle = (modId) => {
        setFormData(prev => {
            const current = prev.activeModules || [];
            const updated = current.includes(modId)
                ? current.filter(id => id !== modId)
                : [...current, modId];
            return { ...prev, activeModules: updated };
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await updateConfig({
                ...formData,
                updatedAt: new Date().toISOString()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving config:", err);
            alert("Error al guardar la configuración.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-24 text-white">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        CONFIGURACIÓN <span className="text-amber-500">DEL NEGOCIO</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        WhatsApp, Datos de Pago y Módulos Activos de {formData.nombre || negocioId}
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[28px] text-xs font-black uppercase tracking-widest shadow-2xl transition-all ${
                        saved 
                            ? 'bg-emerald-500 text-black shadow-emerald-500/30 scale-105'
                            : 'bg-amber-500 text-black shadow-amber-500/30 hover:scale-[1.05] active:scale-[0.95]'
                    }`}
                >
                    {saved ? <><Check size={18} /> ¡Guardado con Éxito!</> : <><Save size={18} /> Guardar Cambios</>}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/5 rounded-[28px] backdrop-blur-md">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'general' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    WhatsApp & Contacto
                </button>
                <button
                    onClick={() => setActiveTab('modulos')}
                    className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'modulos' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Módulos Habilitados
                </button>
                <button
                    onClick={() => setActiveTab('pagos')}
                    className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'pagos' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Datos de Transferencia
                </button>
            </div>

            {/* TAB CONTENT: WhatsApp & General Contact */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <MessageCircle size={30} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                                    WhatsApp Oficial del Negocio
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Este número recibirá automáticamente todas las confirmaciones de reservas, señas y consultas de eventos de tus clientes.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    Número de WhatsApp (con código de país, sin + ni guiones)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        placeholder="Ej: 5493855374835"
                                        className="w-full bg-black/50 border border-emerald-500/30 rounded-2xl py-4 pl-12 pr-4 text-emerald-300 font-black text-lg focus:outline-none focus:border-emerald-400 transition-colors"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold tracking-wider">
                                    Formato Argentina: 549 + código de área sin 0 + número sin 15 (Ej: 5493855374835)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Teléfono Secundario / Fijo
                                </label>
                                <input
                                    type="text"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="Ej: 3855374835"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/5 rounded-[32px] p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <Building2 size={16} /> Información Pública
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Nombre del Complejo / Negocio
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Nombre oficial"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Slogan / Frase de Inicio
                                </label>
                                <input
                                    type="text"
                                    value={formData.slogan}
                                    onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                                    placeholder="Ej: El mejor complejo deportivo"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Calle y altura"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Instagram (@usuario)
                                </label>
                                <input
                                    type="text"
                                    value={formData.instagram}
                                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                    placeholder="@tucomplejo"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Enabled Modules */}
            {activeTab === 'modulos' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[32px] p-8 space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                <Layers size={20} className="text-amber-500" /> Módulos Habilitables
                            </h3>
                            <p className="text-xs text-slate-400">
                                Activá o desactivá los módulos que aplican a tu negocio. Por ejemplo, si no tenés Escuela de Fútbol o Torneos, desactivalos y desaparecerán de la página principal.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {AVAILABLE_MODULES.map(mod => {
                                const isEnabled = formData.activeModules?.includes(mod.id);
                                const Icon = mod.icon;
                                return (
                                    <div
                                        key={mod.id}
                                        onClick={() => handleModuleToggle(mod.id)}
                                        className={`cursor-pointer p-6 rounded-[28px] border transition-all flex items-start justify-between gap-4 ${
                                            isEnabled
                                                ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5'
                                                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl ${
                                                isEnabled ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'
                                            }`}>
                                                <Icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className={`text-base font-black uppercase tracking-tight ${
                                                    isEnabled ? 'text-white' : 'text-slate-400'
                                                }`}>
                                                    {mod.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                                    {mod.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`size-6 rounded-full border flex items-center justify-center transition-all ${
                                            isEnabled 
                                                ? 'bg-amber-500 border-amber-500 text-black' 
                                                : 'border-white/20 text-transparent'
                                        }`}>
                                            <Check size={14} className="stroke-[3]" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Transfer & Payment Data */}
            {activeTab === 'pagos' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <CreditCard size={30} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                                    Cuentas Bancarias y Billeteras Virtuales
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Estos datos serán mostrados a los clientes que elijan pagar la seña de reserva mediante transferencia.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Alias Bancario / MercadoPago
                                </label>
                                <input
                                    type="text"
                                    value={formData.alias}
                                    onChange={e => setFormData({ ...formData, alias: e.target.value })}
                                    placeholder="Ej: OASIS.PADEL.MP"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-amber-400 font-black text-lg focus:outline-none focus:border-amber-500 transition-colors uppercase"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    CBU / CVU (22 dígitos)
                                </label>
                                <input
                                    type="text"
                                    value={formData.cbu}
                                    onChange={e => setFormData({ ...formData, cbu: e.target.value })}
                                    placeholder="0000003100010000000000"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Titular de la Cuenta
                                </label>
                                <input
                                    type="text"
                                    value={formData.titular}
                                    onChange={e => setFormData({ ...formData, titular: e.target.value })}
                                    placeholder="Nombre completo o Razón Social"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
