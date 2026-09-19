import React from 'react';

export type StatusPillTone = 'locked' | 'draft' | 'none' | 'active' | 'neutral';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusPillTone;
  children: React.ReactNode;
}

/**
 * Tactical status pill for round state, group vote status, and phase indicators.
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  tone = 'neutral',
  className = '',
  style,
  children,
  ...props
}) => {
  const getToneStyles = (): React.CSSProperties => {
    switch (tone) {
      case 'locked':
        return {
          color: '#86EFAC',
          borderColor: 'rgba(74, 222, 128, 0.50)',
          background: 'rgba(34, 197, 94, 0.15)',
        };
      case 'draft':
        return {
          color: '#FDE047',
          borderColor: 'rgba(243, 202, 104, 0.50)',
          background: 'rgba(243, 202, 104, 0.14)',
        };
      case 'none':
        return {
          color: '#FCA5A5',
          borderColor: 'rgba(248, 113, 113, 0.50)',
          background: 'rgba(239, 68, 68, 0.15)',
        };
      case 'active':
        return {
          color: '#091410',
          background: 'linear-gradient(180deg, #F3CA68 0%, #D97706 100%)',
          borderColor: '#F3CA68',
          fontWeight: 750,
          boxShadow: '0 0 10px rgba(243, 202, 104, 0.35)',
        };
      case 'neutral':
      default:
        return {
          color: '#CBD5E1',
          borderColor: 'rgba(255, 255, 255, 0.16)',
          background: 'rgba(255, 255, 255, 0.05)',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", "Space Mono", monospace',
    fontSize: '11px',
    fontWeight: 650,
    letterSpacing: '1px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    ...getToneStyles(),
    ...style,
  };

  return (
    <span className={`bamboo-pill ${className}`} style={baseStyles} {...props}>
      {children}
    </span>
  );
};
