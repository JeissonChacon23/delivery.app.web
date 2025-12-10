// src/views/AdminSignUp/AdminSignUpView.tsx
// AdminSignUp View
// Vista de registro de administradores

import React, { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components';
import { authService } from '../../services';
import './AdminSignUpView.css';

// Email Icon
const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export const AdminSignUpView: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Ingresa un correo electrónico válido';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await authService.signUpAdmin(formData.email, formData.password);

            // Navigate to admin dashboard (auto-login)
            navigate('/dashboard/admin');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [formData, navigate]);

    return (
        <div className="admin-signup">
            {/* Background effects */}
            <div className="admin-signup__bg">
                <div className="admin-signup__bg-gradient" />
                <div className="admin-signup__bg-grid" />
            </div>

            {/* Main content */}
            <main className="admin-signup__main">
                <div className="admin-signup__container">
                    {/* Header */}
                    <header className="admin-signup__header">
                        <div className="admin-signup__logo">
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
                        <h1 className="admin-signup__title">Crear Cuenta</h1>
                        <p className="admin-signup__subtitle">
                            Registro de Administrador
                        </p>
                    </header>

                    {/* Form */}
                    <form className="admin-signup__form" onSubmit={handleSubmit}>
                        {/* Back to login link */}
                        <Link to="/login" className="admin-signup__back">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>Volver al inicio de sesión</span>
                        </Link>

                        {/* Form fields */}
                        <div className="admin-signup__fields">
                            <Input
                                type="email"
                                name="email"
                                label="Correo electrónico"
                                placeholder="admin@ejemplo.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={errors.email}
                                accent="admin"
                                icon={<EmailIcon />}
                                fullWidth
                                autoComplete="email"
                                disabled={isLoading}
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Contraseña"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={handleInputChange}
                                error={errors.password}
                                accent="admin"
                                fullWidth
                                autoComplete="new-password"
                                disabled={isLoading}
                            />

                            <Input
                                type="password"
                                name="confirmPassword"
                                label="Confirmar contraseña"
                                placeholder="Repite tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                error={errors.confirmPassword}
                                accent="admin"
                                fullWidth
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        </div>

                        {/* General error message */}
                        {errors.general && (
                            <div className="admin-signup__error animate-slide-down">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>{errors.general}</span>
                            </div>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            accent="admin"
                            isLoading={isLoading}
                            fullWidth
                        >
                            Crear Cuenta
                        </Button>

                        {/* Login link */}
                        <p className="admin-signup__login-link">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>

                    {/* Footer */}
                    <footer className="admin-signup__footer">
                        <p>© {new Date().getFullYear()} Virtual VR. Todos los derechos reservados.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default AdminSignUpView;