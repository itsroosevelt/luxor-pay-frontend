export const theme = {
  colors: {
    background: '#0A0A0A',
    backgroundAlt: '#000000',
    foreground: '#EDEDED',
    white: '#FFFFFF',
    accentLight: '#60A5FA',
    accentDark: '#2563EB',
    bodyText: 'rgba(255, 255, 255, 0.8)',
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glowBlue: 'rgba(37, 99, 235, 0.3)',
    glowOrange: 'rgba(249, 115, 22, 0.2)',
  },
  fonts: {
    heading: "'Outfit', sans-serif",
    body: "'Montserrat', sans-serif",
    mono: "var(--font-geist-mono), monospace",
  },
  typography: {
    h1: {
      fontSize: '60px',
      fontWeight: 500,
      letterSpacing: '-1.5px',
      color: '#FFFFFF',
    },
    h2: {
      fontSize: '48px',
      fontWeight: 500,
      letterSpacing: '-1px',
      color: '#FFFFFF',
    },
    h3: {
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.05em',
      color: '#FFFFFF',
    },
    eyebrow: {
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.4em',
      textTransform: 'uppercase' as const,
      color: '#60A5FA',
    },
    body: {
      fontSize: '15px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'rgba(255, 255, 255, 0.8)',
    },
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(40px)',
    borderRadius: '40px',
    boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.6)',
  },
  radii: {
    pill: '9999px',
    glass: '40px',
  },
  breakpoints: {
    md: '768px',
    lg: '1024px',
  },
  focus: {
    outline: '2px solid #60A5FA',
    outlineOffset: '2px',
  },
  gradient: {
    text: 'linear-gradient(to right, #60A5FA, #2563EB)',
  },
} as const;

export type Theme = typeof theme;
