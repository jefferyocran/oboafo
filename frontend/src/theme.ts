// Design tokens — single source of truth for all styles

export const T = {
  // Backgrounds
  bg:       '#0a0e1a',
  surface:  '#111827',
  surface2: '#1c2333',
  surface3: '#253047',

  // Borders
  border:   '#1f2937',
  borderHi: '#374151',

  // Brand
  gold:     '#d4a843',
  goldDim:  'rgba(212,168,67,0.12)',
  goldText: '#fbbf24',

  // Semantic
  red:      '#ef4444',
  redDim:   'rgba(239,68,68,0.10)',
  redBorder:'#991b1b',
  green:    '#22c55e',
  greenDim: 'rgba(34,197,94,0.10)',
  blue:     '#60a5fa',
  blueDim:  'rgba(96,165,250,0.10)',
  purple:   '#a78bfa',

  // Text
  text:     '#f9fafb',
  text2:    '#9ca3af',
  text3:    '#6b7280',
  text4:    '#374151',

  // Radius
  r:   '8px',
  rLg: '14px',
  rXl: '20px',
  rFull: '999px',

  // Spacing (4-point grid)
  sp: (n: number) => `${n * 4}px`,

  // Transition
  tx: 'all 0.15s ease',
} as const
