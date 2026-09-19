import React from 'react';

export type IconName = 'autonomy' | 'economy' | 'prestige' | 'timer' | 'lock' | 'allin' | 'reveal';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Custom line iconography for The Bamboo Diplomat.
 * Derived from design/icons/icon-set.svg.
 * Zero emoji · Zero stock icons · Vector precision 1.4 stroke
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#D8B46D',
  strokeWidth = 1.4,
  className = '',
  ...props
}) => {
  const renderPaths = () => {
    switch (name) {
      case 'autonomy':
        return (
          <>
            <path d="M0 -22 L18 -6 L12 18 L-12 18 L-18 -6 Z" />
            <circle r="4" />
          </>
        );
      case 'economy':
        return (
          <>
            <path d="M-22 12 L-8 -2 L2 6 L20 -14" />
            <path d="M14 -14 L22 -14 L22 -6" />
            <line x1="-22" y1="20" x2="22" y2="20" />
          </>
        );
      case 'prestige':
        return (
          <>
            <circle r="18" />
            <path d="M-12 -4 L-4 6 L12 -8" />
          </>
        );
      case 'timer':
        return (
          <>
            <circle r="18" />
            <line x1="0" y1="0" x2="0" y2="-12" />
            <line x1="0" y1="0" x2="10" y2="4" />
          </>
        );
      case 'lock':
        return (
          <>
            <rect x="-14" y="-4" width="28" height="20" rx="3" />
            <path d="M-8 -4 V-12 A8 8 0 0 1 8 -12 V-4" />
          </>
        );
      case 'allin':
        return (
          <>
            <path d="M-16 16 L0 -16 L16 16 Z" />
            <line x1="-8" y1="6" x2="8" y2="6" />
          </>
        );
      case 'reveal':
        return (
          <>
            <path d="M-18 0 C -10 -12 10 -12 18 0 C 10 12 -10 12 -18 0 Z" />
            <circle r="4" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="-28 -28 56 56"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={`icon-${name}`}
      className={className}
      {...props}
    >
      {renderPaths()}
    </svg>
  );
};
