import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  active?: boolean;
}

/**
 * Ceramic Badge for Option Letters (A / B / C) or Rank labels.
 */
export const Badge: React.FC<BadgeProps> = ({
  active = false,
  className = '',
  style,
  children,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: '10px',
    background: active
      ? 'linear-gradient(180deg, #246B52 0%, #124031 100%)'
      : 'linear-gradient(180deg, #172D24 0%, #0E1C16 100%)',
    color: active ? '#FFFFFF' : '#F3CA68',
    display: 'inline-grid',
    placeItems: 'center',
    fontFamily: '"IBM Plex Mono", "Space Mono", monospace',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.5px',
    border: active
      ? '1.5px solid #F3CA68'
      : '1px solid rgba(243, 202, 104, 0.45)',
    boxShadow: active
      ? '0 0 14px rgba(243, 202, 104, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 6px rgba(0, 0, 0, 0.35)',
    boxSizing: 'border-box',
    transition: 'all 180ms ease',
    ...style,
  };

  return (
    <span className={`bamboo-badge ${className}`} style={baseStyles} {...props}>
      {children}
    </span>
  );
};
