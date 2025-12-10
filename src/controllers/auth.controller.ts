// src/controllers/auth.controller.ts
// Authentication Controller
// Controlador de autenticación - Maneja la lógica de login/logout

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import type { UserRole, BaseUser, LoginCredentials, AuthState } from '../models';

// Initial auth state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

// Custom hook for authentication logic
export const useAuthController = () => {
    const [authState, setAuthState] = useState<AuthState>(initialState);
    const navigate = useNavigate();

    // Login handler
    const handleLogin = useCallback(async (
        credentials: LoginCredentials,
        role: UserRole
    ): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const user = await authService.signIn(credentials, role);

            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            // Navigate to dashboard based on role
            navigateToDashboard(role);

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';

            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: errorMessage
            });

            return false;
        }
    }, []);

    // Logout handler
    const handleLogout = useCallback(async (): Promise<void> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            await authService.signOut();
            setAuthState(initialState);
            navigate('/login');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
            setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [navigate]);

    // Clear error
    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    // Set user manually (useful for session recovery)
    const setUser = useCallback((user: BaseUser | null) => {
        setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: !!user
        }));
    }, []);

    // Navigate to appropriate dashboard
    const navigateToDashboard = (role: UserRole) => {
        const routes = {
            user: '/dashboard/user',
            delivery: '/dashboard/delivery',
            admin: '/dashboard/admin'
        };
        navigate(routes[role]);
    };

    return {
        ...authState,
        handleLogin,
        handleLogout,
        clearError,
        setUser
    };
};

export default useAuthController;