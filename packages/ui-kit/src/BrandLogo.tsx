import React from 'react';

export interface BrandLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogoMark: React.FC<BrandLogoProps> = ({
  size = 48,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 240 240"
    role="img"
    aria-label="The Bamboo Diplomat mark"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="blm_bambooBlade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#68A98F" />
        <stop offset="1" stopColor="#1C5C47" />
      </linearGradient>
      <linearGradient id="blm_goldRing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F0DFB6" />
        <stop offset=".5" stopColor="#B88A33" />
        <stop offset="1" stopColor="#5C4416" />
      </linearGradient>
      <radialGradient id="blm_ink" cx=".5" cy=".5" r=".7">
        <stop offset="0" stopColor="#0F3628" />
        <stop offset="1" stopColor="#050807" />
      </radialGradient>
    </defs>

    {/* Ceremonial disc */}
    <circle cx="120" cy="120" r="112" fill="url(#blm_ink)" />
    <circle cx="120" cy="120" r="110" fill="none" stroke="url(#blm_goldRing)" strokeWidth="1.6" opacity=".95" />
    <circle cx="120" cy="120" r="94" fill="none" stroke="#B88A33" strokeWidth=".8" opacity=".4" />

    {/* Three axes tick marks (Autonomy / Economy / Prestige) */}
    <g stroke="#D8B46D" strokeWidth="1.2" opacity=".7">
      <line x1="120" y1="12" x2="120" y2="26" />
      <line x1="218" y1="168" x2="206" y2="161" />
      <line x1="22" y1="168" x2="34" y2="161" />
    </g>

    {/* Bamboo culm — three internodes, rising */}
    <g transform="translate(120 200)">
      {/* culm */}
      <rect x="-9" y="-160" width="18" height="160" rx="6" fill="url(#blm_bambooBlade)" />
      {/* internode rings */}
      <g fill="#0F3628" stroke="#D8B46D" strokeWidth=".9">
        <rect x="-11" y="-52" width="22" height="4.5" rx="1.8" />
        <rect x="-11" y="-100" width="22" height="4.5" rx="1.8" />
        <rect x="-11" y="-148" width="22" height="4.5" rx="1.8" />
      </g>
      {/* left leaf */}
      <path d="M-8 -128 C -60 -140 -78 -108 -30 -96 C -50 -110 -30 -122 -8 -122 Z" fill="#2F7D62" />
      {/* right leaf */}
      <path d="M8 -76 C 60 -90 80 -58 32 -46 C 52 -60 32 -70 8 -70 Z" fill="#68A98F" />
      {/* roots */}
      <path
        d="M-14 0 C -22 -6 -30 -4 -34 4 M14 0 C 22 -6 30 -4 34 4 M0 0 C 0 -8 -6 -12 -8 -14 M0 0 C 0 -8 6 -12 8 -14"
        stroke="#8E6A24"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* Cardinal points */}
    <g fill="#D8B46D" opacity=".9">
      <circle cx="120" cy="12" r="2.5" />
      <circle cx="228" cy="120" r="2.5" />
      <circle cx="120" cy="228" r="2.5" />
      <circle cx="12" cy="120" r="2.5" />
    </g>
  </svg>
);

export interface BrandLogoLockupProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  subtitle?: string;
}

export const BrandLogoLockup: React.FC<BrandLogoLockupProps> = ({
  height = 46,
  className = '',
  style = {},
  subtitle = 'KỶ NGUYÊN ĐA CỰC · SITUATION ROOM',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        userSelect: 'none',
        ...style,
      }}
    >
      <BrandLogoMark size={height} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
            fontSize: height * 0.42,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#F3EEDC',
            lineHeight: 1.15,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          THE BAMBOO DIPLOMAT
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: height * 0.22,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#D8B46D',
            marginTop: 2,
            lineHeight: 1.2,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
