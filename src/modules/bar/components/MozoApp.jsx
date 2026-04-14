import React, { useState } from "react";
import { createOrder } from "../services/ordersService";

/**
 * MozoApp: Mobile UI for waitstaff to take orders from tables or courts.
 */
export default function MozoApp() {
    const [mesa, setMesa] = useState("");
    const [producto, setProducto] = useState("");
    const [sending, setSending] = useState(false);

    async function enviarPedido() {
        if (!mesa || !producto) return alert("Completa mesa/cancha y producto");
        
        try {
            setSending(true);
            await createOrder({
                mesa,
                items: [producto],
                estado: "pendiente"
            });
            alert("✅ Pedido enviado a cocina");
            setProducto("");
        } catch (error) {
            alert("Error al enviar pedido");
        } finally {
            setSending(false);
        }
    }

    return (
        <div style={{ 
            padding: '40px 20px', 
            fontFamily: 'sans-serif', 
            maxWidth: '500px', 
            margin: '0 auto',
            backgroundColor: '#fffaf0',
            minHeight: '100vh'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍔</div>
                <h1 style={{ color: '#7b341e', margin: 0 }}>App del Mozo</h1>
                <p style={{ color: '#9c4221' }}>Toma pedidos directamente desde la cancha.</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#7b341e', fontWeight: 'bold' }}>Mesa o Cancha</label>
                    <input
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', boxSizing: 'border-box' }}
                        placeholder="Ej: Cancha 1 o Mesa 5"
                        value={mesa}
                        onChange={(e) => setMesa(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#7b341e', fontWeight: 'bold' }}>Producto(s)</label>
                    <textarea
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', minHeight: '100px', boxSizing: 'border-box' }}
                        placeholder="Ej: 2 Hamburguesas, 1 Coca-Cola"
                        value={producto}
                        onChange={(e) => setProducto(e.target.value)}
                    />
                </div>

                <button 
                    onClick={enviarPedido}
                    disabled={sending}
                    style={{
                        width: '100%',
                        backgroundColor: '#dd6b20',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        opacity: sending ? 0.7 : 1
                    }}
                >
                    {sending ? "Enviando..." : "🚀 Enviar a Cocina"}
                </button>
            </div>
        </div>
    );
}
