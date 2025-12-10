// src/models/User.model.ts
// Base User Model
// Modelo base de usuario

export type UserRole = 'user' | 'delivery' | 'admin';

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
    name: string;
    phone: string;
    vehicleType?: 'motorcycle' | 'bicycle' | 'car';
    vehiclePlate?: string;
    isAvailable: boolean;
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    rating?: number;
    totalDeliveries?: number;
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

// Auth state
export interface AuthState {
    user: BaseUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}