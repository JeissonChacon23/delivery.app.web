// src/components/Button/Button.tsx
// Button Component
// Componente de botón reutilizable con variantes

import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    accent?: 'user' | 'delivery' | 'admin';
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'md',
                                                  accent = 'user',
                                                  isLoading = false,
                                                  fullWidth = false,
                                                  children,
                                                  disabled,
                                                  className = '',
                                                  ...props
                                              }) => {
    const classNames = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        `btn--accent-${accent}`,
        fullWidth && 'btn--full-width',
        isLoading && 'btn--loading',
        disabled && 'btn--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="btn__loader">
          <span className="btn__loader-dot"></span>
          <span className="btn__loader-dot"></span>
          <span className="btn__loader-dot"></span>
        </span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;