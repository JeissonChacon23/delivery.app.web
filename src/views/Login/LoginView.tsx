// src/views/Login/LoginView.tsx
// Login View
// Vista de inicio de sesión con selección de tipo de usuario

import React, { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, RoleCard } from '../../components';
import type { UserRole, LoginCredentials } from '../../models';
import { authService } from '../../services';
import './LoginView.css';

// Icons for each role
const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const DeliveryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const AdminIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
);

// Email Icon
const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

// Role configurations
const ROLES_CONFIG = [
    {
        role: 'user' as UserRole,
        title: 'Cliente',
        description: 'Solicita domicilios y rastrea tus pedidos en tiempo real',
        icon: <UserIcon />
    },
    {
        role: 'delivery' as UserRole,
        title: 'Domiciliario',
        description: 'Gestiona tus entregas y optimiza tus rutas',
        icon: <DeliveryIcon />
    },
    {
        role: 'admin' as UserRole,
        title: 'Administrador',
        description: 'Administra usuarios, domiciliarios y operaciones',
        icon: <AdminIcon />
    }
];

type LoginStep = 'select-role' | 'login-form';

export const LoginView: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState<LoginStep>('select-role');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get accent color based on selected role
    const getAccent = (): 'user' | 'delivery' | 'admin' => {
        return selectedRole || 'user';
    };

    // Handle role selection
    const handleRoleSelect = useCallback((role: UserRole) => {
        setSelectedRole(role);
        setError(null);
        setStep('login-form');
    }, []);

    // Handle back button
    const handleBack = useCallback(() => {
        setStep('select-role');
        setError(null);
        setCredentials({ email: '', password: '' });
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    }, [error]);

    // Handle form submit
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedRole) return;

        // Validation
        if (!credentials.email.trim()) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        if (!credentials.password.trim()) {
            setError('Por favor ingresa tu contraseña');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await authService.signIn(credentials, selectedRole);

            // Navigate based on role
            const routes = {
                user: '/dashboard/user',
                delivery: '/dashboard/delivery',
                admin: '/dashboard/admin'
            };
            navigate(routes[selectedRole]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [credentials, selectedRole, navigate]);

    // Get role display name
    const getRoleName = (role: UserRole): string => {
        const names = { user: 'Cliente', delivery: 'Domiciliario', admin: 'Administrador' };
        return names[role];
    };

    return (
        <div className={`login-view login-view--${getAccent()}`}>
            {/* Background effects */}
            <div className="login-view__bg">
                <div className="login-view__bg-gradient" />
                <div className="login-view__bg-grid" />
            </div>

            {/* Main content */}
            <main className="login-view__main">
                <div className="login-view__container">
                    {/* Logo / Brand */}
                    <header className="login-view__header">
                        <div className="login-view__logo">
                            <svg viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity="0.1" />
                                <path
                                    d="M12 28V12l8 8 8-8v16"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h1 className="login-view__title">Virtual VR</h1>
                        <p className="login-view__subtitle">
                            {step === 'select-role'
                                ? 'Selecciona tu tipo de cuenta para continuar'
                                : `Inicia sesión como ${getRoleName(selectedRole!)}`
                            }
                        </p>
                    </header>

                    {/* Content based on step */}
                    <div className="login-view__content">
                        {step === 'select-role' ? (
                            // Role Selection
                            <div className="login-view__roles animate-slide-up">
                                {ROLES_CONFIG.map((config, index) => (
                                    <div
                                        key={config.role}
                                        className="login-view__role-item"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <RoleCard
                                            role={config.role}
                                            title={config.title}
                                            description={config.description}
                                            icon={config.icon}
                                            onClick={handleRoleSelect}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Login Form
                            <form className="login-view__form animate-slide-up" onSubmit={handleSubmit}>
                                {/* Back button */}
                                <button
                                    type="button"
                                    className="login-view__back"
                                    onClick={handleBack}
                                    aria-label="Volver a selección de rol"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                    <span>Cambiar tipo de cuenta</span>
                                </button>

                                {/* Form fields */}
                                <div className="login-view__fields">
                                    <Input
                                        type="email"
                                        name="email"
                                        label="Correo electrónico"
                                        placeholder="tu@correo.com"
                                        value={credentials.email}
                                        onChange={handleInputChange}
                                        accent={getAccent()}
                                        icon={<EmailIcon />}
                                        fullWidth
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />

                                    <Input
                                        type="password"
                                        name="password"
                                        label="Contraseña"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={handleInputChange}
                                        accent={getAccent()}
                                        fullWidth
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="login-view__error animate-slide-down">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    accent={getAccent()}
                                    isLoading={isLoading}
                                    fullWidth
                                >
                                    Iniciar Sesión
                                </Button>

                                {/* Forgot password link */}
                                <a href="#" className="login-view__forgot">
                                    ¿Olvidaste tu contraseña?
                                </a>

                                {/* Sign up link - For user */}
                                {selectedRole === 'user' && (
                                    <p className="login-view__signup-link login-view__signup-link--user">
                                        ¿No tienes cuenta?{' '}
                                        <Link to="/user/signup">Crear cuenta de cliente</Link>
                                    </p>
                                )}

                                {/* Sign up link - For delivery */}
                                {selectedRole === 'delivery' && (
                                    <p className="login-view__signup-link login-view__signup-link--delivery">
                                        ¿No tienes cuenta?{' '}
                                        <Link to="/delivery/signup">Crear cuenta de domiciliario</Link>
                                    </p>
                                )}

                                {/* Sign up link - For admin */}
                                {selectedRole === 'admin' && (
                                    <p className="login-view__signup-link">
                                        ¿No tienes cuenta?{' '}
                                        <Link to="/admin/signup">Crear cuenta de administrador</Link>
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="login-view__footer">
                        <p>© {new Date().getFullYear()} Virtual VR. Todos los derechos reservados.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LoginView;