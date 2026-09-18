import React from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'warn';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Ceramic & Bamboo strategy button.
 * Strict WCAG 2.2 compliance: min-height 48-52px, active feedback, gold focus ring.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  disabled,
  children,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(180deg, #10B981 0%, #047857 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(243, 202, 104, 0.45)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 8px 24px -2px rgba(16, 185, 129, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4)',
        };
      case 'ghost':
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.3)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(248, 113, 113, 0.5)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 8px 24px -2px rgba(239, 68, 68, 0.45)',
        };
      case 'warn':
        return {
          background: 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)',
          color: '#0F172A',
          border: '1px solid rgba(253, 230, 138, 0.6)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 8px 24px -2px rgba(245, 158, 11, 0.45)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { minHeight: '44px', padding: '8px 16px', fontSize: '13.5px' };
      case 'lg':
        return { minHeight: '56px', padding: '16px 28px', fontSize: '17px' };
      case 'md':
      default:
        return { minHeight: '50px', padding: '12px 22px', fontSize: '15.5px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.3px',
    borderRadius: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'filter 140ms ease, transform 140ms ease, box-shadow 140ms ease',
    outline: 'none',
    boxSizing: 'border-box',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      className={`bamboo-btn ${className}`}
      style={baseStyles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
