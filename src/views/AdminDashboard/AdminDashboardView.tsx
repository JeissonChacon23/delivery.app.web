// src/views/AdminDashboard/AdminDashboardView.tsx
// Admin Dashboard View
// Panel de administración con gestión de domiciliarios y usuarios

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { authService, adminService } from '../../services';
import {
    VEHICLE_TYPE_LABELS,
    BANK_ACCOUNT_TYPE_LABELS,
    DELIVERY_STATUS_LABELS
} from '../../models';
import type { User, DeliveryPerson, VehicleType } from '../../models';
import './AdminDashboardView.css';

// Tab types
type TabType = 'deliveries' | 'users';

// Filter types
interface DeliveryFilters {
    search: string;
    status: 'all' | 'pending' | 'approved' | 'rejected';
    vehicleType: 'all' | VehicleType;
}

interface UserFilters {
    search: string;
    status: 'all' | 'active' | 'inactive';
    preferential: 'all' | 'yes' | 'no';
}

// Icons
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const DeliveryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

// Helper function to format dates
const formatDate = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

const formatDateTime = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const AdminDashboardView: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [activeTab, setActiveTab] = useState<TabType>('deliveries');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [deliveries, setDeliveries] = useState<DeliveryPerson[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Detail view state
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryPerson | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<DeliveryPerson | User>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Filters
    const [deliveryFilters, setDeliveryFilters] = useState<DeliveryFilters>({
        search: '',
        status: 'all',
        vehicleType: 'all'
    });

    const [userFilters, setUserFilters] = useState<UserFilters>({
        search: '',
        status: 'all',
        preferential: 'all'
    });

    // Subscribe to real-time data
    useEffect(() => {
        setIsLoading(true);

        const unsubDeliveries = adminService.subscribeToDeliveries((data) => {
            setDeliveries(data);
            setIsLoading(false);
        });

        const unsubUsers = adminService.subscribeToUsers((data) => {
            setUsers(data);
        });

        return () => {
            unsubDeliveries();
            unsubUsers();
        };
    }, []);

    // Filtered deliveries
    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(delivery => {
            // Search filter
            const searchLower = deliveryFilters.search.toLowerCase();
            const matchesSearch = !searchLower ||
                delivery.firstName.toLowerCase().includes(searchLower) ||
                delivery.lastName.toLowerCase().includes(searchLower) ||
                delivery.idCard.includes(searchLower) ||
                delivery.email.toLowerCase().includes(searchLower) ||
                delivery.phone.includes(searchLower);

            // Status filter
            let matchesStatus = true;
            if (deliveryFilters.status === 'pending') {
                matchesStatus = !delivery.isApproved && delivery.isActive;
            } else if (deliveryFilters.status === 'approved') {
                matchesStatus = delivery.isApproved;
            } else if (deliveryFilters.status === 'rejected') {
                matchesStatus = !delivery.isApproved && !delivery.isActive;
            }

            // Vehicle type filter
            const matchesVehicle = deliveryFilters.vehicleType === 'all' ||
                delivery.vehicleType === deliveryFilters.vehicleType;

            return matchesSearch && matchesStatus && matchesVehicle;
        });
    }, [deliveries, deliveryFilters]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search filter
            const searchLower = userFilters.search.toLowerCase();
            const matchesSearch = !searchLower ||
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                user.idCard.includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.phone.includes(searchLower);

            // Status filter
            let matchesStatus = true;
            if (userFilters.status === 'active') {
                matchesStatus = user.isActive;
            } else if (userFilters.status === 'inactive') {
                matchesStatus = !user.isActive;
            }

            // Preferential filter
            let matchesPreferential = true;
            if (userFilters.preferential === 'yes') {
                matchesPreferential = user.isPreferential;
            } else if (userFilters.preferential === 'no') {
                matchesPreferential = !user.isPreferential;
            }

            return matchesSearch && matchesStatus && matchesPreferential;
        });
    }, [users, userFilters]);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await authService.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }, [navigate]);

    // Handle tab change
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
        setSelectedDelivery(null);
        setSelectedUser(null);
        setIsEditing(false);
    }, []);

    // Handle view delivery detail
    const handleViewDelivery = useCallback((delivery: DeliveryPerson) => {
        setSelectedDelivery(delivery);
        setIsEditing(false);
        setEditData({});
    }, []);

    // Handle view user detail
    const handleViewUser = useCallback((user: User) => {
        setSelectedUser(user);
        setIsEditing(false);
        setEditData({});
    }, []);

    // Handle back to list
    const handleBackToList = useCallback(() => {
        setSelectedDelivery(null);
        setSelectedUser(null);
        setIsEditing(false);
        setEditData({});
    }, []);

    // Handle edit mode
    const handleStartEdit = useCallback(() => {
        if (selectedDelivery) {
            setEditData({ ...selectedDelivery });
        } else if (selectedUser) {
            setEditData({ ...selectedUser });
        }
        setIsEditing(true);
    }, [selectedDelivery, selectedUser]);

    // Handle cancel edit
    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditData({});
    }, []);

    // Handle save edit
    const handleSaveEdit = useCallback(async () => {
        setIsSaving(true);
        try {
            if (selectedDelivery && editData) {
                await adminService.updateDelivery(selectedDelivery.id, editData as Partial<DeliveryPerson>);
                const updated = await adminService.getDeliveryById(selectedDelivery.id);
                if (updated) setSelectedDelivery(updated);
            } else if (selectedUser && editData) {
                await adminService.updateUser(selectedUser.id, editData as Partial<User>);
                const updated = await adminService.getUserById(selectedUser.id);
                if (updated) setSelectedUser(updated);
            }
            setIsEditing(false);
            setEditData({});
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    }, [selectedDelivery, selectedUser, editData]);

    // Handle approve delivery
    const handleApproveDelivery = useCallback(async (id: string) => {
        try {
            await adminService.approveDelivery(id);
            if (selectedDelivery?.id === id) {
                const updated = await adminService.getDeliveryById(id);
                if (updated) setSelectedDelivery(updated);
            }
        } catch (error) {
            console.error('Error approving:', error);
            alert('Error al aprobar el domiciliario');
        }
    }, [selectedDelivery]);

    // Handle reject delivery
    const handleRejectDelivery = useCallback(async (id: string) => {
        if (!confirm('¿Estás seguro de rechazar este domiciliario?')) return;
        try {
            await adminService.rejectDelivery(id);
            if (selectedDelivery?.id === id) {
                const updated = await adminService.getDeliveryById(id);
                if (updated) setSelectedDelivery(updated);
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Error al rechazar el domiciliario');
        }
    }, [selectedDelivery]);

    // Handle toggle user active
    const handleToggleUserActive = useCallback(async (id: string, isActive: boolean) => {
        try {
            await adminService.toggleUserActive(id, !isActive);
            if (selectedUser?.id === id) {
                const updated = await adminService.getUserById(id);
                if (updated) setSelectedUser(updated);
            }
        } catch (error) {
            console.error('Error toggling active:', error);
            alert('Error al cambiar el estado del usuario');
        }
    }, [selectedUser]);

    // Handle toggle user preferential
    const handleToggleUserPreferential = useCallback(async (id: string, isPreferential: boolean) => {
        try {
            await adminService.toggleUserPreferential(id, !isPreferential);
            if (selectedUser?.id === id) {
                const updated = await adminService.getUserById(id);
                if (updated) setSelectedUser(updated);
            }
        } catch (error) {
            console.error('Error toggling preferential:', error);
            alert('Error al cambiar el estado preferencial');
        }
    }, [selectedUser]);

    // Handle edit input change
    const handleEditChange = useCallback((field: string, value: string | boolean | number) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Render delivery status badge
    const renderDeliveryStatus = (delivery: DeliveryPerson) => {
        if (delivery.isApproved) {
            return <span className="status-badge status-badge--approved">Aprobado</span>;
        } else if (!delivery.isActive) {
            return <span className="status-badge status-badge--rejected">Rechazado</span>;
        } else {
            return <span className="status-badge status-badge--pending">Pendiente</span>;
        }
    };

    // Render user status badge
    const renderUserStatus = (user: User) => {
        return user.isActive
            ? <span className="status-badge status-badge--approved">Activo</span>
            : <span className="status-badge status-badge--rejected">Inactivo</span>;
    };

    // Stats
    const stats = useMemo(() => ({
        totalDeliveries: deliveries.length,
        pendingDeliveries: deliveries.filter(d => !d.isApproved && d.isActive).length,
        approvedDeliveries: deliveries.filter(d => d.isApproved).length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        preferentialUsers: users.filter(u => u.isPreferential).length
    }), [deliveries, users]);

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header__left">
                    <button
                        className="admin-header__menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menú"
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                    <div className="admin-header__logo">
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
                        <span>Virtual VR</span>
                    </div>
                </div>

                {/* Desktop Tabs */}
                <nav className="admin-header__tabs">
                    <button
                        className={`admin-header__tab ${activeTab === 'deliveries' ? 'admin-header__tab--active' : ''}`}
                        onClick={() => handleTabChange('deliveries')}
                    >
                        <DeliveryIcon />
                        <span>Domiciliarios</span>
                        {stats.pendingDeliveries > 0 && (
                            <span className="admin-header__badge">{stats.pendingDeliveries}</span>
                        )}
                    </button>
                    <button
                        className={`admin-header__tab ${activeTab === 'users' ? 'admin-header__tab--active' : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        <UsersIcon />
                        <span>Usuarios</span>
                    </button>
                </nav>

                <div className="admin-header__right">
                    <button className="admin-header__logout" onClick={handleLogout}>
                        <LogoutIcon />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`admin-mobile-menu ${isMobileMenuOpen ? 'admin-mobile-menu--open' : ''}`}>
                <nav className="admin-mobile-menu__nav">
                    <button
                        className={`admin-mobile-menu__item ${activeTab === 'deliveries' ? 'admin-mobile-menu__item--active' : ''}`}
                        onClick={() => handleTabChange('deliveries')}
                    >
                        <DeliveryIcon />
                        <span>Domiciliarios</span>
                        {stats.pendingDeliveries > 0 && (
                            <span className="admin-header__badge">{stats.pendingDeliveries}</span>
                        )}
                    </button>
                    <button
                        className={`admin-mobile-menu__item ${activeTab === 'users' ? 'admin-mobile-menu__item--active' : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        <UsersIcon />
                        <span>Usuarios</span>
                    </button>
                </nav>
                <button className="admin-mobile-menu__logout" onClick={handleLogout}>
                    <LogoutIcon />
                    <span>Cerrar Sesión</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="admin-main">
                {isLoading ? (
                    <div className="admin-loading">
                        <div className="admin-loading__spinner" />
                        <p>Cargando datos...</p>
                    </div>
                ) : (
                    <>
                        {/* Deliveries Tab */}
                        {activeTab === 'deliveries' && !selectedDelivery && (
                            <div className="admin-section">
                                {/* Stats */}
                                <div className="admin-stats">
                                    <div className="admin-stat">
                                        <span className="admin-stat__value">{stats.totalDeliveries}</span>
                                        <span className="admin-stat__label">Total</span>
                                    </div>
                                    <div className="admin-stat admin-stat--pending">
                                        <span className="admin-stat__value">{stats.pendingDeliveries}</span>
                                        <span className="admin-stat__label">Pendientes</span>
                                    </div>
                                    <div className="admin-stat admin-stat--approved">
                                        <span className="admin-stat__value">{stats.approvedDeliveries}</span>
                                        <span className="admin-stat__label">Aprobados</span>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="admin-filters">
                                    <div className="admin-filters__search">
                                        <SearchIcon />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, cédula, email..."
                                            value={deliveryFilters.search}
                                            onChange={(e) => setDeliveryFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                    </div>
                                    <select
                                        value={deliveryFilters.status}
                                        onChange={(e) => setDeliveryFilters(prev => ({ ...prev, status: e.target.value as DeliveryFilters['status'] }))}
                                        className="admin-filters__select"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="pending">Pendientes</option>
                                        <option value="approved">Aprobados</option>
                                        <option value="rejected">Rechazados</option>
                                    </select>
                                    <select
                                        value={deliveryFilters.vehicleType}
                                        onChange={(e) => setDeliveryFilters(prev => ({ ...prev, vehicleType: e.target.value as DeliveryFilters['vehicleType'] }))}
                                        className="admin-filters__select"
                                    >
                                        <option value="all">Todos los vehículos</option>
                                        <option value="motorcycle">Motocicleta</option>
                                        <option value="bicycle">Bicicleta</option>
                                        <option value="car">Automóvil</option>
                                        <option value="scooter">Scooter</option>
                                    </select>
                                </div>

                                {/* Table */}
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                            <th>Teléfono</th>
                                            <th>Vehículo</th>
                                            <th>Placa</th>
                                            <th>Estado</th>
                                            <th>Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredDeliveries.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="admin-table__empty">
                                                    No se encontraron domiciliarios
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDeliveries.map(delivery => (
                                                <tr key={delivery.id}>
                                                    <td>
                                                        <div className="admin-table__name">
                                                            {delivery.firstName} {delivery.lastName}
                                                        </div>
                                                        <div className="admin-table__email">{delivery.email}</div>
                                                    </td>
                                                    <td>{delivery.idCard}</td>
                                                    <td>{delivery.phone}</td>
                                                    <td>{VEHICLE_TYPE_LABELS[delivery.vehicleType]}</td>
                                                    <td><span className="admin-table__plate">{delivery.vehiclePlate}</span></td>
                                                    <td>{renderDeliveryStatus(delivery)}</td>
                                                    <td>{formatDate(delivery.registerDate)}</td>
                                                    <td>
                                                        <div className="admin-table__actions">
                                                            <button
                                                                className="admin-table__action admin-table__action--view"
                                                                onClick={() => handleViewDelivery(delivery)}
                                                                title="Ver detalle"
                                                            >
                                                                <EyeIcon />
                                                            </button>
                                                            {!delivery.isApproved && delivery.isActive && (
                                                                <>
                                                                    <button
                                                                        className="admin-table__action admin-table__action--approve"
                                                                        onClick={() => handleApproveDelivery(delivery.id)}
                                                                        title="Aprobar"
                                                                    >
                                                                        <CheckIcon />
                                                                    </button>
                                                                    <button
                                                                        className="admin-table__action admin-table__action--reject"
                                                                        onClick={() => handleRejectDelivery(delivery.id)}
                                                                        title="Rechazar"
                                                                    >
                                                                        <XIcon />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Delivery Detail */}
                        {activeTab === 'deliveries' && selectedDelivery && (
                            <div className="admin-detail">
                                <div className="admin-detail__header">
                                    <button className="admin-detail__back" onClick={handleBackToList}>
                                        <BackIcon />
                                        <span>Volver a la lista</span>
                                    </button>
                                    <div className="admin-detail__actions">
                                        {!isEditing ? (
                                            <Button variant="outline" size="sm" accent="admin" onClick={handleStartEdit}>
                                                <EditIcon />
                                                Editar
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                    Cancelar
                                                </Button>
                                                <Button variant="primary" size="sm" accent="admin" onClick={handleSaveEdit} isLoading={isSaving}>
                                                    Guardar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-detail__content">
                                    {/* Status and Quick Actions */}
                                    <div className="admin-detail__status-bar">
                                        <div className="admin-detail__status">
                                            {renderDeliveryStatus(selectedDelivery)}
                                            <span className="admin-detail__status-label">
                        {DELIVERY_STATUS_LABELS[selectedDelivery.status]}
                      </span>
                                        </div>
                                        {!selectedDelivery.isApproved && selectedDelivery.isActive && (
                                            <div className="admin-detail__quick-actions">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    accent="user"
                                                    onClick={() => handleApproveDelivery(selectedDelivery.id)}
                                                >
                                                    <CheckIcon />
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRejectDelivery(selectedDelivery.id)}
                                                >
                                                    <XIcon />
                                                    Rechazar
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sections */}
                                    <div className="admin-detail__sections">
                                        {/* Personal Info */}
                                        <section className="admin-detail__section">
                                            <h3>Información Personal</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Nombre</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as DeliveryPerson).firstName || ''}
                                                            onChange={(e) => handleEditChange('firstName', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedDelivery.firstName}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Apellido</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as DeliveryPerson).lastName || ''}
                                                            onChange={(e) => handleEditChange('lastName', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedDelivery.lastName}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Cédula</label>
                                                    <span>{selectedDelivery.idCard}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Email</label>
                                                    <span>{selectedDelivery.email}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Teléfono</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as DeliveryPerson).phone || ''}
                                                            onChange={(e) => handleEditChange('phone', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedDelivery.phone}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Fecha de Nacimiento</label>
                                                    <span>{formatDate(selectedDelivery.birthDate)}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Tipo de Sangre</label>
                                                    <span>{selectedDelivery.bloodType}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Address */}
                                        <section className="admin-detail__section">
                                            <h3>Dirección</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field admin-detail__field--full">
                                                    <label>Dirección</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as DeliveryPerson).address || ''}
                                                            onChange={(e) => handleEditChange('address', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedDelivery.address}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Barrio</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as DeliveryPerson).neighborhood || ''}
                                                            onChange={(e) => handleEditChange('neighborhood', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedDelivery.neighborhood}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Ciudad</label>
                                                    <span>Cúcuta, Norte de Santander</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Emergency Contact */}
                                        <section className="admin-detail__section">
                                            <h3>Contacto de Emergencia</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Nombre</label>
                                                    <span>{selectedDelivery.emergencyContactName}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Teléfono</label>
                                                    <span>{selectedDelivery.emergencyContactPhone}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Vehicle Info */}
                                        <section className="admin-detail__section">
                                            <h3>Información del Vehículo</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Tipo</label>
                                                    <span>{VEHICLE_TYPE_LABELS[selectedDelivery.vehicleType]}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Placa</label>
                                                    <span className="admin-detail__plate">{selectedDelivery.vehiclePlate}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Marca</label>
                                                    <span>{selectedDelivery.vehicleBrand}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Modelo</label>
                                                    <span>{selectedDelivery.vehicleModel}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Color</label>
                                                    <span>{selectedDelivery.vehicleColor}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Vencimiento SOAT</label>
                                                    <span>{formatDate(selectedDelivery.soatExpiryDate)}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Vencimiento Técnico-Mecánica</label>
                                                    <span>{formatDate(selectedDelivery.technicalReviewExpiryDate)}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* License */}
                                        <section className="admin-detail__section">
                                            <h3>Licencia de Conducción</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Número</label>
                                                    <span>{selectedDelivery.drivingLicenseNumber}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Categoría</label>
                                                    <span>{selectedDelivery.drivingLicenseCategory}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Vencimiento</label>
                                                    <span>{formatDate(selectedDelivery.drivingLicenseExpiry)}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Bank Info */}
                                        <section className="admin-detail__section">
                                            <h3>Información Bancaria</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Banco</label>
                                                    <span>{selectedDelivery.bankName}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Tipo de Cuenta</label>
                                                    <span>{BANK_ACCOUNT_TYPE_LABELS[selectedDelivery.accountType]}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Número de Cuenta</label>
                                                    <span>{selectedDelivery.accountNumber}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Work Preferences */}
                                        <section className="admin-detail__section">
                                            <h3>Preferencias de Trabajo</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Acepta Mensajería</label>
                                                    <span>{selectedDelivery.acceptsMessaging ? 'Sí' : 'No'}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Acepta Mandados</label>
                                                    <span>{selectedDelivery.acceptsErrands ? 'Sí' : 'No'}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Acepta Transporte</label>
                                                    <span>{selectedDelivery.acceptsTransport ? 'Sí' : 'No'}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Distancia Máxima</label>
                                                    <span>{selectedDelivery.maxDeliveryDistance} km</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Statistics */}
                                        <section className="admin-detail__section">
                                            <h3>Estadísticas</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Total Entregas</label>
                                                    <span>{selectedDelivery.totalDeliveries}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Calificación</label>
                                                    <span>{selectedDelivery.rating.toFixed(1)} ⭐</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Ganancias Totales</label>
                                                    <span>${selectedDelivery.totalEarnings.toLocaleString('es-CO')}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Fecha de Registro</label>
                                                    <span>{formatDateTime(selectedDelivery.registerDate)}</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && !selectedUser && (
                            <div className="admin-section">
                                {/* Stats */}
                                <div className="admin-stats">
                                    <div className="admin-stat">
                                        <span className="admin-stat__value">{stats.totalUsers}</span>
                                        <span className="admin-stat__label">Total</span>
                                    </div>
                                    <div className="admin-stat admin-stat--approved">
                                        <span className="admin-stat__value">{stats.activeUsers}</span>
                                        <span className="admin-stat__label">Activos</span>
                                    </div>
                                    <div className="admin-stat admin-stat--preferential">
                                        <span className="admin-stat__value">{stats.preferentialUsers}</span>
                                        <span className="admin-stat__label">Preferenciales</span>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="admin-filters">
                                    <div className="admin-filters__search">
                                        <SearchIcon />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, cédula, email..."
                                            value={userFilters.search}
                                            onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                    </div>
                                    <select
                                        value={userFilters.status}
                                        onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value as UserFilters['status'] }))}
                                        className="admin-filters__select"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                    <select
                                        value={userFilters.preferential}
                                        onChange={(e) => setUserFilters(prev => ({ ...prev, preferential: e.target.value as UserFilters['preferential'] }))}
                                        className="admin-filters__select"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="yes">Preferenciales</option>
                                        <option value="no">No preferenciales</option>
                                    </select>
                                </div>

                                {/* Table */}
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                            <th>Teléfono</th>
                                            <th>Barrio</th>
                                            <th>Estado</th>
                                            <th>Preferencial</th>
                                            <th>Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="admin-table__empty">
                                                    No se encontraron usuarios
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="admin-table__name">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="admin-table__email">{user.email}</div>
                                                    </td>
                                                    <td>{user.idCard}</td>
                                                    <td>{user.phone}</td>
                                                    <td>{user.neighborhood}</td>
                                                    <td>{renderUserStatus(user)}</td>
                                                    <td>
                                                        {user.isPreferential && (
                                                            <span className="admin-table__preferential">
                                  <StarIcon /> VIP
                                </span>
                                                        )}
                                                    </td>
                                                    <td>{formatDate(user.registerDate)}</td>
                                                    <td>
                                                        <div className="admin-table__actions">
                                                            <button
                                                                className="admin-table__action admin-table__action--view"
                                                                onClick={() => handleViewUser(user)}
                                                                title="Ver detalle"
                                                            >
                                                                <EyeIcon />
                                                            </button>
                                                            <button
                                                                className={`admin-table__action ${user.isActive ? 'admin-table__action--reject' : 'admin-table__action--approve'}`}
                                                                onClick={() => handleToggleUserActive(user.id, user.isActive)}
                                                                title={user.isActive ? 'Desactivar' : 'Activar'}
                                                            >
                                                                {user.isActive ? <XIcon /> : <CheckIcon />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* User Detail */}
                        {activeTab === 'users' && selectedUser && (
                            <div className="admin-detail">
                                <div className="admin-detail__header">
                                    <button className="admin-detail__back" onClick={handleBackToList}>
                                        <BackIcon />
                                        <span>Volver a la lista</span>
                                    </button>
                                    <div className="admin-detail__actions">
                                        {!isEditing ? (
                                            <Button variant="outline" size="sm" accent="admin" onClick={handleStartEdit}>
                                                <EditIcon />
                                                Editar
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                    Cancelar
                                                </Button>
                                                <Button variant="primary" size="sm" accent="admin" onClick={handleSaveEdit} isLoading={isSaving}>
                                                    Guardar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-detail__content">
                                    {/* Status and Quick Actions */}
                                    <div className="admin-detail__status-bar">
                                        <div className="admin-detail__status">
                                            {renderUserStatus(selectedUser)}
                                            {selectedUser.isPreferential && (
                                                <span className="admin-detail__preferential-badge">
                          <StarIcon /> Cliente Preferencial
                        </span>
                                            )}
                                        </div>
                                        <div className="admin-detail__quick-actions">
                                            <Button
                                                variant={selectedUser.isActive ? 'outline' : 'primary'}
                                                size="sm"
                                                accent={selectedUser.isActive ? undefined : 'user'}
                                                onClick={() => handleToggleUserActive(selectedUser.id, selectedUser.isActive)}
                                            >
                                                {selectedUser.isActive ? <XIcon /> : <CheckIcon />}
                                                {selectedUser.isActive ? 'Desactivar' : 'Activar'}
                                            </Button>
                                            <Button
                                                variant={selectedUser.isPreferential ? 'outline' : 'primary'}
                                                size="sm"
                                                accent={selectedUser.isPreferential ? undefined : 'delivery'}
                                                onClick={() => handleToggleUserPreferential(selectedUser.id, selectedUser.isPreferential)}
                                            >
                                                <StarIcon />
                                                {selectedUser.isPreferential ? 'Quitar VIP' : 'Hacer VIP'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div className="admin-detail__sections">
                                        {/* Personal Info */}
                                        <section className="admin-detail__section">
                                            <h3>Información Personal</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Nombre</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as User).firstName || ''}
                                                            onChange={(e) => handleEditChange('firstName', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedUser.firstName}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Apellido</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as User).lastName || ''}
                                                            onChange={(e) => handleEditChange('lastName', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedUser.lastName}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Cédula</label>
                                                    <span>{selectedUser.idCard}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Email</label>
                                                    <span>{selectedUser.email}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Teléfono</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as User).phone || ''}
                                                            onChange={(e) => handleEditChange('phone', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedUser.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </section>

                                        {/* Address */}
                                        <section className="admin-detail__section">
                                            <h3>Dirección</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field admin-detail__field--full">
                                                    <label>Dirección</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as User).address || ''}
                                                            onChange={(e) => handleEditChange('address', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedUser.address}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Barrio</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={(editData as User).neighborhood || ''}
                                                            onChange={(e) => handleEditChange('neighborhood', e.target.value)}
                                                        />
                                                    ) : (
                                                        <span>{selectedUser.neighborhood}</span>
                                                    )}
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Ciudad</label>
                                                    <span>Cúcuta, Norte de Santander</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Account Info */}
                                        <section className="admin-detail__section">
                                            <h3>Información de Cuenta</h3>
                                            <div className="admin-detail__grid">
                                                <div className="admin-detail__field">
                                                    <label>Estado</label>
                                                    <span>{selectedUser.isActive ? 'Activo' : 'Inactivo'}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Cliente Preferencial</label>
                                                    <span>{selectedUser.isPreferential ? 'Sí' : 'No'}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Fecha de Registro</label>
                                                    <span>{formatDateTime(selectedUser.registerDate)}</span>
                                                </div>
                                                <div className="admin-detail__field">
                                                    <label>Última Actualización</label>
                                                    <span>{formatDateTime(selectedUser.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardView;