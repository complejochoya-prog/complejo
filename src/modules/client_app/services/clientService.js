// Fallback por si localStorage está vacío (mismos defaults que espaciosService)
const DEFAULT_ESPACIOS = [
    { id: 'esp-1', title: 'Fútbol 5 sintético', desc: 'Cesped PRO-FIFA', img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800', active: true, order: 1 },
    { id: 'esp-2', title: 'Fútbol 7 profesional', desc: 'Iluminación LED', img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800', active: true, order: 2 },
    { id: 'esp-3', title: 'Padel Glass Pro', desc: 'Canchas vidriadas', img: 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800', active: true, order: 3 },
];

export async function fetchCanchasDisponibles(negocioId, fecha) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Obtener espacios — si no hay nada en localStorage, usar defaults
            const data = localStorage.getItem('complejo_espacios');
            let espacios;
            try {
                espacios = data ? JSON.parse(data) : DEFAULT_ESPACIOS;
            } catch {
                espacios = DEFAULT_ESPACIOS;
            }
            
            // Si el array está vacío (alguien borró todo), usar defaults
            if (!espacios || espacios.length === 0) {
                espacios = DEFAULT_ESPACIOS;
            }
            
            // Mapear el formato de espacios al formato esperado por la UI de la App (FieldCard)
            const result = espacios
                .filter(e => e.active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(e => ({
                    id: e.id,
                    nombre: e.title,
                    tipo: e.desc,
                    img: e.img,
                    precio_diurno: 8000,
                    precio_nocturno: 12000,
                    disponible: true,
                    capacidad: e.capacidad ? parseInt(e.capacidad, 10) : null
                }));

            resolve(result);
        }, 500);
    });
}

export async function fetchHorariosDisponibles(canchaId, fecha) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Leer config de horarios del admin
            let horariosConfig;
            try {
                const hcData = localStorage.getItem('complejo_horarios');
                horariosConfig = hcData ? JSON.parse(hcData) : null;
            } catch { horariosConfig = null; }

            // 1.5 Obtener capacidad del espacio
            let espacioCapacidad = null;
            try {
                const espData = localStorage.getItem('complejo_espacios');
                if (espData) {
                    const espacios = JSON.parse(espData);
                    const espacio = espacios.find(e => e.id === canchaId);
                    if (espacio?.capacidad) espacioCapacidad = parseInt(espacio.capacidad, 10);
                }
            } catch (e) {}

            // 2. Obtener horarios del espacio específico (o general)
            const espacioH = horariosConfig?.espaciosHorarios?.[canchaId];
            const horaApertura = espacioH?.horaApertura || horariosConfig?.horaApertura || '08:00';
            const horaCierre = espacioH?.horaCierre || horariosConfig?.horaCierre || '03:00';
            const diasOperativos = horariosConfig?.diasOperativos || { lun:true, mar:true, mie:true, jue:true, vie:true, sab:true, dom:true };

            // 3. Verificar si el día de la semana está operativo
            const fechaDate = new Date(fecha + 'T12:00:00');
            const dayMap = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
            const diaKey = dayMap[fechaDate.getDay()];
            const diaOperativo = diasOperativos[diaKey] !== false;

            // 4. Generar horas dentro del rango apertura-cierre como timeline lineal
            const aperturaNum = parseInt(horaApertura.split(':')[0]);
            const cierreNum = parseInt(horaCierre.split(':')[0]);

            const todasHoras = [];
            if (aperturaNum <= cierreNum) {
                for (let i = aperturaNum; i <= cierreNum; i++) {
                    todasHoras.push(`${i.toString().padStart(2, '0')}:00`);
                }
            } else {
                // Rango con madrugada (ej: 08:00 → 23:00 → 00:00 → 03:00)
                for (let i = aperturaNum; i <= 23; i++) {
                    todasHoras.push(`${i.toString().padStart(2, '0')}:00`);
                }
                for (let i = 0; i <= cierreNum; i++) {
                    todasHoras.push(`${i.toString().padStart(2, '0')}:00`);
                }
            }

            // Clasificar diurnos/nocturnos
            const nocturnasSet = new Set(['20:00','21:00','22:00','23:00','00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00']);

            // 5. Obtener reservas existentes
            const data = localStorage.getItem('complejo_reservas');
            const reservas = data ? JSON.parse(data) : [];
            const reservasOcupadas = reservas.filter(res => 
                res.canchaId === canchaId && 
                res.fecha === fecha && 
                res.status !== 'cancelada'
            );
            
            const horasOcupacion = {};
            reservasOcupadas.forEach(res => {
                // If capacity is trackable, we use cantidadPersonas, else 1
                const qty = espacioCapacidad && res.cliente?.cantidadPersonas ? parseInt(res.cliente.cantidadPersonas, 10) : 1;
                res.hora.split(' - ').forEach(h => {
                    horasOcupacion[h] = (horasOcupacion[h] || 0) + qty;
                });
            });

            // 6. Obtener bloqueos del admin para este espacio y fecha
            const bloqueos = (horariosConfig?.bloqueosEspacios || []).filter(b =>
                b.espacioId === canchaId && b.fecha === fecha
            );

            const isHoraBloqueada = (hora) => {
                return bloqueos.some(b => {
                    if (b.modo === 'dia_completo') return true;
                    if (b.modo === 'franja') {
                        const hNum = parseInt(hora.split(':')[0]);
                        const startNum = parseInt(b.horaInicio.split(':')[0]);
                        const endNum = parseInt(b.horaFin.split(':')[0]);
                        if (startNum <= endNum) {
                            return hNum >= startNum && hNum <= endNum;
                        } else {
                            return hNum >= startNum || hNum <= endNum;
                        }
                    }
                    return false;
                });
            };

            // 7. Detectar si la fecha es HOY para bloquear horas pasadas
            //    Lógica de TIMELINE LINEAL:
            //    El horario es una secuencia continua: ej 08,09,...,23,00,01,02,03
            //    Si son las 01:00, todo desde 08:00 hasta 00:00 ya pasó en la timeline
            const ahora = new Date();
            const hoyString = ahora.toISOString().split('T')[0];
            const esHoy = fecha === hoyString;
            const horaActual = ahora.getHours();
            const minutoActual = ahora.getMinutes();

            // Convertir hora a "posición en la timeline" para comparar linealmente
            // Si apertura=08 y cierre=03 (overnight), las horas 00-03 se tratan como 24-27
            const esOvernight = aperturaNum > cierreNum;

            const toTimelinePos = (hNum) => {
                if (esOvernight && hNum <= cierreNum) {
                    return hNum + 24; // 00→24, 01→25, 02→26, 03→27
                }
                return hNum;
            };

            const posActual = toTimelinePos(horaActual);

            // 8. Construir resultado
            const all = todasHoras.map(h => {
                const hNum = parseInt(h.split(':')[0]);
                const esNocturno = nocturnasSet.has(h);
                
                let horaPasada = false;
                if (esHoy) {
                    const posSlot = toTimelinePos(hNum);
                    // Si la posición del slot es menor que la posición actual, ya pasó
                    // Si es igual, verificar minutos
                    if (posSlot < posActual || (posSlot === posActual && minutoActual > 0)) {
                        horaPasada = true;
                    }
                }

                let isDisponible = false;
                let cuposRestantes = null;
                const ocupados = horasOcupacion[h] || 0;
                
                if (espacioCapacidad) {
                    cuposRestantes = Math.max(0, espacioCapacidad - ocupados);
                    isDisponible = diaOperativo && cuposRestantes > 0 && !horaPasada && !isHoraBloqueada(h);
                } else {
                    isDisponible = diaOperativo && ocupados === 0 && !horaPasada && !isHoraBloqueada(h);
                }

                return {
                    hora: h,
                    disponible: isDisponible,
                    cuposDisponibles: cuposRestantes,
                    esNocturno
                };
            });

            resolve(all);
        }, 300);
    });
}

