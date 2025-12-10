// src/models/User.model.ts
// Base User Model
// Modelo base de usuario

export type UserRole = 'user' | 'delivery' | 'admin';

// Enums for Delivery
export type VehicleType = 'motorcycle' | 'bicycle' | 'car' | 'scooter';
export type BankAccountType = 'savings' | 'checking';
export type DeliveryStatus = 'offline' | 'available' | 'busy';

// Display names for enums
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
    motorcycle: 'Motocicleta',
    bicycle: 'Bicicleta',
    car: 'Automóvil',
    scooter: 'Scooter'
};

export const BANK_ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
    savings: 'Ahorros',
    checking: 'Corriente'
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
    offline: 'Desconectado',
    available: 'Disponible',
    busy: 'Ocupado'
};

export interface BaseUser {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Client/Customer - Collection: users
export interface User extends BaseUser {
    role: 'user';
    uid: string;

    // Personal Info
    firstName: string;
    lastName: string;
    idCard: string;
    phone: string;

    // Address (solo Cúcuta)
    address: string;
    neighborhood: string;

    // Profile
    profileImageURL?: string;
    registerDate: Date;

    // Preferential Client
    isPreferential: boolean;
    rateTableId?: string;
}

// Computed properties for User (constants for Cúcuta)
export const USER_LOCATION = {
    city: 'Cúcuta',
    state: 'Norte de Santander',
    country: 'Colombia'
} as const;

// Delivery Person - Collection: deliveries
export interface DeliveryPerson extends BaseUser {
    role: 'delivery';
    uid: string;

    // Personal Info
    firstName: string;
    lastName: string;
    idCard: string;
    phone: string;

    // Address (solo Cúcuta)
    address: string;
    neighborhood: string;

    // Personal Data
    birthDate: Date;
    bloodType: string;
    emergencyContactName: string;
    emergencyContactPhone: string;

    // Vehicle Info
    vehicleType: VehicleType;
    vehiclePlate: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleColor: string;
    soatExpiryDate?: Date;
    technicalReviewExpiryDate?: Date;

    // Driving License
    drivingLicenseNumber: string;
    drivingLicenseCategory: string;
    drivingLicenseExpiry?: Date;

    // Bank Info
    bankName: string;
    accountType: BankAccountType;
    accountNumber: string;

    // Work Preferences
    acceptsMessaging: boolean;
    acceptsErrands: boolean;
    acceptsTransport: boolean;
    maxDeliveryDistance: number;

    // Status
    isProfileComplete: boolean;
    status: DeliveryStatus;
    currentOrderId?: string;
    registerDate: Date;
    isApproved: boolean;

    // Statistics
    totalDeliveries: number;
    rating: number;
    totalEarnings: number;
}

// Administrator - Collection: admins
export interface Admin extends BaseUser {
    role: 'admin';
}

// Auth credentials for login
export interface LoginCredentials {
    email: string;
    password: string;
}

// User registration data
export interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    idCard: string;
    phone: string;
    address: string;
    neighborhood: string;
}

// Delivery registration data
export interface DeliveryRegistrationData {
    email: string;
    password: string;

    // Personal Info
    firstName: string;
    lastName: string;
    idCard: string;
    phone: string;
    address: string;
    neighborhood: string;

    // Personal Data
    birthDate: string; // ISO date string for form handling
    bloodType: string;
    emergencyContactName: string;
    emergencyContactPhone: string;

    // Vehicle Info
    vehicleType: VehicleType;
    vehiclePlate: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleColor: string;
    soatExpiryDate: string;
    technicalReviewExpiryDate: string;

    // Driving License
    drivingLicenseNumber: string;
    drivingLicenseCategory: string;
    drivingLicenseExpiry: string;

    // Bank Info
    bankName: string;
    accountType: BankAccountType;
    accountNumber: string;

    // Work Preferences
    acceptsMessaging: boolean;
    acceptsErrands: boolean;
    acceptsTransport: boolean;
    maxDeliveryDistance: number;
}

// Auth state
export interface AuthState {
    user: BaseUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}