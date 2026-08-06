import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/layout/Layout';

import Workshops from '../pages/Workshops';
import WorkshopDetails from '../pages/WorkshopDetails';
import Participants from '../pages/Participants';
import Registrations from '../pages/Registrations';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="workshops" element={<Workshops />} />
                <Route path="workshops/:id" element={<WorkshopDetails />} />
                <Route path="participants" element={<Participants />} />
                <Route path="registrations" element={<Registrations />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