export async function submitReserva(negocioId, reservaData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const currentReservas = JSON.parse(localStorage.getItem('complejo_reservas') || '[]');
            const newReserva = {
                id: `res_${Math.random().toString(36).substr(2, 9)}`,
                ...reservaData,
                createdAt: new Date().toISOString(),
                status: 'confirmada'
            };
            
            currentReservas.push(newReserva);
            localStorage.setItem('complejo_reservas', JSON.stringify(currentReservas));
            
            // Dispatch event for real-time updates in admin
            window.dispatchEvent(new Event('storage_reservas'));
            
            resolve({ success: true, reserva: newReserva });
        }, 800);
    });
}

export async function fetchHistorialReservas(negocioId, clienteId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = localStorage.getItem('complejo_reservas');
            const reservas = data ? JSON.parse(data) : [];
            
            // Si tenemos clienteId (que suele ser el teléfono en este mock)
            // filtramos por eso. O si no, devolvemos todo por ahora.
            const result = clienteId 
                ? reservas.filter(r => r.cliente?.telefono === clienteId)
                : reservas;
                
            resolve(result.reverse());
        }, 600);
    });
}

export async function fetchBarMenu(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const data = localStorage.getItem(`${negocioId}_inventario_v3`);
                if (data) {
                    const inventario = JSON.parse(data);
                    const barItems = inventario.filter(i => i.sector === 'BAR');
                    if (barItems.length > 0) {
                        return resolve(barItems.map(item => ({
                            id: item.id,
                            nombre: item.nombre,
                            descripcion: item.descripcion || `${item.categoria}`,
                            precio: item.precio,
                            categoria: item.categoria,
                            img: item.img || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=400'
                        })));
                    }
                }
            } catch(e) {}
            
            resolve([
                { id: 'p1', nombre: 'Hamburguesa Complejo', descripcion: 'Doble carne, cheddar, bacon y fritas.', precio: 5000, categoria: 'Comidas', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
                { id: 'p2', nombre: 'Pizza Mozzarella', descripcion: '8 porciones', precio: 4500, categoria: 'Comidas', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
                { id: 'b1', nombre: 'Cerveza IPA Pinta', descripcion: 'Artesanal', precio: 2500, categoria: 'Bebidas', img: 'https://images.unsplash.com/photo-1555658636-6e4a36210b95?auto=format&fit=crop&q=80&w=400' },
                { id: 'b2', nombre: 'Gatorade 500ml', descripcion: 'Varios sabores', precio: 1500, categoria: 'Bebidas', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
            ]);
        }, 500);
    });
}
