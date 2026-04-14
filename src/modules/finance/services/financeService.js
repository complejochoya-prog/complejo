// financeService.js - Management of complex finances
export async function fetchFinanceSummary(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalIncome: 1250000,
                totalExpenses: 450000,
                netProfit: 800000,
                byArea: [
                    { area: 'Canchas', income: 750000, color: '#6366f1' },
                    { area: 'Bar', income: 380000, color: '#f59e0b' },
                    { area: 'Torneos', income: 120000, color: '#10b981' }
                ],
                monthlyHistory: [
                    { month: 'Ene', income: 980000, expense: 400000 },
                    { month: 'Feb', income: 1100000, expense: 420000 },
                    { month: 'Mar', income: 1250000, expense: 450000 }
                ]
            });
        }, 500);
    });
}

export async function fetchExpenses(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'e1', title: 'Luz Marzo', amount: 85000, category: 'Servicios', date: '2026-03-05', status: 'pagado' },
                { id: 'e2', title: 'Proveedor Bebidas', amount: 120000, category: 'Bar', date: '2026-03-08', status: 'pendiente' },
                { id: 'e3', title: 'Mantenimiento Césped', amount: 45000, category: 'Mantenimiento', date: '2026-03-10', status: 'pagado' },
                { id: 'e4', title: 'Sueldos Recepción', amount: 200000, category: 'Sueldos', date: '2026-03-12', status: 'pagado' }
            ]);
        }, 500);
    });
}

export async function fetchInvoices(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'F-001', client: 'Juan Perez', amount: 8500, date: '2026-03-12', type: 'Reserva' },
                { id: 'F-002', client: 'Empresa Tech', amount: 45000, date: '2026-03-11', type: 'Evento' },
                { id: 'F-003', client: 'Torneo Verano', amount: 150000, date: '2026-03-10', type: 'Inscripción' }
            ]);
        }, 500);
    });
}

export async function recordExpense(negocioId, expenseData) {
    console.log(`[Finance] Recording expense for ${negocioId}:`, expenseData);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, id: Math.random().toString(36).substr(2, 9) }), 300));
}

export async function generateInvoice(negocioId, invoiceData) {
    console.log(`[Finance] Generating invoice in ${negocioId}:`, invoiceData);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, url: '#' }), 400));
}
