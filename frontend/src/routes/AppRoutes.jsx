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
import ParticipantDetails from '../pages/ParticipantDetails';
import Registrations from '../pages/Registrations';
import RegistrationDetails from '../pages/RegistrationDetails';
import CheckIn from '../pages/CheckIn';
import CheckInHistory from '../pages/CheckInHistory';
import Users from '../pages/Users';
import Reports from '../pages/Reports';

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
                <Route path="participants/:id" element={<ParticipantDetails />} />
                <Route path="registrations" element={<Registrations />} />
                <Route path="registrations/:id" element={<RegistrationDetails />} />
                <Route path="check-in" element={<CheckIn />} />
                <Route path="check-in/history" element={<CheckInHistory />} />
                <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}><Reports /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
