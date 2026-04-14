import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useEmployeeAuth(negocioId) {
    const [employeeUser, setEmployeeUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem(`giovanni_emp_${negocioId}`);
        if (stored) {
            try {
                setEmployeeUser(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    }, [negocioId]);

    const login = async (codigoPin) => {
        // En un mundo real, harias un request al backend:
        // /api/negocios/auth/empleado con el negocioId y el codigoPin
        
        let role = null;
        let name = null;
        
        if (codigoPin === '1234') {
            role = 'admin';
            name = 'Acceso General (Dev)';
        } else if (codigoPin === '1111') {
            role = 'recepcion';
            name = 'Recepción Principal';
        } else if (codigoPin === '2222') {
            role = 'bar';
            name = 'Mozo / Barra';
        } else if (codigoPin === '3333') {
            role = 'cocina';
            name = 'Monitor de Cocina';
        } else if (codigoPin === '9999') {
            role = 'admin';
            name = 'Administrador Total';
        }

        if (role && name) {
            const empData = { name, role, isEmployee: true };
            setEmployeeUser(empData);
            localStorage.setItem(`giovanni_emp_${negocioId}`, JSON.stringify(empData));
            
            // Redirect based on role
            if (role === 'recepcion' || role === 'admin') navigate(`/${negocioId}/empleados/recepcion`);
            else if (role === 'bar') navigate(`/${negocioId}/empleados/bar`);
            else if (role === 'cocina') navigate(`/${negocioId}/empleados/cocina`);
            
            return { success: true };
        }
        
        return { success: false, error: 'PIN inválido para el rol de empleado.' };
    };

    const logout = () => {
        setEmployeeUser(null);
        localStorage.removeItem(`giovanni_emp_${negocioId}`);
        navigate(`/${negocioId}/empleados`);
    };

    return { employeeUser, loading, login, logout };
}
