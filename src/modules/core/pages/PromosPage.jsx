import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag, Sparkles, PartyPopper, ChevronRight, Ticket, Clock, Zap } from 'lucide-react';
import { fetchPromos } from '../../admin/services/promosService';
import { useConfig } from '../../../core/services/ConfigContext';

export default function PromosPage() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    const basePath = `/${negocioId}`;

    useEffect(() => {
        const loadPromos = async () => {
            try {
                const data = await fetchPromos(negocioId);
                // Solo mostrar las activas
                setPromos(data.filter(p => p.active));
            } catch (error) {
                console.error("Error loading promos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPromos();
    }, [negocioId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Cargando ofertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500">
                        <Ticket size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Beneficios Exclusivos</span>
                    </div>
                    
                    <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">
                        PROMOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">& OFERTAS</span>
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
                        Aprovechá nuestros paquetes especiales y promociones semanales diseñadas para que vivas la mejor experiencia en {config?.businessName || 'Complejo Giovanni'}.
                    </p>
                </div>
            </div>

            {/* Promos Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {promos.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/5">
                        <Zap size={48} className="mx-auto text-white/20 mb-6" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white/40">No hay ofertas vigentes en este momento</h3>
                        <p className="text-sm text-white/20 mt-2">¡Volvé pronto para descubrir nuevos beneficios!</p>
                        <Link to={basePath} className="mt-8 inline-block text-amber-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                            Volver al Inicio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {promos.map((promo) => (
                            <div key={promo.id} className="group relative flex flex-col bg-slate-900/50 border border-white/5 rounded-[40px] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
                                {/* Image / Header */}
                                <div className="h-48 relative overflow-hidden">
                                    <img 
                                        src={promo.img || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={promo.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                    
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className={`px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest ${promo.type === 'evento' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                            {promo.type === 'evento' ? 'Pack Evento' : 'Promoción'}
                                        </span>
                                    </div>
                                    
                                    {promo.price && (
                                        <div className="absolute bottom-4 right-6 text-2xl font-black italic tracking-tighter text-amber-500">
                                            {promo.price === '0' || promo.price.toLowerCase() === 'gratis' ? 'GRATIS' : `$${promo.price}`}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-4 flex-grow flex flex-col">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none group-hover:text-amber-400 transition-colors">
                                        {promo.title}
                                    </h3>
                                    <p className="text-sm font-medium text-white/50 leading-relaxed line-clamp-3">
                                        {promo.desc}
                                    </p>
                                    
                                    <div className="mt-auto pt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                            <Clock size={12} />
                                            <span>Tiempo Limitado</span>
                                        </div>
                                        
                                        {promo.link ? (
                                            <a 
                                                href={promo.link.startsWith('http') ? promo.link : `${basePath}${promo.link}`}
                                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:gap-3 transition-all"
                                            >
                                                Ver Detalles <ChevronRight size={14} />
                                            </a>
                                        ) : (
                                            <Link 
                                                to={`${basePath}/reservas`}
                                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:gap-3 transition-all"
                                            >
                                                Reservar Ahora <ChevronRight size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Footer */}
            <div className="max-w-4xl mx-auto px-6 mt-32">
                <div className="glass-premium p-10 lg:p-14 rounded-[48px] border border-white/10 text-center space-y-8 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500 mb-6">
                            <PartyPopper size={32} />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic">¿Querés armar algo a medida?</h2>
                        <p className="text-white/50 font-medium max-w-xl mx-auto">
                            Si tenés un evento especial o sos un grupo grande, contactanos y armamos un paquete personalizado para vos.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <a 
                            href={`https://wa.me/${config?.telefono || '5493834555555'}?text=Hola! Vengo de la web y quiero consultar por una promo personalizada`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Hablar con Administración <ChevronRight size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
