import React, { createContext, useContext, useState, useEffect } from "react";
import { LocalDB } from "../../../core/database/localDB";

const AdminContext = createContext();
const STORAGE_KEY = "businesses";

export function useAdmin(){
    return useContext(AdminContext);
}

/**
 * AdminProvider manages the global state for businesses in the ERP system.
 */
export default function AdminProvider({children}){
    const [businesses, setBusinesses] = useState(
        LocalDB.get(STORAGE_KEY) || [
            {
                id: "1",
                name: "Complejo Giovanni",
                active: true
            }
        ]
    );

    // Persist changes to LocalDB
    useEffect(() => {
        LocalDB.save(STORAGE_KEY, businesses);
    }, [businesses]);

    const addBusiness = (name) => {
        const newBusiness = {
            id: Date.now().toString(),
            name,
            active: true
        };
        setBusinesses(prev => [...prev, newBusiness]);
    };

    const toggleBusiness = (id) => {
        setBusinesses(prev =>
            prev.map(b =>
                b.id === id ? { ...b, active: !b.active } : b
            )
        );
    };

    return (
        <AdminContext.Provider value={{
            businesses,
            addBusiness,
            toggleBusiness
        }}>
            {children}
        </AdminContext.Provider>
    );
}
