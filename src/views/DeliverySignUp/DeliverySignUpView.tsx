// src/views/DeliverySignUp/DeliverySignUpView.tsx
// DeliverySignUp View
// Vista de registro de domiciliarios

import React, { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components';
import { authService } from '../../services';
import type { DeliveryRegistrationData, VehicleType, BankAccountType } from '../../models';
import { VEHICLE_TYPE_LABELS, BANK_ACCOUNT_TYPE_LABELS } from '../../models';
import './DeliverySignUpView.css';

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

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const VehicleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

const LicenseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M7 16h6" />
    </svg>
);

const BankIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18" />
        <path d="M3 10h18" />
        <path d="M5 6l7-3 7 3" />
        <path d="M4 10v11" />
        <path d="M20 10v11" />
        <path d="M8 14v3" />
        <path d="M12 14v3" />
        <path d="M16 14v3" />
    </svg>
);

const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

interface FormData extends Omit<DeliveryRegistrationData, 'acceptsMessaging' | 'acceptsErrands' | 'acceptsTransport' | 'maxDeliveryDistance'> {
    confirmPassword: string;
    acceptsMessaging: boolean;
    acceptsErrands: boolean;
    acceptsTransport: boolean;
    maxDeliveryDistance: string;
}

interface FormErrors {
    [key: string]: string | undefined;
    general?: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LICENSE_CATEGORIES = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
const BANKS = [
    'Bancolombia',
    'Banco de Bogotá',
    'Davivienda',
    'BBVA Colombia',
    'Banco de Occidente',
    'Banco Popular',
    'Banco AV Villas',
    'Banco Caja Social',
    'Scotiabank Colpatria',
    'Banco Agrario',
    'Nequi',
    'Daviplata',
    'Otro'
];

export const DeliverySignUpView: React.FC = () => {
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
        neighborhood: '',
        birthDate: '',
        bloodType: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        vehicleType: 'motorcycle',
        vehiclePlate: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleColor: '',
        soatExpiryDate: '',
        technicalReviewExpiryDate: '',
        drivingLicenseNumber: '',
        drivingLicenseCategory: '',
        drivingLicenseExpiry: '',
        bankName: '',
        accountType: 'savings',
        accountNumber: '',
        acceptsMessaging: true,
        acceptsErrands: true,
        acceptsTransport: false,
        maxDeliveryDistance: '10'
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Account validation
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Ingresa un correo electrónico válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        // Personal info validation
        if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
        if (!formData.idCard.trim()) newErrors.idCard = 'La cédula es requerida';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
        if (!formData.neighborhood.trim()) newErrors.neighborhood = 'El barrio es requerido';

        // Personal data validation
        if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
        if (!formData.bloodType) newErrors.bloodType = 'El tipo de sangre es requerido';
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'El contacto de emergencia es requerido';
        if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'El teléfono de emergencia es requerido';

        // Vehicle validation
        if (!formData.vehiclePlate.trim()) newErrors.vehiclePlate = 'La placa es requerida';
        if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = 'La marca es requerida';
        if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'El modelo es requerido';
        if (!formData.vehicleColor.trim()) newErrors.vehicleColor = 'El color es requerido';
        if (!formData.soatExpiryDate) newErrors.soatExpiryDate = 'La fecha de vencimiento del SOAT es requerida';
        if (!formData.technicalReviewExpiryDate) newErrors.technicalReviewExpiryDate = 'La fecha de vencimiento de la revisión es requerida';

        // License validation
        if (!formData.drivingLicenseNumber.trim()) newErrors.drivingLicenseNumber = 'El número de licencia es requerido';
        if (!formData.drivingLicenseCategory) newErrors.drivingLicenseCategory = 'La categoría es requerida';
        if (!formData.drivingLicenseExpiry) newErrors.drivingLicenseExpiry = 'La fecha de vencimiento es requerida';

        // Bank validation
        if (!formData.bankName) newErrors.bankName = 'El banco es requerido';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'El número de cuenta es requerido';

        // Work preferences validation
        const distance = parseFloat(formData.maxDeliveryDistance);
        if (isNaN(distance) || distance <= 0) {
            newErrors.maxDeliveryDistance = 'Ingresa una distancia válida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.input--error');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const { confirmPassword: _confirmPassword, maxDeliveryDistance, ...rest } = formData;
            const registrationData: DeliveryRegistrationData = {
                ...rest,
                maxDeliveryDistance: parseFloat(maxDeliveryDistance)
            };

            await authService.signUpDelivery(registrationData);

            // Navigate to delivery dashboard (auto-login)
            navigate('/dashboard/delivery');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
            setErrors({ general: errorMessage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    }, [formData, navigate]);

    return (
        <div className="delivery-signup">
            {/* Background effects */}
            <div className="delivery-signup__bg">
                <div className="delivery-signup__bg-gradient" />
                <div className="delivery-signup__bg-grid" />
            </div>

            {/* Main content */}
            <main className="delivery-signup__main">
                <div className="delivery-signup__container">
                    {/* Header */}
                    <header className="delivery-signup__header">
                        <div className="delivery-signup__logo">
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
                        <h1 className="delivery-signup__title">Registro de Domiciliario</h1>
                        <p className="delivery-signup__subtitle">
                            Completa todos los campos para crear tu cuenta
                        </p>
                        <p className="delivery-signup__location">
                            📍 Cúcuta, Norte de Santander
                        </p>
                    </header>

                    {/* Form */}
                    <form className="delivery-signup__form" onSubmit={handleSubmit}>
                        {/* Back to login link */}
                        <Link to="/login" className="delivery-signup__back">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>Volver al inicio de sesión</span>
                        </Link>

                        {/* General error message */}
                        {errors.general && (
                            <div className="delivery-signup__error animate-slide-down">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>{errors.general}</span>
                            </div>
                        )}

                        {/* Form sections */}
                        <div className="delivery-signup__sections">

                            {/* Section 1: Account */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <EmailIcon />
                                    <h2>Datos de Cuenta</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <Input
                                        type="email"
                                        name="email"
                                        label="Correo electrónico"
                                        placeholder="tucorreo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        error={errors.email}
                                        accent="delivery"
                                        icon={<EmailIcon />}
                                        fullWidth
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />

                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="password"
                                            name="password"
                                            label="Contraseña"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            error={errors.password}
                                            accent="delivery"
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
                                            accent="delivery"
                                            fullWidth
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Personal Info */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <UserIcon />
                                    <h2>Información Personal</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="text"
                                            name="firstName"
                                            label="Nombre"
                                            placeholder="Tu nombre"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            error={errors.firstName}
                                            accent="delivery"
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
                                            accent="delivery"
                                            icon={<UserIcon />}
                                            fullWidth
                                            autoComplete="family-name"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="text"
                                            name="idCard"
                                            label="Cédula"
                                            placeholder="Número de cédula"
                                            value={formData.idCard}
                                            onChange={handleInputChange}
                                            error={errors.idCard}
                                            accent="delivery"
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
                                            accent="delivery"
                                            icon={<PhoneIcon />}
                                            fullWidth
                                            autoComplete="tel"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Input
                                        type="text"
                                        name="address"
                                        label="Dirección"
                                        placeholder="Calle, carrera, número..."
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        error={errors.address}
                                        accent="delivery"
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
                                        accent="delivery"
                                        icon={<AddressIcon />}
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </section>

                            {/* Section 3: Personal Data */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <HeartIcon />
                                    <h2>Datos Personales</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="date"
                                            name="birthDate"
                                            label="Fecha de nacimiento"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                            error={errors.birthDate}
                                            accent="delivery"
                                            icon={<CalendarIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <div className="delivery-signup__select-wrapper">
                                            <label className="delivery-signup__label">Tipo de sangre</label>
                                            <select
                                                name="bloodType"
                                                value={formData.bloodType}
                                                onChange={handleInputChange}
                                                className={`delivery-signup__select ${errors.bloodType ? 'delivery-signup__select--error' : ''}`}
                                                disabled={isLoading}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {BLOOD_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.bloodType && <span className="delivery-signup__field-error">{errors.bloodType}</span>}
                                        </div>
                                    </div>

                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="text"
                                            name="emergencyContactName"
                                            label="Contacto de emergencia"
                                            placeholder="Nombre completo"
                                            value={formData.emergencyContactName}
                                            onChange={handleInputChange}
                                            error={errors.emergencyContactName}
                                            accent="delivery"
                                            icon={<UserIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <Input
                                            type="tel"
                                            name="emergencyContactPhone"
                                            label="Teléfono de emergencia"
                                            placeholder="+57 300 123 4567"
                                            value={formData.emergencyContactPhone}
                                            onChange={handleInputChange}
                                            error={errors.emergencyContactPhone}
                                            accent="delivery"
                                            icon={<PhoneIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Vehicle Info */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <VehicleIcon />
                                    <h2>Información del Vehículo</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__field-row">
                                        <div className="delivery-signup__select-wrapper">
                                            <label className="delivery-signup__label">Tipo de vehículo</label>
                                            <select
                                                name="vehicleType"
                                                value={formData.vehicleType}
                                                onChange={handleInputChange}
                                                className="delivery-signup__select"
                                                disabled={isLoading}
                                            >
                                                {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map(type => (
                                                    <option key={type} value={type}>{VEHICLE_TYPE_LABELS[type]}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Input
                                            type="text"
                                            name="vehiclePlate"
                                            label="Placa"
                                            placeholder="ABC123"
                                            value={formData.vehiclePlate}
                                            onChange={handleInputChange}
                                            error={errors.vehiclePlate}
                                            accent="delivery"
                                            fullWidth
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="text"
                                            name="vehicleBrand"
                                            label="Marca"
                                            placeholder="Honda, Yamaha, etc."
                                            value={formData.vehicleBrand}
                                            onChange={handleInputChange}
                                            error={errors.vehicleBrand}
                                            accent="delivery"
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <Input
                                            type="text"
                                            name="vehicleModel"
                                            label="Modelo"
                                            placeholder="XR150, FZ25, etc."
                                            value={formData.vehicleModel}
                                            onChange={handleInputChange}
                                            error={errors.vehicleModel}
                                            accent="delivery"
                                            fullWidth
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Input
                                        type="text"
                                        name="vehicleColor"
                                        label="Color"
                                        placeholder="Negro, Rojo, etc."
                                        value={formData.vehicleColor}
                                        onChange={handleInputChange}
                                        error={errors.vehicleColor}
                                        accent="delivery"
                                        fullWidth
                                        disabled={isLoading}
                                    />

                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="date"
                                            name="soatExpiryDate"
                                            label="Vencimiento SOAT"
                                            value={formData.soatExpiryDate}
                                            onChange={handleInputChange}
                                            error={errors.soatExpiryDate}
                                            accent="delivery"
                                            icon={<CalendarIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <Input
                                            type="date"
                                            name="technicalReviewExpiryDate"
                                            label="Vencimiento Revisión Técnico-Mecánica"
                                            value={formData.technicalReviewExpiryDate}
                                            onChange={handleInputChange}
                                            error={errors.technicalReviewExpiryDate}
                                            accent="delivery"
                                            icon={<CalendarIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: License */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <LicenseIcon />
                                    <h2>Licencia de Conducción</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__field-row">
                                        <Input
                                            type="text"
                                            name="drivingLicenseNumber"
                                            label="Número de licencia"
                                            placeholder="Número de licencia"
                                            value={formData.drivingLicenseNumber}
                                            onChange={handleInputChange}
                                            error={errors.drivingLicenseNumber}
                                            accent="delivery"
                                            icon={<LicenseIcon />}
                                            fullWidth
                                            disabled={isLoading}
                                        />

                                        <div className="delivery-signup__select-wrapper">
                                            <label className="delivery-signup__label">Categoría</label>
                                            <select
                                                name="drivingLicenseCategory"
                                                value={formData.drivingLicenseCategory}
                                                onChange={handleInputChange}
                                                className={`delivery-signup__select ${errors.drivingLicenseCategory ? 'delivery-signup__select--error' : ''}`}
                                                disabled={isLoading}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {LICENSE_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            {errors.drivingLicenseCategory && <span className="delivery-signup__field-error">{errors.drivingLicenseCategory}</span>}
                                        </div>
                                    </div>

                                    <Input
                                        type="date"
                                        name="drivingLicenseExpiry"
                                        label="Fecha de vencimiento"
                                        value={formData.drivingLicenseExpiry}
                                        onChange={handleInputChange}
                                        error={errors.drivingLicenseExpiry}
                                        accent="delivery"
                                        icon={<CalendarIcon />}
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </section>

                            {/* Section 6: Bank Info */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <BankIcon />
                                    <h2>Información Bancaria</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__field-row">
                                        <div className="delivery-signup__select-wrapper">
                                            <label className="delivery-signup__label">Banco</label>
                                            <select
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleInputChange}
                                                className={`delivery-signup__select ${errors.bankName ? 'delivery-signup__select--error' : ''}`}
                                                disabled={isLoading}
                                            >
                                                <option value="">Seleccionar banco...</option>
                                                {BANKS.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                            {errors.bankName && <span className="delivery-signup__field-error">{errors.bankName}</span>}
                                        </div>

                                        <div className="delivery-signup__select-wrapper">
                                            <label className="delivery-signup__label">Tipo de cuenta</label>
                                            <select
                                                name="accountType"
                                                value={formData.accountType}
                                                onChange={handleInputChange}
                                                className="delivery-signup__select"
                                                disabled={isLoading}
                                            >
                                                {(Object.keys(BANK_ACCOUNT_TYPE_LABELS) as BankAccountType[]).map(type => (
                                                    <option key={type} value={type}>{BANK_ACCOUNT_TYPE_LABELS[type]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Input
                                        type="text"
                                        name="accountNumber"
                                        label="Número de cuenta"
                                        placeholder="Número de cuenta"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        error={errors.accountNumber}
                                        accent="delivery"
                                        icon={<BankIcon />}
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </section>

                            {/* Section 7: Work Preferences */}
                            <section className="delivery-signup__section">
                                <div className="delivery-signup__section-header">
                                    <SettingsIcon />
                                    <h2>Preferencias de Trabajo</h2>
                                </div>
                                <div className="delivery-signup__fields">
                                    <div className="delivery-signup__checkboxes">
                                        <label className="delivery-signup__checkbox">
                                            <input
                                                type="checkbox"
                                                name="acceptsMessaging"
                                                checked={formData.acceptsMessaging}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                            <span className="delivery-signup__checkbox-mark"></span>
                                            <span>Acepto mensajería</span>
                                        </label>

                                        <label className="delivery-signup__checkbox">
                                            <input
                                                type="checkbox"
                                                name="acceptsErrands"
                                                checked={formData.acceptsErrands}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                            <span className="delivery-signup__checkbox-mark"></span>
                                            <span>Acepto mandados</span>
                                        </label>

                                        <label className="delivery-signup__checkbox">
                                            <input
                                                type="checkbox"
                                                name="acceptsTransport"
                                                checked={formData.acceptsTransport}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                            />
                                            <span className="delivery-signup__checkbox-mark"></span>
                                            <span>Acepto transporte de personas</span>
                                        </label>
                                    </div>

                                    <Input
                                        type="number"
                                        name="maxDeliveryDistance"
                                        label="Distancia máxima de entrega (km)"
                                        placeholder="10"
                                        value={formData.maxDeliveryDistance}
                                        onChange={handleInputChange}
                                        error={errors.maxDeliveryDistance}
                                        accent="delivery"
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Info message */}
                        <div className="delivery-signup__info">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                            <p>Tu solicitud será revisada por un administrador antes de poder trabajar.</p>
                        </div>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            accent="delivery"
                            isLoading={isLoading}
                            fullWidth
                        >
                            Crear Cuenta
                        </Button>

                        {/* Login link */}
                        <p className="delivery-signup__login-link">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>

                    {/* Footer */}
                    <footer className="delivery-signup__footer">
                        <p>© {new Date().getFullYear()} Virtual VR. Todos los derechos reservados.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default DeliverySignUpView;