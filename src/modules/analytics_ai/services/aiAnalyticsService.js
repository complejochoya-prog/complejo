/**
 * aiAnalyticsService.js
 * Servicio encargado de analizar datos del negocio y generar inteligencia automática.
 */

// Simulated analytics data for intelligence
export async function fetchAIAggregations(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                reservas_historico: {
                    tendencia: 'creciente',
                    tasaCrecimiento: 15,
                    proyeccionProxSemana: 120
                },
                horarios: {
                    pico: ['19:00', '20:00', '21:00'],
                    vacios: ['14:00', '15:00', '16:00']
                },
                bar: {
                    ingresos_proyectados: 850000,
                    productos: {
                        top: ['Cerveza IPA Pinta', 'Hamburguesa Complejo', 'Pizza Muzzarella Doble'],
                        baja_rotacion: ['Ensalada César', 'Jugo Natural', 'Tostado de Jamón']
                    }
                },
                alertas: [
                    { id: 'a1', tipo: 'baja_ocupacion', severidad: 'alta', mensaje: 'Ocupación crítica los días Jueves de 15:00 a 17:00.' },
                    { id: 'a2', tipo: 'stock', severidad: 'media', mensaje: 'Posible quiebre de stock de Cerveza IPA para el Sábado.' }
                ],
                promociones_sugeridas: [
                    { id: 'p1', contexto: 'Horario Vacío', sugerencia: 'Crear Promo 2x1 en Alquiler de Canchas Jueves 15:00 a 17:00', impacto_esperado: '+25% Ocupación' },
                    { id: 'p2', contexto: 'Producto Estancado', sugerencia: 'Armar Combo: Tostado de Jamón + Jugo a Precio Especial', impacto_esperado: '+40% Rotación' }
                ],
                prediccionSemanal: [
                    { dia: 'Lun', real: 45, prediccion: 40 },
                    { dia: 'Mar', real: 50, prediccion: 55 },
                    { dia: 'Mie', real: 60, prediccion: 65 },
                    { dia: 'Jue', real: 40, prediccion: 45 },
                    { dia: 'Vie', real: null, prediccion: 90 },
                    { dia: 'Sab', real: null, prediccion: 110 },
                    { dia: 'Dom', real: null, prediccion: 85 },
                ]
            });
        }, 800);
    });
}
