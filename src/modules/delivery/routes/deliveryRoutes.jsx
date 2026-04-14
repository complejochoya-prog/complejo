import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import DeliveryLogin from '../pages/DeliveryLogin';
import DeliveryApp from '../pages/DeliveryApp';

export default function DeliveryRoutes() {
    return (
        <Routes>
            <Route path="login" element={<DeliveryLogin />} />
            <Route path="" element={<DeliveryApp />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
}
