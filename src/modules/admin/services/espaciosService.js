/**
 * espaciosService.js — Gestión de espacios del complejo
 * Persistencia en localStorage
 */

const STORAGE_KEY = 'complejo_espacios';

const DEFAULT_ESPACIOS = [
    { 
        id: 'esp-1', 
        title: 'Fútbol 5 sintético', 
        desc: 'Cesped PRO-FIFA', 
        img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800',
        active: true,
        order: 1
    },
    { 
        id: 'esp-2', 
        title: 'Fútbol 7 profesional', 
        desc: 'Iluminación LED', 
        img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800',
        active: true,
        order: 2
    },
    { 
        id: 'esp-3', 
        title: 'Padel Glass Pro', 
        desc: 'Canchas vidriadas', 
        img: 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800',
        active: true,
        order: 3
    },
];

function getAll() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : DEFAULT_ESPACIOS;
    } catch { return DEFAULT_ESPACIOS; }
}

function saveAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage_espacios'));
}

export const fetchEspacios = (negocioId) => {
    const list = getAll();
    // En este mock filtramos por negocio si quisiéramos, por ahora devolvemos todos
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const saveEspacio = (espacio) => {
    const list = getAll();
    if (espacio.id) {
        const idx = list.findIndex(e => e.id === espacio.id);
        if (idx !== -1) list[idx] = { ...list[idx], ...espacio };
    } else {
        const nuevo = {
            ...espacio,
            id: `esp-${Date.now()}`,
            active: true,
            order: list.length + 1
        };
        list.push(nuevo);
    }
    saveAll(list);
    return true;
};

export const deleteEspacio = (id) => {
    const list = getAll();
    const filtered = list.filter(e => e.id !== id);
    saveAll(filtered);
    return true;
};

export const toggleEspacioStatus = (id) => {
    const list = getAll();
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
        list[idx].active = !list[idx].active;
        saveAll(list);
    }
    return true;
};

export const reorderEspacios = (id, direction) => {
    const list = getAll().sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
        const temp = list[idx].order;
        list[idx].order = list[idx - 1].order;
        list[idx - 1].order = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
        const temp = list[idx].order;
        list[idx].order = list[idx + 1].order;
        list[idx + 1].order = temp;
    }

    saveAll(list);
};
