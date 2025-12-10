// src/views/UserSignUp/UserSignUpView.tsx
// UserSignUp View
// Vista de registro de usuarios/clientes

import React, { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components';
import { authService } from '../../services';
import type { UserRegistrationData } from '../../models';
import './UserSignUpView.css';

// Icons
const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IdCardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="8" cy="10" r="2" />
        <path d="M8 14h.01" />
        <path d="M14 8h4" />
        <path d="M14 12h4" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const AddressIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const NeighborhoodIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

interface FormData extends UserRegistrationData {
    confirmPassword: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    idCard?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    general?: string;
}

export const UserSignUpView: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        idCard: '',
        phone: '',
        address: '',
        neighborhood: ''
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

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        // ID Card validation
        if (!formData.idCard.trim()) {
            newErrors.idCard = 'La cédula es requerida';
        }

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        // Neighborhood validation
        if (!formData.neighborhood.trim()) {
            newErrors.neighborhood = 'El barrio es requerido';
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
            const { confirmPassword, ...registrationData } = formData;
            await authService.signUpUser(registrationData);

            // Navigate to user dashboard (auto-login)
            navigate('/dashboard/user');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [formData, navigate]);

    return (
        <div className="user-signup">
            {/* Background effects */}
            <div className="user-signup__bg">
                <div className="user-signup__bg-gradient" />
                <div className="user-signup__bg-grid" />
            </div>

            {/* Main content */}
            <main className="user-signup__main">
                <div className="user-signup__container">
                    {/* Header */}
                    <header className="user-signup__header">
                        <div className="user-signup__logo">
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
                        <h1 className="user-signup__title">Crear Cuenta</h1>
                        <p className="user-signup__subtitle">
                            Registro de Cliente
                        </p>
                        <p className="user-signup__location">
                            📍 Cúcuta, Norte de Santander
                        </p>
                    </header>

                    {/* Form */}
                    <form className="user-signup__form" onSubmit={handleSubmit}>
                        {/* Back to login link */}
                        <Link to="/login" className="user-signup__back">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>Volver al inicio de sesión</span>
                        </Link>

                        {/* Form sections */}
                        <div className="user-signup__sections">

                            {/* Account Section */}
                            <section className="user-signup__section">
                                <h2 className="user-signup__section-title">Datos de Cuenta</h2>
                                <div className="user-signup__fields">
                                    <Input
                                        type="email"
                                        name="email"
                                        label="Correo electrónico"
                                        placeholder="tucorreo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        error={errors.email}
                                        accent="user"
                                        icon={<EmailIcon />}
                                        fullWidth
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />

                                    <div className="user-signup__field-row">
                                        <Input
                                            type="password"
                                            name="password"
                                            label="Contraseña"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            error={errors.password}
                                            accent="user"
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
                                            accent="user"
                                            fullWidth
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Personal Info Section */}
                            <section className="user-signup__section">
                                <h2 className="user-signup__section-title">Información Personal</h2>
                                <div className="user-signup__fields">
                                    <div className="user-signup__field-row">
                                        <Input
                                            type="text"
                                            name="firstName"
                                            label="Nombre"
                                            placeholder="Tu nombre"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            error={errors.firstName}
                                            accent="user"
                                            icon={<UserIcon />}
                                            fullWidth
                                            autoComplete="given-name"
                                            disabled={isLoading}
                                        />

                                        <Input
                                            type="text"
                                            name="lastName"
                                            label="Apellido"
                                            placeholder="Tu apellido"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            error={errors.lastName}
                                            accent="user"
                                            icon={<UserIcon />}
                                            fullWidth
                                            autoComplete="family-name"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="user-signup__field-row">
                                        <Input
                                            type="text"
                                            name="idCard"
                                            label="Cédula"
                                            placeholder="Número de cédula"
                                            value={formData.idCard}
                                            onChange={handleInputChange}
                                            error={errors.idCard}
                                            accent="user"
                                            icon={<IdCardIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <Input
                                            type="tel"
                                            name="phone"
                                            label="Teléfono"
                                            placeholder="+57 300 123 4567"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            error={errors.phone}
                                            accent="user"
                                            icon={<PhoneIcon />}
                                            fullWidth
                                            autoComplete="tel"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Address Section */}
                            <section className="user-signup__section">
                                <h2 className="user-signup__section-title">Dirección</h2>
                                <div className="user-signup__fields">
                                    <Input
                                        type="text"
                                        name="address"
                                        label="Dirección"
                                        placeholder="Calle, carrera, número..."
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        error={errors.address}
                                        accent="user"
                                        icon={<AddressIcon />}
                                        fullWidth
                                        autoComplete="street-address"
                                        disabled={isLoading}
                                    />

                                    <Input
                                        type="text"
                                        name="neighborhood"
                                        label="Barrio"
                                        placeholder="Nombre del barrio"
                                        value={formData.neighborhood}
                                        onChange={handleInputChange}
                                        error={errors.neighborhood}
                                        accent="user"
                                        icon={<NeighborhoodIcon />}
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* General error message */}
                        {errors.general && (
                            <div className="user-signup__error animate-slide-down">
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
                            accent="user"
                            isLoading={isLoading}
                            fullWidth
                        >
                            Crear Cuenta
                        </Button>

                        {/* Login link */}
                        <p className="user-signup__login-link">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>

                    {/* Footer */}
                    <footer className="user-signup__footer">
                        <p>© {new Date().getFullYear()} Virtual VR. Todos los derechos reservados.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default UserSignUpView;