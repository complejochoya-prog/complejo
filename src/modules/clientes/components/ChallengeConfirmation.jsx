import React from "react";
import { Link } from "react-router-dom";

export default function ChallengeConfirmation() {
    return (
        <div
            className="challenge-confirm-theme bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-hidden"
            style={{
                '--color-primary': '#0df20d',
                '--color-background-dark': '#102210',
                '--color-background-light': '#f5f8f5',
                '--color-glass': 'rgba(2, 6, 23, 0.7)',
                '--color-glass-border': 'rgba(255, 255, 255, 0.1)',
                backgroundImage: `linear-gradient(rgba(16, 34, 16, 0.85), rgba(16, 34, 16, 0.95)), url('https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=2076&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <style>{`
                .challenge-confirm-theme textarea::-webkit-scrollbar {
                    width: 8px;
                }
                .challenge-confirm-theme textarea::-webkit-scrollbar-track {
                    background: transparent;
                }
                .challenge-confirm-theme textarea::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                .challenge-confirm-theme .bg-glass {
                    background: var(--color-glass);
                }
                .challenge-confirm-theme .border-glass-border {
                    border-color: var(--color-glass-border);
                }
            `}</style>

            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-6 py-4 lg:px-10 backdrop-blur-md bg-background-dark/50 fixed w-full top-0 z-50">
                <div className="flex items-center gap-4 text-white">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined !text-3xl">sports_soccer</span>
                    </div>
                    <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Complejo Giovanni</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
                    <div className="flex items-center gap-9">
                        <Link to="/home" className="text-white/80 hover:text-primary transition-colors text-sm font-medium leading-normal">Inicio</Link>
                        <Link to="#" className="text-primary text-sm font-medium leading-normal">Torneos</Link>
                        <Link to="#" className="text-white/80 hover:text-primary transition-colors text-sm font-medium leading-normal">Reservas</Link>
                        <Link to="#" className="text-white/80 hover:text-primary transition-colors text-sm font-medium leading-normal">Perfil</Link>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                            <span className="material-symbols-outlined">account_circle</span>
                        </button>
                    </div>
                </div>
                {/* Mobile Menu Icon */}
                <button className="md:hidden text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative z-10 w-full h-full">
                {/* Glassmorphism Card Modal */}
                <div className="w-full max-w-[560px] bg-glass backdrop-blur-xl border border-glass-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <h1 className="text-white text-2xl font-bold tracking-tight">ENVIAR DESAFÍO</h1>
                        <button className="text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-8 flex flex-col gap-8">
                        {/* Opponent Team Section */}
                        <div className="flex flex-col items-center gap-5">
                            <div className="relative">
                                <div className="size-28 rounded-full border-4 border-primary/20 shadow-[0_0_20px_rgba(13,242,13,0.3)] overflow-hidden bg-background-dark">
                                    <img alt="Los Tigres FC team logo placeholder" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_CSQQlAOCfJ8STOnUJqS_ZvLeiZF6uPJyoJk0rTSbbViyO9-lqMZvZiyo-JV2w8CBTRJycojHEwVb4mT-R1RJ7q4cwBGoi8odiBoKgkKbifL_aH2qjmx9ES-BWehpYfqQ50ReglH9cdQMIztXDfXAxDN534HNu1aHg5RKDlp5lz-JwyjmDy2lIicN4BZT0YqmjXRkMHThL40uGqoRvonxFFc40S6-ab0sTuMQ8g8lg9P3JwPt8qWLHQ_Mz8fU1z2DXgsds4CbDAw" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-background-dark rounded-full p-1.5 border border-white/10">
                                    <div className="bg-primary text-black rounded-full p-1 w-8 h-8 flex items-center justify-center font-bold text-xs">
                                        7
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <h2 className="text-white text-3xl font-bold tracking-tight">Los Tigres FC</h2>
                                <div className="flex items-center justify-center gap-2 text-primary">
                                    <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                                    <span className="font-medium">Fútbol 7</span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-slate-300">Nivel Intermedio</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-2">Capitán: <span className="text-white font-medium">Juan Pérez</span></p>
                            </div>
                        </div>

                        {/* Message Section */}
                        <div className="flex flex-col gap-3">
                            <label className="text-white text-sm font-medium pl-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                                Mensaje para el capitán
                            </label>
                            <div className="relative group">
                                <textarea
                                    className="w-full bg-background-dark/40 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all min-h-[140px] resize-none leading-relaxed text-[15px]"
                                    defaultValue={"Hola Juan Pérez,\n\n¡Queremos desafiar a tu equipo Los Tigres FC en Complejo Giovanni! ¿Tienen disponibilidad para este fin de semana?"}
                                />
                                {/* Edit hint */}
                                <div className="absolute bottom-3 right-3 text-xs text-slate-500 bg-background-dark/80 px-2 py-1 rounded-md pointer-events-none">
                                    Puedes editar este mensaje
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col gap-3">
                            <button className="w-full h-14 bg-primary hover:bg-[#0be00b] text-background-dark font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(13,242,13,0.3)] hover:shadow-[0_0_30px_rgba(13,242,13,0.4)]">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                                </svg>
                                CONFIRMAR Y ABRIR WHATSAPP
                            </button>
                            <button className="w-full py-3 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                                Cancelar y volver
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decorative background elements */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen z-0"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen z-0"></div>
        </div>
    );
}
