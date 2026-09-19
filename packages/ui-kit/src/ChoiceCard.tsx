import React from 'react';
import { Badge } from './Badge';
import { audioEngine } from './AudioEngine';

export interface ChoiceImpact {
  label: string;
  delta: number;
  trend?: 'up' | 'down' | 'mid';
}

export interface ChoiceCardProps {
  letter: string;
  title: string;
  description: string;
  impacts?: ChoiceImpact[];
  selected?: boolean;
  locked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Imperial Diplomatic Decree (Sắc Lệnh Ngoại Giao Sơn Mài).
 * Replaces generic form radio buttons with high-prestige ceremonial decisions.
 */
export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  letter,
  title,
  description,
  impacts = [],
  selected = false,
  locked = false,
  disabled = false,
  onClick,
  className = '',
  style,
}) => {
  const getTrendColor = (trend?: 'up' | 'down' | 'mid', delta?: number) => {
    const t = trend || (delta !== undefined ? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'mid') : 'mid');
    if (t === 'up') return { color: '#86EFAC', borderColor: 'rgba(74, 222, 128, 0.45)', background: 'rgba(34, 197, 94, 0.14)' };
    if (t === 'down') return { color: '#FCA5A5', borderColor: 'rgba(248, 113, 113, 0.45)', background: 'rgba(239, 68, 68, 0.14)' };
    return { color: '#E2E8F0', borderColor: 'rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.05)' };
  };

  const handleClick = () => {
    if (disabled || locked) return;
    audioEngine.playClick();
    onClick?.();
  };

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    border: selected
      ? '1.5px solid #F3CA68'
      : '1px solid rgba(230, 223, 202, 0.12)',
    background: selected
      ? 'linear-gradient(180deg, rgba(28, 52, 43, 0.96) 0%, rgba(16, 29, 24, 0.98) 100%)'
      : 'linear-gradient(180deg, rgba(22, 36, 30, 0.88) 0%, rgba(13, 22, 18, 0.94) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px',
    padding: '16px',
    minHeight: '108px',
    display: 'grid',
    gridTemplateColumns: '36px 1fr 28px',
    gap: '14px',
    alignItems: 'start',
    cursor: disabled || locked ? 'default' : 'pointer',
    opacity: locked ? 0.85 : disabled ? 0.45 : 1,
    boxShadow: selected
      ? '0 0 0 1px #F3CA68, 0 12px 36px -4px rgba(243, 202, 104, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
      : '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    transition: 'all 180ms cubic-bezier(.22,.61,.36,1)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`bamboo-choice-card ${selected ? 'selected' : ''} ${className}`}
      style={cardStyles}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!disabled && !locked && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Subtle corner lacquer accent */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #F3CA68, transparent)',
          }}
        />
      )}

      <Badge active={selected}>{letter}</Badge>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
            fontFamily: '"Be Vietnam Pro", sans-serif',
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '13.5px',
            color: '#CBD5E1',
            lineHeight: 1.5,
            fontWeight: 450,
          }}
        >
          {description}
        </p>

        {impacts.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {impacts.map((imp, idx) => {
              const styles = getTrendColor(imp.trend, imp.delta);
              const sign = imp.delta > 0 ? `+${imp.delta}` : imp.delta === 0 ? '±0' : `${imp.delta}`;
              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '999px',
                    border: `1px solid ${styles.borderColor}`,
                    color: styles.color,
                    background: styles.background,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ opacity: 0.85, fontSize: '10px' }}>{imp.label}</span>
                  <span>{sign}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Diplomatic Selection Seal Emblem (No cheap radio button) */}
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          border: selected ? '1.5px solid #F3CA68' : '1px solid rgba(255, 255, 255, 0.2)',
          background: selected
            ? 'linear-gradient(180deg, #8E6A24 0%, #5C4314 100%)'
            : 'rgba(255, 255, 255, 0.04)',
          boxShadow: selected ? '0 0 12px rgba(243, 202, 104, 0.4)' : 'none',
          display: 'grid',
          placeItems: 'center',
          marginTop: '2px',
          transition: 'all 160ms ease',
        }}
      >
        {selected ? (
          <span style={{ color: '#F3EEDC', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
        ) : (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} />
        )}
      </div>
    </div>
  );
};
