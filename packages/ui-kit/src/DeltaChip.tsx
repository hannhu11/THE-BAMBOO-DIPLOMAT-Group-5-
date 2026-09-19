import React from 'react';

export type DeltaTrend = 'up' | 'down' | 'mid';

export interface DeltaChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  axis?: 'autonomy' | 'economy' | 'prestige';
  label: string;
  delta?: number;
  trend?: DeltaTrend;
}

/**
 * Tactical impact chip indicating consequences on the 3 strategic axes:
 * TỰ CHỦ (Autonomy), KINH TẾ (Economy), UY TÍN (Prestige).
 */
export const DeltaChip: React.FC<DeltaChipProps> = ({
  axis,
  label,
  delta,
  trend,
  className = '',
  style,
  ...props
}) => {
  // Infer trend if delta is provided and trend is not explicitly set
  const computedTrend: DeltaTrend =
    trend || (delta !== undefined ? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'mid') : 'mid');

  const getTrendStyles = (): React.CSSProperties => {
    switch (computedTrend) {
      case 'up':
        return {
          color: '#86EFAC',
          borderColor: 'rgba(74, 222, 128, 0.4)',
          background: 'rgba(34, 197, 94, 0.12)',
        };
      case 'down':
        return {
          color: '#FCA5A5',
          borderColor: 'rgba(248, 113, 113, 0.4)',
          background: 'rgba(239, 68, 68, 0.12)',
        };
      case 'mid':
      default:
        return {
          color: '#E2E8F0',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.05)',
        };
    }
  };

  const formattedValue =
    delta !== undefined ? (delta > 0 ? `+${delta}` : delta === 0 ? `±0` : `${delta}`) : '';

  const displayText = delta !== undefined ? `${label} ${formattedValue}` : label;

  const baseStyles: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", "Space Mono", monospace',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.8px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    ...getTrendStyles(),
    ...style,
  };

  return (
    <span className={`bamboo-delta-chip ${className}`} style={baseStyles} {...props}>
      {displayText}
    </span>
  );
};
