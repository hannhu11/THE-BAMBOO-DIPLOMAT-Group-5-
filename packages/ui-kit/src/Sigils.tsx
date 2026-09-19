import React from 'react';

export const SigilWest: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 40,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Western Capital Bloc sigil"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="sigil_wg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#C7D3E5" />
        <stop offset="1" stopColor="#6B87B4" />
      </linearGradient>
      <pattern id="sigil_wgrid" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#6B87B4" strokeWidth=".5" opacity=".45" />
      </pattern>
    </defs>
    <circle cx="100" cy="100" r="94" fill="#0D1815" stroke="url(#sigil_wg)" strokeWidth="1.2" />
    <circle cx="100" cy="100" r="80" fill="url(#sigil_wgrid)" opacity=".55" />
    <g stroke="#C7D3E5" strokeWidth="1.4" fill="none">
      <line x1="60" y1="140" x2="140" y2="140" />
      <line x1="60" y1="60" x2="140" y2="60" />
      <line x1="72" y1="60" x2="72" y2="140" />
      <line x1="100" y1="60" x2="100" y2="140" />
      <line x1="128" y1="60" x2="128" y2="140" />
      <path d="M50 60 L100 30 L150 60" fill="none" />
      <path d="M56 148 L144 148" strokeWidth="2" />
    </g>
    <path d="M62 118 L80 106 L96 112 L114 92 L136 78" stroke="#F0DFB6" strokeWidth="1.6" fill="none" />
    <path d="M136 78 L128 82 M136 78 L132 88" stroke="#F0DFB6" strokeWidth="1.6" fill="none" />
    <text x="100" y="182" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="3" fill="#C7D3E5">
      WESTERN · CAPITAL
    </text>
  </svg>
);

export const SigilNeighbor: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 40,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Neighboring Power Bloc sigil"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="sigil_ng" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E8C2A6" />
        <stop offset="1" stopColor="#7A2A2E" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="#0D1815" stroke="url(#sigil_ng)" strokeWidth="1.2" />
    <g stroke="#E8C2A6" fill="none" opacity=".9">
      <path d="M20 100 A80 80 0 0 1 180 100" strokeWidth="1.4" />
      <path d="M32 100 A68 68 0 0 1 168 100" strokeWidth="1.0" opacity=".7" />
      <path d="M46 100 A54 54 0 0 1 154 100" strokeWidth=".8" opacity=".55" />
    </g>
    <g fill="none" stroke="#7A2A2E" strokeWidth="1.6">
      <polygon points="100,66 132,100 100,134 68,100" />
    </g>
    <g fill="#E8C2A6">
      <circle cx="100" cy="100" r="3.4" />
    </g>
    <g stroke="#E8C2A6" strokeWidth="1">
      <line x1="100" y1="26" x2="100" y2="38" />
      <line x1="26" y1="100" x2="38" y2="100" />
      <line x1="174" y1="100" x2="162" y2="100" />
      <line x1="100" y1="174" x2="100" y2="162" />
    </g>
    <text x="100" y="182" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="3" fill="#E8C2A6">
      NEIGHBORING · SECURITY
    </text>
  </svg>
);

export const SigilUN: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 40,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="International Law & UN Bloc sigil"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="sigil_ug" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#DAD6C4" />
        <stop offset="1" stopColor="#5F7284" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="#0D1815" stroke="url(#sigil_ug)" strokeWidth="1.2" />
    <g fill="none" stroke="#DAD6C4" opacity=".85">
      <circle cx="100" cy="100" r="76" strokeWidth="1" />
      <circle cx="100" cy="100" r="60" strokeWidth=".8" opacity=".8" />
      <circle cx="100" cy="100" r="44" strokeWidth=".6" opacity=".65" />
      <circle cx="100" cy="100" r="28" strokeWidth=".5" opacity=".5" />
    </g>
    <g stroke="#DAD6C4" fill="none" strokeWidth="1.4">
      <rect x="70" y="70" width="60" height="60" rx="2" />
      <line x1="78" y1="86" x2="122" y2="86" />
      <line x1="78" y1="98" x2="122" y2="98" />
      <line x1="78" y1="110" x2="122" y2="110" />
      <line x1="78" y1="122" x2="108" y2="122" />
    </g>
    <g stroke="#5F7284" strokeWidth="1.2" fill="none">
      <line x1="100" y1="60" x2="100" y2="74" />
      <line x1="82" y1="62" x2="118" y2="62" />
      <circle cx="82" cy="66" r="3" />
      <circle cx="118" cy="66" r="3" />
    </g>
    <text x="100" y="182" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="3" fill="#DAD6C4">
      UN · INTERNATIONAL LAW
    </text>
  </svg>
);

