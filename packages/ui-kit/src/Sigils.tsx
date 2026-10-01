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

// ==========================================
// IMPERIAL LACQUER TACTICAL CARD EMBLEMS
// High-fidelity vector artwork for tactical card seals
// ==========================================

export const CardDefenseArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Sovereign Defense Jade Emblem"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="def_jade_grad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#2A7A5E" />
        <stop offset="50%" stopColor="#133D2E" />
        <stop offset="100%" stopColor="#081A13" />
      </radialGradient>
      <linearGradient id="def_gold_rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9E29D" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8A6C18" />
      </linearGradient>
    </defs>
    {/* Outer Jade Base */}
    <circle cx="100" cy="100" r="94" fill="url(#def_jade_grad)" stroke="url(#def_gold_rim)" strokeWidth="3" />
    <circle cx="100" cy="100" r="86" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
    <circle cx="100" cy="100" r="78" fill="none" stroke="#68A98F" strokeWidth="1.2" opacity="0.6" />
    {/* Hexagonal Sovereign Shield Ring */}
    <polygon
      points="100,26 164,63 164,137 100,174 36,137 36,63"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="1.8"
      opacity="0.85"
    />
    {/* Sacred Bamboo Pillar (Tự Chủ) */}
    <rect x="94" y="38" width="12" height="124" rx="4" fill="#68A98F" stroke="#133D2E" strokeWidth="1" />
    <rect x="91" y="68" width="18" height="5" rx="1.5" fill="#F9E29D" stroke="#8A6C18" strokeWidth="1" />
    <rect x="91" y="104" width="18" height="5" rx="1.5" fill="#F9E29D" stroke="#8A6C18" strokeWidth="1" />
    <rect x="91" y="140" width="18" height="5" rx="1.5" fill="#F9E29D" stroke="#8A6C18" strokeWidth="1" />
    {/* Bamboo Foliage Wings */}
    <path d="M94 70 C 60 55 45 80 88 84 Z" fill="#2A7A5E" stroke="#F9E29D" strokeWidth="0.8" />
    <path d="M106 106 C 140 91 155 116 112 120 Z" fill="#68A98F" stroke="#F9E29D" strokeWidth="0.8" />
    {/* Anchor Base of Sovereignty */}
    <circle cx="100" cy="100" r="16" fill="none" stroke="#F9E29D" strokeWidth="2.5" />
    <path d="M72 136 C 85 160 115 160 128 136" fill="none" stroke="#F9E29D" strokeWidth="3.2" strokeLinecap="round" />
    <polygon points="72,136 68,144 76,142" fill="#F9E29D" />
    <polygon points="128,136 132,144 124,142" fill="#F9E29D" />
  </svg>
);

export const CardAttackArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Strategic Attack Imperial Gold Emblem"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="att_gold_grad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#4A3410" />
        <stop offset="50%" stopColor="#2A1B07" />
        <stop offset="100%" stopColor="#120A02" />
      </radialGradient>
      <linearGradient id="att_gold_rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2B2" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8A6C18" />
      </linearGradient>
    </defs>
    {/* Outer Lacquer Disc */}
    <circle cx="100" cy="100" r="94" fill="url(#att_gold_grad)" stroke="url(#att_gold_rim)" strokeWidth="3" />
    <circle cx="100" cy="100" r="86" fill="none" stroke="#F3CA68" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
    <circle cx="100" cy="100" r="76" fill="none" stroke="#8A6C18" strokeWidth="1.2" opacity="0.6" />
    {/* Crossed Ceremonial Diplomatic Blades */}
    <g stroke="url(#att_gold_rim)" strokeWidth="3" strokeLinecap="round">
      <line x1="50" y1="50" x2="150" y2="150" />
      <line x1="150" y1="50" x2="50" y2="150" />
    </g>
    {/* Hilt Crossguards */}
    <rect x="62" y="58" width="14" height="4" transform="rotate(45 69 60)" fill="#FFF2B2" />
    <rect x="124" y="58" width="14" height="4" transform="rotate(-45 131 60)" fill="#FFF2B2" />
    {/* Ancient Imperial Coin (Thông Bảo) Center */}
    <circle cx="100" cy="100" r="32" fill="#2A1B07" stroke="#D4AF37" strokeWidth="2.5" />
    <circle cx="100" cy="100" r="26" fill="#3D290C" stroke="#F3CA68" strokeWidth="1" />
    <rect x="88" y="88" width="24" height="24" rx="2" fill="#120A02" stroke="#FFF2B2" strokeWidth="2" />
    {/* Four Imperial Dots */}
    <circle cx="100" cy="79" r="2.5" fill="#FFF2B2" />
    <circle cx="100" cy="121" r="2.5" fill="#FFF2B2" />
    <circle cx="79" cy="100" r="2.5" fill="#FFF2B2" />
    <circle cx="121" cy="100" r="2.5" fill="#FFF2B2" />
  </svg>
);

export const CardPrestigeArt: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 64,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    role="img"
    aria-label="Multilateral Prestige Sapphire Emblem"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <radialGradient id="pres_sapphire_grad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#1E456E" />
        <stop offset="50%" stopColor="#0F2744" />
        <stop offset="100%" stopColor="#05101E" />
      </radialGradient>
      <linearGradient id="pres_gold_rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E2F0FE" />
        <stop offset="50%" stopColor="#4E7EA7" />
        <stop offset="100%" stopColor="#183756" />
      </linearGradient>
    </defs>
    {/* Outer Lacquer Disc */}
    <circle cx="100" cy="100" r="94" fill="url(#pres_sapphire_grad)" stroke="#D4AF37" strokeWidth="2.5" />
    <circle cx="100" cy="100" r="86" fill="none" stroke="#60A5FA" strokeWidth="1" strokeDasharray="4 2" opacity="0.75" />
    <circle cx="100" cy="100" r="76" fill="none" stroke="#1E40AF" strokeWidth="1.2" opacity="0.6" />
    {/* 8-Point Dong Son Solar Star (Trống Đồng Đông Sơn) */}
    <polygon
      points="100,42 107,82 148,68 118,97 158,100 118,103 148,132 107,118 100,158 93,118 52,132 82,103 42,100 82,97 52,68 93,82"
      fill="#D4AF37"
      stroke="#FFF2B2"
      strokeWidth="0.8"
    />
    {/* Central Resonant Gong */}
    <circle cx="100" cy="100" r="22" fill="#0A1828" stroke="#F3CA68" strokeWidth="2" />
    <circle cx="100" cy="100" r="14" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1.5" />
    <circle cx="100" cy="100" r="6" fill="#F3CA68" />
  </svg>
);

// Backward compatibility aliases
export const CardAnchorArt = CardDefenseArt;
export const CardChallengeArt = CardAttackArt;
export const CardAllianceArt = CardPrestigeArt;

