import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintTicketButton({ order }) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Pedido #${order.id}</title>
                    <style>
                        body { font-family: monospace; font-size: 12px; }
                        h1 { font-size: 14px; text-align: center; }
                        .center { text-align: center; }
                        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                        .item { display: flex; justify-content: space-between; }
                    </style>
                </head>
                <body>
                    <h1 class="center">COMPLEJO GIOVANNI</h1>
                    <p class="center">Comanda de Cocina</p>
                    <div class="line"></div>
                    <p>Pedido: <b>#${order.id}</b></p>
                    <p>Mesa: <b>${order.mesa}</b></p>
                    <p>Hora: ${order.hora}</p>
                    <div class="line"></div>
                    ${(order.productos || []).map(i => `
                        <div class="item">
                            <span>${i.quantity}x ${i.nombre}</span>
                        </div>
                        ${i.observaciones ? `<p><i>* ${i.observaciones}</i></p>` : ''}
                    `).join('')}
                    <div class="line"></div>
                    <p class="center">GRACIAS POR SU COMPRA</p>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <button 
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"
        >
            <Printer size={18} />
        </button>
    );
}
