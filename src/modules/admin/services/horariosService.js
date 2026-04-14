/**
 * horariosService.js — Gestión de horarios del complejo
 * Persistencia en localStorage
 * 
 * Estructura de datos:
 * {
 *   horaApertura: '08:00',
 *   horaCierre: '03:00',  // del día siguiente
 *   diasOperativos: { lun: true, mar: true, mie: true, jue: true, vie: true, sab: true, dom: true },
 *   bloqueosEspacios: [
 *     {
 *       id: 'blk_xxx',
 *       espacioId: 'esp-1',
 *       fecha: '2026-03-20',
 *       tipo: 'evento_privado' | 'mantenimiento' | 'cerrado',
 *       modo: 'dia_completo' | 'franja',
 *       horaInicio: '20:00',   // solo si modo === 'franja'
 *       horaFin: '23:00',      // solo si modo === 'franja'
 *       motivo: 'Torneo interno',
 *       createdAt: ISO string
 *     }
 *   ]
 * }
 */

const STORAGE_KEY = 'complejo_horarios';

const DEFAULT_CONFIG = {
    horaApertura: '08:00',
    horaCierre: '03:00',
    diasOperativos: {
        lun: true, mar: true, mie: true, jue: true, vie: true, sab: true, dom: true
    },
    espaciosHorarios: {},  // { 'esp-1': { horaApertura: '08:00', horaCierre: '02:00' }, ... }
    bloqueosEspacios: []
};

function getConfig() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : { ...DEFAULT_CONFIG };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('storage_horarios'));
}

// ── Horarios generales ──

export const fetchHorariosConfig = () => {
    return getConfig();
};

export const updateHorariosConfig = (updates) => {
    const config = getConfig();
    const updated = { ...config, ...updates };
    saveConfig(updated);
    return updated;
};

/**
 * Obtiene horarios de un espacio específico.
 * Si no tiene configuración propia, usa la general del complejo.
 */
export const getEspacioHorarios = (espacioId) => {
    const config = getConfig();
    const especifico = config.espaciosHorarios?.[espacioId];
    return {
        horaApertura: especifico?.horaApertura || config.horaApertura || '08:00',
        horaCierre: especifico?.horaCierre || config.horaCierre || '03:00'
    };
};

export const updateEspacioHorarios = (espacioId, horarios) => {
    const config = getConfig();
    config.espaciosHorarios = {
        ...(config.espaciosHorarios || {}),
        [espacioId]: horarios
    };
    saveConfig(config);
    return config;
};

// ── Bloqueos de espacios ──

export const fetchBloqueos = (espacioId = null, fecha = null) => {
    const config = getConfig();
    let bloqueos = config.bloqueosEspacios || [];
    
    if (espacioId) {
        bloqueos = bloqueos.filter(b => b.espacioId === espacioId);
    }
    if (fecha) {
        bloqueos = bloqueos.filter(b => b.fecha === fecha);
    }
    
    return bloqueos;
};

export const addBloqueo = (bloqueo) => {
    const config = getConfig();
    const nuevo = {
        ...bloqueo,
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString()
    };
    config.bloqueosEspacios = [...(config.bloqueosEspacios || []), nuevo];
    saveConfig(config);
    return nuevo;
};

export const removeBloqueo = (bloqueoId) => {
    const config = getConfig();
    config.bloqueosEspacios = (config.bloqueosEspacios || []).filter(b => b.id !== bloqueoId);
    saveConfig(config);
    return true;
};

// ── Helpers para UI ──

export const getHorasDisponibles = () => {
    const horas = [];
    for (let i = 0; i < 24; i++) {
        horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
};

/**
 * Verifica si un slot de hora está bloqueado para un espacio en una fecha dada
 */
export const isHoraBloqueada = (espacioId, fecha, hora) => {
    const bloqueos = fetchBloqueos(espacioId, fecha);
    
    return bloqueos.some(b => {
        if (b.modo === 'dia_completo') return true;
        if (b.modo === 'franja') {
            const hNum = parseInt(hora.split(':')[0]);
            const startNum = parseInt(b.horaInicio.split(':')[0]);
            const endNum = parseInt(b.horaFin.split(':')[0]);
            
            // Handle overnight ranges
            if (startNum <= endNum) {
                return hNum >= startNum && hNum <= endNum;
            } else {
                return hNum >= startNum || hNum <= endNum;
            }
        }
        return false;
    });
};
