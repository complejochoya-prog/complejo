import React from "react";
import { Link } from "react-router-dom";

export default function Gallery() {
    return (
        <div className="layout-container flex flex-col h-full grow w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-primary/20 px-8 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="size-8 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">sports_tennis</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Complejo Giovanni</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to="/dashboard">Dashboard</Link>
                        <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Reservas</a>
                        <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Socios</a>
                        <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" to="/gallery">Galería</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to="/settings">Configuración</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input className="bg-slate-100 dark:bg-primary/10 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 placeholder:text-slate-500" placeholder="Buscar en administración..." type="text" />
                    </div>
                    <div className="bg-primary/20 rounded-full p-1 border border-primary/30">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" data-alt="User administrator profile avatar" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1afBHgJm4ePILf4p12xCygKKDIvRMXAwSoALgxE5L3cukW2OAW-LE_CFGNDRs3PaaV2VZpe8cR1wlhNV0IApC2vcLXI1dKJ4LjO1gXxsJgBnvytgjMRsYNBhvRVU0hdmHgq8HnjeOzuSF6Jc20lHE-zFXijxx1DEXpgRIswYDcikdfhmYjtnb3v3lB3ysas6PyqEWbhax7gLrEI7cnPb92zkFbt1o6QeprjrRQP7SQ_to45VPBCfe3IvknnEoK8SJffEUus-wKpw")' }}></div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-6 py-10">
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-slate-900 dark:text-slate-100 text-5xl font-black leading-tight tracking-tighter uppercase">ADMIN GALERÍA</h1>
                        <p className="text-slate-500 dark:text-primary/70 text-lg font-medium">Gestiona el catálogo visual del complejo deportivo</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 bg-slate-200 dark:bg-primary/10 hover:bg-slate-300 dark:hover:bg-primary/20 text-slate-900 dark:text-slate-100 px-6 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-wide">
                            <span className="material-symbols-outlined">folder</span> Categorías
                        </button>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark px-6 py-3 rounded-xl font-black text-sm transition-all uppercase tracking-wide shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">cloud_upload</span> Publicar Todo
                        </button>
                    </div>
                </div>

                {/* Drag and Drop Glassmorphism Zone */}
                <div className="mb-12">
                    <div className="relative group rounded-xl border-2 border-dashed border-primary/30 dark:border-primary/20 bg-white/50 dark:bg-primary/5 backdrop-blur-md px-10 py-16 flex flex-col items-center justify-center transition-all hover:border-primary">
                        <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                            <span className="material-symbols-outlined text-5xl">upload_file</span>
                        </div>
                        <div className="text-center max-w-md space-y-4">
                            <h3 className="text-2xl font-bold dark:text-slate-100">SUBIR FOTOS</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                                Arrastra y suelta tus imágenes de alta resolución aquí. <br />Formatos recomendados: <span className="text-primary">WEBP, PNG, JPG</span> (Máx 10MB por archivo).
                            </p>
                        </div>
                        <button className="mt-8 px-10 py-4 bg-primary text-background-dark font-black rounded-full shadow-xl hover:scale-105 transition-transform uppercase tracking-tighter">
                            Seleccionar Archivos
                        </button>
                    </div>
                </div>

                {/* External Link Field */}
                <div className="mb-16 bg-slate-100 dark:bg-primary/5 rounded-xl p-8 border border-slate-200 dark:border-primary/10">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">link</span> Carga por Enlace Externo
                    </h4>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input className="w-full bg-white dark:bg-background-dark border border-slate-300 dark:border-primary/20 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-slate-500" placeholder="https://cloudinary.com/v1_1/giovanni/image/upload/..." type="url" />
                        </div>
                        <button className="bg-primary/20 text-primary hover:bg-primary/30 px-8 py-4 rounded-xl font-bold text-sm transition-all uppercase tracking-wide">
                            Vincular URL
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Soporta Firebase Storage, Cloudinary, AWS S3 y otros servicios de CDN.</p>
                </div>

                {/* Gallery Section with Admin Controls */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-primary/10 pb-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Galería Actual</h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">Todas (24)</span>
                            <span className="px-3 py-1 text-slate-500 rounded-full text-xs font-bold uppercase">Canchas</span>
                            <span className="px-3 py-1 text-slate-500 rounded-full text-xs font-bold uppercase">Piscina</span>
                            <span className="px-3 py-1 text-slate-500 rounded-full text-xs font-bold uppercase">Eventos</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Gallery Item 1 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Modern tennis court with bright lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv875G2wq4kDpiNc_AgP-avkKPnE4k6Mj0gXuXohEEcSdWD8NKeLSBlWm27wNUwztzbl4AXt8PLmfjJL7ChgFKNktlzz6WrTIpQxKacXasK2NDShNM3TibYK-umrxpujoO8tfFmFGXnSAOKD7A4sZl7q5yfVnleOzVkhxgL-aX2iLBv7XQJqrdY_Wns05VuOJiu3VJH5bHVcO8r1yKQEprBO5NSKwzAbliRurJ_eD4D8Ut2_M1adj0t-kYwNZYfRQ8XUxANH4HTW8" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Canchas</span>
                            </div>
                        </div>

                        {/* Gallery Item 2 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Luxury gym interior with modern equipment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOZ7KouHdDqqNYo_zjqDRjbSmGI3iDBrNW2VSy1XTXjPVg-mO3f0mb1nysrI9-6SAk1xVBTo1rIg1BWn2cNcVVNPyIuJO6jGr5xKbkZnQKi3w49Hyvb3lC9Aj7zOR9D4n-7glMvUUH-IhdJoIPgww5ReXVMzqAKnU1aBYLgAMX26bhNpki7l2FdYWbrRT6XdEhwdJuWWcv3klhu51fmNLSjBjD2fxK0ML6wPijtR-iiwZvF81HOHtJGQ38aw7g5aA77xpvZ7nQ0tg" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Gimnasio</span>
                            </div>
                        </div>

                        {/* Gallery Item 3 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Outdoor swimming pool at sunset" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDcLjxFf8rGLYKhcpyn3PP85ou6yCRca4_biW4NsJiCsu8Cf0OGJ1S9apI8qTRI8grs2PIqeWFQvSUZsSt2IFT71pB4bp-Ugsz2i80poCiMPa1vkJ9TnviF2YLCCxlTX26b1iP0jhVQA2uZUuRJQeqFgR_vRtJOiDtxeHwt-Gu6Mx_Ds54OSePmFikE-zSBUfHXUZ9qUWPbYiuEoqUBOmsfoACj_gypVrWKJg6FdnUxtxNRL0s5zoFub2r8UoRHI5uYgJMIe46AxI" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Piscina</span>
                            </div>
                        </div>

                        {/* Gallery Item 4 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Football match action on grass field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHkrZF1WeZ1B2Tws13I6X3dgem1Hm8i4ya6h37y8vD4UUntRPhyndtWYN0OaqYa-eezazvE3tdAHJu6PcShTYVvhcuhR4pHj-pJLJcs8H2sDvF6MJgjYKgTnwW8PU0R5accZH_spWDYKHTcpk_f96pGYS93rJYd5UminQfcflIwChU8PYwIZ3PYOjVg3du0F7ZNva6YY6vRnJF7OwnXg5O1zH4F8aQWL7A7scQkmhPEBngyJR9ArjxM0ECt-31la2XFAVgQKT2QdU" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Fútbol</span>
                            </div>
                        </div>

                        {/* Gallery Item 5 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Elegant lounge area for members" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9cIyTl6nmF6E0pdqke-LElj1SQ83TqFDeBGKJVqEs2geDp-RxpTM44PpCPsCr7wgeHjuxFmUK_3MVPZExrH-uXQARqC3mLVftWMU4btMOU0ewTGyKHdEW1GmL5NLo5NFHbG7wFrcmH56Tt9S_NhW1vKv9-s4aqMn771Ix1yzP3yn6ygqhTrrUpQh8UVE8nTB2tDyH3S29rrG63DLfE60Ygo78yYp01dy-hlDmCbApsihnm2RFNIlFCxiE1NpWxHNNyV8dY0azgk4" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Lounge</span>
                            </div>
                        </div>

                        {/* Gallery Item 6 */}
                        <div className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-primary/5">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Buffet section at sports club restaurant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq3x0Ly49Fd0IM6ueBlRHZYQ4ARBqPgcgahBfec0Y60ZbAM48NBKtLD902e5ljM3RcXJU6Kztiq5NkbYjEipUbmkYXvwVk-JfoDGvVre0onJzR8Pyvia77N6UeiE_M1bOvAIm3MZ_7U9imhatXeMtH5zs3b2HgdQqPFCg0KpvfWEiAC15Pjdwt4fvnSRAUf4W9JW-0x5OnNNZjWeve5lJZ2qPNG02se3Mom0req-hkpFK4OVDiw7dg4_N6BHEfeTRUUrAH5Lh6ZtI" />
                            <div className="absolute inset-0 bg-background-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-white text-background-dark px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span> Editar Categoría
                                </button>
                                <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Restaurante</span>
                            </div>
                        </div>

                        {/* Placeholder for New Uploads */}
                        <div className="aspect-square rounded-xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                            <span className="text-xs font-bold uppercase">Agregar Foto</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-primary/10 py-10 px-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                <p>© 2024 Complejo Giovanni - Panel de Administración</p>
            </footer>
        </div>
    );
}
