/**
 * @bamboo/design-tokens
 * Neo-Oriental Civic Strategy Design System Tokens
 * Source of truth: design/tokens/tokens.css & tokens.json
 */

export const colors = {
  bg: {
    canvas: '#07110E',
    panel: '#0D1815',
    panel2: '#11211C',
    elevated: '#162A23',
    scrim: 'rgba(4, 10, 8, 0.72)',
  },
  bamboo: {
    900: '#0F3628',
    700: '#1C5C47',
    500: '#2F7D62',
    300: '#68A98F',
    100: '#B5D6C6',
  },
  gold: {
    900: '#5C4416',
    700: '#8E6A24',
    500: '#B88A33',
    300: '#D8B46D',
    100: '#F0DFB6',
  },
  neutrals: {
    ink950: '#050807',
    ink900: '#0B0E10',
    slate800: '#1B2521',
    slate700: '#33413D',
    slate500: '#6D7C77',
    slate300: '#A8B3AF',
    slate200: '#C4CCC9',
    paper100: '#F3EEDC',
    paper200: '#E6DFCA',
  },
  semantic: {
    success: '#3D8C6A',
    warning: '#C08A2E',
    danger: '#A9474F',
    dangerStrong: '#8A2F37',
    info: '#4E7EA7',
    focus: '#D4AE63',
  },
  faction: {
    west: {
      ink: '#C7D3E5',
      accent: '#6B87B4',
    },
    neighbor: {
      ink: '#E8C2A6',
      accent: '#7A2A2E',
    },
    un: {
      ink: '#DAD6C4',
      accent: '#5F7284',
    },
    vnPeople: {
      ink: '#C7E1CE',
      accent: '#2F7D62',
    },
  },
} as const;

export const typography = {
  fontFamily: {
    display: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
    ui: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
    mono: '"IBM Plex Mono", "Space Mono", ui-monospace, "SFMono-Regular", monospace',
  },
  scale: {
    displayXL: { size: '52px', weight: 700, lineHeight: 1.05 },
    displayL: { size: '40px', weight: 700, lineHeight: 1.08 },
    h1: { size: '30px', weight: 650, lineHeight: 1.15 },
    h2: { size: '24px', weight: 650, lineHeight: 1.2 },
    h3: { size: '20px', weight: 600, lineHeight: 1.25 },
    bodyL: { size: '17px', weight: 450, lineHeight: 1.55 },
    bodyM: { size: '15px', weight: 450, lineHeight: 1.55 },
    meta: { size: '12.5px', weight: 500, lineHeight: 1.35 },
    mono: { size: '13px', weight: 500, lineHeight: 1.3 },
  },
} as const;

export const radii = {
  xs: '10px',
  sm: '14px',
  md: '18px',
  lg: '24px',
  xl: '32px',
  pill: '999px',
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

export const motion = {
  duration: {
    fast: '140ms',
    base: '220ms',
    slow: '320ms',
    reveal: '520ms',
  },
  easing: {
    standard: 'cubic-bezier(.22,.61,.36,1)',
    emphasis: 'cubic-bezier(.2,.7,.1,1)',
  },
} as const;

export const touch = {
  targetMin: '48px',
  focusRingPx: '3px',
} as const;

export const cssVars = {
  bgCanvas: 'var(--bg-canvas)',
  bgPanel: 'var(--bg-panel)',
  bgPanel2: 'var(--bg-panel-2)',
  bgElevated: 'var(--bg-elevated)',
  bamboo700: 'var(--bamboo-700)',
  bamboo500: 'var(--bamboo-500)',
  bamboo300: 'var(--bamboo-300)',
  bamboo100: 'var(--bamboo-100)',
  gold700: 'var(--gold-700)',
  gold500: 'var(--gold-500)',
  gold300: 'var(--gold-300)',
  gold100: 'var(--gold-100)',
  paper100: 'var(--paper-100)',
  paper200: 'var(--paper-200)',
  slate700: 'var(--slate-700)',
  slate500: 'var(--slate-500)',
  slate300: 'var(--slate-300)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  focus: 'var(--focus)',
} as const;
