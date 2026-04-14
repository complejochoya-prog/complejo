import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    Rocket,
    Calendar,
    Layers,
    UtensilsCrossed,
    ArrowRight
} from 'lucide-react';

const timelineData = [
    {
        id: 1,
        status: 'completed',
        version: 'v1.0 - Lanzamiento Inicial',
        date: 'Febrero 2026',
        title: 'Fundación del Sistema',
        description: 'Implementación del core funcional para la gestión del complejo deportivo y gastronómico.',
        icon: <Layers className="w-6 h-6" />,
        items: [
            'Sistema de reservas de canchas y espacios',
            'Panel de administración con control de precios y horarios',
            'Gestión de caja básica',
            'Página principal para clientes'
        ],
        color: 'emerald'
    },
    {
        id: 2,
        status: 'completed',
        version: 'v1.5 - Gastronomía & Personal',
        date: 'Finales Febrero 2026',
        title: 'KDS y Gestión de Personal',
        description: 'Digitalización del área de gastronomía y control de turnos del personal.',
        icon: <UtensilsCrossed className="w-6 h-6" />,
        items: [
            'Kitchen Display System (KDS) en tiempo real',
            'Sistema para mozos (Toma de pedidos móvil)',
            'Gestión de empleados y control de asistencia',
            'Actualizaciones dinámicas de menú'
        ],
        color: 'emerald'
    },
    {
        id: 3,
        status: 'in-progress',
        version: 'v2.0 - Optimización y Expansión',
        date: 'Marzo 2026 (Actual)',
        title: 'Módulo de Entregas y Ajustes Avanzados',
        description: 'Incorporación de nuevas vías de venta y estandarización del negocio.',
        icon: <Clock className="w-6 h-6" />,
        items: [
            'Aplicación de Delivery para motoristas',
            'Gestión de inventarios y proveedores',
            'Bloqueos avanzados de horarios de reservas',
            'Reportes y métricas mejoradas'
        ],
        color: 'blue'
    },
    {
        id: 4,
        status: 'planned',
        version: 'v2.5 - Experiencia del Cliente',
        date: 'Próximamente',
        title: 'Fidelización y Pagos',
        description: 'Mejoras orientadas directamente a la experiencia del usuario final.',
        icon: <Rocket className="w-6 h-6" />,
        items: [
            'Integración con pasarelas de pago online (MercadoPago)',
            'Sistema de membresías y puntos',
            'Notificaciones automáticas por WhatsApp / Email',
            'Portal de torneos y clasificaciones en vivo'
        ],
        color: 'violet'
    }
];

export default function Progress() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredTimeline = timelineData.filter(item => {
        if (activeFilter === 'all') return true;
        return item.status === activeFilter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completado</span>;
            case 'in-progress':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> En Desarrollo</span>;
            case 'planned':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-700 border border-violet-200 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Planificado</span>;
            default:
                return null;
        }
    };

    const getColorClasses = (color, status) => {
        switch (color) {
            case 'emerald':
                return {
                    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    line: status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200',
                    hover: 'hover:border-emerald-300'
                };
            case 'blue':
                return {
                    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
                    line: 'bg-gray-200',
                    hover: 'hover:border-blue-300'
                };
            case 'violet':
                return {
                    iconBg: 'bg-violet-50 text-violet-600 border-violet-200',
                    line: 'bg-transparent',
                    hover: 'hover:border-violet-300'
                };
            default:
                return { iconBg: 'bg-gray-50 text-gray-600 border-gray-200', line: 'bg-gray-200', hover: 'hover:border-gray-300' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 mb-6 transition-transform duration-500 hover:scale-105">
                        <Rocket className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-800">Hoja de Ruta del Proyecto</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 animate-fade-in-up transition-all delay-100">
                        Evolución del Sistema <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            Complejo Giovanni
                        </span>
                    </h1>

                    <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up transition-all delay-200">
                        Sigue de cerca nuestro progreso y descubre las nuevas funcionalidades que estamos desarrollando para ofrecerte la mejor experiencia.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center flex-wrap gap-2 mb-12 animate-fade-in-up transition-all delay-300">
                    {['all', 'completed', 'in-progress', 'planned'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {filter === 'all' ? 'Ver Todo' :
                                filter === 'completed' ? 'Completado' :
                                    filter === 'in-progress' ? 'En Desarrollo' : 'Planificado'}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 md:-ml-px top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-12">
                        {filteredTimeline.map((item, index) => {
                            const colors = getColorClasses(item.color, item.status);
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={item.id}
                                    className="relative flex items-center md:justify-between flex-col md:flex-row w-full animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-8 md:left-1/2 -ml-4 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 bg-white">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-emerald-500' :
                                                item.status === 'in-progress' ? 'bg-blue-500' : 'bg-violet-400'
                                            }`} />
                                    </div>

                                    {/* Left Content (or empty space) */}
                                    <div className={`w-full md:w-[calc(50%-2rem)] pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:text-left md:order-2'}`}>
                                        {isEven && (
                                            <div className="hidden md:block">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                                <p className="text-sm font-medium text-gray-500 mb-3">{item.date}</p>
                                                <div className="flex justify-end mb-4">
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>
                                        )}
                                        {!isEven && (
                                            <Card Content={item} colors={colors} />
                                        )}
                                    </div>

                                    {/* Right Content (or empty space) */}
                                    <div className={`w-full md:w-[calc(50%-2rem)] pl-16 md:pl-0 mt-4 md:mt-0 ${!isEven ? 'md:pr-12 md:text-right flex justify-end' : 'md:pl-12 md:text-left'}`}>
                                        {isEven && (
                                            <Card Content={item} colors={colors} />
                                        )}
                                        {!isEven && (
                                            <div className="hidden md:block">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                                <p className="text-sm font-medium text-gray-500 mb-3">{item.date}</p>
                                                <div className="flex justify-start mb-4">
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile header (visible only on mobile) */}
                                    <div className="w-full pl-16 mt-[-1rem] mb-4 md:hidden block">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-medium text-gray-500">{item.date}</p>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center animate-fade-in-up transition-all delay-500">
                    <p className="text-gray-600 mb-4">
                        ¿Tienes alguna sugerencia para mejorar la plataforma?
                    </p>
                    <a href="https://wa.me/5493855374835" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                        Enviar Comentarios
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for the card
function Card({ Content, colors }) {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${colors.hover} hover:shadow-md relative overflow-hidden group`}>
            {/* Decorative gradient blob */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${Content.color === 'emerald' ? 'bg-emerald-500' :
                    Content.color === 'blue' ? 'bg-blue-500' : 'bg-violet-500'
                }`} />

            <div className="relative z-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl border ${colors.iconBg}`}>
                        {Content.icon}
                    </div>
                    <div>
                        <span className="text-sm font-bold text-gray-400 block">{Content.version}</span>
                    </div>
                </div>

                <p className="text-gray-600 mb-5 leading-relaxed">
                    {Content.description}
                </p>

                <ul className="space-y-2.5 text-sm">
                    {Content.items.map((listItem, i) => (
                        <li key={i} className="flex gap-2.5">
                            <CheckCircle2 className={`w-5 h-5 shrink-0 ${Content.status === 'completed' ? 'text-emerald-500' :
                                    Content.status === 'in-progress' ? 'text-blue-400' : 'text-gray-300'
                                }`} />
                            <span className={Content.status === 'planned' ? 'text-gray-500' : 'text-gray-700'}>
                                {listItem}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
