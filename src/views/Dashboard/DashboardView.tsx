// src/views/Dashboard/DashboardView.tsx
// Dashboard View
// Vista placeholder del dashboard - Se implementará más adelante

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import type { UserRole } from '../../models';
import { authService } from '../../services';
import './DashboardView.css';

// Role configurations
const ROLE_CONFIG: Record<UserRole, { title: string; color: string; accent: 'user' | 'delivery' | 'admin' }> = {
    user: {
        title: 'Cliente',
        color: 'var(--color-accent-user)',
        accent: 'user'
    },
    delivery: {
        title: 'Domiciliario',
        color: 'var(--color-accent-delivery)',
        accent: 'delivery'
    },
    admin: {
        title: 'Administrador',
        color: 'var(--color-accent-admin)',
        accent: 'admin'
    }
};

export const DashboardView: React.FC = () => {
    const { role } = useParams<{ role: UserRole }>();
    const navigate = useNavigate();

    const config = ROLE_CONFIG[role as UserRole] || ROLE_CONFIG.user;

    const handleLogout = async () => {
        try {
            await authService.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className={`dashboard dashboard--${config.accent}`}>
            <div className="dashboard__bg">
                <div className="dashboard__bg-gradient" />
            </div>

            <main className="dashboard__main">
                <div className="dashboard__container">
                    <div className="dashboard__welcome">
                        <div className="dashboard__icon" style={{ color: config.color }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>

                        <h1 className="dashboard__title">
                            ¡Bienvenido, {config.title}!
                        </h1>

                        <p className="dashboard__subtitle">
                            Has iniciado sesión correctamente. Esta sección está en desarrollo.
                        </p>

                        <div className="dashboard__info">
                            <div className="dashboard__info-card">
                                <span className="dashboard__info-label">Panel de Control</span>
                                <span className="dashboard__info-value" style={{ color: config.color }}>
                  {config.title}
                </span>
                            </div>
                            <div className="dashboard__info-card">
                                <span className="dashboard__info-label">Estado</span>
                                <span className="dashboard__info-value dashboard__info-value--success">
                  Activo
                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            accent={config.accent}
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardView;