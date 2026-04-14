import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ScorersAndSanctions() {
    const [activeTab, setActiveTab] = useState('scorers'); // 'scorers' or 'sanctions'
    return (
        <div className="bg-background-light dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-display antialiased min-h-screen flex flex-col selection:bg-[#0df20d] selection:text-slate-900">
            <style>{`
        .glass-panel {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 lg:px-10 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white">
                        <div className="size-8 text-[#0df20d]">
                            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM5.93 4.26C8.6 2.87 11.69 2.45 14.65 3.12C11.89 4.67 9.53 7.03 7.98 9.79C7.31 6.83 7.73 3.74 9.12 1.07L5.93 4.26ZM4 12C4 10.73 4.29 9.51 4.82 8.42C6.72 6.2 9.14 4.54 11.9 3.65C9.37 5.79 7.42 8.5 6.25 11.59C5.43 11.72 4.63 11.93 3.86 12.22C3.95 12.14 4 12.07 4 12ZM12 20C10.73 20 9.51 19.71 8.42 19.18C6.2 17.28 4.54 14.86 3.65 12.1C5.79 14.63 8.5 16.58 11.59 17.75C11.72 18.57 11.93 19.37 12.22 20.14C12.14 20.05 12.07 20 12 20ZM19.18 15.58C17.28 17.8 14.86 19.46 12.1 20.35C14.63 18.21 16.58 15.5 17.75 12.41C18.57 12.28 19.37 12.07 20.14 11.78C20.05 11.86 20 11.93 20 12C20 13.27 19.71 14.49 19.18 15.58Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-white text-xl font-black tracking-tighter italic">COMPLEJO GIOVANNI</h2>
                    </div>
                    <div className="hidden lg:flex flex-1 justify-end gap-8">
                        <nav className="flex items-center gap-8 mr-8">
                            <Link to="/home" className="text-slate-400 hover:text-[#0df20d] text-sm font-bold tracking-wider transition-colors">INICIO</Link>
                            <Link to="/home" className="text-slate-400 hover:text-[#0df20d] text-sm font-bold tracking-wider transition-colors">CANCHAS</Link>
                            <Link to="/tournament-admin" className="text-white border-b-2 border-[#0df20d] pb-1 text-sm font-bold tracking-wider">TORNEOS</Link>
                            <Link to="/dashboard" className="text-slate-400 hover:text-[#0df20d] text-sm font-bold tracking-wider transition-colors">ADMIN</Link>
                        </nav>
                        <div className="flex gap-3">
                            <button className="flex items-center justify-center rounded-full size-10 bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-white/10">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                            </button>
                            <button className="flex items-center justify-center rounded-full size-10 bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-white/10">
                                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                            </button>
                        </div>
                    </div>
                    <button className="lg:hidden text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-10 py-8 space-y-8">
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df20d] to-emerald-400">Estadísticas</span> y Sanciones
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl font-light">
                            Consulta el rendimiento de los jugadores estrella y mantente al día con el estado disciplinario del torneo actual.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[#0df20d]">calendar_month</span>
                        <span className="text-slate-300 font-medium text-sm">Temporada 2024 - Apertura</span>
                    </div>
                </section>

                <div className="sticky top-[80px] z-40 bg-[#0f172a]/80 backdrop-blur-md pt-2 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex bg-slate-900/50 p-1.5 rounded-full border border-white/5 max-w-md">
                        <button
                            onClick={() => setActiveTab('scorers')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-black transition-all transform hover:scale-[1.02] ${activeTab === 'scorers' ? 'bg-[#0df20d] text-slate-900 shadow-lg shadow-[#0df20d]/20' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px] font-bold">trophy</span>
                            GOLEADORES
                        </button>
                        <button
                            onClick={() => setActiveTab('sanctions')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-bold transition-colors ${activeTab === 'sanctions' ? 'bg-[#0df20d] text-slate-900 shadow-lg shadow-[#0df20d]/20' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            SANCIONES
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Top Scorers Table (Takes 2 columns) - Only show if scorers tab active on mobile, always on desktop */}
                    <div className={`lg:col-span-2 space-y-6 ${activeTab !== 'scorers' ? 'hidden lg:block' : ''}`}>
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
                                <h3 className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#0df20d]">leaderboard</span>
                                    TABLA DE GOLEO
                                </h3>
                                <button className="text-xs font-bold text-[#0df20d] hover:text-white transition-colors uppercase tracking-wider">Ver todo</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-900/40">
                                            <th className="px-6 py-4 w-16 text-center">Pos</th>
                                            <th className="px-6 py-4">Jugador</th>
                                            <th className="px-6 py-4">Equipo</th>
                                            <th className="px-6 py-4 text-center">PJ</th>
                                            <th className="px-6 py-4 text-right">Goles</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        <tr className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-slate-900 font-black flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">1</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="size-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-yellow-500/50">
                                                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV0luucXiMQ6w6Qe4Ysfr4v9LfNK3YJQP0AzXfSWCF_C4WqQZc3BxqEPVkudi1aLZatFtwPSdCvmUsDCFcO8x7nv_QB4zA7RMzDbtG3s7iN52ADy28vNkFQOOqAgi625YkujeOZ3tW1okHSmJ5reWx0SLcsQsw7YOB46X35F9j-1JOOIygMucmlz2JSEvzVGBZqagVRKNvVCtqYK9yJo2t2nY5373uJvsM5G20I_Ejk0DqI0uunxLRP5663u2jHbHLjwNzvSEeW9M" alt="Carlos Mendoza" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                                                            <span className="material-symbols-outlined text-[10px] text-slate-900 block font-bold">star</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">Carlos Mendoza</p>
                                                        <p className="text-xs text-slate-400">Delantero</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">Los Rayos FC</td>
                                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-2xl font-black text-white">12</span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 font-black flex items-center justify-center mx-auto shadow-lg shadow-slate-400/20">2</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-400/50">
                                                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjXfLXp3sSMpW6yn2savscoirXtxhNuTOZVmQcLp-QV5z4IfvWCbmhsRY-8TwCjoqQBAJff0AdFu6GnCZ24BgRl5aUo_rgHIv9vsWb2Cg_FOcfx9jn1kAK4zfTp95C-W0jcULMlpTmrZPXs_5oHwslxP6LA-krGH9fcE2fexNGTmc0uJUuUfV6JVbcW3mxly6NFWYobsnNovMqWAE_d-P2NCy1Oln0V3pDZv71BoEtQLrEzbf8V8kQM5Ru44gws3-qtviPDX1ly7w" alt="Andrés Silva" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white group-hover:text-slate-300 transition-colors">Andrés Silva</p>
                                                        <p className="text-xs text-slate-400">Mediapunta</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">Atlético Sur</td>
                                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-2xl font-black text-white">10</span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black flex items-center justify-center mx-auto shadow-lg shadow-amber-700/20">3</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-amber-700/50">
                                                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO_hrFS-ETwYo4Yh8nrdeE61xCaKp00obo7MeE3REOYo-Awh1GLxd5KBBrwaIvFLPrCjGWOgGFdqP0pKy5CxQ5O7BsfHhrvPngBLhXWNy6I98KjFSVUFTWr2idNMR9POuN_VLBiwyrQo6714o-lwSewl9UPqWKAQ7b9716jVykkEzy3VatSEUM2-d52g5qPQFFk2HE4NFAPtJDcG9LdoeynB6kKlAoSQ3iDR7n7riaDrFlN2IfIWWxFR7KIoLkLwMx8SEGxl37cEI" alt="Jorge Ruiz" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white group-hover:text-amber-500 transition-colors">Jorge Ruiz</p>
                                                        <p className="text-xs text-slate-400">Delantero</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">Deportivo Norte</td>
                                            <td className="px-6 py-4 text-center text-slate-400">7</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-2xl font-black text-white">9</span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-slate-500">4</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">Luis Hernández</p>
                                                        <p className="text-xs text-slate-400">Extremo</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">F.C. Giovanni</td>
                                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xl font-bold text-slate-300">7</span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-white/5 transition-colors border-b-0">
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-slate-500">5</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">Miguel Torres</p>
                                                        <p className="text-xs text-slate-400">Central</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">Halcones</td>
                                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xl font-bold text-slate-300">6</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Sanctions & Quick Stats - Only show if sanctions tab active on mobile, always on desktop */}
                    <div className={`lg:col-span-1 space-y-6 ${activeTab !== 'sanctions' ? 'hidden lg:block' : ''}`}>
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-[120px] text-red-500">style</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-white text-lg font-bold tracking-wide mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">gavel</span>
                                    SANCIONES RECIENTES
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="relative shrink-0">
                                            <div className="size-12 rounded-full bg-slate-800 overflow-hidden">
                                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHhx5F86rnbvYue__3874bpYzGUlzqIsr0_EmG8QHWcdu3obiGoKenLM8BbwRIFy3EPOhVrBqYxUba8nns3cHMVMXKivdCBMzeIkPsQgc-4mrRrswopBTX4DOLmXfGzd_PbPZXCAYdirQjuORyahkj_1Q1hcnKUpvsHcolTu3BR1nLqw-kraacIWEu60wkm4xn0StAB7lQFoo2U0z3MVPzBVncPbI3adq1UPfRC4QUxkeRwhgx4Bk-WEdtZTRybeXqhS1z1Rd-AKw" alt="Suspended Player" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 border border-slate-900">
                                                <span className="material-symbols-outlined text-[12px] text-white block">block</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">Roberto Diaz</p>
                                            <p className="text-xs text-red-400 font-medium uppercase tracking-wider">Suspendido (2 Fechas)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-white/5">
                                        <div className="size-12 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-400">person</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">Juan Perez</p>
                                            <p className="text-xs text-slate-400">Los Rayos FC</p>
                                        </div>
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-5 bg-yellow-400 rounded-sm shadow-sm transform -rotate-6 border border-black/20" title="Tarjeta Amarilla"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-white/5">
                                        <div className="size-12 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-400">person</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">Esteban Quito</p>
                                            <p className="text-xs text-slate-400">Halcones</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                            <div className="w-4 h-5 bg-yellow-400 rounded-sm shadow-sm transform -rotate-12 border border-black/20" title="Tarjeta Amarilla"></div>
                                            <div className="w-4 h-5 bg-yellow-400 rounded-sm shadow-sm transform rotate-6 border border-black/20" title="Tarjeta Amarilla"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-white/5">
                                        <div className="size-12 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-400">person</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">Mario G.</p>
                                            <p className="text-xs text-slate-400">Deportivo Norte</p>
                                        </div>
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-5 bg-red-600 rounded-sm shadow-sm transform rotate-3 border border-black/20" title="Tarjeta Roja"></div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                    Ver reporte completo
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Equipo Fair Play</h3>
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10">
                                    <span className="material-symbols-outlined text-slate-900 text-3xl">shield</span>
                                </div>
                                <div>
                                    <p className="text-white text-lg font-black italic">ATLÉTICO SUR</p>
                                    <p className="text-emerald-400 text-sm font-medium">0 Tarjetas Rojas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="lg:hidden fixed bottom-0 w-full glass-panel border-t border-white/10 px-6 py-3 z-50">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[10px] font-bold">Inicio</span>
                    </Link>
                    <Link to="/tournament-admin" className="flex flex-col items-center gap-1 text-[#0df20d]">
                        <span className="material-symbols-outlined fill-current">emoji_events</span>
                        <span className="text-[10px] font-bold">Torneos</span>
                    </Link>
                    <div className="relative -top-8">
                        <button className="size-14 rounded-full bg-[#0df20d] text-slate-900 flex items-center justify-center shadow-lg shadow-[#0df20d]/40 border-4 border-slate-900">
                            <span className="material-symbols-outlined text-3xl">sports_soccer</span>
                        </button>
                    </div>
                    <Link to="/home" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">calendar_month</span>
                        <span className="text-[10px] font-bold">Fechas</span>
                    </Link>
                    <Link to="/players" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0df20d]">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-bold">Perfil</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
