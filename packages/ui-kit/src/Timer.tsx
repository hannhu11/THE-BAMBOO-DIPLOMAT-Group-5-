import React from 'react';

export interface TimerProps extends React.HTMLAttributes<HTMLDivElement> {
  secondsLeft: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Real-time countdown timer.
 * High-visibility monospace display with urgent warning aura when remaining time is critical (<= 10s).
 */
export const Timer: React.FC<TimerProps> = ({
  secondsLeft,
  size = 'md',
  showLabel = true,
  className = '',
  style,
  ...props
}) => {
  const mins = Math.floor(Math.max(0, secondsLeft) / 60);
  const secs = Math.max(0, secondsLeft) % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 10 && secondsLeft > 0;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: '15px', letterSpacing: '1px' };
      case 'lg':
        return { fontSize: '48px', letterSpacing: '2px' };
      case 'md':
      default:
        return { fontSize: '20px', letterSpacing: '1.5px' };
    }
  };

  const containerStyles: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", "Space Mono", monospace',
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '6px',
    fontWeight: 700,
    color: isUrgent ? '#EF4444' : '#F3CA68',
    textShadow: isUrgent
      ? '0 0 16px rgba(239, 68, 68, 0.85), 0 0 4px #FFFFFF'
      : '0 0 12px rgba(243, 202, 104, 0.4)',
    transition: 'color 200ms ease, text-shadow 200ms ease',
    ...getSizeStyles(),
    ...style,
  };

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`bamboo-timer ${isUrgent ? 'urgent' : ''} ${className}`}
      style={containerStyles}
      {...props}
    >
      <span>{formatted}</span>
      {showLabel && (
        <small
          style={{
            fontSize: size === 'lg' ? '14px' : '10.5px',
            color: '#94A3B8',
            letterSpacing: '1.6px',
            fontWeight: 600,
          }}
        >
          REMAIN
        </small>
      )}
    </div>
  );
};
