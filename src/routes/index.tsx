// src/routes/index.tsx
// Routes Configuration
// Configuración de rutas de la aplicación

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView, DashboardView, AdminSignUpView, UserSignUpView, DeliverySignUpView, AdminDashboardView } from '../views';

// Route definitions
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/login',
        element: <LoginView />
    },
    {
        path: '/admin/signup',
        element: <AdminSignUpView />
    },
    {
        path: '/user/signup',
        element: <UserSignUpView />
    },
    {
        path: '/delivery/signup',
        element: <DeliverySignUpView />
    },
    {
        path: '/dashboard/admin',
        element: <AdminDashboardView />
    },
    {
        path: '/dashboard/:role',
        element: <DashboardView />
    },
    {
        path: '*',
        element: <Navigate to="/login" replace />
    }
]);

export default router;