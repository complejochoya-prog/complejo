import React from "react";
import { hasPermission } from "../utils/permissions";

/**
 * RoleGuard protects children components based on user roles stored in localStorage.
 * If unauthorized, displays a centered access denied message.
 */
export default function RoleGuard({ children, allowedRoles }) {
    const userRole = localStorage.getItem("userRole");

    if (!hasPermission(userRole, allowedRoles)) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "sans-serif",
                color: "#ff4d4d",
                backgroundColor: "#f9f9f9"
            }}>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Acceso no autorizado</h2>
                <p style={{ color: "#666" }}>No tienes permisos para ver esta sección.</p>
                <button 
                    onClick={() => window.history.back()}
                    style={{
                        marginTop: "1.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        background: "white"
                    }}
                >
                    Volver
                </button>
            </div>
        );
    }

    return children;
}
