// src/services/auth.service.ts
// Authentication Service
// Servicio de autenticación con Firebase

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import type { UserRole, BaseUser, LoginCredentials, UserRegistrationData, DeliveryRegistrationData } from '../models';

// Collection names for each user type
const COLLECTIONS = {
    user: 'users',
    delivery: 'deliveries',
    admin: 'admins'
} as const;

class AuthService {
    // Sign in user with email and password
    async signIn(credentials: LoginCredentials, role: UserRole): Promise<BaseUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            // Get user data from the corresponding collection
            const userData = await this.getUserByRole(userCredential.user.uid, role);

            if (!userData) {
                await signOut(auth);
                throw new Error('Usuario no encontrado en el sistema como ' + this.getRoleName(role));
            }

            return userData;
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Create new user account
    async signUp(
        credentials: LoginCredentials,
        role: UserRole,
        additionalData: Partial<BaseUser>
    ): Promise<BaseUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            const userData = await this.createUserDocument(
                userCredential.user.uid,
                credentials.email,
                role,
                additionalData
            );

            return userData;
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Sign out current user
    async signOut(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Sign up admin with email and password only
    async signUpAdmin(email: string, password: string): Promise<BaseUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Create admin document with minimal fields
            const adminData = {
                email,
                role: 'admin',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = doc(db, 'admins', userCredential.user.uid);
            await setDoc(docRef, adminData);

            return {
                id: userCredential.user.uid,
                email,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as BaseUser;
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Sign up user/client with full registration data
    async signUpUser(data: UserRegistrationData): Promise<BaseUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            const uid = userCredential.user.uid;

            // Create user document with all fields
            const userData = {
                uid,
                email: data.email,
                role: 'user',

                // Personal Info
                firstName: data.firstName,
                lastName: data.lastName,
                idCard: data.idCard,
                phone: data.phone,

                // Address (solo Cúcuta)
                address: data.address,
                neighborhood: data.neighborhood,

                // Profile
                profileImageURL: null,
                registerDate: serverTimestamp(),
                isActive: true,

                // Preferential Client
                isPreferential: false,
                rateTableId: null,

                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = doc(db, 'users', uid);
            await setDoc(docRef, userData);

            return {
                id: uid,
                email: data.email,
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as BaseUser;
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Sign up delivery person with full registration data
    async signUpDelivery(data: DeliveryRegistrationData): Promise<BaseUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            const uid = userCredential.user.uid;

            // Helper function to convert date string to Timestamp
            const toTimestamp = (dateStr: string): Timestamp | null => {
                if (!dateStr) return null;
                return Timestamp.fromDate(new Date(dateStr));
            };

            // Create delivery document with all fields
            const deliveryData = {
                uid,
                email: data.email,
                role: 'delivery',

                // Personal Info
                firstName: data.firstName,
                lastName: data.lastName,
                idCard: data.idCard,
                phone: data.phone,

                // Address (solo Cúcuta)
                address: data.address,
                neighborhood: data.neighborhood,

                // Personal Data
                birthDate: toTimestamp(data.birthDate),
                bloodType: data.bloodType,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,

                // Vehicle Info
                vehicleType: data.vehicleType,
                vehiclePlate: data.vehiclePlate.toUpperCase(),
                vehicleBrand: data.vehicleBrand,
                vehicleModel: data.vehicleModel,
                vehicleColor: data.vehicleColor,
                soatExpiryDate: toTimestamp(data.soatExpiryDate),
                technicalReviewExpiryDate: toTimestamp(data.technicalReviewExpiryDate),

                // Driving License
                drivingLicenseNumber: data.drivingLicenseNumber,
                drivingLicenseCategory: data.drivingLicenseCategory,
                drivingLicenseExpiry: toTimestamp(data.drivingLicenseExpiry),

                // Bank Info
                bankName: data.bankName,
                accountType: data.accountType,
                accountNumber: data.accountNumber,

                // Work Preferences
                acceptsMessaging: data.acceptsMessaging,
                acceptsErrands: data.acceptsErrands,
                acceptsTransport: data.acceptsTransport,
                maxDeliveryDistance: data.maxDeliveryDistance,

                // Status
                isProfileComplete: true,
                status: 'offline',
                currentOrderId: null,
                registerDate: serverTimestamp(),
                isActive: true,
                isApproved: false, // Requires admin approval

                // Statistics
                totalDeliveries: 0,
                rating: 0,
                totalEarnings: 0,

                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = doc(db, 'deliveries', uid);
            await setDoc(docRef, deliveryData);

            return {
                id: uid,
                email: data.email,
                role: 'delivery',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            } as BaseUser;
        } catch (error: unknown) {
            throw this.handleAuthError(error);
        }
    }

    // Get user data by role from the corresponding collection
    async getUserByRole(uid: string, role: UserRole): Promise<BaseUser | null> {
        const collection = COLLECTIONS[role];
        const docRef = doc(db, collection, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as BaseUser;
        }

        return null;
    }

    // Find user across all collections
    async findUserInAllCollections(uid: string): Promise<{ user: BaseUser; role: UserRole } | null> {
        for (const [role, collection] of Object.entries(COLLECTIONS)) {
            const docRef = doc(db, collection, uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    user: {
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date()
                    } as BaseUser,
                    role: role as UserRole
                };
            }
        }

        return null;
    }

    // Create user document in the corresponding collection (legacy method)
    // NOTE: Use signUpUser or signUpAdmin for new registrations
    private async createUserDocument(
        uid: string,
        email: string,
        role: UserRole,
        _additionalData: Partial<BaseUser>
    ): Promise<BaseUser> {
        const collection = COLLECTIONS[role];
        const docRef = doc(db, collection, uid);

        const baseData = {
            email,
            role,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Add role-specific default fields
        let userData: Record<string, unknown>;

        switch (role) {
            case 'user':
                userData = {
                    ...baseData,
                    uid,
                    firstName: '',
                    lastName: '',
                    idCard: '',
                    phone: '',
                    address: '',
                    neighborhood: '',
                    registerDate: serverTimestamp(),
                    isPreferential: false,
                    rateTableId: null,
                    profileImageURL: null
                };
                break;
            case 'delivery':
                userData = {
                    ...baseData,
                    name: '',
                    phone: '',
                    vehicleType: 'motorcycle',
                    vehiclePlate: '',
                    isAvailable: false,
                    currentLocation: null,
                    rating: 0,
                    totalDeliveries: 0
                };
                break;
            case 'admin':
                userData = {
                    ...baseData
                };
                break;
        }

        await setDoc(docRef, userData);

        return {
            id: uid,
            email,
            role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        } as BaseUser;
    }

    // Listen to auth state changes
    onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    }

    // Get role display name in Spanish
    private getRoleName(role: UserRole): string {
        const names = {
            user: 'Cliente',
            delivery: 'Domiciliario',
            admin: 'Administrador'
        };
        return names[role];
    }

    // Handle authentication errors with Spanish messages
    private handleAuthError(error: unknown): Error {
        const firebaseError = error as { code?: string; message?: string };
        const errorCode = firebaseError.code || '';

        const errorMessages: Record<string, string> = {
            'auth/invalid-email': 'El correo electrónico no es válido',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/user-not-found': 'No existe una cuenta con este correo',
            'auth/wrong-password': 'La contraseña es incorrecta',
            'auth/email-already-in-use': 'Este correo ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/invalid-credential': 'Las credenciales proporcionadas son inválidas'
        };

        return new Error(errorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente');
    }
}

export const authService = new AuthService();
export default authService;