export const SigilVN: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 40,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Vietnamese People & Enterprise sigil"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="sigil_vg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#C7E1CE" />
        <stop offset="1" stopColor="#2F7D62" />
      </linearGradient>
      <pattern id="sigil_weave" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 6 Q3 0 6 6 T12 6" fill="none" stroke="#2F7D62" strokeWidth=".7" opacity=".45" />
      </pattern>
    </defs>
    <circle cx="100" cy="100" r="94" fill="#0D1815" stroke="url(#sigil_vg)" strokeWidth="1.2" />
    <circle cx="100" cy="100" r="80" fill="url(#sigil_weave)" />
    <g stroke="#68A98F" strokeWidth="2.2" fill="none" strokeLinecap="round">
      <line x1="70" y1="150" x2="70" y2="70" />
      <line x1="100" y1="158" x2="100" y2="52" />
      <line x1="130" y1="150" x2="130" y2="72" />
    </g>
    <g stroke="#D8B46D" strokeWidth=".8" fill="none">
      <line x1="66" y1="100" x2="74" y2="100" />
      <line x1="96" y1="90" x2="104" y2="90" />
      <line x1="126" y1="106" x2="134" y2="106" />
      <line x1="66" y1="126" x2="74" y2="126" />
      <line x1="96" y1="120" x2="104" y2="120" />
      <line x1="126" y1="130" x2="134" y2="130" />
    </g>
    <path d="M100 52 C 86 44 82 34 96 30 C 88 40 100 44 100 52 Z" fill="#B5D6C6" />
    <text x="100" y="182" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="3" fill="#C7E1CE">
      NHÂN DÂN · ENTERPRISE VN
    </text>
  </svg>
);

export const CardAnchorArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="-90 -90 180 180"
    role="img"
    aria-label="Anchor of Sovereignty Artwork"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="art_ac_inner" cx=".5" cy=".5" r=".7">
        <stop offset="0" stopColor="#1C5C47" stopOpacity=".7" />
        <stop offset="1" stopColor="#0B1512" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r="88" fill="url(#art_ac_inner)" />
    <g stroke="#D8B46D" strokeWidth="1.2" fill="none" opacity=".9">
      <circle r="72" />
      <circle r="56" opacity=".6" />
      <circle r="42" opacity=".4" />
    </g>
    <g stroke="#68A98F" strokeWidth="3" strokeLinecap="round">
      <line x1="-50" y1="-50" x2="-50" y2="50" />
      <line x1="-25" y1="-62" x2="-25" y2="62" />
      <line x1="0" y1="-68" x2="0" y2="68" />
      <line x1="25" y1="-62" x2="25" y2="62" />
      <line x1="50" y1="-50" x2="50" y2="50" />
    </g>
    <g stroke="#0F3628" strokeWidth="4">
      <line x1="-56" y1="-18" x2="56" y2="-18" />
      <line x1="-56" y1="18" x2="56" y2="18" />
    </g>
    <g fill="none" stroke="#F0DFB6" strokeWidth="2">
      <circle cx="0" cy="-6" r="9" />
      <line x1="0" y1="3" x2="0" y2="32" />
      <path d="M-18 22 C -16 36 -5 44 0 44 C 5 44 16 36 18 22" />
    </g>
  </svg>
);

export const CardAllianceArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="-115 -115 230 230"
    role="img"
    aria-label="Alliance Form Artwork"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="art_al_inner" cx=".5" cy=".5" r=".7">
        <stop offset="0" stopColor="#2F7D62" stopOpacity=".5" />
        <stop offset="1" stopColor="#06110D" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r="90" fill="url(#art_al_inner)" />
    <path d="M -90 -36 C -36 -100 36 -100 90 -36" fill="none" stroke="#B5D6C6" strokeWidth="2.2" />
    <path d="M -90 36 C -36 100 36 100 90 36" fill="none" stroke="#68A98F" strokeWidth="2.2" />
    <path d="M -90 -36 C -36 18 36 18 90 -36" fill="none" stroke="#D8B46D" strokeWidth="1.4" opacity=".8" />
    <path d="M -90 36 C -36 -18 36 -18 90 36" fill="none" stroke="#D8B46D" strokeWidth="1.4" opacity=".8" />
    <g stroke="#F0DFB6" strokeWidth="1.6" fill="none">
      <rect x="-14" y="-14" width="28" height="28" transform="rotate(45)" />
      <circle r="6" />
    </g>
    <g stroke="#B5D6C6" strokeWidth="1.4" fill="none">
      <line x1="-80" y1="-56" x2="-80" y2="56" />
      <line x1="80" y1="-56" x2="80" y2="56" />
      <rect x="-80" y="-56" width="20" height="14" fill="#2F7D62" stroke="none" />
      <rect x="60" y="-56" width="20" height="14" fill="#8E6A24" stroke="none" />
    </g>
  </svg>
);

export const CardChallengeArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="-120 -110 240 200"
    role="img"
    aria-label="Multilateral Challenge Artwork"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="art_ch_inner" cx=".5" cy=".5" r=".7">
        <stop offset="0" stopColor="#8A2F37" stopOpacity=".5" />
        <stop offset="1" stopColor="#0B0808" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r="95" fill="url(#art_ch_inner)" />
    <path d="M -100 36 Q 0 -18 100 36" stroke="#E8C2A6" strokeWidth="1.8" fill="none" />
    <path d="M -100 60 Q 0 6 100 60" stroke="#8A2F37" strokeWidth="1.4" fill="none" opacity=".8" />
    <path d="M 0 -90 L -70 54 L 70 54 Z" fill="#E8C2A6" opacity=".1" />
    <path d="M 0 -90 L -70 54 L 70 54 Z" fill="none" stroke="#E8C2A6" strokeWidth=".8" opacity=".45" />
    <g transform="translate(0 -16) rotate(-18)" stroke="#F0DFB6" strokeWidth="1.8" fill="none">
      <rect x="-26" y="-7" width="52" height="14" rx="2" />
      <line x1="26" y1="0" x2="60" y2="0" />
      <circle cx="60" cy="0" r="3" />
    </g>
    <g fill="#E8C2A6">
      <circle cx="-54" cy="54" r="3" />
      <circle cx="0" cy="54" r="3" />
      <circle cx="54" cy="54" r="3" />
    </g>
  </svg>
);
