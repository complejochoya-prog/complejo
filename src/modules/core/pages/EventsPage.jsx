import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, X, PartyPopper, CheckCircle2 } from 'lucide-react';
import { fetchPromos } from '../../admin/services/promosService';
import { submitOrder } from '../../menu/services/menuService';

export default function EventsPage() {
    const { negocioId } = useParams();
    const [promos, setPromos] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        setPromos(fetchPromos().filter(p => p.active));
        setAnimate(true);
    }, []);

    const handleOrder = (promo) => {
        const res = submitOrder({
            promoName: promo.title,
            price: promo.price,
            promoId: promo.id
        });
        
        if (res.success) {
            setOrderSuccess(true);
            setSelectedPromo(null);
            setTimeout(() => setOrderSuccess(false), 3000);
        }
    };

    const basePath = `/${negocioId}`;

    return (
        <div className={`min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Premium Blue Header */}
            <header className="py-12 lg:py-20 text-center border-b border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <Link to={basePath} className="absolute top-8 left-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors z-20">
                    <ChevronLeft size={14} /> Volver al Inicio
                </Link>

                <h1 className="font-display-mcd text-6xl md:text-8xl lg:text-9xl text-blue-500 italic tracking-tighter uppercase transform -skew-x-6 leading-none animate-in slide-in-from-top-10 duration-700">
                    SUPER <br className="md:hidden" /> PROMOS
                </h1>
                <p className="text-slate-400 text-sm md:text-xl font-black tracking-[0.4em] uppercase mt-4 opacity-70">
                    Digital Menu Board
                </p>
            </header>

            <main className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {promos.map((prm) => (
                        <div 
                            key={prm.id}
                            onClick={() => setSelectedPromo(prm)}
                            className="group relative bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden hover:border-blue-500 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col hover:shadow-blue-500/20 active:scale-[0.98]"
                        >
                            <div className="h-80 lg:h-96 overflow-hidden relative">
                                <img 
                                    src={prm.img || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800'} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-[2s] ease-out"
                                    alt={prm.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                
                                {/* Floating Price Badge */}
                                <div className="absolute bottom-8 right-8 bg-red-600 text-white font-black text-4xl lg:text-5xl px-8 py-4 rounded-[2rem] shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 italic tracking-tighter shadow-red-900/50">
                                    ${parseInt(prm.price).toLocaleString()}
                                </div>
                            </div>

                            <div className="p-10 lg:p-12 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Promoción Disponible</span>
                                </div>

                                <h2 className="font-display-mcd text-3xl lg:text-4xl leading-none mb-6 uppercase text-blue-500 italic tracking-tighter" >
                                    {prm.title}
                                </h2>
                                
                                <p className="text-zinc-400 text-sm lg:text-base font-bold uppercase tracking-widest flex-grow mb-10 line-clamp-3 leading-relaxed">
                                    {prm.desc.split('\n')[0]}
                                </p>
                                
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-display-mcd text-xl lg:text-2xl py-6 rounded-3xl transition-all duration-300 uppercase tracking-tighter italic">
                                    ¡PEDIR AHORA!
                                </button>
                            </div>

                            {/* Brillo Top Border */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal de Detalle al estilo Board */}
            {selectedPromo && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setSelectedPromo(null)}
                >
                    <div 
                        className="bg-slate-900 w-full max-w-5xl rounded-[4rem] overflow-hidden relative border-4 border-blue-500 shadow-[0_0_100px_rgba(59,130,246,0.2)] animate-in zoom-in-95 duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedPromo(null)}
                            className="absolute top-8 right-10 text-zinc-400 hover:text-white text-6xl font-light z-10 hover:rotate-90 transition-transform duration-300"
                        >
                            &times;
                        </button>
                        
                        <div className="flex flex-col lg:flex-row">
                            <div className="w-full lg:w-1/2 h-80 lg:h-[700px]">
                                <img 
                                    src={selectedPromo.img || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800'} 
                                    className="w-full h-full object-cover"
                                    alt={selectedPromo.title}
                                />
                            </div>
                            
                            <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-zinc-900 to-black">
                                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                    <CheckCircle2 size={16} /> CALIDAD SUPERIOR PREMIUM
                                </div>

                                <h2 className="font-display-mcd text-4xl lg:text-6xl text-blue-500 mb-8 italic leading-tight uppercase tracking-tighter" >
                                    {selectedPromo.title}
                                </h2>
                                
                                <div className="space-y-6 mb-12">
                                    <h4 className="text-zinc-500 uppercase font-black tracking-widest text-[10px]">¿Qué incluye el Pack?</h4>
                                    <ul className="text-white space-y-4">
                                        {selectedPromo.desc.split('\n').map((item, idx) => (
                                            <li key={idx} className="flex items-center text-lg lg:text-xl font-display-mcd uppercase tracking-tight">
                                                <span className="text-blue-500 mr-4 text-2xl">✔</span>
                                                {item.replace('•', '').trim()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between mb-10 border-t border-zinc-800 pt-10">
                                    <div className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">Inversión Total:</div>
                                    <div className="font-display-mcd text-5xl lg:text-7xl text-red-600 italic tracking-tighter">
                                        ${parseInt(selectedPromo.price).toLocaleString()}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOrder(selectedPromo)}
                                    className="w-full bg-green-500 hover:bg-white hover:text-green-600 text-white font-display-mcd text-3xl lg:text-4xl py-8 rounded-[2.5rem] transition-all duration-300 shadow-2xl hover:shadow-green-500/20 active:scale-95 italic tracking-tighter"
                                >
                                    RESERVAR PROMO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification de Pedido */}
            {orderSuccess && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-white px-12 py-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 flex items-center gap-6 border-4 border-white/20">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-green-600">
                        <PartyPopper size={36} />
                    </div>
                    <div>
                        <p className="font-black italic uppercase tracking-tight text-3xl leading-none">¡ÉXITO!</p>
                        <p className="text-[12px] font-black uppercase tracking-widest opacity-80 mt-1">Tu reserva ha sido enviada al Bar...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
