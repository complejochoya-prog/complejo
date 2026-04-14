import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Membership() {
    const [selectedPlan, setSelectedPlan] = useState('premium');

    return (
        <div className="bg-background-light dark:bg-[#221e10] font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <style>{`
        .glass-card {
            background: rgba(34, 30, 16, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(242, 185, 13, 0.2);
        }
        .glow-button {
            box-shadow: 0 0 20px rgba(242, 185, 13, 0.4);
        }
      `}</style>
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                {/* Top Navigation */}
                <header className="flex items-center justify-between border-b border-[#f2b90d]/10 px-6 py-4 lg:px-20 bg-[#221e10]/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4 text-[#f2b90d]">
                        <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                        <h2 className="text-slate-100 text-xl font-extrabold tracking-tighter uppercase font-display">COMPLEJO GIOVANNI</h2>
                    </div>
                    <div className="hidden lg:flex items-center gap-10">
                        <Link to="/home" className="text-slate-300 hover:text-[#f2b90d] text-sm font-semibold transition-colors">INICIO</Link>
                        <Link to="/home" className="text-slate-300 hover:text-[#f2b90d] text-sm font-semibold transition-colors">RESERVAS</Link>
                        <Link to="/tournament-admin" className="text-slate-300 hover:text-[#f2b90d] text-sm font-semibold transition-colors">TORNEOS</Link>
                        <Link to="/membership" className="text-[#f2b90d] text-sm font-bold border-b-2 border-[#f2b90d] pb-1">CLUB</Link>
                        <Link to="/bar-management" className="text-slate-300 hover:text-[#f2b90d] text-sm font-semibold transition-colors">BAR</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex min-w-[120px] items-center justify-center rounded-full h-10 px-5 bg-[#f2b90d] text-[#221e10] text-sm font-bold tracking-wide hover:scale-105 transition-transform">
                            MI PERFIL
                        </button>
                        <div className="rounded-full size-10 border-2 border-[#f2b90d]/30 overflow-hidden">
                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ__qrWeTINzDujcfLY8AWhaa0pdrA4fjTV3LT-bi6WGUTO0r0iaEwd4ls5WyrtUgBXIIz0KAC9yA3MiS_8jy_C0JpWH-luqYEMK1FrQMH16HlFfWF6IF4EU84SXHksRXJ2X7xJQjZGtCVHo7eBn5s6U-glne5jsS5vXUMFiFhW9ub9WKRMDiDAOzarpe4PVbqqgRwAjED7UVSbl4bF4iuF2vPo5jt9sLUlGfIe9RXXjn--TSwnznA7Em71hl_c40dyHe04Ty_c7E" alt="User profile" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-start py-12 px-6 lg:px-20 max-w-7xl mx-auto w-full">
                    {/* Hero Header Section */}
                    <div className="w-full mb-12 text-center lg:text-left">
                        <h1 className="text-[#f2b90d] text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
                            BECOME A MEMBER <br />
                            <span className="text-slate-100 not-italic">CLUB GIOVANNI</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl lg:ml-1">
                            Únete a la élite del deporte y el ocio. Beneficios exclusivos, prioridad en reservas y experiencias premium diseñadas para atletas exigentes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                        {/* Registration Form - Glassmorphism Card */}
                        <div className="lg:col-span-8 glass-card rounded-xl p-8 lg:p-12">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="size-10 rounded-full bg-[#f2b90d] flex items-center justify-center text-[#221e10] font-bold">1</div>
                                <h3 className="text-2xl font-bold text-slate-100">Información Personal</h3>
                            </div>
                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider ml-1">Nombre Completo</label>
                                        <input className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-4 text-slate-100 focus:ring-2 focus:ring-[#f2b90d] focus:border-transparent outline-none transition-all placeholder:text-slate-600" placeholder="Ej: Juan Pérez" type="text" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider ml-1">Fecha de Nacimiento</label>
                                        <input className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-4 text-slate-100 focus:ring-2 focus:ring-[#f2b90d] focus:border-transparent outline-none transition-all" type="date" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider ml-1">WhatsApp</label>
                                        <input className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-4 text-slate-100 focus:ring-2 focus:ring-[#f2b90d] focus:border-transparent outline-none transition-all placeholder:text-slate-600" placeholder="+54 9 11 ..." type="tel" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider ml-1">Deporte Preferido</label>
                                        <select className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-4 text-slate-100 focus:ring-2 focus:ring-[#f2b90d] focus:border-transparent outline-none transition-all appearance-none">
                                            <option>Fútbol</option>
                                            <option>Pádel</option>
                                            <option>Tenis</option>
                                            <option>Básquet</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-10 rounded-full bg-[#f2b90d] flex items-center justify-center text-[#221e10] font-bold">2</div>
                                        <h3 className="text-2xl font-bold text-slate-100">Plan de Membresía</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label
                                            onClick={() => setSelectedPlan('standard')}
                                            className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all group ${selectedPlan === 'standard' ? 'border-[#f2b90d] bg-[#f2b90d]/5' : 'border-slate-700 bg-[#0f172a]/30 hover:border-[#f2b90d]/50'
                                                }`}
                                        >
                                            <input
                                                checked={selectedPlan === 'standard'}
                                                onChange={() => setSelectedPlan('standard')}
                                                className="absolute top-4 right-4 text-[#f2b90d] focus:ring-[#f2b90d] bg-slate-800 border-slate-600"
                                                name="plan"
                                                type="radio"
                                            />
                                            <span className="text-xl font-bold text-slate-100 mb-1">Standard</span>
                                            <span className="text-[#f2b90d] font-bold text-lg mb-4">$5.000 <span className="text-slate-500 text-xs uppercase">/ mes</span></span>
                                            <p className="text-slate-400 text-sm">Acceso a beneficios básicos y reservas anticipadas de 24hs.</p>
                                        </label>
                                        <label
                                            onClick={() => setSelectedPlan('premium')}
                                            className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all group ${selectedPlan === 'premium' ? 'border-[#f2b90d] bg-[#f2b90d]/5' : 'border-slate-700 bg-[#0f172a]/30 hover:border-[#f2b90d]/50'
                                                }`}
                                        >
                                            <input
                                                checked={selectedPlan === 'premium'}
                                                onChange={() => setSelectedPlan('premium')}
                                                className="absolute top-4 right-4 text-[#f2b90d] focus:ring-[#f2b90d] bg-slate-800 border-slate-600"
                                                name="plan"
                                                type="radio"
                                            />
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl font-bold text-slate-100">Premium</span>
                                                <span className="bg-[#f2b90d] text-[#221e10] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Top</span>
                                            </div>
                                            <span className="text-[#f2b90d] font-bold text-lg mb-4">$8.500 <span className="text-slate-500 text-xs uppercase">/ mes</span></span>
                                            <p className="text-slate-300 text-sm">Acceso total, estacionamiento VIP y descuentos exclusivos en el bar.</p>
                                        </label>
                                    </div>
                                </div>

                                <button className="w-full glow-button bg-[#f2b90d] hover:bg-[#f2b90d]/90 text-[#221e10] font-black text-xl py-6 rounded-xl mt-8 transition-all hover:scale-[1.01] active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3" type="button">
                                    UNIRME AL CLUB
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </form>
                        </div>

                        {/* Benefits Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass-card rounded-xl p-8 border-l-4 border-l-[#f2b90d]">
                                <h4 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#f2b90d]">verified</span>
                                    Tus Beneficios
                                </h4>
                                <ul className="space-y-5">
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#f2b90d] text-xl">check_circle</span>
                                        <div>
                                            <p className="text-slate-100 font-semibold text-sm">Descuento en Bar</p>
                                            <p className="text-slate-400 text-xs">20% OFF en todos tus consumos en Giovanni Bar.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#f2b90d] text-xl">check_circle</span>
                                        <div>
                                            <p className="text-slate-100 font-semibold text-sm">Prioridad de Reserva</p>
                                            <p className="text-slate-400 text-xs">Reserva tus canchas favoritas antes que nadie.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#f2b90d] text-xl">check_circle</span>
                                        <div>
                                            <p className="text-slate-100 font-semibold text-sm">Torneos Exclusivos</p>
                                            <p className="text-slate-400 text-xs">Inscripción bonificada en la Copa Giovanni anual.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#f2b90d] text-xl">check_circle</span>
                                        <div>
                                            <p className="text-slate-100 font-semibold text-sm">Estacionamiento VIP</p>
                                            <p className="text-slate-400 text-xs">Ubicación preferencial dentro del predio.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#f2b90d] text-xl">check_circle</span>
                                        <div>
                                            <p className="text-slate-100 font-semibold text-sm">Vestuarios Premium</p>
                                            <p className="text-slate-400 text-xs">Acceso a lockers privados y zona de relax.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="rounded-xl overflow-hidden h-48 relative group">
                                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdVvinhbT4sY15KzxcSyefGov1SoSt4UApAwOFZprP1jHA1y_dAeGFH1Ce6Uc4Woi2aVKbeQv7vjDqYqV5ZpWHO484mI0uM_Re44ebDlB_CIbFOWeCd8PxFm6sgS9uMV2T70oXztTwloiEf3n2oyXXfHyZ6DRZTzOqOJc-QiMqc-tJ5vZrkrsw5YiT6EjyVxMCOML6w_Fe40EzOw0KARn5wcg2WZSI3ryLclcPl2pKvWdcHGFQLT6JMJzQ-LcBwn8G2O415OZloB4" alt="Facilities" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221e10] to-transparent flex items-end p-6">
                                    <p className="text-white text-sm font-bold italic">Instalaciones de primer nivel mundial.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Persistent Bottom Navigation */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#221e10]/95 backdrop-blur-lg border-t border-slate-800 px-6 py-4 flex justify-between items-center z-50">
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
                    </Link>
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined">calendar_month</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Reservas</span>
                    </Link>
                    <Link to="/membership" className="flex flex-col items-center gap-1 text-[#f2b90d]">
                        <span className="material-symbols-outlined">workspace_premium</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Club</span>
                    </Link>
                    <Link to="/tournament-admin" className="flex flex-col items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined">sports_score</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Torneos</span>
                    </Link>
                    <Link to="/players" className="flex flex-col items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
                    </Link>
                </nav>

                {/* Desktop Footer Info */}
                <footer className="hidden lg:block py-10 px-20 border-t border-slate-800 bg-[#221e10] text-slate-500">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <p className="text-sm">© 2024 Complejo Giovanni. All Rights Reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/help" className="hover:text-[#f2b90d] transition-colors">Términos</Link>
                            <Link to="/help" className="hover:text-[#f2b90d] transition-colors">Privacidad</Link>
                            <Link to="/help" className="hover:text-[#f2b90d] transition-colors">Contacto</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
