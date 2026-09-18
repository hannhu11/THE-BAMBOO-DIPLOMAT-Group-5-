import React from 'react';

export type PanelVariant = 'standard' | 'elevated' | 'danger' | 'dashed';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  children: React.ReactNode;
}

/**
 * Deep Lacquer & Smoke Panel
 * Conforms to Neo-Oriental Civic Strategy aesthetics with subtle inner glow and hairline borders.
 */
export const Panel: React.FC<PanelProps> = ({
  variant = 'standard',
  className = '',
  style,
  children,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          background: 'linear-gradient(180deg, rgba(26, 48, 39, 0.90) 0%, rgba(14, 26, 21, 0.95) 100%)',
          border: '1px solid rgba(243, 202, 104, 0.28)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(180deg, rgba(46, 20, 24, 0.90) 0%, rgba(24, 10, 12, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.50)',
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        };
      case 'dashed':
        return {
          background: 'linear-gradient(180deg, rgba(26, 36, 26, 0.85) 0%, rgba(14, 22, 16, 0.90) 100%)',
          border: '1.5px dashed rgba(243, 202, 104, 0.55)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.30)',
        };
      case 'standard':
      default:
        return {
          background: 'linear-gradient(180deg, rgba(22, 38, 32, 0.78) 0%, rgba(12, 22, 18, 0.90) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: '22px',
    padding: '20px',
    color: '#FFFFFF',
    position: 'relative',
    boxSizing: 'border-box',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <div className={`bamboo-panel ${className}`} style={baseStyles} {...props}>
      {children}
    </div>
  );
};
