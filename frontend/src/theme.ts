/**
 * Oboafo design tokens — civic rights education UI
 */

export const T = {
  // Brand colors
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  accent: '#D4A017',
  accentLight: '#F0C842',
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E8E0D5',
  borderHi: '#d4cfc4',
  redBorder: '#9b2c2c',
  text: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#9C9C9C',
  success: '#386641',
  warning: '#C77B2A',
  disclaimerBg: '#F5F0E8',
  languageStripBg: '#F0E9D8',

  // Legacy aliases (gradual migration from dark theme)
  gold: '#D4A017',
  goldDim: 'rgba(212, 160, 23, 0.14)',
  goldText: '#B8860B',
  surface2: '#FAF7F2',
  surface3: '#F0E9D8',
  text2: '#5C5C5C',
  text3: '#9C9C9C',
  text4: '#5C5C5C',
  blue: '#2D6A4F',
  blueDim: 'rgba(45, 106, 79, 0.12)',
  green: '#386641',
  greenDim: 'rgba(56, 102, 65, 0.12)',
  red: '#C53030',
  redDim: 'rgba(197, 48, 48, 0.1)',
  purple: '#2D6A4F',

  // Radius
  rSm: '6px',
  r: '8px',
  rMd: '16px',
  rLg: '24px',
  rFull: '999px',

  // Shadows
  shadowCard: '0 2px 12px rgba(0,0,0,0.06)',
  shadowHover: '0 8px 24px rgba(0,0,0,0.10)',
  shadowModal: '0 24px 64px rgba(0,0,0,0.14)',

  // Typography (font stacks — Fraunces + DM Sans loaded in index.html)
  fontDisplay: '"Fraunces", Georgia, "Times New Roman", serif',
  fontBody: '"DM Sans", system-ui, -apple-system, sans-serif',

  // Type scale (px)
  hero: { size: 64, weight: 700 as const, lh: 1.1 },
  h1: { size: 48, weight: 700 as const, lh: 1.15 },
  h2: { size: 36, weight: 600 as const, lh: 1.2 },
  h3: { size: 24, weight: 600 as const, lh: 1.3 },
  bodyLg: { size: 18, weight: 400 as const, lh: 1.6 },
  body: { size: 16, weight: 400 as const, lh: 1.6 },
  small: { size: 14, weight: 400 as const, lh: 1.5 },
  caption: { size: 12, weight: 500 as const, lh: 1.4 },
  button: { size: 15, weight: 600 as const, lh: 1.2, ls: '0.02em' },

  // Spacing (8px base)
  sp: (n: number) => `${n * 8}px`,

  tx: 'all 0.2s ease',
  txSlow: 'all 0.35s ease',
} as const

export const MQ = {
  mobileMax: '767px',
  desktopMin: '768px',
} as const
