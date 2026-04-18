import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutGrid, Utensils, ShoppingBasket, Monitor, Smartphone, Volume2, Search } from 'lucide-react';
import { fetchPromosMenu, submitOrder } from '../services/menuService';
import PromoCard from '../components/PromoCard';
import PromoModal from '../components/PromoModal';

export default function MenuBoard() {
    const [promos, setPromos] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const { negocioId } = useParams();

    useEffect(() => {
        const load = async () => {
            const data = await fetchPromosMenu(negocioId);
            setPromos(data);
            setLoading(false);
        };
        load();
        window.addEventListener('storage_promos', load);
        return () => window.removeEventListener('storage_promos', load);
    }, [negocioId]);

    const handleOrder = async (promo) => {
        const res = await submitOrder(negocioId, {
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

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
            {/* Header Tipo Digital Board */}
            <header className="bg-[#111] p-6 lg:p-10 border-b-4 border-yellow-400 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px]" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-yellow-400 rounded-[28px] flex items-center justify-center text-black shadow-[0_0_30px_rgba(250,204,21,0.4)] animate-pulse">
                        <Utensils size={36} className="lg:size-48" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-display-mcd italic tracking-tighter uppercase leading-none transform -skew-x-6">
                            COMPLEJO <span className="text-yellow-400">GIOVANNI</span>
                        </h1>
                        <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mt-2 flex items-center gap-2">
                             Digital Menu Board <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-10 relative z-10 bg-black/40 p-4 rounded-3xl border border-white/5">
                    <div className="flex flex-col items-center gap-1 border-r border-white/10 pr-6 lg:pr-10">
                        <Monitor className="text-yellow-400" size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Pantallas</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-r border-white/10 pr-6 lg:pr-10">
                        <Smartphone className="text-yellow-400" size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">App Móvil</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Search className="text-slate-500" size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Buscar</span>
                    </div>
                </div>
            </header>

            {/* Banner Dinámico */}
            <div className="bg-yellow-400 p-3 overflow-hidden whitespace-nowrap relative">
                <div className="flex animate-marquee gap-20">
                    {[1, 2, 3, 4, 5].map(i => (
                        <p key={i} className="text-black font-black italic text-sm uppercase tracking-widest">
                             🔥 FESTEJÁ TU CUMPLE CON NOSOTROS 🔥 RESERVÁ TU PACK PREMIUM 🔥 PIZZAS GRATIS CON TU TORNEO 🔥 NOVEDADES EN EL BAR 🔥
                        </p>
                    ))}
                </div>
            </div>

            {/* Grid de Productos */}
            <main className="p-8 lg:p-20 max-w-[1920px] mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cargando Menú Board...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-16">
                        {promos.map((prm) => (
                            <PromoCard 
                                key={prm.id} 
                                promo={prm} 
                                onClick={() => setSelectedPromo(prm)}
                                onOrder={handleOrder}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Detalle */}
            <PromoModal 
                promo={selectedPromo} 
                onClose={() => setSelectedPromo(null)}
                onOrder={handleOrder}
            />

            {/* Feedback de Pedido */}
            {orderSuccess && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-white px-10 py-6 rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-10 flex items-center gap-6 border-2 border-white/20">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600">
                        <ShoppingBasket size={28} />
                    </div>
                    <div>
                        <p className="font-display-mcd italic uppercase tracking-tight text-xl">¡PEDIDO ENVIADO!</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Estamos preparando tu reserva...</p>
                    </div>
                </div>
            )}

            <style dangerouslySetSource={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
            ` }} />
        </div>
    );
}
