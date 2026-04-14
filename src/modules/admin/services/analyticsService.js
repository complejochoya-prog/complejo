import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/config';

/**
 * AnalyticsService - FASE 9
 * Procesa datos del complejo y genera sugerencias.
 */

export async function fetchAnalytics(negocioId, timeRange = 30) {
    try {
        // Here we would ideally fetch the pre-aggregated daily stats from `analytics/${negocioId}/...`
        // For demonstration, we simulate the intelligent engine response requested in FASE 9.
        
        // Simulating the processor response
        return {
            fecha: new Date().toISOString().split('T')[0],
            resumen: {
                reservas_totales: 42,
                ventas_bar: 320000,
                horas_pico: ["19:00", "20:00", "21:00"],
                producto_top: "Pizza Doble Muzzarella",
                cancha_mas_usada: "Cancha 2"
            },
            graficos: {
                dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                ocupacion: [30, 40, 55, 70, 95, 100, 85],
                ventas_bar_semana: [15000, 22000, 31000, 45000, 68000, 85000, 54000],
                ranking_productos: [
                    { nombre: 'Pizza Doble Muzzarella', qty: 145 },
                    { nombre: 'Hamburguesa Completa', qty: 112 },
                    { edit: 'Cerveza IPA Pinta', qty: 250 }, // For ranking visual
                ],
                meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                ingresos_mensuales: [2.1, 2.4, 3.1, 2.8, 3.5, 4.2] // En millones
            },
            recomendaciones: [
                { id: 1, tipo: 'info', icon: 'clock', texto: 'Las 20:00 es la hora con más reservas.' },
                { id: 2, tipo: 'info', icon: 'shopping', texto: 'Las pizzas representan el 38% de las ventas del bar.' },
                { id: 3, tipo: 'info', icon: 'target', texto: 'La cancha 2 es la más utilizada de la semana.' },
                { id: 4, tipo: 'sugerencia', icon: 'zap', texto: 'Sugerimos crear promoción para las 16:00 (horario vacío).' },
                { id: 5, tipo: 'sugerencia', icon: 'star', texto: 'Sugerimos crear combo promocional (Pizza + Cerveza).' }
            ],
            alertas: [
                { id: 1, tipo: 'baja_ocupacion', texto: 'Atención: Baja ocupación detectada los días Lunes por la mañana.' }
            ]
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
}
