/**
 * promosService.js — Gestión de Promos y Eventos
 * Persistencia en localStorage
 */

const STORAGE_KEY = 'complejo_promos';

const DEFAULT_PROMOS = [
    { 
        id: 'prm-birthday-1', 
        title: 'Festejo de Cumple (Pack Premium)', 
        desc: 'Para 10 personas\n• 5 pizzas de cualquier variedad\n• 10 tragos (mojito, daikiri o gin tonic)\n• 4 cervezas Heineken o Stella o 6 cocas de 1,5 lt\n• Incluye: 1 botella de champagne para brindar', 
        price: '140000',
        active: true,
        type: 'evento',
        img: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop'
    },
    { 
        id: 'prm-birthday-2', 
        title: 'Festejo de Cumple (Pack Clásico)', 
        desc: 'Para 10 personas\n• 3 pizzas de cualquier variedad\n• 4 porciones de papas\n• 1 docena de empanadas\n• 4 cervezas Heineken o 6 cocas 1,5 lt\n• Incluye: 1 botella de champagne para brindar', 
        price: '130000',
        active: true,
        type: 'evento',
        img: 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=800&auto=format&fit=crop'
    }
];

function getAll() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : DEFAULT_PROMOS;
    } catch { return DEFAULT_PROMOS; }
}

function saveAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage_promos'));
}

export const fetchPromos = () => {
    return getAll();
};

export const savePromo = (promo) => {
    const list = getAll();
    if (promo.id) {
        const idx = list.findIndex(p => p.id === promo.id);
        if (idx !== -1) list[idx] = { ...list[idx], ...promo };
    } else {
        const nuevo = {
            ...promo,
            id: `prm-${Date.now()}`,
            active: true
        };
        list.push(nuevo);
    }
    saveAll(list);
    return true;
};

export const deletePromo = (id) => {
    const list = getAll();
    const filtered = list.filter(p => p.id !== id);
    saveAll(filtered);
    return true;
};

export const togglePromoStatus = (id) => {
    const list = getAll();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
        list[idx].active = !list[idx].active;
        saveAll(list);
    }
    return true;
};
