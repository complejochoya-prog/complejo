import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MozoLogin from '../pages/MozoLogin';
import MozoApp from '../pages/MozoApp';
import MozoDashboard from '../pages/MozoDashboard';
import MozoTables from '../pages/MozoTables';
import MozoOrders from '../pages/MozoOrders';
import MozoCheckout from '../pages/MozoCheckout';

export default function MozoRoutes() {
    return (
        <Routes>
            <Route path="login" element={<MozoLogin />} />
            
            {/* The MozoApp acts as a layout for the mozo module */}
            <Route path="" element={<MozoApp />}>
                <Route index element={<MozoDashboard />} />
                <Route path="mesas" element={<MozoTables />} />
                <Route path="pedidos" element={<MozoOrders />} />
                <Route path="cobrar" element={<MozoCheckout />} />
            </Route>

            {/* Fallback to login if not matched */}
            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
}
