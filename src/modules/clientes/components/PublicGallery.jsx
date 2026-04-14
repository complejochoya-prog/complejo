import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicGallery() {
    return (
        <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-[#f5f7f8] dark:bg-[#020617] font-display text-slate-900 dark:text-slate-100 selection:bg-[#0d7ff2]/30">
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .masonry-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    grid-auto-rows: 200px;
                    gap: 1.5rem;
                }
                .masonry-item-tall {
                    grid-row: span 2;
                }
                .masonry-item-wide {
                    grid-column: span 2;
                }
                @media (max-width: 768px) {
                    .masonry-item-wide {
                        grid-column: span 1;
                    }
                }
            `}</style>

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-[#f5f7f8]/80 dark:bg-[#020617]/80 backdrop-blur-md px-6 md:px-10 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-[#0d7ff2]">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">COMPLEJO GIOVANNI</h2>
                        </div>
                        <nav className="hidden lg:flex items-center gap-8">
                            <Link to="/home" className="text-slate-600 dark:text-slate-400 hover:text-[#0d7ff2] dark:hover:text-[#0d7ff2] transition-colors text-sm font-semibold tracking-wider">INICIO</Link>
                            <Link to="/reservations" className="text-slate-600 dark:text-slate-400 hover:text-[#0d7ff2] dark:hover:text-[#0d7ff2] transition-colors text-sm font-semibold tracking-wider">RESERVAS</Link>
                            <Link to="/tournament-admin" className="text-slate-600 dark:text-slate-400 hover:text-[#0d7ff2] dark:hover:text-[#0d7ff2] transition-colors text-sm font-semibold tracking-wider">TORNEOS</Link>
                            <Link to="/public-gallery" className="text-[#0d7ff2] text-sm font-semibold tracking-wider border-b-2 border-[#0d7ff2] pb-1">GALERÍA</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-900 dark:text-slate-200 placeholder:text-slate-500" placeholder="Buscar fotos..." type="text" />
                        </div>
                        <button className="bg-[#0d7ff2] hover:bg-[#0d7ff2]/90 text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#0d7ff2]/20">
                            RESERVAR AHORA
                        </button>
                        <div className="size-10 rounded-full bg-slate-800 border-2 border-[#0d7ff2]/50 overflow-hidden">
                            <img className="w-full h-full object-cover" data-alt="Avatar of the user profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPHL7zZ6THEa48BeA67vwZqJf1yJNbbJh2gZinpctGIJB2vCKhTv9Z0o802SPppxRA7n7VPkJXr1gT5GTarENT6lOOrVkyaKJRxCbXwqMZubX1eAgbvasSorINb6dgbIZTAkKxoUnpjyK8e_67U9rFiSQoaTez1xVmG99KaO3M9v8-AhQNoOkw-tt3dSsyhP1I2M2i2pg0YT-16KWgR_PCAiUUXNrYNRcdq_Y6oqSnwlsyjtQio4Ok8zlo72yK8zixLClqYITzrTo" alt="Profile" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-10 py-12 pb-32">
                {/* Hero Title */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-4">
                        GALERÍA DE FOTOS Y TORNEOS
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                        Reviví los mejores momentos de cada competencia, la pasión del juego y las celebraciones de los campeones.
                    </p>
                </div>

                {/* Categories Filter */}
                <div className="flex flex-wrap items-center gap-3 mb-12 scrollbar-hide overflow-x-auto pb-2">
                    <button className="px-8 py-3 rounded-full bg-[#0d7ff2] text-white font-bold text-sm tracking-widest transition-all">
                        TODOS
                    </button>
                    <button className="px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm tracking-widest transition-all border border-slate-200 dark:border-slate-800">
                        FÚTBOL 5
                    </button>
                    <button className="px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm tracking-widest transition-all border border-slate-200 dark:border-slate-800">
                        VÓLEY
                    </button>
                    <button className="px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm tracking-widest transition-all border border-slate-200 dark:border-slate-800">
                        TORNEO VERANO
                    </button>
                    <button className="px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm tracking-widest transition-all border border-slate-200 dark:border-slate-800">
                        POOL PARTY
                    </button>
                </div>

                {/* Masonry Grid */}
                <div className="masonry-grid">
                    {/* Large Item */}
                    <div className="masonry-item-tall masonry-item-wide relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Action shot of a soccer match at night" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgsBdsM4IzeBASLNbgsCGH51Fsxz8djqVQ4-txW3D5OJoSxzCNhVssQswswj4_WY7_WtxsKfh1JteFVQE4dsz-UcZ6jBSXRG09B_icYhv1OdqOyg3UYNFH0FkAfSFRAk2A8abFv5sivqWmGFiWfUN_EIhQmR_T5Be4QcIFB7UcfInI_dExo9KOm-J9fRjBW7OK3P9spmISboeCVzQw3z0Kples8LpkLF1k5pdSVNrnEilQRz0PtlZX9VI-56d1VQA-bTN73HDmOR4" alt="Match" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                            <h3 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter">FINAL TORNEO APERTURA</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm font-medium">15 de Marzo, 2024</span>
                                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold tracking-widest uppercase transition-all">
                                    <span className="material-symbols-outlined text-sm">share</span> COMPARTIR
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Regular Item */}
                    <div className="relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="High quality volleyball game action" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpWVxLoJ0w5IlggsRcBAtKu88JUqOr3uc8vFUfvAcb0xdGg9NH1pSndLDXGIrziVbV3_8wnL3ObsXIL2Z3KuNzZxhNkIyJwkpOonoikOuczPDgFzHt4UVhYxrQhMDWxUh6h3pMVyo6fuBREvJYqeBAv-9YHZIAU-Mni7ZwSMaDBdX6ndyUCpGWpJl6CvHoCvBNIWbE58QAy7bbc8VxcSdyl8VNfsbzHu2rqfeJezg_5RllZOhZux4DIk1xpVZ6zElBmUJ8AfZ-jFY" alt="Volley" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <h3 className="text-white font-black italic text-lg mb-1 uppercase tracking-tighter">MIXTO VÓLEY</h3>
                            <button className="w-fit flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                                <span className="material-symbols-outlined text-xs">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Tall Item */}
                    <div className="masonry-item-tall relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Summer pool party event atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOV9CEPcjH6UO7Ad-ch5YDmOqKkN6dvY0uo3-1kRaT7LkdA71q6MmO85gH8q4jJi5kLv4Wi6BNtcxlKk_N6RGP6Uq5y4C3Ysw7u3CWRc1P211_YUuEgGVTPygb7s_lTdcgzH4qeyHGII64HwfcBIyImRuCiAbJFnW6OeCM1Y8ucWtXxTAsZEP_qBw2TjKyexn215RIEi92VUEWPJihVKqCBE8YCSRdcvNLeRqEF9DAJkd8mACyuSTbSTJotJAkWJ0ILswII8pONdg" alt="Pool Party" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <h3 className="text-white font-black italic text-lg mb-1 uppercase tracking-tighter">POOL PARTY EXCLUSIVE</h3>
                            <button className="w-fit flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                                <span className="material-symbols-outlined text-xs">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Regular Item */}
                    <div className="relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Football players celebrating a goal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcZmSD_jwAyvqLCDCNe7APr8cRSCvOQ0-bXyH8N7O1qdWUpQuNTLMtggmG97RuysI1IvdH5pXQM3hs0P_EG9S5mNzEqOackVdDmqJtc79YeDM5NdKuSCpJH_OYy6f0fWewJ582zQVlRCpWKYsDb7DMO2gFnAcYA5I1h7EI7eW9_sSMVeY9GVc1P2zYKJUrZ9zW_lO7C36TPzQzVoZhnSff5LNLZYmrd9bxyyvZ9TsJWEOebligVJWAOxLVLWKzqYL4ngljhfo_H9g" alt="Goal Celebration" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <h3 className="text-white font-black italic text-lg mb-1 uppercase tracking-tighter">CELEBRACIÓN CAMPEÓN</h3>
                            <button className="w-fit flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                                <span className="material-symbols-outlined text-xs">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Regular Item */}
                    <div className="relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Night soccer match under bright stadium lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPnrFTDzaDPKP6aNAr8Nqbd3zav-XGIG5RVlKXfVpW7VseAY0r87-oj66HGAjJP-r5J01Dhjql2KMusjenm1liK0zLGEgilr0QfoPFWFonpK6TTtOeDMvYR7dY8dv6Jc2bHE0aJ4CSfH7QPjnw0Dd4T-c0EH_060QkLg_ftY8HrVb9ZRy8y4QYxRRSY11QvRh30Bzs76zb3vozBhMcKy6zVLHpDVLMyMufo3PsQcrMrpqgipI7fM4uU10aG5SeOw_oCm2isnQ81e0" alt="Night Cup" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <h3 className="text-white font-black italic text-lg mb-1 uppercase tracking-tighter">NIGHT CUP</h3>
                            <button className="w-fit flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                                <span className="material-symbols-outlined text-xs">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Wide Item */}
                    <div className="masonry-item-wide relative group rounded-lg overflow-hidden glass-card">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Aerial view of sports complex during tournament" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1mZ8hnAs5kGRvOXdL1qQtfajbhKZyqxQvyPVOP4llOQQHB378P7xIQfMpnCI3gbEeEsEKWfEQ2743RNI24EXanEvPfT9K2dbOtkZNJegAFzBaqAVElPCmf6JsB9aJ6Kof4TsEYlAEyOWKTObliYW97WNoilPVe8R6FeBhsoSvo_3jdJ8kqDx_UsO-EP_pWfE21U0NbrRipgPC1JypqUxQ5_hQMk-ge6gmNHEQBhZFJlskcBfuuAOfqQvu2VGu6z2TzaUauW-R0cE" alt="Aerial" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                            <h3 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter">MASTER VISTA COMPLEJO</h3>
                            <button className="w-fit flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold tracking-widest uppercase transition-all">
                                <span className="material-symbols-outlined text-sm">share</span> COMPARTIR
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-2xl">
                    <Link to="/home" className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-2xl">dashboard</span>
                    </Link>
                    <Link to="/tournaments" className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-2xl">trophy</span>
                    </Link>
                    <Link to="/public-gallery" className="p-4 rounded-full bg-[#0d7ff2] text-white shadow-lg shadow-[#0d7ff2]/30 transition-all">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                    </Link>
                    <Link to="/players" className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-2xl">group</span>
                    </Link>
                    <Link to="/settings" className="p-4 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
