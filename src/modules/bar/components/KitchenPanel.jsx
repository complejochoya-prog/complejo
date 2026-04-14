import React, { useEffect, useState } from "react";
import socket from "../../../core/socket/socketClient";
import { getOrders, updateOrder } from "../services/ordersService";

/**
 * KitchenPanel: Dashboard for staff to view and manage pending orders.
 */
export default function KitchenPanel() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();

        // Real-time listener
        socket.on("nuevo_pedido", (pedido) => {
            console.log("Real-time order received:", pedido);
            setOrders(prev => [pedido, ...prev]);
        });

        const interval = setInterval(loadOrders, 10000); // 10s Poll as fallback
        return () => {
            clearInterval(interval);
            socket.off("nuevo_pedido");
        };
    }, []);

    async function loadOrders() {
        try {
            const data = await getOrders();
            // Show only pending or preparing orders
            setOrders(data.filter(o => o.estado !== "entregado"));
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstado(id, nuevoEstado) {
        try {
            await updateOrder(id, { estado: nuevoEstado });
            loadOrders();
        } catch (error) {
            alert("Error al actualizar pedido");
        }
    }

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#1a202c', minHeight: '100vh', color: 'white' }}>
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#63b3ed' }}>👨‍🍳 Panel de Cocina</h1>
                    <p style={{ color: '#a0aec0', marginTop: '5px' }}>Pedidos en tiempo real para el bar.</p>
                </div>
                <div style={{ backgroundColor: '#2d3748', padding: '10px 20px', borderRadius: '10px' }}>
                    <span style={{ color: '#63b3ed', fontWeight: 'bold' }}>{orders.length}</span> Pedidos Activos
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {orders.map(o => (
                    <div key={o._id} style={{ 
                        backgroundColor: '#2d3748', 
                        padding: '25px', 
                        borderRadius: '15px', 
                        borderLeft: `8px solid ${o.estado === 'listo' ? '#48bb78' : '#ed8936'}`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#ebf8ff' }}>📍 {o.mesa}</h3>
                            <span style={{ 
                                fontSize: '0.8rem', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                backgroundColor: o.estado === 'listo' ? '#22543d' : '#744210',
                                color: o.estado === 'listo' ? '#c6f6d5' : '#feebc8'
                            }}>
                                {o.estado.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ backgroundColor: '#1a202c', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {o.items.map((item, i) => (
                                    <li key={i} style={{ color: '#cbd5e0', padding: '5px 0', borderBottom: '1px solid #2d3748' }}>
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {o.estado === 'pendiente' && (
                                <button 
                                    onClick={() => cambiarEstado(o._id, "preparando")}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#3182ce', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Preparar
                                </button>
                            )}
                            {o.estado !== 'listo' && (
                                <button 
                                    onClick={() => cambiarEstado(o._id, "listo")}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38a169', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Listo
                                </button>
                            )}
                            {o.estado === 'listo' && (
                                <button 
                                    onClick={() => cambiarEstado(o._id, "entregado")}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#718096', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Entregado
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {orders.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px', color: '#4a5568' }}>
                    <div style={{ fontSize: '4rem' }}>😴</div>
                    <p>No hay pedidos pendientes por ahora.</p>
                </div>
            )}
        </div>
    );
}
