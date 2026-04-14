import React from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
    return (
        <div className="bg-background-light dark:bg-[#102210] text-slate-900 dark:text-slate-100 min-h-screen font-display">
            <style>{`
        .glass-card {
            background: rgba(2, 6, 23, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(13, 242, 13, 0.2);
        }
        .italic-accent {
            font-style: italic;
        }
      `}</style>
            <div className="flex h-full grow flex-col">
                {/* Top Navigation */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#0df20d]/20 px-6 lg:px-40 py-4 bg-[#102210]/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4 text-[#0df20d]">
                        <span className="material-symbols-outlined text-3xl">star_half</span>
                        <h2 className="text-slate-100 text-lg font-black leading-tight tracking-tighter italic-accent uppercase">COMPLEJO GIOVANNI</h2>
                    </div>
                    <div className="hidden md:flex flex-1 justify-end gap-8">
                        <nav className="flex items-center gap-9">
                            <Link to="/home" className="text-slate-300 hover:text-[#0df20d] text-xs font-bold leading-normal tracking-widest transition-colors uppercase">INICIO</Link>
                            <Link to="/home" className="text-slate-300 hover:text-[#0df20d] text-xs font-bold leading-normal tracking-widest transition-colors uppercase">RESERVAS</Link>
                            <Link to="/tournament-admin" className="text-slate-300 hover:text-[#0df20d] text-xs font-bold leading-normal tracking-widest transition-colors uppercase">TORNEOS</Link>
                            <Link to="/membership" className="text-slate-300 hover:text-[#0df20d] text-xs font-bold leading-normal tracking-widest transition-colors uppercase">BENEFICIOS</Link>
                        </nav>
                        <div className="flex items-center gap-4 border-l border-[#0df20d]/20 pl-8">
                            <Link to="/profile">
                                <button className="flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#0df20d] text-[#102210] text-xs font-black leading-normal tracking-widest uppercase hover:scale-105 transition-transform">
                                    <span>MI PERFIL</span>
                                </button>
                            </Link>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#0df20d]/50" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnmgnYl9ZVnuxpFWMkurXW4ZFJ6LUb5lW9-R-fKu_LhVWgt_RupcJ1J4LHU_2McjSMBya3BFZGIPKorvvMmbbAjJHxiSGfDQbKGHxM5VocOdISp_BDZSmWnYwm0Y8xTCYLU1SjvU0n8AhkKgcwqqHYjnfG6Rz1LKx1AmsVjA--gCrqer4QVFJwkKYxvt3O4oKwAXoeUiysfAn2R_G9vzOBjTvJzY06sYY0WXPE-0zIIugfcuV9BZNJjwsTiUjLN2IrRiHjt6XoHAE')" }}></div>
                        </div>
                    </div>
                    <div className="md:hidden">
                        <span className="material-symbols-outlined text-[#0df20d]">menu</span>
                    </div>
                </header>

                <main className="px-6 lg:px-40 py-10 max-w-[1400px] mx-auto w-full">
                    {/* Premium Profile Header Card */}
                    <div className="glass-card rounded-xl p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                        {/* Abstract Background Ornament */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0df20d]/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="size-32 md:size-40 rounded-xl border-4 border-[#0df20d]/30 overflow-hidden shadow-lg transform -rotate-2">
                                <img alt="Juan Perez" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ7iJVGsJmktB4FhjZADhfDinyneMBgPE8BZCRJPYXs7JyoU3TKqiz4qSK3M1J-8HgPUV2R1NgmdkRcJX4Zm_ipxNl_PunDylkz6hRORZyJ1fl1WGeRhJ9we5nNphWI97qIyf0ydhBOKob-bOAdlE6bpBbDNrwluuERRUtVXv1zjUjTgonk2eJzTQ9iJK0ltTm1E8m5PvTsV8Dz25tJspckyS-3SRdVS8DuAC9kbk8FGQBpPu17UQFA_H9mzhfBUoRjc-b22sFP68" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-white italic-accent tracking-tighter uppercase">JUAN PÉREZ</h1>
                                <span className="bg-[#0df20d]/20 text-[#0df20d] px-3 py-1 rounded text-xs font-bold tracking-widest border border-[#0df20d]/30 inline-block mb-2">SOCIO GOLD</span>
                            </div>
                            <p className="text-slate-400 font-mono tracking-widest text-sm mb-6 uppercase">ID: #GIO-99283-2024</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <button className="bg-[#0df20d] text-[#102210] font-black px-6 py-2 rounded-full text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">edit</span> EDITAR PERFIL
                                </button>
                                <Link to="/">
                                    <button className="bg-transparent border border-slate-700 text-slate-400 font-black px-6 py-2 rounded-full text-xs tracking-widest hover:bg-slate-800 transition-colors">
                                        CERRAR SESIÓN
                                    </button>
                                </Link>
                            </div>
                        </div>
                        {/* Stats Summary inside glass card */}
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-48 relative z-10">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">PUNTOS G</p>
                                <p className="text-2xl font-black text-[#0df20d] italic-accent">2,450</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">RANKING</p>
                                <p className="text-2xl font-black text-white italic-accent">#12</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MIS RESERVAS Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black italic-accent tracking-widest uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#0df20d]">calendar_month</span> MIS RESERVAS
                                </h2>
                                <a className="text-[#0df20d] text-xs font-bold uppercase tracking-widest hover:underline" href="#">VER TODAS</a>
                            </div>
                            <div className="bg-slate-900/30 rounded-lg border border-[#0df20d]/10 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[#0df20d]/5">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">FECHA & HORA</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">ACTIVIDAD</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">ESTADO</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">ACCIÓN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#0df20d]/10">
                                            <tr className="hover:bg-[#0df20d]/5 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <p className="text-[#0df20d] font-bold text-sm">24 OCT - 19:00</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-white font-bold text-sm uppercase italic-accent">PADEL CANCHA 1</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="bg-[#0df20d]/20 text-[#0df20d] text-[10px] font-black px-3 py-1 rounded-full uppercase">PRÓXIMA</span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="text-slate-500 hover:text-red-500 text-[10px] font-black tracking-widest uppercase transition-colors">CANCELAR</button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-[#0df20d]/5 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <p className="text-slate-400 font-bold text-sm">20 OCT - 21:00</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-white font-bold text-sm uppercase italic-accent">FÚTBOL 5 - SINTÉTICO</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">COMPLETADA</span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="text-[#0df20d] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors">REPETIR</button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-[#0df20d]/5 transition-colors group border-b-0">
                                                <td className="px-6 py-6">
                                                    <p className="text-slate-400 font-bold text-sm">18 OCT - 18:30</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-white font-bold text-sm uppercase italic-accent">CLASE ENTRENAMIENTO</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">COMPLETADA</span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="text-[#0df20d] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors">REPETIR</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* MIS LOGROS Section */}
                            <div className="pt-8">
                                <h2 className="text-xl font-black italic-accent tracking-widest uppercase flex items-center gap-2 mb-6 px-2">
                                    <span className="material-symbols-outlined text-[#0df20d]">emoji_events</span> MIS LOGROS
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/40 p-6 rounded-lg border border-[#0df20d]/10 flex flex-col items-center text-center group hover:border-[#0df20d]/40 transition-all">
                                        <div className="w-16 h-16 rounded-full bg-[#0df20d]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">local_fire_department</span>
                                        </div>
                                        <p className="text-white font-black text-[10px] uppercase tracking-widest mb-1">RACHA 7 DÍAS</p>
                                        <p className="text-slate-500 text-[10px] leading-tight">Asistencia perfecta semanal</p>
                                    </div>
                                    <div className="bg-slate-900/40 p-6 rounded-lg border border-[#0df20d]/10 flex flex-col items-center text-center group hover:border-[#0df20d]/40 transition-all">
                                        <div className="w-16 h-16 rounded-full bg-[#0df20d]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">military_tech</span>
                                        </div>
                                        <p className="text-white font-black text-[10px] uppercase tracking-widest mb-1">CAMPEÓN PADEL</p>
                                        <p className="text-slate-500 text-[10px] leading-tight">Torneo Primavera 2023</p>
                                    </div>
                                    <div className="bg-slate-900/40 p-6 rounded-lg border border-[#0df20d]/10 flex flex-col items-center text-center group hover:border-[#0df20d]/40 transition-all">
                                        <div className="w-16 h-16 rounded-full bg-[#0df20d]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">groups</span>
                                        </div>
                                        <p className="text-white font-black text-[10px] uppercase tracking-widest mb-1">CAPITÁN</p>
                                        <p className="text-slate-500 text-[10px] leading-tight">Líder de equipo Fútbol 5</p>
                                    </div>
                                    <div className="bg-slate-900/20 p-6 rounded-lg border border-slate-800 flex flex-col items-center text-center grayscale opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-slate-500 text-3xl">workspace_premium</span>
                                        </div>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">SOCIO PLATINUM</p>
                                        <p className="text-slate-600 text-[10px] leading-tight">Bloqueado</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: MIS BENEFICIOS */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black italic-accent tracking-widest uppercase flex items-center gap-2 px-2">
                                <span className="material-symbols-outlined text-[#0df20d]">redeem</span> MIS BENEFICIOS
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg border border-[#0df20d]/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 bg-[#0df20d] text-[#102210] font-black text-[10px] tracking-widest italic-accent rounded-bl-lg uppercase">EXCLUSIVO GOLD</div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="material-symbols-outlined text-[#0df20d] text-4xl">restaurant</span>
                                        <div>
                                            <h3 className="text-white font-black italic-accent text-lg leading-tight uppercase">20% OFF LOMITOS</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Giovanni Bar & Grill</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mb-4">Válido de Lunes a Jueves presentando tu ID digital en caja.</p>
                                    <button className="w-full py-3 bg-[#0df20d]/10 hover:bg-[#0df20d]/20 border border-[#0df20d]/30 text-[#0df20d] text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-colors">GENERAR CÓDIGO</button>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg border border-[#0df20d]/20 relative overflow-hidden group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="material-symbols-outlined text-[#0df20d] text-4xl">sports_tennis</span>
                                        <div>
                                            <h3 className="text-white font-black italic-accent text-lg leading-tight uppercase">CLASE CORTESÍA</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Academia Padel</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mb-4">1 clase de técnica individual por mes incluida en tu membresía.</p>
                                    <button className="w-full py-3 bg-[#0df20d] text-[#102210] text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-colors hover:scale-[1.02]">RESERVAR AHORA</button>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg border border-[#0df20d]/20 relative overflow-hidden group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="material-symbols-outlined text-[#0df20d] text-4xl">local_mall</span>
                                        <div>
                                            <h3 className="text-white font-black italic-accent text-lg leading-tight uppercase">15% OFF STORE</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Indumentaria Oficial</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mb-4">Descuento en toda la línea de ropa deportiva Giovanni.</p>
                                    <button className="w-full py-3 bg-[#0df20d]/10 hover:bg-[#0df20d]/20 border border-[#0df20d]/30 text-[#0df20d] text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-colors">VER CATÁLOGO</button>
                                </div>
                            </div>

                            {/* Promo Banner */}
                            <div className="rounded-lg overflow-hidden relative aspect-[4/5] group cursor-pointer shadow-xl">
                                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzuSQH-b9U13eSOP78CYfz_OPPCtar0tkK0nbtyveyd10Gl2PjRzRnYWVsiu515MxSE6C5TK_e5dNd1qZdURlbrdyTMlcP97i0niW3rFQPTypeiXTDRejyOH4GWNxi1grUtfBWRAvuj30pCHKJDHUvM3zBQ6SY7LqScMAqcNcWe0C7gvQE53u1jOU29uZ0P0xpsB9aHvUhub597_7fvuYIhr3vxi9OdsvRLkxbDK_gGTHSY550ZZhmbWKes59zqxxK2GQO4GPfjqI" alt="Summer Open" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#102210] via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h4 className="text-white font-black italic-accent text-2xl uppercase leading-tight mb-2">PRÓXIMO TORNEO:<br />OPEN VERANO</h4>
                                    <p className="text-[#0df20d] font-bold text-sm tracking-widest mb-4 uppercase">INSCRIPCIONES ABIERTAS</p>
                                    <button className="bg-white text-[#102210] font-black px-4 py-2 rounded-full text-[10px] tracking-widest uppercase">MÁS INFO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Bottom Navigation Mobile */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#102210] border-t border-[#0df20d]/20 px-6 py-4 flex justify-between items-center z-50">
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">INICIO</span>
                    </Link>
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">event_available</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">RESERVAS</span>
                    </Link>
                    <div className="bg-[#0df20d] p-3 rounded-full -mt-10 border-4 border-[#102210] shadow-lg">
                        <span className="material-symbols-outlined text-[#102210]">add</span>
                    </div>
                    <Link to="/tournament-admin" className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">trophy</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">TORNEOS</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-[#0df20d]">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">PERFIL</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
