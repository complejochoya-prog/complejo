import React, { useEffect, useState } from "react";
import socket from "../../../core/socket/socketClient";
import { getStats } from "../services/statsService";

/**
 * Dashboard: High-level overview of business performance.
 */
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();

        // Real-time listener
        socket.on("nueva_reserva", () => {
            console.log("Real-time reservation refresh...");
            load();
        });

        return () => {
            socket.off("nueva_reserva");
        };
    }, []);

    async function load() {
        try {
            const data = await getStats();
            setStats(data);
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>
            <p>Cargando Dashboard...</p>
        </div>
    );

    const cards = [
        { title: "Reservas Totales", value: stats?.reservas || 0, icon: "📅", color: "#3182ce" },
        { title: "Pedidos del Bar", value: stats?.pedidos || 0, icon: "🍔", color: "#dd6b20" },
        { title: "Ingresos Totales", value: `$${(stats?.totalVentas || 0).toLocaleString()}`, icon: "💰", color: "#38a169" },
        { title: "Crecimiento", value: stats?.growth || "0%", icon: "📈", color: "#805ad5" }
    ];

    return (
        <div style={{ padding: '40px', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                    Dashboard del Complejo
                </h1>
                <p style={{ color: '#64748b' }}>Bienvenido de nuevo. Aquí tienes un resumen del rendimiento de hoy.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {cards.map((card, i) => (
                    <div key={i} style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '20px', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: card.color, backgroundColor: `${card.color}15`, padding: '4px 8px', borderRadius: '8px' }}>
                                LIVE
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>
                            {card.title}
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Actividad Reciente</h3>
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                        <p>Próximamente: Gráficos de actividad en tiempo real.</p>
                    </div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '24px', color: 'white' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#f1f5f9' }}>Estado del Sistema</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Servidor API Online</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Base de Datos Conectada</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Pagos MercadoPago Activos</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
