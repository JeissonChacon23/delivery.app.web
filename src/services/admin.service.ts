// src/services/admin.service.ts
// Admin Service
// Servicio para operaciones de administrador con Firestore

import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import type { User, DeliveryPerson } from '../models';

class AdminService {
    // ========================================
    // DELIVERIES (Domiciliarios)
    // ========================================

    // Get all deliveries with real-time updates
    subscribeToDeliveries(callback: (deliveries: DeliveryPerson[]) => void): Unsubscribe {
        const q = query(collection(db, 'deliveries'), orderBy('registerDate', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const deliveries: DeliveryPerson[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    birthDate: data.birthDate?.toDate() || new Date(),
                    soatExpiryDate: data.soatExpiryDate?.toDate(),
                    technicalReviewExpiryDate: data.technicalReviewExpiryDate?.toDate(),
                    drivingLicenseExpiry: data.drivingLicenseExpiry?.toDate(),
                    registerDate: data.registerDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as DeliveryPerson;
            });
            callback(deliveries);
        });
    }

    // Get all deliveries (one-time fetch)
    async getAllDeliveries(): Promise<DeliveryPerson[]> {
        const q = query(collection(db, 'deliveries'), orderBy('registerDate', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                birthDate: data.birthDate?.toDate() || new Date(),
                soatExpiryDate: data.soatExpiryDate?.toDate(),
                technicalReviewExpiryDate: data.technicalReviewExpiryDate?.toDate(),
                drivingLicenseExpiry: data.drivingLicenseExpiry?.toDate(),
                registerDate: data.registerDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as DeliveryPerson;
        });
    }

    // Get single delivery by ID
    async getDeliveryById(id: string): Promise<DeliveryPerson | null> {
        const docRef = doc(db, 'deliveries', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            birthDate: data.birthDate?.toDate() || new Date(),
            soatExpiryDate: data.soatExpiryDate?.toDate(),
            technicalReviewExpiryDate: data.technicalReviewExpiryDate?.toDate(),
            drivingLicenseExpiry: data.drivingLicenseExpiry?.toDate(),
            registerDate: data.registerDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        } as DeliveryPerson;
    }

    // Approve delivery
    async approveDelivery(id: string): Promise<void> {
        const docRef = doc(db, 'deliveries', id);
        await updateDoc(docRef, {
            isApproved: true,
            updatedAt: serverTimestamp()
        });
    }

    // Reject/Disapprove delivery
    async rejectDelivery(id: string): Promise<void> {
        const docRef = doc(db, 'deliveries', id);
        await updateDoc(docRef, {
            isApproved: false,
            isActive: false,
            updatedAt: serverTimestamp()
        });
    }

    // Update delivery data
    async updateDelivery(id: string, data: Partial<DeliveryPerson>): Promise<void> {
        const docRef = doc(db, 'deliveries', id);

        // Remove fields that shouldn't be updated directly
        const { id: _id, createdAt: _createdAt, ...updateData } = data;

        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
    }

    // Toggle delivery active status
    async toggleDeliveryActive(id: string, isActive: boolean): Promise<void> {
        const docRef = doc(db, 'deliveries', id);
        await updateDoc(docRef, {
            isActive,
            updatedAt: serverTimestamp()
        });
    }

    // ========================================
    // USERS (Clientes)
    // ========================================

    // Get all users with real-time updates
    subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
        const q = query(collection(db, 'users'), orderBy('registerDate', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const users: User[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    registerDate: data.registerDate?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as User;
            });
            callback(users);
        });
    }

    // Get all users (one-time fetch)
    async getAllUsers(): Promise<User[]> {
        const q = query(collection(db, 'users'), orderBy('registerDate', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                registerDate: data.registerDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as User;
        });
    }

    // Get single user by ID
    async getUserById(id: string): Promise<User | null> {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            registerDate: data.registerDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        } as User;
    }

    // Update user data
    async updateUser(id: string, data: Partial<User>): Promise<void> {
        const docRef = doc(db, 'users', id);

        // Remove fields that shouldn't be updated directly
        const { id: _id, createdAt: _createdAt, ...updateData } = data;

        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
    }

    // Toggle user active status
    async toggleUserActive(id: string, isActive: boolean): Promise<void> {
        const docRef = doc(db, 'users', id);
        await updateDoc(docRef, {
            isActive,
            updatedAt: serverTimestamp()
        });
    }

    // Toggle user preferential status
    async toggleUserPreferential(id: string, isPreferential: boolean): Promise<void> {
        const docRef = doc(db, 'users', id);
        await updateDoc(docRef, {
            isPreferential,
            updatedAt: serverTimestamp()
        });
    }
}

export const adminService = new AdminService();
export default adminService;