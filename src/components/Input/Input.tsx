// src/components/Input/Input.tsx
// Input Component
// Componente de input reutilizable con estados y validación

import React, { useState } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    accent?: 'user' | 'delivery' | 'admin';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                helperText,
                                                accent = 'user',
                                                icon,
                                                iconPosition = 'left',
                                                fullWidth = false,
                                                type = 'text',
                                                className = '',
                                                id,
                                                ...props
                                            }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const containerClasses = [
        'input-container',
        `input-container--accent-${accent}`,
        fullWidth && 'input-container--full-width',
        error && 'input-container--error',
        isFocused && 'input-container--focused',
        icon && `input-container--icon-${iconPosition}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}

            <div className="input-wrapper">
                {icon && iconPosition === 'left' && (
                    <span className="input-icon input-icon--left">{icon}</span>
                )}

                <input
                    id={inputId}
                    type={inputType}
                    className="input-field"
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        className="input-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}

                {icon && iconPosition === 'right' && !isPassword && (
                    <span className="input-icon input-icon--right">{icon}</span>
                )}
            </div>

            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper--error' : ''}`}>
          {error || helperText}
        </span>
            )}
        </div>
    );
};

export default Input;