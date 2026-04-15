import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintTicketButton({ order }) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const itemsToPrint = order.items || order.productos || order.products || [];
        const orderId = String(order.id).slice(-4);
        const orderType = order.tipo === 'Delivery' ? 'DELIVERY' : order.tipo === 'Para llevar' ? 'TAKEAWAY' : `MESA ${order.mesa || order.table || ''}`;
        
        const content = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Ticket #${orderId}</title>
                    <style>
                        @page { margin: 0; size: 58mm auto; }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            font-size: 12px; 
                            width: 58mm; 
                            margin: 0; 
                            padding: 2mm; 
                            color: #000;
                            line-height: 1.2;
                        }
                        h1 { font-size: 16px; text-align: center; margin: 0 0 5px 0; font-weight: bold; }
                        h2 { font-size: 14px; text-align: center; margin: 0 0 5px 0; font-weight: bold; }
                        .center { text-align: center; }
                        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                        .item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
                        .item-name { flex: 1; margin-left: 5px; word-break: break-all; }
                        .obs { font-size: 11px; margin-left: 15px; font-style: italic; }
                    </style>
                </head>
                <body>
                    <h1>GIOVANNI</h1>
                    <h2>TICKET COCINA</h2>
                    <div class="line"></div>
                    <p class="center" style="font-size: 14px; margin: 2px 0;"><b>${orderType}</b></p>
                    <p style="margin: 2px 0;">Comanda: <b>#${orderId}</b></p>
                    <p style="margin: 2px 0;">Mozo: ${order.mozoName || 'Sistema'}</p>
                    <p style="margin: 2px 0;">Hora: ${order.hora || new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</p>
                    <div class="line"></div>
                    ${itemsToPrint.map(i => {
                        const obs = i.observaciones || i.comment || i.notes || i.nota;
                        return `
                        <div>
                            <div class="item">
                                <b style="white-space: nowrap;">${i.quantity || i.cantidad || 1}x</b>
                                <span class="item-name">${i.nombre}</span>
                            </div>
                            ${obs ? `<div class="obs">=> ${obs}</div>` : ''}
                        </div>
                        `;
                    }).join('')}
                    <div class="line"></div>
                    <p class="center" style="margin-top: 10px; font-size: 10px;">---</p>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
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
