// src/components/RoleCard/RoleCard.tsx
// RoleCard Component
// Componente de tarjeta para selección de rol/perfil

import React from 'react';
import type { UserRole } from '../../models';
import './RoleCard.css';

export interface RoleCardProps {
    role: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    isSelected?: boolean;
    onClick: (role: UserRole) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
                                                      role,
                                                      title,
                                                      description,
                                                      icon,
                                                      isSelected = false,
                                                      onClick
                                                  }) => {
    const classNames = [
        'role-card',
        `role-card--${role}`,
        isSelected && 'role-card--selected'
    ].filter(Boolean).join(' ');

    return (
        <button
            type="button"
            className={classNames}
            onClick={() => onClick(role)}
            aria-pressed={isSelected}
        >
            <div className="role-card__glow" />
            <div className="role-card__content">
                <div className="role-card__icon">
                    {icon}
                </div>
                <h3 className="role-card__title">{title}</h3>
                <p className="role-card__description">{description}</p>
            </div>
            <div className="role-card__indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6" />
                </svg>
            </div>
        </button>
    );
};

export default RoleCard;